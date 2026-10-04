// Matching engine from PDF Section 10.2 and 10.3, run in the browser on synthetic partners.

export type PartnerType = "NGO" | "FOOD_BANK" | "COMPOSTER" | "ANIMAL_FEED" | "BIOGAS";
export type Urgency = "low" | "medium" | "high" | "critical";
export type Action = "DONATE" | "REDISTRIBUTE" | "UPCYCLE";

export interface Partner {
  id: string;
  name: string;
  type: PartnerType;
  lat: number;
  lon: number;
  verified: boolean;
  active: boolean;
  freeKg: number;
  categories: string[];
  vegOnly: boolean;
  open: [number, number]; // hours of day
  responseRate: number;
  availableNow: number;
  needsCategory: boolean;
  completed: number;
  accepted: number;
  avgRating: number; // 0-5
  recentShare: number; // share of last N allocations
}

export interface Listing {
  lat: number;
  lon: number;
  category: string;
  isVeg: boolean;
  quantityKg: number;
  hoursLeft: number;
  urgency: Urgency;
  action: Action;
  nowHour: number;
}

export interface Weights {
  dist: number; cap: number; time: number; resp: number; need: number; rel: number;
}

export const DEFAULT_WEIGHTS: Weights = { dist: 0.3, cap: 0.2, time: 0.2, resp: 0.15, need: 0.05, rel: 0.1 };

// Config values named in the PDF (config/matching.yaml defaults).
export const CONFIG = {
  dMaxKm: 15,
  bufferH: 20 / 60,
  minCapShare: 0.2,
  lambda: 0.15,
  // Not specified in the PDF. Simulation assumption for Haversine ETA.
  avgSpeedKmh: 20,
};

const R = 6371;
const rad = (d: number) => (d * Math.PI) / 180;

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const dLat = rad(lat2 - lat1);
  const dLon = rad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export function effectiveWeights(base: Weights, urgency: Urgency): Weights {
  const w = { ...base };
  if (urgency === "high" || urgency === "critical") {
    w.dist *= 1.3;
    w.time *= 1.4;
  }
  if (urgency === "critical") w.resp *= 1.5;
  const sum = w.dist + w.cap + w.time + w.resp + w.need + w.rel;
  if (sum <= 0) return { dist: 0, cap: 0, time: 0, resp: 0, need: 0, rel: 0 };
  return {
    dist: w.dist / sum, cap: w.cap / sum, time: w.time / sum,
    resp: w.resp / sum, need: w.need / sum, rel: w.rel / sum,
  };
}

export interface Factors { dist: number; cap: number; time: number; resp: number; need: number; rel: number }

export interface Scored {
  partner: Partner;
  distanceKm: number;
  etaH: number;
  failures: string[];
  factors?: Factors;
  score?: number;
  finalScore?: number;
}

const HUMAN: PartnerType[] = ["NGO", "FOOD_BANK"];
const UPCYCLERS: PartnerType[] = ["COMPOSTER", "ANIMAL_FEED", "BIOGAS"];

export function rankPartners(listing: Listing, partners: Partner[], base: Weights) {
  const w = effectiveWeights(base, listing.urgency);
  const out: Scored[] = partners.map((p) => {
    const d = haversineKm(listing.lat, listing.lon, p.lat, p.lon);
    const eta = d / CONFIG.avgSpeedKmh;
    const failures: string[] = [];
    if (!p.verified) failures.push("Not verified by admin");
    if (!p.active) failures.push("Partner suspended or inactive");
    const allowed = listing.action === "UPCYCLE" ? UPCYCLERS : HUMAN;
    if (!allowed.includes(p.type))
      failures.push(
        listing.action === "UPCYCLE"
          ? "Feeds people; UPCYCLE food is never offered to them"
          : `${p.type.replace("_", " ").toLowerCase()} partner does not take ${listing.action} food`,
      );
    if (!p.categories.includes(listing.category)) failures.push("Does not accept this food category");
    if (p.vegOnly && !listing.isVeg) failures.push("Veg-only partner, food is non-veg");
    if (d > CONFIG.dMaxKm) failures.push(`${d.toFixed(1)} km is beyond the ${CONFIG.dMaxKm} km radius`);
    const arrive = (listing.nowHour + eta) % 24;
    if (arrive < p.open[0] || arrive > p.open[1]) failures.push(`Closed at ETA (open ${p.open[0]}:00-${p.open[1]}:00)`);
    if (p.freeKg < CONFIG.minCapShare * listing.quantityKg)
      failures.push(`Free capacity ${p.freeKg} kg is below 20% of ${listing.quantityKg} kg`);
    if (eta + CONFIG.bufferH >= listing.hoursLeft) failures.push("Cannot arrive before the safe window ends");

    if (failures.length) return { partner: p, distanceKm: d, etaH: eta, failures };

    const relCount = (p.completed + 1) / (p.accepted + 2);
    const factors: Factors = {
      dist: Math.max(0, 1 - d / CONFIG.dMaxKm),
      cap: Math.min(1, p.freeKg / listing.quantityKg),
      time: Math.min(1, Math.max(0, (listing.hoursLeft - eta - CONFIG.bufferH) / listing.hoursLeft)),
      resp: p.responseRate * p.availableNow,
      need: p.needsCategory ? 1 : 0.5,
      rel: 0.5 * relCount + 0.5 * (p.avgRating / 5),
    };
    const score =
      w.dist * factors.dist + w.cap * factors.cap + w.time * factors.time +
      w.resp * factors.resp + w.need * factors.need + w.rel * factors.rel;
    const finalScore = score * (1 - CONFIG.lambda * p.recentShare);
    return { partner: p, distanceKm: d, etaH: eta, failures, factors, score, finalScore };
  });

  const eligible = out
    .filter((s) => !s.failures.length)
    .sort((a, b) => {
      const diff = (b.finalScore ?? 0) - (a.finalScore ?? 0);
      if (Math.abs(diff) > 1e-9) return diff;
      if (a.partner.recentShare !== b.partner.recentShare) return a.partner.recentShare - b.partner.recentShare;
      return a.distanceKm - b.distanceKm;
    });
  const filtered = out.filter((s) => s.failures.length);
  return { eligible, filtered, weights: w };
}

// Fictional partners around Thane (OPEN DECISION A3 default: Mumbai / Thane).
export const DONOR = { lat: 19.2183, lon: 72.9781, label: "Donor kitchen" };

const COOKED = ["cooked_meal", "bakery", "mixed_leftovers"];

export const PARTNERS: Partner[] = [
  { id: "p1", name: "Asha Community Kitchen", type: "NGO", lat: 19.2183, lon: 72.998, verified: true, active: true, freeKg: 10, categories: COOKED, vegOnly: false, open: [8, 22], responseRate: 0.85, availableNow: 0.95, needsCategory: true, completed: 40, accepted: 46, avgRating: 4.2, recentShare: 0.1 },
  { id: "p2", name: "Annapurna Shelter", type: "NGO", lat: 19.2525, lon: 72.9781, verified: true, active: true, freeKg: 30, categories: COOKED, vegOnly: false, open: [7, 23], responseRate: 0.8, availableNow: 0.9, needsCategory: true, completed: 31, accepted: 36, avgRating: 4.0, recentShare: 0.2 },
  { id: "p3", name: "Sahyog Food Bank", type: "FOOD_BANK", lat: 19.1598, lon: 72.9781, verified: true, active: true, freeKg: 120, categories: [...COOKED, "packaged"], vegOnly: false, open: [9, 21], responseRate: 0.7, availableNow: 0.85, needsCategory: false, completed: 60, accepted: 70, avgRating: 3.9, recentShare: 0.3 },
  { id: "p4", name: "Nirmal Trust", type: "NGO", lat: 19.2183, lon: 72.9695, verified: false, active: true, freeKg: 40, categories: COOKED, vegOnly: false, open: [0, 24], responseRate: 0.9, availableNow: 1, needsCategory: true, completed: 0, accepted: 0, avgRating: 0, recentShare: 0 },
  { id: "p5", name: "Green Loop Compost", type: "COMPOSTER", lat: 19.2440, lon: 73.0110, verified: true, active: true, freeKg: 300, categories: [...COOKED, "fruits_veg"], vegOnly: false, open: [6, 20], responseRate: 0.75, availableNow: 0.9, needsCategory: true, completed: 22, accepted: 25, avgRating: 4.1, recentShare: 0.1 },
  { id: "p6", name: "Seva Night Shelter", type: "NGO", lat: 19.3713, lon: 72.9781, verified: true, active: true, freeKg: 50, categories: COOKED, vegOnly: true, open: [17, 23], responseRate: 0.9, availableNow: 0.8, needsCategory: true, completed: 18, accepted: 20, avgRating: 4.5, recentShare: 0 },
];

export function deriveUrgency(hoursLeft: number): Urgency {
  // Simulation assumption: the PDF derives urgency from time-to-expiry and category but gives no cut-offs.
  if (hoursLeft <= 2) return "critical";
  if (hoursLeft <= 4) return "high";
  if (hoursLeft <= 12) return "medium";
  return "low";
}
