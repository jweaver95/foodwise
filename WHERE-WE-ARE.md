# Where we are

Saved the night of Wednesday, November 25, 2026, before travel. Live site: https://foodwise-mu.vercel.app. GitHub: https://github.com/jweaver95/foodwise. Latest commit on `main`: `d685cd9` — a 12-digit barcode matches the same number stored with a leading 0, and every other code stays exact.

## Barcode lookup

A product is found by the barcode, not by words in the name.

- 12 digits looks up that number and the same number with a 0 on the front.
- 13 digits starting with 0 looks up that number and the 12 digits behind the 0.
- Any other 13-digit code has to be that exact number. A different size is a different barcode.
- A changed digit, or a 13-digit code with one digit dropped, is rejected.

Checked on the live site: 12-digit Skippy returns Creamy Peanut Butter. The 13-digit Skippy code with the leading 0 returns the same jar. The 13-digit Nutella code returns Nutella.

The products table has 56 rows: 17 stored as 13 digits starting with 0, 3 stored as 12, and 36 real 13-digit codes that do not start with 0.

## Open Food Facts

If the barcode is not in the products table, or the saved row is older than 30 days, one Open Food Facts request asks for that exact number. A 12-digit code is sent with the leading 0. The call asks only for the name, brand, ingredients, allergen tags, and photo.

A row marked not found in the last 30 days stays unknown and does not call out again. The Open Food Facts result is not written back into the products table, so a barcode that is still missing will be asked again on the next scan.

## Already live from earlier tonight

Demo family stays Priya, shopping for Leo and Maya. Leo is peanuts and tree nuts. Maya is milk, wheat, and gluten. The engine decides. AI may phrase a suggestion and must not call a substitute safe. Only a new scan is a verdict.

Approved swaps come from the `ingredient_swaps` table, status approved, 22 rows. Unknown or unreadable products get no invented substitute. Meal suggestions stay behind the Meal suggestions button and show Sharon Spillman’s dishes only when every hit is one the menu actually leaves out. Wheat, gluten, soy, sesame, fish, and shellfish hide that button. The menu is one menu, not a per-allergen approval, and it is not free of all nine major allergens. Finding more items that leave all nine out is the team’s job.

## Still open

- Barry (wayvmath@gmail.com) still has to save the Supabase Site URL `https://foodwise-mu.vercel.app` and the redirect allow list `https://foodwise-mu.vercel.app/**`, plus the sender name Foodwise. Joseph is an administrator and cannot save those auth settings.
- Do not say a restaurant is safe. No restaurant list until the team has reviewed places.
- Do not build a paywall.
- Android barcode detection is in the app and has not been tried on a real Android phone.
- Left untracked on purpose: `.cursor/`, `public/img/`, `public/products/`, `demo-feature-boxes.png`, and `.env.local`.
