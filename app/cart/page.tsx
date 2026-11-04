"use client"

import { useEffect, useState } from "react"
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Header from "@/components/light-header"
import Footer from "@/components/footer"
import Image from "next/image"
import Link from "next/link"
import { useCart } from "@/hooks/use-cart"

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, getCartTotal, getCartCount, clearCart } = useCart()
  const [customerDetails, setCustomerDetails] = useState({
    name: "",
    email: "",
    address: "",
    place: "",
    district: "",
    state: "",
    pincode: "",
    phoneNumber: "",
    landmark: "",
  })
  const [discount, setDiscount] = useState(0)
  const [whatsappNotificationsEnabled, setWhatsappNotificationsEnabled] = useState(false)
  const [locationLookup, setLocationLookup] = useState("")
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false)
  const [checkoutError, setCheckoutError] = useState("")
  const [orderResult, setOrderResult] = useState<{ orderNumber: string; total: number; whatsappUrl: string | null } | null>(null)

  useEffect(() => {
    fetch("/api/v1/customer/store-settings", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload) => {
        if (payload.success) setWhatsappNotificationsEnabled(payload.data.whatsappNotificationsEnabled)
      })
      .catch(() => undefined)
  }, [])

  useEffect(() => {
    if (!/^\d{6}$/.test(customerDetails.pincode)) {
      setLocationLookup("")
      return
    }
    const controller = new AbortController()
    setLocationLookup("Looking up postal area…")
    fetch(`/api/v1/customer/pincode/${customerDetails.pincode}`, { signal: controller.signal })
      .then(async (response) => {
        const payload = await response.json()
        if (!response.ok || !payload.success) throw new Error(payload.message || "Area lookup unavailable")
        setCustomerDetails((current) => current.pincode === customerDetails.pincode
          ? { ...current, place: payload.data.place || current.place, district: payload.data.district || current.district, state: payload.data.state || current.state }
          : current)
        setLocationLookup("Postal area added. Check the details before placing your order.")
      })
      .catch((error) => {
        if (error.name !== "AbortError") setLocationLookup("Enter your town and district manually if lookup is unavailable.")
      })
    return () => controller.abort()
  }, [customerDetails.pincode])

  const handleCustomerDetailsChange = (field: string, value: string) => {
    setCustomerDetails((prev) => ({ ...prev, [field]: value }))
  }

  const validateCustomerDetails = () => {
    const { name, address, place, district, state, pincode, phoneNumber } = customerDetails
    if (!name || !address || !place || !district || !state || !pincode || !phoneNumber) {
      setCheckoutError("Complete the required delivery details before placing your order.")
      return false
    }
    if (!/^\d{6}$/.test(pincode)) {
      setCheckoutError("Pincode must be a 6-digit number.")
      return false
    }
    if (!/^\d{10}$/.test(phoneNumber)) {
      setCheckoutError("Phone number must be a 10-digit number.")
      return false
    }
    return true
  }

  const handleCheckout = async () => {
    setCheckoutError("")
    if (!validateCustomerDetails()) return
    setIsSubmittingOrder(true)
    try {
      const response = await fetch("/api/v1/customer/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            name: customerDetails.name,
            phone: customerDetails.phoneNumber,
            email: customerDetails.email,
            address: customerDetails.address,
            place: customerDetails.place,
            district: customerDetails.district,
            state: customerDetails.state,
            pincode: customerDetails.pincode,
            landmark: customerDetails.landmark,
          },
          items: items.map((item) => ({ skuId: item.id, quantity: item.quantity, options: item.variations || [] })),
        }),
      })
      const payload = await response.json()
      if (!response.ok || !payload.success) throw new Error(payload.message || "Unable to place your order")
      setOrderResult(payload.data)
      clearCart()
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : "Unable to place your order")
    } finally {
      setIsSubmittingOrder(false)
    }
  }

  const subtotal = getCartTotal()
  const discountAmount = subtotal * discount
  const shipping = subtotal > 50 ? 0 : 9.99
  const total = subtotal - discountAmount + shipping

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-green-50 to-white">
        <Header />
        <div className="pt-24 pb-12 px-4">
          <div className="max-w-4xl mx-auto text-center">
            {orderResult && (
              <div role="status" className="mb-8 rounded-lg border border-green-200 bg-white p-6 text-left shadow-sm sm:p-8">
                <p className="text-xs font-bold uppercase tracking-wide text-green-800">Order received</p>
                <h1 className="mt-2 text-2xl font-black text-slate-950">Thank you for your order</h1>
                <p className="mt-2 text-sm text-slate-600">Order <strong>{orderResult.orderNumber}</strong> · ₹{orderResult.total.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link href="/track-order" className="inline-flex h-10 items-center rounded-md bg-green-800 px-4 text-sm font-bold text-white hover:bg-green-900">Track order</Link>
                  {whatsappNotificationsEnabled && orderResult.whatsappUrl && <a href={orderResult.whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center rounded-md border border-green-200 px-4 text-sm font-bold text-green-900 hover:bg-green-50">Notify us on WhatsApp</a>}
                </div>
              </div>
            )}
            <div className="mb-8">
              <ShoppingBag className="w-24 h-24 text-gray-400 mx-auto mb-4" />
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4 mobile-text-xl">
                Your Cart is Empty
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-8 mobile-text-base">
                Looks like you haven't added any items to your cart yet. Start shopping to fill it up!
              </p>
              <Link href="/products">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-green-700 to-white hover:from-white hover:to-green-700 text-black px-8 py-4 rounded-full transform hover:scale-105 transition-all duration-300 mobile-text-base"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-green-50 to-white">
      <Header />

      <div className="pt-24 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2 mobile-text-xl">
              Shopping Cart
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mobile-text-sm">{getCartCount()} items in your cart</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <Card
                  key={`${item.id}-${JSON.stringify(item.variations)}`} // Unique key including variations
                  className="border-0 bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 flex-wrap md:flex-nowrap gap-3 justify-center  ">
                      {/* Product Image */}
                      <div className="relative overflow-hidden rounded-lg">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          width={100}
                          height={100}
                          className="w-20 h-20 object-cover"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1">
                        <h3 className="text-base md:text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1 mobile-text-sm">
                          {item.name}
                        </h3>
                        {item.variations && item.variations.length > 0 && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mobile-text-sm">
                            {item.variations.map((v) => `${v.name}: ${v.value}`).join(", ")}
                          </p>
                        )}
                        <p className="text-green-700 font-bold text-lg md:text-xl mobile-text-base">₹{item.price}</p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.variations, Math.max(1, item.quantity - 1))}
                            className="px-3 py-2"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="px-4 py-2 font-medium text-gray-800 dark:text-gray-200">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.variations, item.quantity + 1)}
                            className="px-3 py-2"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Remove Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.id, item.variations)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 p-2"
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>

                      {/* Item Total */}
                      <div className="text-right">
                        <p className="text-base md:text-lg font-bold text-gray-800 dark:text-gray-200 mobile-text-sm">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Continue Shopping */}
              <div className="pt-4">
                <Link href="/products">
                  <Button
                    variant="outline"
                    className="border-green-200 dark:border-green-900 text-green-800 dark:text-amber-500 hover:bg-green-50 dark:hover:bg-green-900/20 mobile-text-sm"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="border-0 bg-gradient-to-br from-white to-green-50 shadow-xl sticky top-24">
                <CardContent className="p-6">
                  <h2 className="text-lg md:text-xl font-bold text-gray-800 dark:text-gray-200 mb-6 mobile-text-base">
                    Order Summary
                  </h2>

                  {/* Customer Details Form */}
                  <div className="space-y-4 mb-6">
                    <div>
                      <Label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 mobile-text-sm">
                        Name *
                      </Label>
                      <Input
                        id="name"
                        placeholder="Enter your name"
                        value={customerDetails.name}
                        onChange={(e) => handleCustomerDetailsChange("name", e.target.value)}
                        className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 mobile-text-sm">Email (Optional)</Label>
                      <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" value={customerDetails.email} onChange={(e) => handleCustomerDetailsChange("email", e.target.value)} className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600" />
                    </div>

                    <div>
                      <Label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 mobile-text-sm">Street address *</Label>
                      <Input id="address" autoComplete="street-address" placeholder="House, street, or building" value={customerDetails.address} onChange={(e) => handleCustomerDetailsChange("address", e.target.value)} className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600" required />
                    </div>

                    <div>
                      <Label htmlFor="place" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 mobile-text-sm">
                        Town / post office *
                      </Label>
                      <Input
                        id="place"
                        placeholder="Enter your place"
                        value={customerDetails.place}
                        onChange={(e) => handleCustomerDetailsChange("place", e.target.value)}
                        className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="district" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 mobile-text-sm">
                        District *
                      </Label>
                      <Input id="district" autoComplete="address-level2" placeholder="District" value={customerDetails.district} onChange={(e) => handleCustomerDetailsChange("district", e.target.value)} className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600" required />
                    </div>

                    <div>
                      <Label htmlFor="pincode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 mobile-text-sm">
                        Pincode *
                      </Label>
                      <Input
                        id="pincode"
                        placeholder="Enter your pincode"
                        value={customerDetails.pincode}
                        autoComplete="postal-code"
                        inputMode="numeric"
                        maxLength={6}
                        onChange={(e) => handleCustomerDetailsChange("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))}
                        className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                        required
                      />
                      {locationLookup && <p aria-live="polite" className="mt-1 text-xs text-slate-500">{locationLookup}</p>}
                    </div>

                    <div>
                      <Label htmlFor="state" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 mobile-text-sm">State *</Label>
                      <Input id="state" autoComplete="address-level1" placeholder="State" value={customerDetails.state} onChange={(e) => handleCustomerDetailsChange("state", e.target.value)} className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600" required />
                    </div>

                    <div>
                      <Label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 mobile-text-sm">
                        Phone Number *
                      </Label>
                      <Input
                        id="phoneNumber"
                        placeholder="Enter your phone number"
                        value={customerDetails.phoneNumber}
                        onChange={(e) => handleCustomerDetailsChange("phoneNumber", e.target.value)}
                        className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="landmark" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 mobile-text-sm">
                        Landmark (Optional)
                      </Label>
                      <Input
                        id="landmark"
                        placeholder="Enter a landmark (optional)"
                        value={customerDetails.landmark}
                        onChange={(e) => handleCustomerDetailsChange("landmark", e.target.value)}
                        className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                      />
                    </div>
                  </div>

                  {checkoutError && <p role="alert" className="mb-4 text-sm text-red-700">{checkoutError}</p>}

                  {/* Price Breakdown */}
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400 mobile-text-sm">Subtotal:</span>
                      <span className="font-medium text-gray-800 dark:text-gray-200 mobile-text-sm">
                        ₹{subtotal.toFixed(2)}
                      </span>
                    </div>

                    {discount > 0 && (
                      <div className="flex justify-between text-green-600 dark:text-green-400">
                        <span className="mobile-text-sm">Discount ({discount * 100}%):</span>
                        <span className="mobile-text-sm">-₹{discountAmount.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400 mobile-text-sm">Shipping:</span>
                      <span className="font-medium text-gray-800 dark:text-gray-200 mobile-text-sm">
                        {shipping === 0 ? "Free" : `₹${shipping.toFixed(2)}`}
                      </span>
                    </div>

                    {subtotal < 50 && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mobile-text-sm">
                        Add ₹{(50 - subtotal).toFixed(2)} more for free shipping!
                      </p>
                    )}

                    <hr className="border-gray-200 dark:border-gray-700" />

                    <div className="flex justify-between text-base md:text-lg font-bold">
                      <span className="text-gray-800 dark:text-gray-200 mobile-text-base">Total:</span>
                      <span className="text-green-700 mobile-text-base">₹{total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <Button
                    size="lg"
                    onClick={handleCheckout}
                    disabled={isSubmittingOrder}
                    className="w-full bg-green-800 hover:bg-green-900 text-white py-4 text-base md:text-lg font-semibold rounded-lg transition-colors disabled:opacity-60 mobile-text-base"
                  >
                    {isSubmittingOrder ? "Placing order…" : "Place order"}
                  </Button>

                  {/* Security Info */}
                  {/*                   <div className="mt-4 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mobile-text-sm">
                      🔒 Secure checkout with SSL encryption
                    </p>
                  </div> */}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}