import { DEMO_MEMBERS, DEMO_SHOPPER } from "./data";
import type { HouseholdState } from "./types";

const KEY = "foodwise-household-v1";

export const emptyHousehold: HouseholdState = {
  shopperName: "",
  members: [],
  selectedMemberId: null,
  recentScans: [],
  onboarded: false,
  source: "local",
};

export const demoHousehold: HouseholdState = {
  shopperName: DEMO_SHOPPER,
  members: DEMO_MEMBERS,
  selectedMemberId: DEMO_MEMBERS[0].id,
  recentScans: [],
  onboarded: true,
  source: "demo",
};

export function loadHousehold(): HouseholdState {
  if (typeof window === "undefined") return emptyHousehold;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return emptyHousehold;
    const parsed = JSON.parse(raw) as Partial<HouseholdState>;
    if (!Array.isArray(parsed.members)) return emptyHousehold;
    if (parsed.source === "demo") {
      const demoIds = new Set(DEMO_MEMBERS.map((member) => member.id));
      const selected = parsed.selectedMemberId;
      return {
        ...demoHousehold,
        selectedMemberId:
          typeof selected === "string" && demoIds.has(selected)
            ? selected
            : demoHousehold.selectedMemberId,
        recentScans: Array.isArray(parsed.recentScans)
          ? parsed.recentScans.filter((scan) => demoIds.has(scan.memberId))
          : [],
      };
    }
    return {
      ...emptyHousehold,
      ...parsed,
      members: parsed.members,
      recentScans: Array.isArray(parsed.recentScans) ? parsed.recentScans : [],
      source: "local",
    };
  } catch {
    return emptyHousehold;
  }
}

export function saveHousehold(state: HouseholdState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Private-mode storage failures should not break the app.
  }
}

export function clearHousehold() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}
