export interface ParsedIngredient {
  name: string;
  amount: string;
  unit: string;
}

export interface ParsedStep {
  step_number: number;
  instruction: string;
  tip: string;
  image_url?: string;
}

export interface ParsedNutrition {
  calories: number;
  carbohydrates: number;
  protein: number;
  fat: number;
  sodium: number;
}

export interface ParsedRecipe {
  title: string;
  description: string;
  category: string;
  servings: number;
  prep_time: string;
  cook_time: string;
  ingredients: ParsedIngredient[];
  steps: ParsedStep[];
  nutrition: ParsedNutrition;
}

export interface ParseError {
  error: "PARSE_FAILED";
  reason: string;
}

export type ParseResult = ParsedRecipe | ParseError;
