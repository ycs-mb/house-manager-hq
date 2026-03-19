type ScheduleRow = {
  when: string;
  agent: "Chef" | "Manager" | "Finance";
  action: string;
  notionOutput: string;
};

const schedule: ScheduleRow[] = [
  {
    when: "Sun 8 AM",
    agent: "Chef",
    action: "Plan weekly menus & generate shopping list",
    notionOutput: "Meal Plan DB + Shopping List page",
  },
  {
    when: "Sun 9 AM",
    agent: "Manager",
    action: "Assign weekly chores to household members",
    notionOutput: "Chores DB entries (To Do)",
  },
  {
    when: "Mon 7 AM",
    agent: "Chef",
    action: "Log Monday dinner prep & calories",
    notionOutput: "Meal Log DB entry",
  },
  {
    when: "Wed 6 PM",
    agent: "Finance",
    action: "Mid-week spending snapshot vs. budget",
    notionOutput: "Budget Tracker entry + alert if >70%",
  },
  {
    when: "Thu 8 AM",
    agent: "Manager",
    action: "Check chore completion; send reminders",
    notionOutput: "Chores DB status update",
  },
  {
    when: "Fri 6 PM",
    agent: "Finance",
    action: "Weekly budget review & variance report",
    notionOutput: "Weekly Finance Report page",
  },
  {
    when: "Fri 7 PM",
    agent: "Chef",
    action: "Log meals completed; flag missed items",
    notionOutput: "Meal Log DB + Weekly Nutrition Summary",
  },
  {
    when: "Sat 10 AM",
    agent: "Manager",
    action: "Mark completed chores; carry over pending",
    notionOutput: "Chores DB — closed + new entries",
  },
  {
    when: "Sat 11 AM",
    agent: "Finance",
    action: "Approve any flagged discretionary spend",
    notionOutput: "Approval log entry in Activity DB",
  },
];

const agentColors: Record<ScheduleRow["agent"], string> = {
  Chef: "bg-brand-blue/10 text-brand-blue",
  Manager: "bg-green-600/10 text-green-700",
  Finance: "bg-amber-600/10 text-amber-700",
};

const rowColors: Record<ScheduleRow["agent"], string> = {
  Chef: "bg-brand-blue/5",
  Manager: "bg-green-600/5",
  Finance: "bg-amber-600/5",
};

export default function WeeklySchedule() {
  return (
    <section className="w-full bg-zinc-50 px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-14 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl">
            A week in the life
          </h2>
          <p className="mx-auto max-w-xl text-lg text-zinc-500">
            Nine scheduled operations — every agent, every action, every Notion
            output, mapped out.
          </p>
        </div>

        {/* Horizontal scroll container for mobile */}
        <div className="overflow-x-auto rounded-2xl border border-zinc-100 shadow-sm">
          <table className="min-w-full bg-white text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-brand-navy text-left text-xs font-semibold uppercase tracking-wider text-white">
                <th className="px-5 py-4">When</th>
                <th className="px-5 py-4">Agent</th>
                <th className="px-5 py-4">Action</th>
                <th className="px-5 py-4">Notion Output</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((row, index) => (
                <tr
                  key={index}
                  className={`border-b border-zinc-50 last:border-0 ${rowColors[row.agent]}`}
                >
                  <td className="whitespace-nowrap px-5 py-3 font-medium text-zinc-700">
                    {row.when}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${agentColors[row.agent]}`}
                    >
                      {row.agent}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-zinc-700">{row.action}</td>
                  <td className="px-5 py-3 text-zinc-500">{row.notionOutput}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
