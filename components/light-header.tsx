"use client"

import { useState, useEffect, useRef } from "react"
import { Menu, X, ShoppingCart, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useCart } from "@/hooks/use-cart"
import { usePathname, useRouter } from "next/navigation"

interface ProductSuggestion {
    _id: string
    M06_product_sku_name: string
    M06_thumbnail_image: string | null
}

const navigation = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Products", href: "/products" },
    { name: "Track Order", href: "/track-order" },
    { name: "Contact", href: "/contact" },
]

export default function LightHeader() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isScrolled, setIsScrolled] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [cartHydrated, setCartHydrated] = useState(false)

    const { getCartCount } = useCart()
    const pathname = usePathname()
    const router = useRouter()
    const searchRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10)
        }
        window.addEventListener("scroll", handleScroll)

        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSuggestions(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)

        return () => {
            window.removeEventListener("scroll", handleScroll)
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    useEffect(() => {
        const markHydrated = () => setCartHydrated(true)
        if (useCart.persist.hasHydrated()) {
            markHydrated()
            return
        }
        return useCart.persist.onFinishHydration(markHydrated)
    }, [])

    useEffect(() => {
        const query = searchQuery.trim()
        if (query.length < 2) {
            setSuggestions([])
            setIsSearching(false)
            return
        }

        const controller = new AbortController()
        const timer = window.setTimeout(async () => {
            setIsSearching(true)
            try {
                const response = await fetch(`/api/v1/customer/product-sku?search=${encodeURIComponent(query)}`, { signal: controller.signal })
                const payload = await response.json()
                setSuggestions(response.ok && payload.success ? payload.data.products_skus.slice(0, 5) : [])
            } catch (error) {
                if (!controller.signal.aborted) setSuggestions([])
            } finally {
                if (!controller.signal.aborted) setIsSearching(false)
            }
        }, 220)

        return () => {
            window.clearTimeout(timer)
            controller.abort()
        }
    }, [searchQuery])

    const handleSearch = (e?: React.FormEvent) => {
        e?.preventDefault()
        if (searchQuery.trim()) {
            router.push(`/products?search=${encodeURIComponent(searchQuery)}`)
            setIsMenuOpen(false)
            setShowSuggestions(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleSearch()
        }
    }

    return (
        <header className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center">
            <div
                className={`w-full border-b border-green-100/80 shadow-sm backdrop-blur-xl transition-all duration-300 ${isScrolled
                    ? "bg-white/95 py-2"
                    : "bg-white/90 py-3"
                    }`}
            >
                <div className={`mx-auto max-w-7xl transition-all duration-300 ${isScrolled ? "px-4" : "px-6"} flex items-center justify-between`}>

                    {/* Logo Section */}
                    <Link href="/" className="flex items-center gap-2.5 group shrink-0" aria-label="AFM Cart home">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-green-700 transition-colors group-hover:bg-green-100">
                            <svg viewBox="300 340 580 340" className="h-7 w-7 fill-current" aria-hidden="true">
                                <path d="M310 357h164l109 188h240l-30 42H560L455 400H345z" />
                                <path d="M520 382h347l-34 53H553zM565 461h256l-32 53H598z" />
                                <circle cx="609" cy="623" r="35" /><circle cx="745" cy="623" r="35" />
                            </svg>
                        </span>
                        <span className="text-xl font-black text-gray-950">Afm<span className="text-green-700">cart</span></span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center space-x-8">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`text-sm font-semibold tracking-wide transition-all duration-300 relative group ${pathname === item.href ? "text-green-700" : "text-gray-800 hover:text-green-700"
                                    }`}
                            >
                                {item.name}
                                <span className="absolute -bottom-1 left-1/2 w-0 h-0.5 bg-green-600 group-hover:w-full group-hover:left-0 transition-all duration-300" />
                            </Link>
                        ))}
                    </nav>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-3">
                        {/* Search Icon (Desktop) */}
                        <div className="hidden md:flex items-center relative" ref={searchRef}>
                            <div className="flex items-center bg-white rounded-full px-3 py-1.5 border border-green-100 focus-within:ring-2 ring-green-500/30 transition-all">
                                <Search className="w-4 h-4 text-gray-500 mr-2 cursor-pointer" onClick={() => handleSearch()} />
                                <input
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value)
                                        setShowSuggestions(true)
                                    }}
                                    onFocus={() => setShowSuggestions(true)}
                                    onKeyDown={handleKeyDown}
                                    className="bg-transparent border-none outline-none text-sm w-24 focus:w-40 transition-all placeholder:text-gray-400 text-gray-800"
                                />
                            </div>

                            {/* Suggestions Dropdown */}
                            {showSuggestions && searchQuery.trim().length >= 2 && (isSearching || suggestions.length > 0) && (
                                <div className="absolute top-12 right-0 w-64 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden py-2 animate-in fade-in slide-in-from-top-2">
                                    {isSearching ? <p className="px-4 py-3 text-xs text-gray-500">Searching products…</p> : suggestions.map((product) => (
                                        <Link
                                            key={product._id}
                                            href={`/products/${product._id}`}
                                            onClick={() => {
                                                setShowSuggestions(false)
                                                setSearchQuery("")
                                            }}
                                            className="flex items-center px-4 py-2 hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="w-8 h-8 relative rounded overflow-hidden flex-shrink-0 mr-3">
                                                <img
                                                    src={product.M06_thumbnail_image || "/placeholder.svg"}
                                                    alt={product.M06_product_sku_name}
                                                    className="object-cover w-full h-full"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">{product.M06_product_sku_name}</p>
                                            </div>
                                        </Link>
                                    ))}
                                    {!isSearching && suggestions.length > 0 && <button
                                        onClick={() => handleSearch()}
                                        className="w-full text-center text-xs text-green-700 font-medium py-2 border-t border-gray-50 hover:bg-green-50 mt-1"
                                    >View all results</button>}
                                </div>
                            )}
                        </div>

                        <Link href="/cart">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="relative h-10 w-10 rounded-full bg-green-50 hover:bg-green-100 text-gray-800 transition-all duration-300"
                            >
                                <ShoppingCart className="w-5 h-5" />
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-700 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                                    {cartHydrated ? getCartCount() : 0}
                                </span>
                            </Button>
                        </Link>

                        <Link href="tel:+919207104571" className="hidden sm:block">
                            <Button className="bg-green-700 hover:bg-green-800 text-white rounded-full px-5 h-10 text-xs font-bold shadow-sm transition-colors">
                                Call Now
                            </Button>
                        </Link>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="lg:hidden h-10 w-10 p-0 rounded-full bg-green-50 hover:bg-green-100 text-gray-800"
                        >
                            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay - Separate Floating Glass Box */}
            <div
                className={`lg:hidden w-[90%] max-w-sm mt-3 transition-all duration-500 ease-in-out origin-top ${isMenuOpen ? "opacity-100 translate-y-0 max-h-[500px]" : "opacity-0 -translate-y-4 max-h-0 pointer-events-none"
                    }`}
            >
                <div className="bg-white/95 backdrop-blur-xl border border-green-100 shadow-xl overflow-hidden p-4">
                    <div className="space-y-1">
                        <div className="relative mb-4">
                            <Search
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 cursor-pointer"
                                onClick={() => handleSearch()}
                            />
                            <Input
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="pl-10 w-full rounded-xl border-green-100 bg-green-50/50 text-gray-800 focus:ring-green-400"
                            />
                        </div>

                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsMenuOpen(false)}
                                className={`block px-4 py-3 font-medium transition-all duration-300 rounded-xl ${pathname === item.href ? "bg-green-50 text-green-800" : "text-gray-700 hover:bg-gray-50"
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    {item.name}
                                    {pathname === item.href && <div className="w-1.5 h-1.5 rounded-full bg-green-600" />}
                                </div>
                            </Link>
                        ))}

                        <Link href="tel:+919207104571" onClick={() => setIsMenuOpen(false)}>
                            <Button className="w-full mt-4 bg-green-700 hover:bg-green-800 text-white rounded-xl py-6 font-bold">
                                Call Now
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </header >
    )
}
