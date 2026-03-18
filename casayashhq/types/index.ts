export type Agent = "claude-code" | "codex" | "zeroclaw";

export type MealEntry = {
  date: string;
  mealType: "Breakfast" | "Lunch" | "Dinner" | "Snack";
  recipeName: string;
  prepTime: string;
  calories: number;
  servings: number;
};

export type ChoreEntry = {
  id: string;
  task: string;
  assignee: "You" | "Partner";
  frequency: "Daily" | "Weekly" | "Monthly" | "Seasonal";
  dueDate: string;
  status: "To Do" | "In Progress" | "Done";
};

export type BudgetEntry = {
  category: string;
  budgeted: number;
  actual: number;
  variance: number;
  month: string;
};

export type ActivityEntry = {
  agent: Agent;
  action: string;
  timestamp: string;
  tokenCost: number;
  status: "Success" | "Failed" | "Pending";
};

export type ApprovalRequest = {
  id: string;
  agentName: Agent;
  requestType: string;
  description: string;
  context?: string;
  status: "pending" | "approved" | "rejected";
  note?: string;
  createdAt: string;
  resolvedAt?: string;
};
