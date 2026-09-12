import {
  clearHousehold,
  demoHousehold,
  emptyHousehold,
  loadHousehold,
  saveHousehold,
} from "./storage";
import type { HouseholdMember, HouseholdState, RecentScan } from "./types";

/* localStorage is an external system, so the household lives in an external
   store that React subscribes to. This keeps the server render deterministic
   and avoids a hydration pass that writes state from an effect. */

const listeners = new Set<() => void>();

let snapshot: HouseholdState | null = null;

function readSnapshot(): HouseholdState {
  snapshot ??= loadHousehold();
  return snapshot;
}

function commit(next: HouseholdState) {
  snapshot = next;
  saveHousehold(next);
  for (const listener of listeners) listener();
}

function mutate(mutator: (current: HouseholdState) => HouseholdState) {
  commit(mutator(readSnapshot()));
}

export const householdStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  getSnapshot: readSnapshot,
  getServerSnapshot(): HouseholdState {
    return emptyHousehold;
  },
};

export function loadDemo() {
  commit(demoHousehold);
}

export function selectMember(id: string) {
  mutate((current) => ({ ...current, selectedMemberId: id }));
}

export function saveMember(member: HouseholdMember) {
  mutate((current) => {
    const exists = current.members.some((item) => item.id === member.id);
    return {
      ...current,
      members: exists
        ? current.members.map((item) => (item.id === member.id ? member : item))
        : [...current.members, member],
      selectedMemberId: current.selectedMemberId ?? member.id,
      onboarded: true,
    };
  });
}

export function removeMember(id: string) {
  mutate((current) => {
    const members = current.members.filter((item) => item.id !== id);
    return {
      ...current,
      members,
      selectedMemberId:
        current.selectedMemberId === id
          ? (members[0]?.id ?? null)
          : current.selectedMemberId,
    };
  });
}

export function setShopperName(name: string) {
  mutate((current) => ({ ...current, shopperName: name }));
}

export function recordScan(scan: RecentScan) {
  mutate((current) => {
    const alreadyTop =
      current.recentScans[0]?.productId === scan.productId &&
      current.recentScans[0]?.memberId === scan.memberId;
    if (alreadyTop) return current;

    const deduped = current.recentScans.filter(
      (item) =>
        !(item.productId === scan.productId && item.memberId === scan.memberId),
    );
    return { ...current, recentScans: [scan, ...deduped].slice(0, 6) };
  });
}

export function reset() {
  clearHousehold();
  commit(emptyHousehold);
}
