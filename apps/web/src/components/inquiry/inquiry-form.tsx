"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";

import { submitInquiry } from "@/features/inquiries/actions";
import {
  defaultLocale,
  getDictionary,
  type Locale
} from "@/lib/i18n/dictionaries";

const initialState = {
  message: "",
  ok: false
};

const maxQuoteFileSizeBytes = 20 * 1024 * 1024;

export function InquiryForm({
  defaultMessage,
  locale = defaultLocale,
  productId,
  submitLabel
}: {
  defaultMessage?: string;
  locale?: Locale;
  productId?: string;
  submitLabel?: string;
}) {
  const dictionary = getDictionary(locale);
  const t = dictionary.inquiryForm;
  const [state, formAction, isPending] = useActionState(
    submitInquiry,
    initialState
  );
  const formRef = useRef<HTMLFormElement>(null);
  const [clientError, setClientError] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const isSubmitting = isPending || isLocked;

  useEffect(() => {
    if (!isPending) {
      setIsLocked(false);
    }
  }, [isPending]);

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
    }
  }, [state.ok]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (isSubmitting) {
      event.preventDefault();
      return;
    }

    const formData = new FormData(event.currentTarget);
    const quoteFile = formData.get("quoteFile");

    if (quoteFile instanceof File && quoteFile.size > maxQuoteFileSizeBytes) {
      event.preventDefault();
      setClientError(t.clientFileTooLarge);
      return;
    }

    setClientError("");
    setIsLocked(true);
  }

  return (
    <div className="inquiry-card">
      <form action={formAction} onSubmit={handleSubmit} ref={formRef}>
        <div className="form-grid-2">
          <div className="form-row">
            <label>
              {t.name} <span className="required">*</span>
            </label>
            <input
              disabled={isSubmitting}
              name="name"
              placeholder={t.namePlaceholder}
              required
              type="text"
            />
          </div>
          <div className="form-row">
            <label>{t.company}</label>
            <input
              disabled={isSubmitting}
              name="company"
              placeholder={t.companyPlaceholder}
              type="text"
            />
          </div>
        </div>

        <div className="form-grid-2">
          <div className="form-row">
            <label>
              {t.phone} <span className="required">*</span>
            </label>
            <input
              disabled={isSubmitting}
              name="phone"
              placeholder={t.phonePlaceholder}
              required
              type="tel"
            />
          </div>
          <div className="form-row">
            <label>
              {t.email} <span className="required">*</span>
            </label>
            <input
              disabled={isSubmitting}
              name="email"
              placeholder={t.emailPlaceholder}
              required
              type="email"
            />
          </div>
        </div>

        <input name="productId" type="hidden" value={productId ?? ""} />
        <input name="locale" type="hidden" value={locale} />

        <div className="form-row">
          <label>{t.message}</label>
          <textarea
            defaultValue={defaultMessage ?? ""}
            disabled={isSubmitting}
            name="message"
            placeholder={t.messagePlaceholder}
            required
            rows={4}
          />
        </div>

        <div className="form-row">
          <label>{t.fileLabel}</label>
          <input
            accept=".csv,.pdf,.dwg,.dxf,.jpg,.jpeg,.png"
            disabled={isSubmitting}
            name="quoteFile"
            type="file"
          />
          <p className="text-muted" style={{ fontSize: 12, marginTop: 6 }}>
            {t.fileHint}
          </p>
        </div>

        <button
          aria-disabled={isSubmitting}
          className="btn btn-primary btn-block"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? t.submitting : submitLabel ?? t.submitInquiry}
        </button>

        {clientError || state.message ? (
          <div
            className={`form-feedback ${
              !clientError && state.ok ? "is-success" : "is-error"
            }`}
            role="status"
          >
            {clientError || state.message}
          </div>
        ) : null}
      </form>
    </div>
  );
}
