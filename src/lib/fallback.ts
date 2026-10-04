// Rule-based fallback from PDF Sections 8.4 and 9.7. It is NOT the trained model.
import type { Action } from "./matching";

export interface FallbackInput {
  category: string;
  quantityKg: number;
  hoursToExpiry: number;
  storage: "refrigerated" | "room_temp" | "hot_held" | "frozen";
  servedBefore: boolean;
}

// Simulation assumption: nearby free capacity equals the eligible demo partners in the matching lab.
export const SIM_NEARBY_CAPACITY_KG = 40;

export function fallbackPredict(i: FallbackInput) {
  const pts: Record<Action, number> = { DONATE: 1, REDISTRIBUTE: 0.3, UPCYCLE: 0.1 };
  const reasons: string[] = [];

  if (i.hoursToExpiry <= 0) {
    pts.UPCYCLE += 4;
    reasons.push("The safe window has already ended, so the food should not go to people.");
  } else if (i.hoursToExpiry < 1) {
    pts.UPCYCLE += 2;
    reasons.push(`Only ${i.hoursToExpiry.toFixed(1)} hours of safe window left, too short to reach most partners.`);
  }
  if (i.servedBefore && (i.storage === "room_temp")) {
    pts.UPCYCLE += 2;
    reasons.push("Served before and kept at room temperature, which is weak storage for touched food.");
  } else if (i.servedBefore) {
    pts.UPCYCLE += 0.6;
    reasons.push("Food was served before (buffet or plate leftovers), which raises spoilage risk.");
  }
  if (i.quantityKg > SIM_NEARBY_CAPACITY_KG) {
    pts.REDISTRIBUTE += 1.5 + Math.min(1.5, i.quantityKg / SIM_NEARBY_CAPACITY_KG / 3);
    reasons.push(`${i.quantityKg} kg is more than the ${SIM_NEARBY_CAPACITY_KG} kg nearby partners can take, so it needs splitting or a food bank.`);
  }
  if (i.hoursToExpiry > 0 && i.hoursToExpiry < 2) {
    pts.REDISTRIBUTE += 0.6;
    reasons.push("Little time for a single pickup, so wider routing helps.");
  }
  if (i.storage === "refrigerated" || i.storage === "frozen" || i.storage === "hot_held") {
    pts.DONATE += 0.5;
    if (!i.servedBefore && i.hoursToExpiry > 0) reasons.push(`Kept ${i.storage.replace("_", " ")}, which keeps it safe longer.`);
  }
  if (i.hoursToExpiry >= 2 && i.quantityKg <= SIM_NEARBY_CAPACITY_KG && !i.servedBefore) {
    pts.DONATE += 1;
    reasons.push(`${i.hoursToExpiry} hours left and ${i.quantityKg} kg fits one nearby partner.`);
  }

  const total = pts.DONATE + pts.REDISTRIBUTE + pts.UPCYCLE;
  const probs = {
    DONATE: pts.DONATE / total,
    REDISTRIBUTE: pts.REDISTRIBUTE / total,
    UPCYCLE: pts.UPCYCLE / total,
  };
  const action = (Object.keys(probs) as Action[]).reduce((a, b) => (probs[b] > probs[a] ? b : a));
  return { action, probs, confidence: probs[action], reasons: reasons.slice(0, 3), lowConfidence: probs[action] < 0.5 };
}
