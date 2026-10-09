"use client";

import { useSyncExternalStore } from "react";
import { householdStore } from "@/lib/householdStore";
import type { HouseholdMember, HouseholdState } from "@/lib/types";

export {
  loadDemo,
  recordScan,
  removeMember,
  reset,
  saveMember,
  selectMember,
  setShopperName,
} from "@/lib/householdStore";

const subscribeOnce = () => () => {};

/** False during the server render and the first client render, true after. */
function useIsHydrated(): boolean {
  return useSyncExternalStore(
    subscribeOnce,
    () => true,
    () => false,
  );
}

export function useHousehold(): HouseholdState & {
  hydrated: boolean;
  ready: boolean;
  selectedMember: HouseholdMember | null;
  syncError: string | null;
} {
  const state = useSyncExternalStore(
    householdStore.subscribe,
    householdStore.getSnapshot,
    householdStore.getServerSnapshot,
  );
  const hydrated = useIsHydrated();
  const ready = useSyncExternalStore(
    householdStore.subscribe,
    householdStore.isReady,
    () => false,
  );

  const selectedMember =
    state.members.find((member) => member.id === state.selectedMemberId) ??
    state.members[0] ??
    null;

  const syncError = useSyncExternalStore(
    householdStore.subscribe,
    householdStore.readSyncError,
    () => null,
  );

  return { ...state, hydrated, ready, selectedMember, syncError };
}
