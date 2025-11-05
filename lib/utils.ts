import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Scores, Category } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateOverallScore(scores: Scores, categories: Category[]): number {
  let totalWeight = 0;
  let weightedSum = 0;

  categories.forEach((category) => {
    const score = scores[category.id];
    if (score > 0) {
      weightedSum += score * category.weight;
      totalWeight += category.weight;
    }
  });

  if (totalWeight === 0) return 0;
  return weightedSum / totalWeight;
}

export function formatScore(score: number): string {
  return score.toFixed(2);
}

export function getScoreColor(score: number): string {
  if (score >= 4.5) return "text-green-600";
  if (score >= 4.0) return "text-green-500";
  if (score >= 3.5) return "text-yellow-600";
  if (score >= 3.0) return "text-yellow-500";
  if (score >= 2.0) return "text-orange-500";
  return "text-red-500";
}



