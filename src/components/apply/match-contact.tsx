import { getTranslations } from "next-intl/server";
import { getStudioContact } from "@/lib/studios";

/**
 * Contacts card after a confirmed match: the platform steps back, the two
 * sides talk directly. Rendered only to the application's own candidate.
 */
export async function MatchContact({
  studioId,
  studioName,
}: {
  studioId: string;
  studioName: string;
}) {
  const [t, contact] = await Promise.all([
    getTranslations("Apply"),
    getStudioContact(studioId),
  ]);
  if (!contact) return null;

  return (
    <section className="border-cognac/50 bg-cognac/5 mt-8 border p-6">
      <h2 className="text-cognac-deep font-mono text-[0.7rem] tracking-[0.16em] uppercase">
        {t("contactTitle")}
      </h2>
      <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
        {t("contactNote", { studio: studioName })}
      </p>
      <div className="mt-4 text-sm">
        <div className="font-semibold">{contact.name}</div>
        {contact.role ? (
          <div className="text-muted-foreground">{contact.role}</div>
        ) : null}
        <a
          href={`mailto:${contact.email}`}
          className="hover:text-cognac-deep mt-1 inline-block font-mono text-xs underline underline-offset-4 transition-colors"
        >
          {contact.email}
        </a>
      </div>
    </section>
  );
}
