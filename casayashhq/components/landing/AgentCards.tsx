import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type AgentCardData = {
  icon: string;
  name: string;
  title: string;
  department: string;
  description: string;
  model: string;
  accentColor: string;
  borderColor: string;
  badgeBg: string;
  badgeText: string;
};

const agents: AgentCardData[] = [
  {
    icon: "🍳",
    name: "Chef",
    title: "Meal Planner & Nutritionist",
    department: "Kitchen Operations",
    description:
      "Plans weekly menus based on dietary goals, generates shopping lists, and logs every meal with calorie estimates. Never lets the fridge go stale.",
    model: "Claude Code",
    accentColor: "text-brand-blue",
    borderColor: "border-brand-blue/30",
    badgeBg: "bg-brand-blue/10",
    badgeText: "text-brand-blue",
  },
  {
    icon: "🏠",
    name: "Manager",
    title: "Home Operations Manager",
    department: "House & Chores",
    description:
      "Assigns and tracks household chores, coordinates schedules between residents, and makes sure recurring tasks never fall through the cracks.",
    model: "Codex",
    accentColor: "text-green-600",
    borderColor: "border-green-600/30",
    badgeBg: "bg-green-600/10",
    badgeText: "text-green-600",
  },
  {
    icon: "💰",
    name: "Finance",
    title: "Budget Analyst",
    department: "Financial Planning",
    description:
      "Tracks spending vs. budget across every category, flags anomalies, and produces concise weekly reports so you always know where money goes.",
    model: "ZeroClaw",
    accentColor: "text-amber-600",
    borderColor: "border-amber-600/30",
    badgeBg: "bg-amber-600/10",
    badgeText: "text-amber-600",
  },
];

export default function AgentCards() {
  return (
    <section className="w-full bg-zinc-50 px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-14 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl">
            Meet your household crew
          </h2>
          <p className="mx-auto max-w-xl text-lg text-zinc-500">
            Three specialized agents — each with a defined role, a department,
            and a model powering it.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {agents.map((agent) => (
            <Card
              key={agent.name}
              className={`border-2 bg-white transition-shadow hover:shadow-md ${agent.borderColor}`}
            >
              <CardHeader>
                <div className="mb-2 text-4xl">{agent.icon}</div>
                <CardTitle
                  className={`text-lg font-bold ${agent.accentColor}`}
                >
                  {agent.name}
                </CardTitle>
                <p className="text-sm font-medium text-zinc-700">
                  {agent.title}
                </p>
                <p className="text-xs text-zinc-400">{agent.department}</p>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <p className="text-sm leading-relaxed text-zinc-600">
                  {agent.description}
                </p>
                <Badge
                  className={`w-fit text-xs font-semibold ${agent.badgeBg} ${agent.badgeText} border-0`}
                >
                  Powered by {agent.model}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
