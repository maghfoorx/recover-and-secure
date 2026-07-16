import { Doc } from "convex/_generated/dataModel";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const STOP_WORDS = new Set([
  "the",
  "and",
  "with",
  "for",
  "from",
  "was",
  "has",
  "had",
  "its",
  "one",
  "two",
  "near",
  "left",
  "lost",
  "found",
  "item",
  "colour",
  "color",
  "small",
  "large",
  "black",
  "white",
]);

export type MatchConfidence = "high" | "medium" | "low" | "none";

export interface MatchAssessment {
  score: number;
  confidence: MatchConfidence;
  reasons: string[];
  matchedKeywords: string[];
  sameCategory: boolean;
  similarLocation: boolean;
  daysApart: number;
}

export const MATCH_CONFIDENCE_LABELS: Record<MatchConfidence, string> = {
  high: "Strong match",
  medium: "Possible match",
  low: "Weak match",
  none: "No shared signals",
};

function tokenize(...texts: Array<string | undefined>) {
  const tokens = new Set<string>();
  for (const text of texts) {
    if (!text) continue;
    for (const word of text.toLowerCase().split(/[^a-z0-9]+/)) {
      if (word.length >= 3 && !STOP_WORDS.has(word)) {
        tokens.add(word);
      }
    }
  }
  return tokens;
}

function intersect(a: Set<string>, b: Set<string>) {
  return [...a].filter((token) => b.has(token));
}

/**
 * Scores how likely a lost-item report and a found item describe the same
 * physical item, using category, description keywords, location and date
 * proximity. Used to rank suggested matches — never to match automatically.
 */
export function assessMatch(
  lostItem: Doc<"lost_items">,
  foundItem: Doc<"found_items">,
): MatchAssessment {
  let score = 0;
  const reasons: string[] = [];

  const sameCategory =
    lostItem.category_slug !== undefined &&
    lostItem.category_slug === foundItem.category_slug;
  if (sameCategory) {
    score += 35;
    reasons.push("Same category");
  }

  const matchedKeywords = intersect(
    tokenize(lostItem.name, lostItem.details),
    tokenize(foundItem.name, foundItem.details),
  );
  if (matchedKeywords.length > 0) {
    score += Math.min(matchedKeywords.length * 15, 45);
    reasons.push(
      `Shared description: ${matchedKeywords.slice(0, 4).join(", ")}`,
    );
  }

  const similarLocation =
    intersect(tokenize(lostItem.location_lost), tokenize(foundItem.location_found))
      .length > 0;
  if (similarLocation) {
    score += 10;
    reasons.push("Similar area");
  }

  const daysApart = Math.round(
    Math.abs(foundItem.found_date - lostItem.date_reported) / DAY_IN_MS,
  );
  if (daysApart <= 1) {
    score += 10;
    reasons.push("Reported and found within a day");
  } else if (daysApart <= 3) {
    score += 5;
    reasons.push(`Reported and found ${daysApart} days apart`);
  }

  let confidence: MatchConfidence = "none";
  if (score >= 60) confidence = "high";
  else if (score >= 35) confidence = "medium";
  else if (score >= 15) confidence = "low";

  return {
    score,
    confidence,
    reasons,
    matchedKeywords,
    sameCategory,
    similarLocation,
    daysApart,
  };
}
