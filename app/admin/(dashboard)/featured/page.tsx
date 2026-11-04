"use client"
import React, { useEffect, useState } from "react"
import { Star, Trash2, Plus, Loader2, X } from "lucide-react"

export default function FeaturedProducts() {
  const [featured, setFeatured] = useState<any[]>([])
  const [allProducts, setAllProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAdding, setIsAdding] = useState<string | null>(null)
  
  // Toast state
  const [toast, setToast] = useState<{msg: string, type: 'error' | 'success'} | null>(null)

  const showToast = (msg: string, type: 'error' | 'success' = 'error') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    fetchFeatured()
    fetchAllProducts()
  }, [])

  const fetchFeatured = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/featured")
      const json = await res.json()
      if (json.success) {
        setFeatured(json.data)
      }
    } catch (error) {
      console.error("Failed to fetch featured products")
    } finally {
      setLoading(false)
    }
  }

  const fetchAllProducts = async () => {
    try {
      const res = await fetch("/api/v1/customer/product-sku")
      const json = await res.json()
      if (json.success) {
        setAllProducts(json.data.products_skus || [])
      }
    } catch (error) {
      console.error("Failed to fetch all products")
    }
  }

  const handleAddFeatured = async (productId: string) => {
    setIsAdding(productId)
    try {
      const res = await fetch("/api/admin/featured", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId })
      })
      const data = await res.json()
      if (data.success) {
        showToast("Product added to featured list!", "success")
        fetchFeatured()
      } else {
        showToast(data.message, "error")
      }
    } catch (err) {
      showToast("Failed to add to featured", "error")
    } finally {
      setIsAdding(null)
    }
  }

  const handleRemoveFeatured = async (featuredId: string) => {
    if (!confirm("Are you sure you want to remove this from featured?")) return
    
    try {
      const res = await fetch(`/api/admin/featured/${featuredId}`, { method: "DELETE" })
      const data = await res.json()
      if (data.success) {
        showToast("Removed from featured list!", "success")
        fetchFeatured()
      } else {
        showToast(data.message, "error")
      }
    } catch (err) {
      showToast("Failed to remove from featured", "error")
    }
  }

  // Filter out products that are already featured
  const featuredProductIds = featured.map(f => f.P01_M06_product_id?._id)
  const availableProducts = allProducts.filter(p => !featuredProductIds.includes(p._id))

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Featured Products</h1>
          <p className="text-slate-500 mt-1">Highlight your best products on the storefront.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center shadow-lg shadow-indigo-500/30 transition-all">
          <Plus className="w-5 h-5 mr-2" />
          Add to Featured
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Image</th>
                <th className="px-6 py-4 font-medium">Product Name</th>
                <th className="px-6 py-4 font-medium">Price</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-indigo-500" />
                    Loading featured products...
                  </td>
                </tr>
              ) : featured.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                    No featured products yet. Click "Add to Featured" to select some.
                  </td>
                </tr>
              ) : (
                featured.map((item) => {
                  const prod = item.P01_M06_product_id
                  if (!prod) return null
                  return (
                    <tr key={item._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-3">
                        <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 flex items-center justify-center">
                          {prod.M06_thumbnail_image ? (
                            <img src={prod.M06_thumbnail_image} alt={prod.M06_product_sku_name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[10px] text-slate-400">No Img</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-900 flex items-center">
                          {prod.M06_product_sku_name}
                          <Star className="w-3 h-3 ml-2 text-yellow-500 fill-yellow-500" />
                        </p>
                        <p className="text-xs text-slate-500">{prod.M06_sku}</p>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">₹{prod.M06_price}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => handleRemoveFeatured(item._id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Remove from Featured">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Select Products Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
              <h2 className="text-xl font-bold text-slate-900">Select Product to Feature</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700 bg-white rounded-full p-1 border border-slate-200 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-0 overflow-y-auto flex-1">
              {availableProducts.length === 0 ? (
                <div className="p-12 text-center text-slate-500">
                  All products are already featured, or you have no products yet!
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {availableProducts.map((prod) => (
                    <div key={prod._id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
                          {prod.M06_thumbnail_image && (
                            <img src={prod.M06_thumbnail_image} alt={prod.M06_product_sku_name} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{prod.M06_product_sku_name}</p>
                          <p className="text-xs text-slate-500">₹{prod.M06_price}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddFeatured(prod._id)}
                        disabled={isAdding === prod._id}
                        className="px-4 py-2 bg-indigo-50 text-indigo-600 font-bold text-sm rounded-xl hover:bg-indigo-100 transition-colors disabled:opacity-50"
                      >
                        {isAdding === prod._id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Custom Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-8 fade-in duration-300 z-[60] ${
          toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
        }`}>
          <div className="font-semibold">{toast.msg}</div>
          <button onClick={() => setToast(null)} className="opacity-80 hover:opacity-100 transition-opacity">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
