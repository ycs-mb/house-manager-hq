import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-brand-navy px-6 py-12 text-brand-blue-light/70">
      <div className="mx-auto max-w-5xl">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
          {/* Column 1: Firm name + tagline */}
          <div>
            <p className="mb-2 text-base font-bold text-white">Casa Yash HQ</p>
            <p className="text-sm leading-relaxed">
              Your home, managed by AI agents. Less logistics, more living.
            </p>
          </div>

          {/* Column 2: Nav links */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand-blue-light/50">
              Navigation
            </p>
            <ul className="flex flex-col gap-2 text-sm">
              <li>
                <Link
                  href="/dashboard"
                  className="transition-colors hover:text-white"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/meals"
                  className="transition-colors hover:text-white"
                >
                  Meals
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/chores"
                  className="transition-colors hover:text-white"
                >
                  Chores
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/budget"
                  className="transition-colors hover:text-white"
                >
                  Budget
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Built with */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand-blue-light/50">
              Built with
            </p>
            <ul className="flex flex-col gap-1 text-sm">
              <li>Next.js 16 · TypeScript · Tailwind CSS</li>
              <li>shadcn/ui · Prisma · NextAuth</li>
              <li>Claude Code · Codex · ZeroClaw</li>
              <li>Notion API</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-brand-blue-light/10 pt-6 text-center text-xs">
          © {new Date().getFullYear()} Casa Yash HQ. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
