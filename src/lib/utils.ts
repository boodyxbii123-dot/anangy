import type { ToothCondition, ToothType } from "./types";

export function formatEGP(amount: number): string {
  return `${amount.toLocaleString("en-EG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })} EGP`;
}

export function conditionLabel(condition: ToothCondition): string {
  return { sound: "Sound", semi_sound: "Semi Sound", caries: "Caries" }[
    condition
  ];
}

export function toothTypeLabel(type: ToothType): string {
  return { anterior: "Anterior", premolar: "Premolar", molar: "Molar" }[type];
}

export function slugifyCondition(condition: ToothCondition): string {
  return condition.replace("_", "-");
}

export function unslugifyCondition(slug: string): ToothCondition | null {
  const map: Record<string, ToothCondition> = {
    sound: "sound",
    "semi-sound": "semi_sound",
    caries: "caries",
  };
  return map[slug] ?? null;
}
