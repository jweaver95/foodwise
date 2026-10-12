import {
  householdStore,
  hydrateHousehold,
} from "./householdStore";
import { recallProduct, rememberProduct } from "./productCache";
import { emptyHousehold, loadHousehold } from "./storage";
import { getSupabase } from "./supabase/browser";
import type { HouseholdMember, HouseholdState, Product, RecentScan, VerdictStatus } from "./types";

type MemberRow = {
  id: string;
  name: string;
  relation: string;
  category_ids: number[] | null;
};

type ScanRow = {
  member_id: string | null;
  member_name: string;
  product_key: string;
  status: VerdictStatus;
  created_at: string;
};

type CategoryRow = { id: number; name: string; category_type: string };

const CATEGORY_NAMES = new Map<number, string>();

export async function loadCategories(): Promise<CategoryRow[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("allergen_categories")
    .select("id,name,category_type")
    .order("id");
  if (error) throw error;
  const rows = (data ?? []) as CategoryRow[];
  for (const row of rows) CATEGORY_NAMES.set(row.id, row.name);
  return rows;
}

function memberFromRow(row: MemberRow): HouseholdMember {
  const categoryIds = row.category_ids ?? [];
  return {
    id: row.id,
    name: row.name,
    relation: row.relation,
    allergens: [],
    protocols: [],
    categoryIds,
    categoryNames: categoryIds.map((id) => CATEGORY_NAMES.get(id) ?? `Category ${id}`),
  };
}

export async function bootstrapAccount() {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      householdStore.setAccountUser(null);
      if (householdStore.getSnapshot().source === "account") {
        hydrateHousehold(emptyHousehold);
      }
      return;
    }

    householdStore.setAccountUser(data.user.id);
    await loadCategories().catch(() => undefined);

    const [profileResult, memberResult, scanResult] = await Promise.all([
      supabase
        .from("profiles")
        .select("shopper_name,selected_member_id")
        .eq("id", data.user.id)
        .maybeSingle(),
      supabase
        .from("household_members")
        .select("id,name,relation,category_ids")
        .eq("user_id", data.user.id)
        .order("created_at"),
      supabase
        .from("scans")
        .select("member_id,member_name,product_key,status,created_at")
        .eq("user_id", data.user.id)
        .order("created_at", { ascending: false })
        .limit(6),
    ]);

    if (profileResult.error || memberResult.error || scanResult.error) return;

    const members = ((memberResult.data ?? []) as MemberRow[]).map(memberFromRow);
    const scans = ((scanResult.data ?? []) as ScanRow[]).map(
      (scan): RecentScan => ({
        productId: /^\d{8,14}$/.test(scan.product_key)
          ? `barcode-${scan.product_key}`
          : scan.product_key,
        memberId: scan.member_id ?? "",
        memberName: scan.member_name,
        status: scan.status,
        at: new Date(scan.created_at).getTime(),
      }),
    );
    await Promise.all(
      scans.map(async (scan) => {
        const barcode = /^barcode-(\d+)$/.exec(scan.productId)?.[1];
        if (!barcode || recallProduct(scan.productId)) return;
        try {
          const response = await fetch(`/api/lookup?barcode=${barcode}`);
          const body = (await response.json()) as { product?: Product };
          if (body.product) rememberProduct(body.product);
        } catch {
          // The scan still appears. Opening it asks for another scan if the product is gone.
        }
      }),
    );
    const profile = profileResult.data as {
      shopper_name: string | null;
      selected_member_id: string | null;
    } | null;

    const next: HouseholdState = {
      shopperName: profile?.shopper_name ?? "",
      members,
      selectedMemberId:
        profile?.selected_member_id ?? members[0]?.id ?? null,
      recentScans: scans,
      onboarded: members.length > 0,
      source: "account",
    };
    hydrateHousehold(next);
  } finally {
    householdStore.markReady();
  }
}

const PUBLIC_APP_URL = "https://foodwise-mu.vercel.app";

export async function signUp(email: string, password: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${PUBLIC_APP_URL}/account`,
    },
  });
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const supabase = getSupabase();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  await bootstrapAccount();
}

export async function requestPasswordReset(email: string) {
  const supabase = getSupabase();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${PUBLIC_APP_URL}/account/reset`,
  });
  if (error) throw error;
}

export async function updatePassword(password: string) {
  const supabase = getSupabase();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
  await bootstrapAccount();
}

export async function signOutAccount() {
  const supabase = getSupabase();
  householdStore.setAccountUser(null);
  await supabase.auth.signOut();
  hydrateHousehold(typeof window === "undefined" ? emptyHousehold : loadHousehold());
}
