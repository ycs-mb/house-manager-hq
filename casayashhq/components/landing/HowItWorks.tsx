const steps = [
  {
    number: "01",
    title: "Agents wake on schedule",
    description:
      "Each agent runs on its own cron — weekly meal planning on Sunday, budget review on Friday, chore assignments every Monday.",
  },
  {
    number: "02",
    title: "They plan & decide",
    description:
      "Agents query your data, apply your preferences, and draft a complete plan — menus, task lists, spending summaries.",
  },
  {
    number: "03",
    title: "You approve what matters",
    description:
      "Anything above a threshold — grocery spend, schedule changes — surfaces in your dashboard as a one-tap approval request.",
  },
  {
    number: "04",
    title: "Results land in Notion",
    description:
      "Every completed task writes structured data back to Notion: meal logs, chore status, budget entries, and activity trails.",
  },
];

export default function HowItWorks() {
  return (
    <section className="w-full bg-white px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-14 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl">
            How it works
          </h2>
          <p className="mx-auto max-w-xl text-lg text-zinc-500">
            Four steps from sleeping agents to structured results — fully
            automated, minimally intrusive.
          </p>
        </div>

        {/* Desktop: horizontal flow */}
        <div className="hidden items-start md:flex">
          {steps.map((step, index) => (
            <div key={step.number} className="flex flex-1 items-start">
              <div className="flex flex-1 flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-navy text-sm font-bold text-white">
                  {step.number}
                </div>
                <h3 className="mb-2 text-base font-semibold text-brand-navy">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-zinc-500">
                  {step.description}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className="mt-6 flex-shrink-0 px-2 text-zinc-300">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M5 12h14M13 6l6 6-6 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Mobile: vertical flow */}
        <div className="flex flex-col gap-8 md:hidden">
          {steps.map((step) => (
            <div key={step.number} className="flex gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand-navy text-sm font-bold text-white">
                {step.number}
              </div>
              <div>
                <h3 className="mb-1 text-base font-semibold text-brand-navy">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-zinc-500">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Cost callout */}
        <div className="mt-14 rounded-2xl border border-brand-blue/20 bg-brand-blue-light/30 px-8 py-6 text-center">
          <p className="text-lg font-semibold text-brand-navy">
            $60/month total AI operating cost
          </p>
          <p className="mt-1 text-sm text-zinc-600">
            All three agents, all models, unlimited runs — less than a dinner
            out.
          </p>
        </div>
      </div>
    </section>
  );
}
