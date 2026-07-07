"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  createSubmissionUploadUrl,
  submitApplication,
} from "@/app/actions/apply";
import { createClient } from "@/lib/supabase/client";
import {
  SUBMISSION_COMMENT_MAX,
  SUBMISSION_MAX_FILE_BYTES,
} from "@/lib/validation/submission";

const formSchema = z.object({
  link: z.string().trim().url().max(300).optional().or(z.literal("")),
  comment: z
    .string()
    .trim()
    .max(SUBMISSION_COMMENT_MAX)
    .optional()
    .or(z.literal("")),
});

type FormValues = z.input<typeof formSchema>;

const inputClass =
  "border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:border-graphite focus-visible:outline-cognac w-full border px-3.5 py-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2";
const labelClass =
  "text-muted-foreground font-mono text-[0.7rem] tracking-[0.12em] uppercase";
const errorClass = "text-destructive font-mono text-xs";

type Phase = "idle" | "uploading" | "submitting";

export function SubmissionForm({
  applicationId,
  showIncognitoChecklist,
}: {
  applicationId: string;
  showIncognitoChecklist: boolean;
}) {
  const t = useTranslations("Apply");
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [fileError, setFileError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { link: "", comment: "" },
  });

  function validateFile(file: File): boolean {
    if (file.type !== "application/pdf") {
      setFileError(t("filePdfOnly"));
      return false;
    }
    if (file.size > SUBMISSION_MAX_FILE_BYTES) {
      setFileError(t("fileTooLarge"));
      return false;
    }
    setFileError(null);
    return true;
  }

  async function onSubmit(values: FormValues) {
    setFormError(null);
    if (!file && !values.link) {
      setFormError(t("needWork"));
      return;
    }
    if (file && !validateFile(file)) return;

    let filePath = "";
    if (file) {
      setPhase("uploading");
      const grant = await createSubmissionUploadUrl(applicationId, file.size);
      if (!grant.ok) {
        setPhase("idle");
        setFormError(t("uploadFailed"));
        return;
      }
      const supabase = createClient();
      const { error } = await supabase.storage
        .from("submissions")
        .uploadToSignedUrl(grant.path, grant.token, file, {
          contentType: "application/pdf",
        });
      if (error) {
        setPhase("idle");
        setFormError(t("uploadFailed"));
        return;
      }
      filePath = grant.path;
    }

    setPhase("submitting");
    const result = await submitApplication(applicationId, {
      link: values.link,
      filePath,
      comment: values.comment,
    });
    if (!result.ok) {
      setPhase("idle");
      setFormError(t("submitFailed"));
      return;
    }
    // The server page re-renders into the stepper view.
    router.refresh();
  }

  const busy = phase !== "idle";

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-5"
    >
      {showIncognitoChecklist ? (
        <div className="border-cognac/40 bg-cognac/5 border p-4 text-sm leading-relaxed">
          <p className="font-semibold">{t("incognitoChecklistTitle")}</p>
          <p className="text-muted-foreground mt-1">
            {t("incognitoChecklist")}
          </p>
        </div>
      ) : null}

      <div className="flex flex-col gap-2">
        <label htmlFor="sub-file" className={labelClass}>
          {t("fileLabel")}
        </label>
        <input
          id="sub-file"
          type="file"
          accept="application/pdf"
          onChange={(event) => {
            const next = event.target.files?.[0] ?? null;
            setFile(next);
            if (next) validateFile(next);
            else setFileError(null);
          }}
          className="border-input bg-background text-muted-foreground file:bg-secondary file:text-foreground focus-visible:outline-cognac w-full border px-3.5 py-2.5 text-sm file:mr-3 file:border-0 file:px-3 file:py-1.5 file:font-mono file:text-[0.7rem] file:tracking-[0.08em] file:uppercase focus-visible:outline-2 focus-visible:outline-offset-2"
        />
        <p className="text-taupe text-xs">{t("fileHint")}</p>
        {fileError ? <p className={errorClass}>{fileError}</p> : null}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="sub-link" className={labelClass}>
          {t("linkLabel")}
        </label>
        <input
          id="sub-link"
          type="url"
          placeholder="https://…"
          aria-invalid={Boolean(errors.link)}
          className={inputClass}
          {...register("link")}
        />
        {errors.link ? <p className={errorClass}>{t("linkInvalid")}</p> : null}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="sub-comment" className={labelClass}>
          {t("commentLabel")}{" "}
          <span className="normal-case">· {t("commentOptional")}</span>
        </label>
        <textarea
          id="sub-comment"
          rows={3}
          maxLength={SUBMISSION_COMMENT_MAX}
          placeholder={t("commentPlaceholder")}
          aria-invalid={Boolean(errors.comment)}
          className={inputClass}
          {...register("comment")}
        />
        <p className="text-taupe text-xs">{t("commentHint")}</p>
      </div>

      <div className="flex flex-col gap-2">
        <button
          type="submit"
          disabled={busy}
          className="bg-primary text-primary-foreground ease-room focus-visible:outline-cognac w-fit px-5 py-3 text-sm font-semibold transition-transform duration-300 hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60"
        >
          {phase === "uploading"
            ? t("uploading")
            : phase === "submitting"
              ? t("submitting")
              : t("submitCta")}
        </button>
        {formError ? <p className={errorClass}>{formError}</p> : null}
        <p className="text-taupe text-xs">{t("submitNote")}</p>
      </div>
    </form>
  );
}
