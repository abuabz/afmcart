import mongoose, { Schema } from "mongoose";

const StoreSettingsSchema = new Schema({
  key: { type: String, required: true, unique: true, default: "storefront" },
  whatsappNotificationsEnabled: { type: Boolean, default: false },
}, {
  timestamps: true,
  collection: "store_settings",
});

export const StoreSettings = mongoose.models.StoreSettings ||
  mongoose.model("StoreSettings", StoreSettingsSchema, "store_settings");