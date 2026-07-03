import { getTranslations, setRequestLocale } from "next-intl/server";
import { type Locale } from "@/i18n/routing";
import { LocaleSwitcher } from "@/components/site/locale-switcher";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { WaitlistForm } from "@/components/site/waitlist-form";

function DimRule({ label }: { label: string }) {
  return (
    <div className="text-taupe flex items-center gap-3 font-mono text-[0.68rem] tracking-[0.1em] uppercase">
      <span className="bg-hairline h-px w-1.5" />
      <span className="bg-hairline h-px flex-1" />
      <span>{label}</span>
      <span className="bg-hairline h-px flex-1" />
      <span className="bg-hairline h-px w-1.5" />
    </div>
  );
}

function HowStep({
  n,
  title,
  body,
}: {
  n: string;
  title: string;
  body: string;
}) {
  return (
    <div className="border-border flex flex-col gap-3 border-t pt-5 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-6">
      <span className="text-cognac font-mono text-xs">{n}</span>
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{body}</p>
    </div>
  );
}

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  const [tNav, tHero, tHow, tDemo, tWaitlist, tFooter] = await Promise.all([
    getTranslations("Nav"),
    getTranslations("Hero"),
    getTranslations("How"),
    getTranslations("Demo"),
    getTranslations("Waitlist"),
    getTranslations("Footer"),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-[1060px] flex-1 flex-col gap-20 px-6 py-6 sm:gap-24 sm:px-10 sm:py-8">
      {/* top bar */}
      <header className="border-graphite flex items-end justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-2 font-serif text-2xl">
          <span className="bg-cognac inline-block h-px w-3.5" />
          prova
        </div>
        <div className="flex items-center gap-4">
          <LocaleSwitcher />
          <ThemeToggle />
        </div>
      </header>

      {/* hero */}
      <section className="grid items-end gap-8 sm:grid-cols-[1.4fr_1fr] sm:gap-12">
        <div>
          <p className="text-muted-foreground font-mono text-[0.7rem] tracking-[0.16em] uppercase">
            {tHero("eyebrow")}
          </p>
          <h1 className="mt-4 mb-5 font-serif text-4xl leading-[1.03] font-medium text-balance sm:text-6xl">
            {tHero("title")}
          </h1>
          <p className="text-muted-foreground max-w-[42ch]">{tHero("body")}</p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <a
              href="#waitlist"
              className="bg-primary text-primary-foreground ease-room focus-visible:outline-cognac px-5 py-3 text-sm font-semibold transition-transform duration-300 hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              {tHero("ctaPrimary")}
            </a>
            <a
              href="#how"
              className="border-hairline ease-room hover:border-graphite focus-visible:outline-cognac border px-5 py-3 text-sm font-semibold transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              {tHero("ctaSecondary")}
            </a>
          </div>
        </div>

        {/* material board — pinned samples */}
        <div
          className="border-graphite bg-card grid grid-cols-2 grid-rows-2 gap-2 border p-2.5"
          aria-hidden
        >
          <div className="text-muted-foreground flex h-24 items-end p-2 font-mono text-[0.6rem] tracking-[0.1em] uppercase [background:#f3efe7]">
            paper
          </div>
          <div className="flex h-24 items-end p-2 font-mono text-[0.6rem] tracking-[0.1em] text-[#d8c6b4] uppercase [background:linear-gradient(160deg,#6b5645,#2c2521)]">
            walnut
          </div>
          <div className="flex h-24 items-end p-2 font-mono text-[0.6rem] tracking-[0.1em] text-[#b3a895] uppercase [background:#26241f]">
            graphite
          </div>
          <div className="flex h-24 items-end p-2 font-mono text-[0.6rem] tracking-[0.1em] text-[#6b5236] uppercase [background:radial-gradient(90%_80%_at_70%_25%,rgba(233,201,138,0.9),rgba(233,201,138,0.12))]">
            amber 2700K
          </div>
        </div>
      </section>

      {/* how it works */}
      <section id="how" className="flex scroll-mt-8 flex-col gap-10">
        <DimRule label={tHow("eyebrow")} />
        <div className="flex flex-col gap-2">
          <h2 className="font-serif text-2xl font-medium sm:text-3xl">
            {tHow("title")}
          </h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-3 sm:gap-0">
          <HowStep n="1" title={tHow("step1Title")} body={tHow("step1Body")} />
          <HowStep n="2" title={tHow("step2Title")} body={tHow("step2Body")} />
          <HowStep n="3" title={tHow("step3Title")} body={tHow("step3Body")} />
        </div>
      </section>

      {/* product moment */}
      <section className="flex flex-col gap-10">
        <DimRule label={tDemo("eyebrow")} />
        <div className="flex flex-col gap-2">
          <h2 className="font-serif text-2xl font-medium sm:text-3xl">
            {tDemo("title")}
          </h2>
        </div>

        <div className="grid items-stretch gap-5 sm:grid-cols-2">
          {/* role card */}
          <article className="border-graphite bg-card flex flex-col gap-4 border p-6">
            <div className="flex items-center gap-3">
              <div className="text-amber grid size-9 place-items-center bg-[linear-gradient(150deg,var(--wood),var(--wood-deep))] font-serif text-lg">
                N
              </div>
              <div className="leading-tight">
                <div className="text-sm font-semibold">Studio Nordwind</div>
                <div className="text-muted-foreground text-xs">
                  {tDemo("companyMeta")}
                </div>
              </div>
            </div>

            <h3 className="font-serif text-2xl font-medium">{tDemo("role")}</h3>

            <div className="flex flex-wrap gap-1.5">
              {[
                tDemo("tagRemote"),
                tDemo("tagFulltime"),
                tDemo("tagField"),
              ].map((tag) => (
                <span
                  key={tag}
                  className="border-hairline text-muted-foreground border px-2 py-1 font-mono text-[0.66rem] tracking-[0.06em] uppercase"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="border-border bg-secondary flex items-baseline gap-2 border px-4 py-3">
              <span className="font-serif text-xl tabular-nums">
                €2 400 – 3 200
              </span>
              <span className="text-muted-foreground font-mono text-[0.66rem] tracking-[0.1em] uppercase">
                {tDemo("salaryPerMonth")}
              </span>
            </div>

            <div className="flex flex-col">
              {[
                {
                  n: "1",
                  now: true,
                  t: tDemo("step1Title"),
                  s: tDemo("step1Sub"),
                  time: tDemo("step1Time"),
                },
                {
                  n: "2",
                  now: false,
                  t: tDemo("step2Title"),
                  s: tDemo("step2Sub"),
                  time: tDemo("step2Time"),
                },
                {
                  n: "3",
                  now: false,
                  t: tDemo("step3Title"),
                  s: tDemo("step3Sub"),
                  time: tDemo("step3Time"),
                },
              ].map((step) => (
                <div
                  key={step.n}
                  className="border-border grid grid-cols-[auto_1fr_auto] items-center gap-3 border-t py-3 first:border-t-0"
                >
                  <span
                    className={
                      step.now
                        ? "border-cognac bg-cognac text-primary-foreground grid size-6 place-items-center border font-mono text-xs tabular-nums"
                        : "border-hairline text-muted-foreground grid size-6 place-items-center border font-mono text-xs tabular-nums"
                    }
                  >
                    {step.n}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">
                      {step.t}
                    </span>
                    <span className="text-muted-foreground block text-xs">
                      {step.s}
                    </span>
                  </span>
                  <span className="text-taupe font-mono text-xs whitespace-nowrap">
                    {step.time}
                  </span>
                </div>
              ))}
            </div>

            <p className="border-cognac text-muted-foreground border-l-2 pl-3.5 text-sm leading-relaxed">
              {tDemo("note")}
            </p>

            <div className="flex flex-wrap items-center gap-2.5">
              <span className="bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold">
                {tDemo("cta")} →
              </span>
              <span className="border-hairline border px-5 py-2.5 text-sm font-semibold">
                {tDemo("ctaSecondary")}
              </span>
            </div>
          </article>

          {/* status panel */}
          <aside className="border-graphite bg-secondary flex flex-col gap-4 border p-6">
            <p className="text-cognac font-mono text-[0.7rem] tracking-[0.16em] uppercase">
              {tDemo("statusEyebrow")}
            </p>
            <div className="mt-auto flex flex-col">
              <div className="border-border flex items-center gap-3 border-t py-3 text-sm first:border-t-0">
                <span className="bg-wood size-2 shrink-0 rounded-full" />
                {tDemo("statusSent")}
                <span className="text-taupe ml-auto font-mono text-xs">
                  02.07 · 21:14
                </span>
              </div>
              <div className="border-border flex items-center gap-3 border-t py-3 text-sm">
                <span className="bg-cognac size-2 shrink-0 rounded-full shadow-[0_0_0_4px_rgba(168,98,59,0.18)]" />
                {tDemo("statusLive")}
                <span className="text-taupe ml-auto font-mono text-xs">
                  {tDemo("statusLiveNow")}
                </span>
              </div>
              <div className="border-border text-muted-foreground flex items-center gap-3 border-t py-3 text-sm">
                <span className="border-taupe size-2 shrink-0 rounded-full border" />
                {tDemo("statusNext")}
                <span className="text-taupe ml-auto font-mono text-xs">
                  {tDemo("statusNextLabel")}
                </span>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* waitlist */}
      <section id="waitlist" className="flex scroll-mt-8 flex-col gap-8">
        <DimRule label={tWaitlist("eyebrow")} />
        <div className="flex max-w-[52ch] flex-col gap-3">
          <h2 className="font-serif text-2xl font-medium text-balance sm:text-3xl">
            {tWaitlist("title")}
          </h2>
          <p className="text-muted-foreground">{tWaitlist("body")}</p>
        </div>
        <WaitlistForm />
      </section>

      {/* footer */}
      <footer className="border-graphite mt-auto flex flex-wrap items-center justify-between gap-3 border-t pt-5 text-sm">
        <span className="text-muted-foreground font-serif">
          {tFooter("tagline")}
        </span>
        <span className="text-taupe font-mono text-xs tabular-nums">
          {tFooter("rights", { year: new Date().getFullYear() })}
        </span>
        <span className="sr-only">{tNav("forCompanies")}</span>
      </footer>
    </div>
  );
}
