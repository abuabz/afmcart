"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Plus, Minus, ShoppingCart, Truck, Shield, RotateCcw, Award, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import LightHeader from "@/components/light-header"
import Footer from "@/components/footer"
import ProductDetailSkeleton from "@/components/product-detail-skeleton"
import Image from "next/image"
import Link from "next/link"
import { useCart } from "@/hooks/use-cart"
import { useToast } from "@/hooks/use-toast"
// @ts-ignore
import debounce from "lodash/debounce"

// Define interface for API response (Product Details)
interface ProductImage {
  _id: string
  M07_image_path: string
  M07_M06_product_sku_id: string
  M07_order: number
  M07_is_active: number
}

interface ProductSpec {
  key: string
  value: string
}

interface ProductVariation {
  _id: string
  M10_M06_product_sku_id: string
  M10_M08_product_variation_id: string
  M10_M09_variation_option_id: string
  M08_name: string
  M08_M05_product_id: string
  M08_is_active: number
  M09_name: string
  M09_M05_product_id: string
  M09_M08_product_variation_id: string
  M09_is_active: number
}

interface ProductApiResponse {
  success: boolean
  msg: string
  data: {
    _id: string
    M06_sku: string
    M06_product_sku_name: string
    M06_description: string
    M06_features: string[]
    M06_specs: ProductSpec[]
    M06_thumbnail_image: string
    M06_MRP: number
    M06_price: number
    M06_quantity: number
    M06_is_new: boolean
    M06_single_order_limit: number | null
    M06_is_active: number
    M06_is_out_of_stock: boolean
    M06_M05_product_id: string
    Images: ProductImage[]
    Variations: ProductVariation[]
  }
  statusCode: number
}

interface Product {
  id: string
  name: string
  price: number
  originalPrice: number
  category: string
  images: string[]
  rating: number
  reviews: number
  badge: string
  description: string
  features: string[]
  specifications: { [key: string]: string }
  inStock: boolean
  stockCount: number
  variations: ProductVariation[]
  productId: string
}

// Define interface for Variation API response
interface VariationOption {
  _id: string
  M09_name: string
  M09_is_active: number
}

interface Variation {
  _id: string
  M08_name: string
  M08_is_active: number
  options: VariationOption[]
}

interface VariationApiResponse {
  success: boolean
  msg: string
  data: Variation[]
  statusCode: number
}

interface SkuVariationOption {
  _id: string
  name: string
}

interface SkuVariationDetail {
  _id: string
  name: string
  options: SkuVariationOption
}

interface SkuVariation {
  _id: string
  skuId: string
  M06_sku: string
  M06_product_sku_name: string
  M06_thumbnail_image: string
  variations: SkuVariationDetail[]
}

interface SkuVariationApiResponse {
  success: boolean
  msg: string
  data: SkuVariation[]
  statusCode: number
}

interface AvailableCombination {
  skuId: string
  variations: Record<string, string>
}

// Helper function to determine available options
const getAvailableOptions = (skuVariations: SkuVariation[]) => {
  const availableOptions: Record<string, Set<string>> = {} // variationId: Set of optionIds

  skuVariations.forEach((sku) => {
    sku.variations.forEach((variation) => {
      const variationId = variation._id
      const optionId = variation.options._id

      if (!availableOptions[variationId]) {
        availableOptions[variationId] = new Set()
      }
      availableOptions[variationId].add(optionId)
    })
  })

  return availableOptions
}

const COLOR_MAP: Record<string, string> = {
  red: "#dc2626", blue: "#2563eb", green: "#16a34a", black: "#111827", white: "#ffffff",
  yellow: "#facc15", orange: "#f97316", pink: "#ec4899", purple: "#9333ea", violet: "#7c3aed",
  grey: "#9ca3af", gray: "#9ca3af", silver: "#c0c0c8", gold: "#d4af37", brown: "#92400e",
  beige: "#e7d8b8", maroon: "#7f1d1d", navy: "#1e3a8a", teal: "#0d9488", cyan: "#06b6d4",
  lime: "#84cc16", sky: "#38bdf8", skyblue: "#38bdf8", lightblue: "#7dd3fc", darkblue: "#1e3a8a",
  lightgreen: "#86efac", darkgreen: "#166534", peach: "#fdba74", cream: "#fef3c7",
}

// Returns a CSS color for a color-option name, or null if it isn't recognisable
function cssColor(name: string): string | null {
  const v = name.trim().toLowerCase()
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/.test(v)) return v
  const compact = v.replace(/[\s_-]+/g, "")
  if (COLOR_MAP[compact]) return COLOR_MAP[compact]
  const words = v.split(/[\s_-]+/)
  const hit = words.reverse().find((w) => COLOR_MAP[w])
  return hit ? COLOR_MAP[hit] : null
}

export default function ProductDetailPage() {
  const params = useParams()
  const productId = params.id as string
  const router = useRouter()
  const { addToCart, updateQuantity, removeFromCart, items } = useCart()
  const { showToast } = useToast()

  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1) // Initialize quantity to 1
  const [activeTab, setActiveTab] = useState("features")
  const [isVisible, setIsVisible] = useState<Record<string, boolean>>({ "product-tabs": true })
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [variations, setVariations] = useState<Variation[]>([])
  const [skuVariations, setSkuVariations] = useState<SkuVariation[]>([])
  const [selectedVariations, setSelectedVariations] = useState<Record<string, string>>({})
  const [availableCombinations, setAvailableCombinations] = useState<AvailableCombination[]>([])
  const [availableOptions, setAvailableOptions] = useState<Record<string, Set<string>>>({})
  const [isExpanded, setIsExpanded] = useState(false)

  // Debounced function to update cart quantity
  const debouncedUpdateCartQuantity = useCallback(
    debounce((id: string, variations: { name: string; value: string }[], newQuantity: number) => {
      updateQuantity(id, variations, newQuantity)
    }, 1000),
    [updateQuantity]
  )

  // Fetch product data
  const fetchProductData = async (skuId: string) => {
    try {
      const response = await fetch(`/api/v1/customer/product-sku/${skuId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch product')
      }
      const data: ProductApiResponse = await response.json()
      if (data.success) {
        const apiProduct = data.data
        const mappedProduct: Product = {
          id: apiProduct._id,
          name: apiProduct.M06_product_sku_name,
          price: apiProduct.M06_price,
          originalPrice: apiProduct.M06_MRP,
          category: "Store Finds",
          images: apiProduct.Images.map((img) => img.M07_image_path),
          rating: 5,
          reviews: 24,
          badge: apiProduct.M06_is_new ? "New" : "Best Seller",
          description: apiProduct.M06_description,
          features: apiProduct.M06_features,
          specifications: apiProduct.M06_specs.reduce((acc: { [key: string]: string }, spec: ProductSpec) => {
            acc[spec.key] = spec.value
            return acc
          }, {}),
          inStock: !apiProduct.M06_is_out_of_stock,
          stockCount: apiProduct.M06_quantity,
          variations: apiProduct.Variations,
          productId: apiProduct.M06_M05_product_id,
        }
        return mappedProduct
      } else {
        throw new Error(data.msg || 'API returned unsuccessful response')
      }
    } catch (err) {
      throw err
    }
  }

  useEffect(() => {
    const initializeProductData = async () => {
      setLoading(true)
      setError(null)
      try {
        // Fetch initial product data
        const productData = await fetchProductData(productId)
        if (!productData) return
        setProduct(productData)
        const [variationResponse, skuVariationResponse] = await Promise.all([
          fetch(`/api/v1/customer/variation-by-product-id/${productData.productId}`),
          fetch(`/api/v1/customer/skus-variation-by-product-id/${productData.productId}`),
        ])
        if (!variationResponse.ok || !skuVariationResponse.ok) {
          throw new Error("Failed to fetch product options")
        }

        const [variationData, skuVariationData] = await Promise.all([
          variationResponse.json() as Promise<VariationApiResponse>,
          skuVariationResponse.json() as Promise<SkuVariationApiResponse>,
        ])
        if (!variationData.success || !skuVariationData.success) {
          throw new Error(variationData.msg || skuVariationData.msg || "Failed to fetch product options")
        }

        setVariations(variationData.data)
        setSkuVariations(skuVariationData.data)
        setAvailableOptions(getAvailableOptions(skuVariationData.data))

        const combinations = skuVariationData.data.map((sku: SkuVariation) => {
          const variationMap: Record<string, string> = {}
          sku.variations.forEach((v: SkuVariationDetail) => {
            const variation = variationData.data.find((varItem: Variation) => varItem.M08_name === v.name)
            const option = variation?.options.find((item: VariationOption) => item.M09_name === v.options.name)
            if (variation && option) variationMap[variation._id] = option._id
          })
          return { skuId: sku._id, variations: variationMap }
        })
        setAvailableCombinations(combinations)

        const currentSku = skuVariationData.data.find((sku: SkuVariation) => sku._id === productId)
        if (currentSku) {
          const initialSelections: Record<string, string> = {}
          currentSku.variations.forEach((v: SkuVariationDetail) => {
            const variation = variationData.data.find((varItem: Variation) => varItem.M08_name === v.name)
            const option = variation?.options.find((item: VariationOption) => item.M09_name === v.options.name)
            if (variation && option) initialSelections[variation._id] = option._id
          })
          setSelectedVariations(initialSelections)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    if (productId) {
      initializeProductData()
    }
  }, [productId])

  // Update quantity based on selected variations
  useEffect(() => {
    if (!product || Object.keys(selectedVariations).length === 0) return

    // Map selected variations to the format used in the cart
    const variationDetails = variations.map((variation) => ({
      name: variation.M08_name,
      value:
        variation.options.find((opt) => opt._id === selectedVariations[variation._id])?.M09_name || "",
    }))

    // Check if the current variation is in the cart
    const existingItem = items.find(
      (item) =>
        item.id === product.id &&
        JSON.stringify(item.variations) === JSON.stringify(variationDetails)
    )

    // If the variation is in the cart, set the quantity to the cart's quantity; otherwise, reset to 1
    setQuantity(existingItem ? existingItem.quantity : 1)
  }, [selectedVariations, items, product, variations])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }))
          }
        })
      },
      { threshold: 0.1 }
    )

    const elements = document.querySelectorAll("[data-animate]")
    elements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  const handleVariationChange = async (variationId: string, optionId: string) => {
    const newSelections = {
      ...selectedVariations,
      [variationId]: optionId,
    }

    // Check if the new selection matches an available combination
    let matchingCombination = availableCombinations.find((combo) =>
      Object.entries(newSelections).every(([vId, optId]) => combo.variations[vId] === optId)
    )

    if (matchingCombination) {
      // If exact match found, fetch and update full product data
      const newProductData = await fetchProductData(matchingCombination.skuId)
      if (newProductData && newProductData.id !== product?.id) {
        setProduct(newProductData)
        setSelectedImage(0)
      }
      setSelectedVariations(newSelections)
    } else {
      // If no exact match, find the first available combination with the selected option
      const partialMatch = availableCombinations.find((combo) => combo.variations[variationId] === optionId)
      if (partialMatch) {
        setSelectedVariations(partialMatch.variations)
        const newProductData = await fetchProductData(partialMatch.skuId)
        if (newProductData) {
          setProduct(newProductData)
          setSelectedImage(0)
        }
      } else {
        // If no combination includes the selected option, keep the selection but don't change product
        setSelectedVariations(newSelections)
      }
    }
  }

  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(newQuantity)

    if (!product) return

    // Map selected variations to the format used in the cart
    const variationDetails = variations.map((variation) => ({
      name: variation.M08_name,
      value:
        variation.options.find((opt) => opt._id === selectedVariations[variation._id])?.M09_name || "",
    }))

    // Update the cart quantity after a 1-second delay
    debouncedUpdateCartQuantity(product.id, variationDetails, newQuantity)
  }

  const isInCart = items.some(
    (item) =>
      item.id === product?.id &&
      JSON.stringify(item.variations) ===
      JSON.stringify(
        variations.map((variation) => ({
          name: variation.M08_name,
          value:
            variation.options.find((opt) => opt._id === selectedVariations[variation._id])?.M09_name || "",
        }))
      )
  )

  const handleCartAction = () => {
    if (!product) return

    if (isInCart) {
      removeFromCart(product.id, variations.map((variation) => ({
        name: variation.M08_name,
        value:
          variation.options.find((opt) => opt._id === selectedVariations[variation._id])?.M09_name || "",
      })))
      showToast(`${product.name} removed from cart!`, "info")
    } else {
      // Ensure all variations are selected before adding to cart
      const missingVariations = variations.filter(
        (variation) => !selectedVariations[variation._id]
      )
      if (missingVariations.length > 0) {
        showToast(`Please select a ${missingVariations[0].M08_name} option.`, "error")
        return
      }

      // Map selected variations to the format expected by the cart
      const variationDetails = variations.map((variation) => ({
        name: variation.M08_name,
        value:
          variation.options.find((opt) => opt._id === selectedVariations[variation._id])?.M09_name || "",
      }))

      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        quantity: quantity, // Use the current quantity
        variations: variationDetails, // Add selected variations to cart item
      })
      showToast(`${product.name} added to cart!`, "success")
    }
  }

  const handleBuyNow = () => {
    if (!product) return;

    // Map selected variations to the format used in the cart
    const variationDetails = variations.map((variation) => ({
      name: variation.M08_name,
      value:
        variation.options.find((opt) => opt._id === selectedVariations[variation._id])?.M09_name || "",
    }));

    if (!product.inStock) {
      // If product is out of stock, do nothing (button will be disabled)
      return;
    }

    // Check if all variations are selected
    const missingVariations = variations.filter(
      (variation) => !selectedVariations[variation._id]
    );
    if (missingVariations.length > 0) {
      showToast(`Please select a ${missingVariations[0].M08_name} option.`, "error");
      return;
    }

    // Check if product is already in cart
    const isCurrentlyInCart = items.some(
      (item) =>
        item.id === product.id &&
        JSON.stringify(item.variations) === JSON.stringify(variationDetails)
    );

    if (!isCurrentlyInCart) {
      // If product is not in cart, add it
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        quantity: quantity,
        variations: variationDetails,
      });
    }

    // Navigate to cart regardless of whether it was just added or already in cart
    router.push("/cart");
  };
  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case "Best Seller":
        return "bg-green-500"
      case "New":
        return "bg-blue-500"
      case "Popular":
        return "bg-green-700"
      default:
        return "bg-gray-500"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <LightHeader />
        <ProductDetailSkeleton />
        <Footer />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white">
        <LightHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-800 mb-4">
              {error || "Product Not Found"}
            </h1>
            <Link href="/products">
              <Button className="bg-gradient-to-r from-green-700 to-white text-black">Back to Products</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <LightHeader />

      {/* Breadcrumb */}
      <section className="pt-24 md:pt-28 pb-3 px-4">
        <div className="max-w-7xl mx-auto">
          <nav className="flex items-center text-sm font-medium text-slate-500">
            <Link href="/" className="hover:text-black transition-colors">
              Home
            </Link>
            <span className="mx-2 text-slate-300">/</span>
            <Link href="/products" className="hover:text-black transition-colors">
              Products
            </Link>
            <span className="mx-2 text-slate-300">/</span>
            <span className="text-slate-900 font-semibold">{product.name}</span>
          </nav>
        </div>
      </section>

      <section className="pb-10 md:pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Product Images */}
            <div className="flex flex-col md:flex-row gap-3 md:gap-4 md:items-start lg:max-w-[560px]">
              <div className="relative flex-1 min-w-0 aspect-[4/3] max-h-[300px] md:aspect-square md:max-h-[420px] overflow-hidden rounded-xl md:rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center p-3 md:p-8 group">
                <Image
                  src={product.images[selectedImage] || "/placeholder.svg"}
                  alt={product.name}
                  width={800}
                  height={800}
                  className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                  priority
                />
                {product.badge && (
                  <Badge className={`absolute top-3 left-3 md:top-6 md:left-6 px-3 py-1 text-[10px] md:text-xs font-bold uppercase tracking-wider ${getBadgeColor(product.badge)} text-white border-0 shadow-lg`}>
                    {product.badge}
                  </Badge>
                )}
              </div>

              {/* Thumbnail Images */}
              <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto md:max-h-[420px] pb-1 scrollbar-hide md:order-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative w-14 h-14 md:w-16 md:h-16 flex-shrink-0 overflow-hidden rounded-lg md:rounded-xl border-2 transition-all duration-300 ${selectedImage === index
                      ? "border-green-700 ring-2 ring-green-700/20"
                      : "border-slate-100 hover:border-slate-300 bg-slate-50"
                      }`}
                  >
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      priority={index === selectedImage}
                      className="object-contain p-2"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              <div className="mb-5">
                <div className="mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {product.category}
                  </span>
                </div>
                <h1 className="text-xl md:text-3xl font-bold text-slate-900 leading-snug mb-2">
                  {product.name}
                </h1>

                {/* Price */}
                <div className="flex flex-wrap items-baseline gap-3 mb-2">
                  <span className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">₹{product.price.toLocaleString()}</span>
                  {product.originalPrice && (
                    <span className="text-base md:text-xl text-slate-400 line-through font-medium">
                      ₹{product.originalPrice.toLocaleString()}
                    </span>
                  )}
                  {product.originalPrice && (
                    <span className="text-sm font-bold text-green-600 px-2 py-0.5 bg-green-50 rounded">
                      {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                    </span>
                  )}
                </div>
              </div>

              {/* Variations */}
              {variations.length > 0 && (
                <div className="space-y-5 mb-6">
                  {variations.map((variation) => {
                    const isColor = /colou?r/i.test(variation.M08_name)
                    return (
                      <div key={variation._id} className="space-y-2.5">
                        <div className="text-sm text-slate-500">
                          {variation.M08_name}:{" "}
                          <span className="font-semibold text-slate-900">
                            {variation.options.find((o) => o._id === selectedVariations[variation._id])?.M09_name}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          {variation.options.map((option) => {
                            const isDisabled = !availableOptions[variation._id]?.has(option._id)
                            const isSelected = selectedVariations[variation._id] === option._id
                            const swatch = isColor ? cssColor(option.M09_name) : null
                            const onPick = () => !isDisabled && handleVariationChange(variation._id, option._id)
                            if (swatch) {
                              return (
                                <button
                                  key={option._id}
                                  type="button"
                                  title={option.M09_name}
                                  aria-label={option.M09_name}
                                  onClick={onPick}
                                  disabled={isDisabled}
                                  className={`h-9 w-9 rounded-full p-0.5 border-2 transition ${isSelected ? "border-slate-900" : "border-transparent hover:border-slate-300"} ${isDisabled ? "opacity-30 cursor-not-allowed" : ""}`}
                                >
                                  <span className="block h-full w-full rounded-full border border-slate-300" style={{ background: swatch }} />
                                </button>
                              )
                            }
                            return (
                              <button
                                key={option._id}
                                type="button"
                                onClick={onPick}
                                disabled={isDisabled}
                                className={`min-w-[44px] px-4 py-2 rounded-lg text-sm font-medium border transition ${isSelected
                                  ? "border-slate-900 bg-slate-900 text-white"
                                  : "border-slate-300 bg-white text-slate-700 hover:border-slate-500"
                                  } ${isDisabled ? "opacity-30 cursor-not-allowed line-through" : ""}`}
                              >
                                {option.M09_name}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Stock and Features Preview */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  {product.inStock ? (
                    <div className="flex items-center gap-2 text-green-600 text-sm font-bold bg-green-50 px-3 py-1.5 rounded-full">
                      <CheckCircle2 className="w-4 h-4" />
                      In Stock & Ready to Ship
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-600 text-sm font-bold bg-red-50 px-3 py-1.5 rounded-full">
                      <div className="w-2 h-2 bg-current rounded-full animate-pulse" />
                      Currently Out of Stock
                    </div>
                  )}
                </div>


                <div className="mt-4 text-slate-600 text-sm leading-relaxed">
                  {isExpanded || !product?.description || product.description.length <= 150 ? (
                    <span>{product?.description}</span>
                  ) : (
                    <span>{product.description.substring(0, 150)}...</span>
                  )}
                  {product?.description && product.description.length > 150 && (
                    <button
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="text-green-800 font-bold hover:text-green-900 transition-colors ml-2"
                    >
                      {isExpanded ? "Read Less" : "Read More"}
                    </button>
                  )}
                </div>

              </div>

              {/* Quantity and Actions */}
              <div className="space-y-4 md:space-y-6 mt-2 md:mt-auto">
                <div className="flex items-center gap-6">
                  <span className="text-sm font-bold text-slate-900 uppercase tracking-wider">Quantity</span>
                  <div className="flex items-center bg-slate-50 rounded-2xl p-1 border border-slate-200">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleQuantityChange(Math.max(1, quantity - 1))}
                      className="h-10 w-10 rounded-xl hover:bg-white hover:shadow-sm text-slate-600"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-12 text-center font-bold text-slate-900">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleQuantityChange(quantity + 1)}
                      className="h-10 w-10 rounded-xl hover:bg-white hover:shadow-sm text-slate-600"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={handleBuyNow}
                    disabled={!product.inStock}
                    size="lg"
                    className={`h-12 md:h-14 text-sm md:text-base font-bold rounded-xl transition-all duration-300 shadow-sm active:scale-95 ${!product.inStock
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
                      : "bg-green-700 hover:bg-green-800 text-white"
                      }`}
                  >
                    Buy Now
                  </Button>
                  <Button
                    onClick={handleCartAction}
                    disabled={!product.inStock}
                    variant="outline"
                    size="lg"
                    className={`h-12 md:h-14 text-sm md:text-base font-bold rounded-xl border-2 transition-all duration-300 active:scale-95 ${!product.inStock
                      ? "bg-slate-100 border-slate-100 text-slate-400"
                      : isInCart
                        ? "bg-white border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                        : "bg-slate-900 border-slate-900 text-white hover:bg-slate-800 hover:text-white"
                      }`}
                  >
                    <ShoppingCart className="w-4 h-4 mr-1.5" />
                    {isInCart ? "Remove" : "Add to Cart"}
                  </Button>
                </div>

                {/* Benefits */}

              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="product-tabs"
        data-animate
        className={`py-10 md:py-20 px-4 bg-slate-50 border-y border-slate-100 transition-all duration-1000 ${isVisible["product-tabs"] ? "opacity-100 transform translate-y-0" : "opacity-0 transform translate-y-8"
          }`}
      >
        <div className="max-w-7xl mx-auto">
          {/* Tab Navigation */}
          <div className="flex justify-center gap-6 md:gap-12 border-b border-slate-200 mb-6 md:mb-12">
            {["features", "specifications"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 px-2 text-xs md:text-sm font-bold uppercase tracking-wider transition-all duration-300 relative ${activeTab === tab
                  ? "text-slate-900"
                  : "text-slate-400 hover:text-slate-600"
                  }`}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-700 rounded-t-full" />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="min-h-[100px]">
            {activeTab === "features" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {product.features.length > 0 ? (
                  product.features.map((feature, index) => (
                    <div key={index} className="flex gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm transition-all hover:shadow-md">
                      <div className="h-8 w-8 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-4 h-4 text-green-800" />
                      </div>
                      <span className="text-slate-600 text-sm font-medium leading-relaxed">{feature}</span>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-12 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                    <p className="text-slate-400 font-medium">No detailed features specified for this product.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "specifications" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                {Object.keys(product.specifications).length > 0 ? (
                  Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-4 border-b border-slate-100 px-2 transition-colors hover:bg-slate-50/50">
                      <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">{key}</span>
                      <span className="text-sm font-bold text-slate-900">{value}</span>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-12 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                    <p className="text-slate-400 font-medium">Specifications haven't been listed yet.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}