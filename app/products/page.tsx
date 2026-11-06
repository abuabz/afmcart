"use client"

import { useState, useEffect, useRef } from "react"
import { Search, Filter, Star, ArrowRight, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Header from "@/components/light-header"
import Footer from "@/components/footer"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"

// Define interfaces for category API response
interface ProductCategory {
  _id: string
  M04_category_name: string
  M04_image: string | null
  M04_M04_parent_category_id: string | null
  M04_is_active: number
  M04_deleted_at: string | null
  createdAt: string
  updatedAt: string
}

interface CategoryApiResponse {
  success: boolean
  msg: string
  data: {
    productCategories: ProductCategory[]
    pagination: {
      currentPage: number
      totalPages: number
      totalItems: number
      limit: number
    }
  }
  statusCode: number
}

// Define interfaces for product SKU API response
interface ProductSku {
  _id: string
  M06_sku: string
  M06_product_sku_name: string
  M06_description: string
  M06_thumbnail_image: string
  M06_MRP: number
  M06_price: number
  M06_quantity: number
  M06_is_new: boolean
  M06_single_order_limit: number | null
  M06_is_active: number
  M06_deleted_at: string | null
  M06_is_out_of_stock: boolean
  M06_M05_product_id: string
  createdAt: string
  updatedAt: string
  Variations: any[]
}

interface ProductApiResponse {
  success: boolean
  msg: string
  data: {
    products_skus: ProductSku[]
    pagination: {
      page: number
      limit: number
      totalItems: number
      totalPages: number
    }
  }
  statusCode: number
}

// Define interface for products to render
interface Product {
  id: string
  name: string
  price: number
  category: string
  image: string
  rating: number
  reviews: number
  originalPrice: number
  description: string
  variantCount?: number
}

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [allCategories, setAllCategories] = useState<ProductCategory[]>([])
  const [parentCategories, setParentCategories] = useState<ProductCategory[]>([])

  const [selectedParentId, setSelectedParentId] = useState<string | null>(null)
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null)

  const [searchTerm, setSearchTerm] = useState("")
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loadingCategories, setLoadingCategories] = useState<boolean>(true)
  const [categoryError, setCategoryError] = useState<string | null>(null)
  const [loadingProducts, setLoadingProducts] = useState<boolean>(true)
  const [productError, setProductError] = useState<string | null>(null)
  const [totalProducts, setTotalProducts] = useState<number>(0)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [showCategoryBar, setShowCategoryBar] = useState(true)
  const lastScrollY = useRef(0)
  const productsPerPage = 32

  // Add scroll listener for hiding/showing category bar
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      if (currentScrollY > lastScrollY.current && currentScrollY > 150) {
        // Scrolling down
        setShowCategoryBar(false)
      } else if (currentScrollY < lastScrollY.current) {
        // Scrolling up
        setShowCategoryBar(true)
      }
      lastScrollY.current = currentScrollY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Ref to store the debounce timer
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

  // Sync currentPage and searchTerm with URL query parameter
  useEffect(() => {
    const pageParam = searchParams.get("page")
    const searchParam = searchParams.get("search")

    const pageNumber = pageParam ? parseInt(pageParam, 10) : 1
    if (!isNaN(pageNumber) && pageNumber !== currentPage) {
      setCurrentPage(pageNumber)
    }

    if (searchParam !== null && searchParam !== searchTerm) {
      setSearchTerm(searchParam)
    }
  }, [searchParams])

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`/api/v1/customer/product-category?limit=100`)
        if (!response.ok) {
          throw new Error('Failed to fetch product categories')
        }
        const data: CategoryApiResponse = await response.json()
        if (data.success) {
          const fetchedCategories = data.data.productCategories
          setAllCategories(fetchedCategories)

          const parents = fetchedCategories.filter(cat => cat.M04_M04_parent_category_id === null)
          setParentCategories(parents)
        } else {
          throw new Error(data.msg || 'API returned unsuccessful response')
        }
      } catch (err) {
        setCategoryError(err instanceof Error ? err.message : 'An error occurred while fetching categories')
      } finally {
        setLoadingCategories(false)
      }
    }

    fetchCategories()
  }, [])

  // Fetch products from API with pagination
  useEffect(() => {
    const controller = new AbortController()
    const fetchProducts = async () => {
      setLoadingProducts(true)
      setProductError(null)
      try {
        const categoryID = searchParams.get("categoryID")
        const search = searchParams.get("search")

        let url = `/api/v1/customer/product-sku`
        const queryParams = new URLSearchParams()
        queryParams.append("page", currentPage.toString())
        queryParams.append("limit", productsPerPage.toString())
        if (categoryID) {
          queryParams.append("categoryId", categoryID)
        }
        if (search) {
          queryParams.append("search", search)
        }
        if (queryParams.toString()) {
          url += `?${queryParams.toString()}`
        }
        console.log('Fetching products with URL:', url)
        const response = await fetch(url, { signal: controller.signal })
        if (!response.ok) {
          throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`)
        }
        const data: ProductApiResponse = await response.json()

        if (data.success) {
          // One card per product: versions of the same product collapse into a single entry
          const byProduct = new Map<string, any[]>()
          for (const sku of data.data.products_skus as any[]) {
            const pid = String(sku.M06_M05_product_id?._id ?? sku.M06_M05_product_id ?? sku._id)
            byProduct.set(pid, [...(byProduct.get(pid) || []), sku])
          }
          const mappedProducts: Product[] = [...byProduct.values()].map((versions) => {
            const inStock = versions.filter((v) => v.M06_quantity > 0)
            const pool = inStock.length ? inStock : versions
            // Prefer a version that has variant values so the product page can switch between them
            const sku = pool.find((v) => v.variant_label) || pool[0]
            const cheapest = pool.reduce((a, b) => (b.M06_price < a.M06_price ? b : a))
            return {
              id: sku._id,
              name: sku.M06_product_sku_name || "Unnamed Product",
              price: cheapest.M06_price || 0,
              category: "",
              image: sku.M06_thumbnail_image || "/placeholder.svg",
              rating: 5,
              reviews: 20,
              originalPrice: cheapest.M06_MRP || cheapest.M06_price,
              description: sku.M06_description || "No description available",
              variantCount: versions.length,
            }
          })
          setTotalProducts(mappedProducts.length)
          setTotalPages(1)
          setFilteredProducts(mappedProducts)
        } else {
          // Check if it's just no products found (which might return success: false or empty data)
          // But based on previous code, empty array is handled in success block.
          // If data.success is false, it might be an error or just no results.
          setFilteredProducts([])
          setTotalProducts(0)
          setTotalPages(0)
        }
      } catch (err) {
        if (controller.signal.aborted) return
        const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching products'
        setProductError(errorMessage)
        console.error('Product fetch error:', errorMessage)
      } finally {
        if (!controller.signal.aborted) setLoadingProducts(false)
      }
    }

    fetchProducts()
    return () => controller.abort()
  }, [searchParams, currentPage])

  // Update URL when searchTerm changes (Debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentSearch = searchParams.get("search") || ""
      if (searchTerm !== currentSearch) {
        const newParams = new URLSearchParams(searchParams.toString())
        if (searchTerm) {
          newParams.set("search", searchTerm)
        } else {
          newParams.delete("search")
        }
        newParams.set("page", "1") // Reset to page 1 on search change
        router.push(`/products?${newParams.toString()}`)
      }
    }, 250)
    return () => clearTimeout(timer)
  }, [searchTerm, searchParams, router])

  // Set active category based on URL query parameter
  useEffect(() => {
    const categoryID = searchParams.get("categoryID")
    if (categoryID) {
      const parent = parentCategories.find((c) => c._id === categoryID)
      if (parent) {
        setSelectedParentId(parent._id)
        setSelectedSubId(null)
      } else {
        const sub = allCategories.find((c) => c._id === categoryID)
        if (sub) {
          setSelectedParentId(sub.M04_M04_parent_category_id)
          setSelectedSubId(sub._id)
        } else {
          setSelectedParentId(null)
          setSelectedSubId(null)
        }
      }
    } else {
      setSelectedParentId(null)
      setSelectedSubId(null)
    }
  }, [searchParams, allCategories, parentCategories])

  // Handle parent category click
  const handleParentCategoryClick = (categoryId: string | null) => {
    setSelectedParentId(categoryId)
    setSelectedSubId(null)

    const queryParams = new URLSearchParams()
    if (categoryId !== null) {
      queryParams.append("categoryID", categoryId)
    }
    setSearchTerm("")
    router.push(`/products?${queryParams.toString()}`)
  }

  // Handle sub category click
  const handleSubCategoryClick = (subCategoryId: string) => {
    setSelectedSubId(subCategoryId)

    const queryParams = new URLSearchParams()
    queryParams.append("categoryID", subCategoryId)
    setSearchTerm("")
    router.push(`/products?${queryParams.toString()}`)
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      const queryParams = new URLSearchParams(searchParams.toString())
      queryParams.set("page", page.toString())
      router.push(`/products?${queryParams.toString()}`)
    }
  }

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-green-100">
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .categories-container {
          display: flex;
          overflow-x: auto;
          gap: 0.75rem;
          padding: 0.5rem 0.25rem;
        }
        .loader {
          width: 48px;
          height: 48px;
          border: 5px solid #000;
          border-bottom-color: #facc15;
          border-radius: 50%;
          display: inline-block;
          box-sizing: border-box;
          animation: rotation 1s linear infinite;
        }
        @keyframes rotation {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <Header />



      {/* Search and Filter */}
      <section className={`sticky top-20 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 py-4 px-4 shadow-sm transition-all duration-300 ${showCategoryBar ? 'translate-y-0' : '-translate-y-[150%] opacity-0 pointer-events-none'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-6 items-center">

            {/* Search */}
            <div className="relative w-full md:w-1/3">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search gifts, toys, jewellery..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 border-gray-200 focus:border-green-700 focus:ring-green-700 rounded-full h-12 bg-slate-50 w-full transition-all"
              />
            </div>

            {/* Categories */}
            <div className="w-full md:w-2/3 overflow-hidden">
              {loadingCategories ? (
                <div className="h-12 w-full bg-slate-100 rounded-full animate-pulse" />
              ) : categoryError ? (
                <p className="text-red-500 text-sm">{categoryError}</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {/* Parent Categories */}
                  <div className="categories-container scrollbar-hide">
                    <Button
                      onClick={() => handleParentCategoryClick(null)}
                      className={`rounded-full px-6 h-10 text-sm font-medium transition-all duration-300 whitespace-nowrap shadow-sm ${selectedParentId === null
                        ? "bg-black text-white hover:bg-gray-800 hover:text-white transform scale-105"
                        : "bg-white border border-gray-200 text-gray-600 hover:bg-green-50 hover:text-green-900 hover:border-green-100"
                        }`}
                    >
                      All
                    </Button>
                    {parentCategories.map((category) => (
                      <Button
                        key={category._id}
                        onClick={() => handleParentCategoryClick(category._id)}
                        className={`rounded-full px-6 h-10 text-sm font-medium transition-all duration-300 whitespace-nowrap shadow-sm ${selectedParentId === category._id
                          ? "bg-black text-white hover:bg-gray-800 hover:text-white transform scale-105"
                          : "bg-white border border-gray-200 text-gray-600 hover:bg-green-50 hover:text-green-900 hover:border-green-100"
                          }`}
                      >
                        {category.M04_category_name}
                      </Button>
                    ))}
                  </div>

                  {/* Sub Categories (Only show if a parent is selected and has children) */}
                  {selectedParentId && allCategories.filter(c => c.M04_M04_parent_category_id === selectedParentId).length > 0 && (
                    <div className="categories-container scrollbar-hide">
                      <Button
                        onClick={() => handleParentCategoryClick(selectedParentId)}
                        className={`rounded-full px-5 h-8 text-xs font-medium transition-all duration-300 whitespace-nowrap shadow-sm ${selectedSubId === null
                          ? "bg-amber-500 text-black hover:bg-green-700 transform scale-105 border-0"
                          : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"
                          }`}
                      >
                        All in {parentCategories.find(c => c._id === selectedParentId)?.M04_category_name}
                      </Button>
                      {allCategories.filter(c => c.M04_M04_parent_category_id === selectedParentId).map((subCat) => (
                        <Button
                          key={subCat._id}
                          onClick={() => handleSubCategoryClick(subCat._id)}
                          className={`rounded-full px-5 h-8 text-xs font-medium transition-all duration-300 whitespace-nowrap shadow-sm ${selectedSubId === subCat._id
                            ? "bg-amber-500 text-black hover:bg-green-700 transform scale-105 border-0"
                            : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"
                            }`}
                        >
                          {subCat.M04_category_name}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12 px-4 bg-white min-h-[60vh]">
        <div className="max-w-7xl mx-auto">
          {/* Product count */}
          {(!loadingProducts || filteredProducts.length > 0) && (
            <div className="mb-8 flex justify-between items-end border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedSubId
                    ? allCategories.find((c) => c._id === selectedSubId)?.M04_category_name
                    : selectedParentId
                      ? parentCategories.find((c) => c._id === selectedParentId)?.M04_category_name
                      : "All Products"}
                </h2>
                {searchTerm && <p className="text-sm text-gray-500 mt-1">Found results for "{searchTerm}"</p>}
              </div>
              <p className="text-sm font-medium text-gray-500">
                <span className="text-black font-bold">{filteredProducts.length}</span> results
              </p>
            </div>
          )}

          {/* Loading state for products */}
          {loadingProducts && filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <span className="loader mb-4"></span>
              <p className="text-gray-500 animate-pulse">Loading products...</p>
            </div>
          ) : productError && filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-red-500 bg-red-50 px-6 py-4 rounded-xl inline-block">{productError}</p>
            </div>
          ) : (
            <>
              {loadingProducts && <p role="status" className="mb-4 text-sm text-green-800">Updating results…</p>}
              {productError && <p role="alert" className="mb-4 text-sm text-amber-800">Showing previous results; new results could not be loaded.</p>}
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                  {filteredProducts.map((product) => (
                    <div key={product.id} className="h-full">
                      <Link href={`/products/${product.id}`} className="block h-full">
                        <Card className="border border-gray-100 shadow-sm hover:shadow-xl transition-shadow duration-300 h-full overflow-hidden bg-white group rounded-3xl">
                          <div className="relative h-40 md:h-64 bg-gray-50 p-4 md:p-6 flex items-center justify-center overflow-hidden">
                            <Image
                              src={product.image || "/placeholder.svg"}
                              alt={product.name}
                              fill
                              className="object-contain p-2 md:p-4 group-hover:scale-110 transition-transform duration-500"
                            />
                            {product.originalPrice > product.price && (
                              <Badge className="absolute top-3 left-3 bg-red-500 text-white rounded-md px-1.5 py-0.5 md:px-2 md:py-1 text-[10px] md:text-xs font-bold uppercase tracking-wider shadow-sm">
                                Sale
                              </Badge>
                            )}
                            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-800 shadow-md transition-colors group-hover:bg-amber-500 group-hover:text-black">
                                <ArrowRight className="h-4 w-4" />
                              </span>
                            </div>
                          </div>

                          <CardContent className="p-3 md:p-5">
                            <div className="flex justify-between items-start mb-1 md:mb-2">
                              <h3 className="text-sm md:text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-green-800 transition-colors w-full pr-1 md:pr-2" title={product.name}>
                                {product.name}
                              </h3>
                              <div className="flex items-center gap-0.5 text-amber-500 text-[10px] md:text-xs font-bold shrink-0 mt-0.5 md:mt-1">
                                <Star className="w-2.5 h-2.5 md:w-3 md:h-3 fill-current" /> 4.5
                              </div>
                            </div>

                            <p className="hidden md:block text-gray-500 text-xs mb-4 line-clamp-2 h-10 leading-relaxed">
                              {product.description}
                            </p>

                            <div className="flex items-center justify-between mt-auto border-t border-gray-50 pt-2 md:pt-3">
                              <div className="flex flex-col">
                                {product.originalPrice > product.price && (
                                  <span className="text-[10px] md:text-xs text-gray-400 line-through">₹{product.originalPrice}</span>
                                )}
                                <span className="text-sm md:text-lg font-extrabold text-gray-900">
                                  {(product.variantCount ?? 1) > 1 && <span className="text-[10px] md:text-xs font-medium text-gray-500 mr-1">From</span>}
                                  ₹{product.price}
                                </span>
                              </div>
                              <span aria-hidden="true" className="inline-flex h-7 items-center rounded-lg bg-black px-2 text-[10px] font-bold text-white shadow-sm transition-colors group-hover:bg-green-700 md:h-9 md:px-4 md:text-xs">
                                Buy Now
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-slate-50 rounded-3xl">
                  <div className="text-gray-300 mb-6">
                    <Search className="w-20 h-20 mx-auto" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    No products found
                  </h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    We couldn't find any products matching your criteria. Try selecting a different category or clearing your search.
                  </p>
                  <Button
                    onClick={() => { handleParentCategoryClick(null); setSearchTerm(""); }}
                    className="mt-6 bg-amber-500 text-black hover:bg-green-700 rounded-full px-8 py-2 font-bold"
                  >
                    Clear Filters
                  </Button>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-16 flex justify-center items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="rounded-full border-gray-200 text-gray-900 font-bold hover:bg-black hover:text-white hover:border-black disabled:opacity-50 transition-all duration-300"
                  >
                    Previous
                  </Button>

                  {/* Simple pagination logic for display */}
                  <div className="px-4 font-bold text-gray-900">
                    Page {currentPage} of {totalPages}
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="rounded-full bg-black text-white font-bold hover:bg-green-700 hover:text-black border-black hover:border-green-700 disabled:opacity-50 transition-all duration-300"
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}