import { getSupabase } from "./supabase/browser";
import {
  clearHousehold,
  demoHousehold,
  emptyHousehold,
  loadHousehold,
  saveHousehold,
} from "./storage";
import {
  isUnverifiedLookup,
  type HouseholdMember,
  type HouseholdState,
  type RecentScan,
} from "./types";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/* localStorage is an external system, so the household lives in an external
   store that React subscribes to. This keeps the server render deterministic
   and avoids a hydration pass that writes state from an effect. */

const listeners = new Set<() => void>();

let snapshot: HouseholdState | null = null;
let accountUserId: string | null = null;
let ready = false;
let pushChain: Promise<void> = Promise.resolve();
let lastScanKey = "";
let syncError: string | null = null;

function scanProductKey(productId: string): string {
  const barcode = /^barcode-(\d+)$/.exec(productId);
  return barcode ? barcode[1] : productId;
}

function notify() {
  for (const listener of listeners) listener();
}

function readSnapshot(): HouseholdState {
  snapshot ??= loadHousehold();
  return snapshot;
}

function isUuid(value: string | null | undefined): value is string {
  return Boolean(value && UUID.test(value));
}

function pushAccount(state: HouseholdState) {
  const userId = accountUserId;
  if (!userId || state.source !== "account") return;
  const captured = state;
  pushChain = pushChain
    .then(async () => {
      const supabase = getSupabase();
      const members = captured.members.filter((member) => isUuid(member.id));

      if (members.length > 0) {
        const { error } = await supabase.from("household_members").upsert(
          members.map((member) => ({
            id: member.id,
            user_id: userId,
            name: member.name,
            relation: member.relation,
            category_ids: member.categoryIds ?? [],
          })),
        );
        if (error) throw error;
        const { error: deleteError } = await supabase
          .from("household_members")
          .delete()
          .eq("user_id", userId)
          .not("id", "in", `(${members.map((member) => member.id).join(",")})`);
        if (deleteError) throw deleteError;
      } else {
        const { error } = await supabase
          .from("household_members")
          .delete()
          .eq("user_id", userId);
        if (error) throw error;
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          shopper_name: captured.shopperName,
          selected_member_id: isUuid(captured.selectedMemberId)
            ? captured.selectedMemberId
            : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);
      if (profileError) throw profileError;

      const scan = captured.recentScans[0];
      if (!scan) return;
      const scanKey = `${scan.productId}|${scan.memberId}|${scan.at}`;
      if (scanKey === lastScanKey) return;
      lastScanKey = scanKey;
      const { error: scanError } = await supabase.from("scans").insert({
        user_id: userId,
        member_id: isUuid(scan.memberId) ? scan.memberId : null,
        member_name: scan.memberName,
        product_key: scanProductKey(scan.productId),
        status: scan.status,
      });
      if (scanError) throw scanError;
      syncError = null;
      notify();
    })
    .catch((error: unknown) => {
      syncError =
        error instanceof Error
          ? error.message
          : "Your household could not be saved. It is still on this screen.";
      notify();
    });
}

function commit(next: HouseholdState, origin: "edit" | "hydrate" = "edit") {
  snapshot = next;
  if (origin === "edit" && next.source === "account" && accountUserId) {
    pushAccount(next);
  } else if (origin === "edit" && next.source !== "account") {
    saveHousehold(next);
  }
  notify();
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
  isReady: () => ready,
  readSyncError: () => syncError,
  setAccountUser(id: string | null) {
    accountUserId = id;
  },
  markReady() {
    ready = true;
    notify();
  },
};

export function hydrateHousehold(next: HouseholdState) {
  const scan = next.recentScans[0];
  lastScanKey = scan ? `${scan.productId}|${scan.memberId}|${scan.at}` : "";
  commit(next, "hydrate");
}

export function loadDemo() {
  commit(demoHousehold);
}

export function selectMember(id: string) {
  mutate((current) => ({ ...current, selectedMemberId: id }));
}

export function saveMember(member: HouseholdMember) {
  if (readSnapshot().source === "demo") return;
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
  if (readSnapshot().source === "demo") return;
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
  if (readSnapshot().source === "demo") return;
  mutate((current) => ({ ...current, shopperName: name }));
}

export function recordScan(scan: RecentScan) {
  if (isUnverifiedLookup(scan.status)) return;
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
