import { execFileSync, spawn } from "node:child_process";

const CMS_PORT = "3003";

function getPidsOnPort(port) {
  try {
    const output = execFileSync(
      "lsof",
      ["-tiTCP:" + port, "-sTCP:LISTEN"],
      { encoding: "utf8" }
    );

    return output
      .split("\n")
      .map((pid) => pid.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

function killPids(pids) {
  for (const pid of pids) {
    try {
      process.kill(Number(pid), "SIGTERM");
      console.log(`Stopped old CMS dev server process ${pid}.`);
    } catch (error) {
      console.warn(`Could not stop process ${pid}: ${error.message}`);
    }
  }
}

const pids = getPidsOnPort(CMS_PORT);

if (pids.length > 0) {
  console.log(`Port ${CMS_PORT} is in use. Clearing it before starting CMS...`);
  killPids(pids);
}

const child = spawn(
  "npm",
  [
    "run",
    "dev",
    "--workspace",
    "@commercial/cms",
    "--",
    "-H",
    "127.0.0.1",
    "-p",
    CMS_PORT
  ],
  {
    stdio: "inherit"
  }
);

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
