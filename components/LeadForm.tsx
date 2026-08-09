"use client";

import { useState } from "react";

export type Field = {
  name: string;
  label: string;
  type?: "text" | "email" | "tel" | "textarea" | "select";
  placeholder?: string;
  options?: string[];
  required?: boolean;
  full?: boolean;
  rows?: number;
};

/**
 * Prototype lead form: validates and shows a success state locally.
 * On the WordPress build this is swapped for the site's form plugin —
 * the field names below are the ones to reuse.
 */
export default function LeadForm({
  fields,
  submitLabel,
  successTitle,
  successCopy,
  variant = "dark",
}: {
  fields: Field[];
  submitLabel: string;
  successTitle: string;
  successCopy: string;
  variant?: "dark" | "cream";
}) {
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  if (sent) {
    return (
      <div
        style={{
          border: `1px dashed ${variant === "cream" ? "var(--line-dark)" : "var(--line)"}`,
          borderRadius: "var(--radius)",
          padding: "42px 28px",
          textAlign: "center",
        }}
      >
        <h3 className="display h3" style={{ margin: 0 }}>
          {successTitle}
        </h3>
        <p className="body-copy" style={{ maxWidth: "42ch", margin: "12px auto 22px" }}>
          {successCopy}
        </p>
        <button
          className={variant === "cream" ? "btn btn-dark btn-sm" : "btn btn-ghost btn-sm"}
          onClick={() => setSent(false)}
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form
      className="form-grid"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const missing = fields
          .filter((field) => field.required && !String(data.get(field.name) ?? "").trim())
          .map((field) => field.label);
        setErrors(missing);
        if (missing.length === 0) setSent(true);
      }}
      noValidate
    >
      {fields.map((field) => (
        <div
          className="field"
          key={field.name}
          style={field.full ? { gridColumn: "1 / -1" } : undefined}
        >
          <label htmlFor={field.name}>
            {field.label}
            {field.required ? " *" : ""}
          </label>
          {field.type === "textarea" ? (
            <textarea
              id={field.name}
              name={field.name}
              rows={field.rows ?? 4}
              placeholder={field.placeholder}
            />
          ) : field.type === "select" ? (
            <select id={field.name} name={field.name} defaultValue="">
              <option value="" disabled>
                {field.placeholder ?? "Choose one"}
              </option>
              {(field.options ?? []).map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          ) : (
            <input
              id={field.name}
              name={field.name}
              type={field.type ?? "text"}
              placeholder={field.placeholder}
            />
          )}
        </div>
      ))}

      {errors.length > 0 ? (
        <p
          className="field-hint"
          style={{ gridColumn: "1 / -1", color: "var(--crimson)", margin: 0 }}
          role="alert"
        >
          Please fill in: {errors.join(", ")}
        </p>
      ) : null}

      <div style={{ gridColumn: "1 / -1" }}>
        <button className={variant === "cream" ? "btn btn-dark" : "btn btn-solid"} style={{ minWidth: 260 }}>
          {submitLabel}
        </button>
        <p className="field-hint" style={{ marginTop: 12 }}>
          Prototype form — connects to the client&rsquo;s inbox on the WordPress build.
        </p>
      </div>
    </form>
  );
}
