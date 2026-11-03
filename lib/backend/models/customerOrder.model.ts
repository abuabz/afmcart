import mongoose, { Schema } from "mongoose";

export const customerOrderStatuses = [
  "placed",
  "confirmed",
  "packing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

const CustomerOrderLineSchema = new Schema({
  skuId: { type: Schema.Types.ObjectId, required: true, ref: "M06_product_sku" },
  sku: { type: String, required: true },
  name: { type: String, required: true },
  image: { type: String, default: "" },
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1 },
  options: [{
    name: { type: String, required: true },
    value: { type: String, required: true },
  }],
}, { _id: false });

const CustomerOrderSchema = new Schema({
  orderNumber: { type: String, required: true, unique: true, index: true },
  customer: {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    phone: { type: String, required: true, trim: true, maxlength: 20, index: true },
    email: { type: String, default: "", trim: true, maxlength: 160 },
    address: { type: String, required: true, trim: true, maxlength: 240 },
    place: { type: String, required: true, trim: true, maxlength: 100 },
    district: { type: String, required: true, trim: true, maxlength: 100 },
    state: { type: String, required: true, trim: true, maxlength: 100 },
    pincode: { type: String, required: true, trim: true, minlength: 6, maxlength: 6, index: true },
    landmark: { type: String, default: "", trim: true, maxlength: 160 },
  },
  items: { type: [CustomerOrderLineSchema], required: true, validate: (items: unknown[]) => items.length > 0 },
  subtotal: { type: Number, required: true, min: 0 },
  deliveryCharge: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true, min: 0 },
  status: { type: String, enum: customerOrderStatuses, default: "placed", index: true },
  statusHistory: [{
    status: { type: String, enum: customerOrderStatuses, required: true },
    note: { type: String, default: "" },
    at: { type: Date, default: Date.now },
  }],
  whatsappNotificationEnabled: { type: Boolean, default: false },
}, {
  timestamps: true,
  collection: "customer_orders",
});

export const CustomerOrder = mongoose.models.CustomerOrder ||
  mongoose.model("CustomerOrder", CustomerOrderSchema, "customer_orders");