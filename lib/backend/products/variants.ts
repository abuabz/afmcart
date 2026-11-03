import mongoose from "mongoose"
import "@/lib/backend/models/product.model"
import { ProductVariation } from "@/lib/backend/models/productVariation.model"
import { ProductVariationOption } from "@/lib/backend/models/productVariationOption"
import { ProductVariationConfiguration } from "@/lib/backend/models/productVariationConfiguration.model"
import { ProductSKU } from "@/lib/backend/models/productSKU.model"

export type VariantAttr = { name: string; value: string }

// Thrown for bad input so routes can answer 400 instead of 500
export class VariantError extends Error {}

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
const ci = (s: string) => new RegExp(`^${escapeRegex(s)}$`, "i")
const key = (s: string) => s.trim().toLowerCase()

export function normalizeVariants(raw: unknown): VariantAttr[] {
  if (!Array.isArray(raw)) return []
  const seen = new Set<string>()
  const out: VariantAttr[] = []
  for (const r of raw) {
    const name = String(r?.name ?? "").trim()
    const value = String(r?.value ?? "").trim()
    if (!name && !value) continue
    if (!name || !value) throw new VariantError("Each variant option needs both a name and a value")
    if (seen.has(key(name))) throw new VariantError(`Variant option "${name}" is added twice`)
    seen.add(key(name))
    out.push({ name, value })
  }
  return out
}

// skuId -> ordered options for every live SKU of the given products
async function loadConfigs(productIds: any[]) {
  const rows = (await ProductVariationConfiguration.find({
    M10_M05_product_id: { $in: productIds },
    M10_deleted_at: null,
  })
    .populate("M10_M08_product_variation_id", "M08_name")
    .populate("M10_M09_variation_option_id", "M09_name")
    .lean()) as any[]
  const live = new Set(
    (
      await ProductSKU.find({
        _id: { $in: rows.map((r) => r.M10_M06_product_sku_id) },
        M06_deleted_at: null,
      } as any)
        .select("_id")
        .lean()
    ).map((s: any) => String(s._id))
  )
  const bySku = new Map<string, { variationId: string; name: string; value: string }[]>()
  for (const r of rows) {
    const v = r.M10_M08_product_variation_id
    const o = r.M10_M09_variation_option_id
    const sku = String(r.M10_M06_product_sku_id)
    if (!v || !o || !live.has(sku)) continue
    if (!bySku.has(sku)) bySku.set(sku, [])
    bySku.get(sku)!.push({ variationId: String(v._id), name: v.M08_name, value: o.M09_name })
  }
  for (const list of bySku.values()) list.sort((a, b) => a.variationId.localeCompare(b.variationId))
  return bySku
}

// Rejects option sets that clash with, or don't line up with, sibling SKUs of the same product
export async function assertVariantsAllowed(productId: any, attrs: VariantAttr[], excludeSkuId?: string) {
  const bySku = await loadConfigs([productId])
  const siblings = [...bySku.entries()].filter(([id]) => id !== String(excludeSkuId))
  if (siblings.length === 0 || attrs.length === 0) return

  const sig = (list: { name: string; value: string }[]) =>
    list.map((a) => `${key(a.name)}=${key(a.value)}`).sort().join("|")
  const mine = sig(attrs)
  if (siblings.some(([, list]) => sig(list) === mine)) {
    throw new VariantError("This version already exists for the product (same option values)")
  }
}

export async function setSkuVariants(productId: any, skuId: any, attrs: VariantAttr[]) {
  await ProductVariationConfiguration.deleteMany({ M10_M06_product_sku_id: skuId })
  const docs: any[] = []
  for (const a of attrs) {
    let variation: any = await ProductVariation.findOne({
      M08_M05_product_id: productId,
      M08_deleted_at: null,
      M08_name: ci(a.name),
    })
    if (!variation) variation = await ProductVariation.create({ M08_name: a.name, M08_M05_product_id: productId })
    let option: any = await ProductVariationOption.findOne({
      M09_M08_product_variation_id: variation._id,
      M09_deleted_at: null,
      M09_name: ci(a.value),
    })
    if (!option) {
      option = await ProductVariationOption.create({
        M09_name: a.value,
        M09_M05_product_id: productId,
        M09_M08_product_variation_id: variation._id,
      })
    }
    docs.push({
      M10_M05_product_id: productId,
      M10_M06_product_sku_id: skuId,
      M10_M08_product_variation_id: variation._id,
      M10_M09_variation_option_id: option._id,
    })
  }
  if (docs.length) await ProductVariationConfiguration.insertMany(docs)
  await pruneUnusedVariations(productId)
}

export async function clearSkuVariants(productId: any, skuId: any) {
  await ProductVariationConfiguration.deleteMany({ M10_M06_product_sku_id: skuId })
  await pruneUnusedVariations(productId)
}

async function pruneUnusedVariations(productId: any) {
  const used = await ProductVariationConfiguration.find({ M10_M05_product_id: productId }).lean()
  const usedOptions = used.map((u) => u.M10_M09_variation_option_id)
  const usedVariations = used.map((u) => u.M10_M08_product_variation_id)
  await ProductVariationOption.deleteMany({ M09_M05_product_id: productId, _id: { $nin: usedOptions } } as any)
  await ProductVariation.deleteMany({ M08_M05_product_id: productId, _id: { $nin: usedVariations } } as any)
}

export async function getSkuVariants(skuId: string, productId: any): Promise<VariantAttr[]> {
  const bySku = await loadConfigs([productId])
  return (bySku.get(String(skuId)) || []).map(({ name, value }) => ({ name, value }))
}

// Display data for the admin list: "Red / 26" per SKU, and SKUs lacking options inside a variant group
export async function getVariantLabels(skus: { _id: any; productId: any }[]) {
  const productIds = [...new Set(skus.map((s) => String(s.productId)).filter((p) => mongoose.isValidObjectId(p)))]
  const bySku = await loadConfigs(productIds)
  const skuToProduct = new Map(skus.map((s) => [String(s._id), String(s.productId)]))
  const grouped = new Set<string>()
  for (const id of bySku.keys()) {
    const p = skuToProduct.get(id)
    if (p) grouped.add(p)
  }
  return new Map(
    skus.map((s) => {
      const list = bySku.get(String(s._id)) || []
      return [
        String(s._id),
        { label: list.map((a) => a.value).join(" / "), missing: list.length === 0 && grouped.has(String(s.productId)) },
      ]
    })
  )
}
