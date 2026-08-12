import bcrypt from "bcryptjs";

const PBKDF2_ITERATIONS = 100_000;
const PBKDF2_KEY_LENGTH = 32;
const PBKDF2_PREFIX = "pbkdf2";

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary);
}

function base64ToBytes(value: string) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function timingSafeEqual(left: Uint8Array, right: Uint8Array) {
  if (left.length !== right.length) {
    return false;
  }

  let difference = 0;

  for (let index = 0; index < left.length; index += 1) {
    difference |= left[index] ^ right[index];
  }

  return difference === 0;
}

async function derivePasswordKey(password: string, salt: Uint8Array) {
  const encodedPassword = new TextEncoder().encode(password);
  const saltBuffer = salt.slice().buffer as ArrayBuffer;
  const key = await crypto.subtle.importKey(
    "raw",
    encodedPassword,
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    {
      hash: "SHA-256",
      iterations: PBKDF2_ITERATIONS,
      name: "PBKDF2",
      salt: saltBuffer
    },
    key,
    PBKDF2_KEY_LENGTH * 8
  );

  return new Uint8Array(bits);
}

export async function hashPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const derivedKey = await derivePasswordKey(password, salt);

  return [
    PBKDF2_PREFIX,
    PBKDF2_ITERATIONS,
    bytesToBase64(salt),
    bytesToBase64(derivedKey)
  ].join("$");
}

export async function verifyPassword(password: string, passwordHash: string) {
  if (passwordHash.startsWith(`${PBKDF2_PREFIX}$`)) {
    const [, iterations, salt, derivedKey] = passwordHash.split("$");

    if (Number(iterations) !== PBKDF2_ITERATIONS || !salt || !derivedKey) {
      return false;
    }

    const expectedKey = base64ToBytes(derivedKey);
    const actualKey = await derivePasswordKey(password, base64ToBytes(salt));

    return timingSafeEqual(actualKey, expectedKey);
  }

  return bcrypt.compare(password, passwordHash);
}
