import { Client } from "@notionhq/client";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import type { ActivityEntry, Agent, BudgetEntry, ChoreEntry, MealEntry } from "@/types";

const notion = new Client({ auth: process.env.NOTION_TOKEN });

const AGENT_VALUES: Agent[] = ["claude-code", "codex", "zeroclaw"];
const ACTIVITY_STATUS_VALUES: ActivityEntry["status"][] = ["Success", "Failed", "Pending"];
const CHORE_STATUS_VALUES: ChoreEntry["status"][] = ["To Do", "In Progress", "Done"];
const CHORE_FREQUENCY_VALUES: ChoreEntry["frequency"][] = ["Daily", "Weekly", "Monthly", "Seasonal"];
const MEAL_TYPE_VALUES: MealEntry["mealType"][] = ["Breakfast", "Lunch", "Dinner", "Snack"];

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function asPage(results: unknown[]): PageObjectResponse[] {
  return results.filter(
    (item): item is PageObjectResponse =>
      typeof item === "object" &&
      item !== null &&
      "object" in item &&
      (item as { object: string }).object === "page" &&
      "properties" in item,
  );
}

function pickProperty(
  properties: PageObjectResponse["properties"],
  candidates: string[],
): PageObjectResponse["properties"][string] | undefined {
  for (const key of candidates) {
    if (properties[key]) {
      return properties[key];
    }
  }
  return undefined;
}

function readPlainText(property: PageObjectResponse["properties"][string] | undefined): string {
  if (!property) {
    return "";
  }

  if (property.type === "title") {
    return property.title.map((part) => part.plain_text).join("").trim();
  }

  if (property.type === "rich_text") {
    return property.rich_text.map((part) => part.plain_text).join("").trim();
  }

  if (property.type === "select") {
    return property.select?.name?.trim() ?? "";
  }

  if (property.type === "status") {
    return property.status?.name?.trim() ?? "";
  }

  if (property.type === "date") {
    return property.date?.start ?? "";
  }

  if (property.type === "number") {
    return property.number?.toString() ?? "";
  }

  return "";
}

function readNumber(property: PageObjectResponse["properties"][string] | undefined): number {
  if (!property) {
    return 0;
  }

  if (property.type === "number") {
    return property.number ?? 0;
  }

  const parsed = Number.parseFloat(readPlainText(property));
  return Number.isFinite(parsed) ? parsed : 0;
}

function toEnum<T extends string>(value: string, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

function mapAgent(value: string): Agent {
  const normalized = value.toLowerCase().replaceAll("_", "-").replaceAll(" ", "-");
  return toEnum(normalized, AGENT_VALUES, "codex");
}

function mapMealType(value: string): MealEntry["mealType"] {
  const normalized = value.trim();
  return toEnum(normalized, MEAL_TYPE_VALUES, "Dinner");
}

function mapChoreStatus(value: string): ChoreEntry["status"] {
  return toEnum(value.trim(), CHORE_STATUS_VALUES, "To Do");
}

function mapChoreFrequency(value: string): ChoreEntry["frequency"] {
  return toEnum(value.trim(), CHORE_FREQUENCY_VALUES, "Weekly");
}

function mapActivityStatus(value: string): ActivityEntry["status"] {
  const normalized = value.trim();
  return toEnum(normalized, ACTIVITY_STATUS_VALUES, "Pending");
}

export async function getMealPlan(): Promise<MealEntry[]> {
  const response = await notion.dataSources.query({
    data_source_id: getEnv("NOTION_MEALS_DB_ID"),
    sorts: [{ timestamp: "created_time", direction: "descending" }],
  });

  return asPage(response.results).map((page) => {
    const { properties } = page;
    return {
      date: readPlainText(pickProperty(properties, ["Date", "When"])),
      mealType: mapMealType(readPlainText(pickProperty(properties, ["Meal Type", "Type"]))),
      recipeName: readPlainText(pickProperty(properties, ["Recipe", "Recipe Name", "Name"])),
      prepTime: readPlainText(pickProperty(properties, ["Prep Time", "Prep"])),
      calories: readNumber(pickProperty(properties, ["Calories", "Kcal"])),
      servings: readNumber(pickProperty(properties, ["Servings"])),
    };
  });
}

export async function getChores(): Promise<ChoreEntry[]> {
  const response = await notion.dataSources.query({
    data_source_id: getEnv("NOTION_CHORES_DB_ID"),
    sorts: [{ timestamp: "created_time", direction: "descending" }],
  });

  return asPage(response.results).map((page) => {
    const { properties } = page;

    const assigneeRaw = readPlainText(pickProperty(properties, ["Assignee", "Owner"]));
    const assignee = assigneeRaw === "Partner" ? "Partner" : "You";

    return {
      id: page.id,
      task: readPlainText(pickProperty(properties, ["Task", "Name"])),
      assignee,
      frequency: mapChoreFrequency(readPlainText(pickProperty(properties, ["Frequency"]))),
      dueDate: readPlainText(pickProperty(properties, ["Due Date", "Due"])),
      status: mapChoreStatus(readPlainText(pickProperty(properties, ["Status"]))),
    };
  });
}

export async function getBudget(): Promise<BudgetEntry[]> {
  const response = await notion.dataSources.query({
    data_source_id: getEnv("NOTION_BUDGET_DB_ID"),
    sorts: [{ timestamp: "created_time", direction: "descending" }],
  });

  return asPage(response.results).map((page) => {
    const { properties } = page;
    const budgeted = readNumber(pickProperty(properties, ["Budgeted", "Budget"]));
    const actual = readNumber(pickProperty(properties, ["Actual", "Spent"]));

    return {
      category: readPlainText(pickProperty(properties, ["Category", "Name"])),
      budgeted,
      actual,
      variance: actual - budgeted,
      month: readPlainText(pickProperty(properties, ["Month"])),
    };
  });
}

export async function getActivityLog(): Promise<ActivityEntry[]> {
  const response = await notion.dataSources.query({
    data_source_id: getEnv("NOTION_ACTIVITY_DB_ID"),
    sorts: [{ timestamp: "created_time", direction: "descending" }],
  });

  return asPage(response.results).map((page) => {
    const { properties } = page;

    return {
      agent: mapAgent(readPlainText(pickProperty(properties, ["Agent", "Agent Name", "Name"]))),
      action: readPlainText(pickProperty(properties, ["Action", "Task"])),
      timestamp: readPlainText(pickProperty(properties, ["Timestamp", "Date", "When"])),
      tokenCost: readNumber(pickProperty(properties, ["Token Cost", "Cost", "Tokens"])),
      status: mapActivityStatus(readPlainText(pickProperty(properties, ["Status"]))),
    };
  });
}
