const stats = [
  {
    value: "3–5 hrs/week",
    label: "Lost to home admin tasks that could be automated",
  },
  {
    value: "4 siloed apps",
    label: "Juggled to manage meals, chores, budgets, and schedules",
  },
  {
    value: "0 automation",
    label: "Connecting all those tools to actually act on your behalf",
  },
];

export default function Problem() {
  return (
    <section className="w-full bg-white px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-14 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl">
            The overhead nobody talks about
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-zinc-500">
            Running a household is a second job. The planning, the
            coordination, the follow-through — it adds up invisibly, every
            single week.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.value}
              className="flex flex-col items-center rounded-2xl border border-zinc-100 bg-zinc-50 px-8 py-10 text-center shadow-sm"
            >
              <span className="mb-3 text-4xl font-extrabold text-brand-navy">
                {stat.value}
              </span>
              <span className="text-sm leading-relaxed text-zinc-500">
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-12 max-w-2xl text-center text-base leading-relaxed text-zinc-600">
          Casa Yash HQ replaces the chaos with a single intelligent platform.
          AI agents handle the planning, coordination, and execution — you
          just approve what matters and enjoy the results.
        </p>
      </div>
    </section>
  );
}
