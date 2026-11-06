import { StoreSettings } from "@/lib/backend/models/storeSettings.model";

export async function getStorefrontSettings() {
  return StoreSettings.findOneAndUpdate(
    { key: "storefront" },
    { $setOnInsert: { key: "storefront", whatsappNotificationsEnabled: false } },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
  ).lean();
}