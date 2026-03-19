import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-brand-navy px-6 py-24 text-center">
      {/* Dot-grid SVG background */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="dot-grid"
            x="0"
            y="0"
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="1.5" cy="1.5" r="1.5" fill="#D6E4F0" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dot-grid)" />
      </svg>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl">
        <p className="mb-4 text-sm font-medium uppercase tracking-widest text-brand-blue-light/70">
          Casa Yash HQ
        </p>
        <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl">
          Your home, managed by{" "}
          <span className="text-brand-blue-light">AI agents</span>
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-brand-blue-light/80 sm:text-xl">
          Meal planning, chores, budgets, and scheduling — automated end-to-end
          by a crew of specialized agents so you can focus on living, not
          logistics.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex h-12 items-center justify-center rounded-full bg-brand-blue px-8 text-base font-semibold text-white transition-colors hover:bg-brand-blue/90"
        >
          Go to Dashboard →
        </Link>
      </div>
    </section>
  );
}
