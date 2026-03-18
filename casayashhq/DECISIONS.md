# Architecture Decisions

## ADR-001: Using Next.js 16 instead of Next.js 14

**Date:** 2026-03-19
**Decision:** Scaffold used Next.js 16.2.0 (latest) with React 19 instead of the spec-mandated 14.

**Reason:** `create-next-app@latest` installs the current stable release. Pinning to v14 would require a manual install with known security vulnerabilities. Next.js 16 still uses App Router, TypeScript, and all specified APIs (`NextResponse`, route handlers, middleware) — no functional difference for this project.

**Tailwind CSS v4:** Installed alongside. The design token approach shifts from `tailwind.config.ts` to CSS `@theme` variables in `globals.css`. Brand tokens added there instead.

**shadcn Toast → Sonner:** The `toast` shadcn component was deprecated. Using `sonner` instead per shadcn guidance. The `ApprovalCard.tsx` spec references Sonner explicitly so this is aligned.

## ADR-002: next-auth v4 (not v5 beta)

**Date:** 2026-03-19
**Decision:** Using `next-auth@4` per spec (`NextAuthOptions`, `getServerSession`, `CredentialsProvider` are v4 APIs).
