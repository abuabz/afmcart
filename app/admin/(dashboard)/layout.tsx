"use client"
import React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Settings, 
  Bell, 
  Search,
  LogOut,
  Star,
  ShoppingBag,
  PackageCheck,
  Menu,
  X
} from "lucide-react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = React.useState(false)

  // Close the mobile drawer after navigating
  React.useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  return (
    <div className="flex h-dvh bg-slate-50 overflow-hidden">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar: off-canvas drawer on mobile, fixed column on desktop */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 max-w-[80vw] bg-slate-900 text-slate-300 flex flex-col shadow-2xl z-40 transition-transform duration-300 lg:static lg:translate-x-0 lg:z-20 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-16 sm:h-20 flex items-center justify-between px-6 border-b border-slate-800 shrink-0">
          <div className="flex items-center">
            <ShoppingBag className="w-8 h-8 text-green-500 mr-3" />
            <span className="text-xl font-bold text-white tracking-wider">AFM<span className="text-green-500"> ADMIN</span></span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 text-slate-400 hover:text-white" aria-label="Close menu">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <Link href="/admin" className={`flex items-center px-4 py-3 rounded-xl transition-all duration-300 group ${pathname === "/admin" ? "bg-green-500/10 text-green-400" : "hover:bg-slate-800 hover:text-white"}`}>
            <LayoutDashboard className="w-5 h-5 mr-3 transition-transform group-hover:scale-110" />
            <span className="font-medium">Dashboard</span>
          </Link>
          <Link href="/admin/products" className={`flex items-center px-4 py-3 rounded-xl transition-all duration-300 group ${pathname.startsWith("/admin/products") ? "bg-green-500/10 text-green-400" : "hover:bg-slate-800 hover:text-white"}`}>
            <Package className="w-5 h-5 mr-3 transition-transform group-hover:scale-110" />
            <span className="font-medium">Products</span>
          </Link>
          <Link href="/admin/orders" className={`flex items-center px-4 py-3 rounded-xl transition-all duration-300 group ${pathname.startsWith("/admin/orders") ? "bg-green-500/10 text-green-400" : "hover:bg-slate-800 hover:text-white"}`}>
            <PackageCheck className="w-5 h-5 mr-3 transition-transform group-hover:scale-110" />
            <span className="font-medium">Orders</span>
          </Link>
          <Link href="/admin/featured" className={`flex items-center px-4 py-3 rounded-xl transition-all duration-300 group ${pathname.startsWith("/admin/featured") ? "bg-green-500/10 text-green-400" : "hover:bg-slate-800 hover:text-white"}`}>
            <Star className={`w-5 h-5 mr-3 transition-transform group-hover:scale-110 ${!pathname.startsWith("/admin/featured") && "text-yellow-400"}`} />
            <span className="font-medium">Featured</span>
          </Link>
          <Link href="/admin/categories" className={`flex items-center px-4 py-3 rounded-xl transition-all duration-300 group ${pathname.startsWith("/admin/categories") ? "bg-green-500/10 text-green-400" : "hover:bg-slate-800 hover:text-white"}`}>
            <ShoppingCart className="w-5 h-5 mr-3 transition-transform group-hover:scale-110" />
            <span className="font-medium">Categories</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <Link href="/admin/settings" className={`flex items-center px-4 py-3 rounded-xl transition-all duration-300 group ${pathname.startsWith("/admin/settings") ? "bg-green-500/10 text-green-400" : "hover:bg-slate-800 hover:text-white"}`}>
            <Settings className="w-5 h-5 mr-3 transition-transform group-hover:scale-110" />
            <span className="font-medium">Settings</span>
          </Link>
          <button 
            onClick={async () => {
              try {
                // Call the backend API to clear the HTTP-only admin_token cookie
                await fetch('/api/admin/logout', { method: 'POST' });
              } catch (e) {
                console.error("Logout failed", e);
              }
              // Clear any local storage auth tokens if they exist just in case
              localStorage.removeItem('adminToken');
              // Redirect to main storefront
              router.push('/');
            }}
            className="w-full flex items-center px-4 py-3 rounded-xl transition-all duration-300 hover:bg-red-500/10 hover:text-red-400 group mt-2 text-left"
          >
            <LogOut className="w-5 h-5 mr-3 transition-transform group-hover:scale-110" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col h-dvh overflow-hidden">
        {/* Top Header */}
        <header className="h-16 sm:h-20 bg-white/70 backdrop-blur-md border-b border-slate-200 flex items-center justify-between gap-3 px-4 sm:px-8 shadow-sm z-10 sticky top-0 shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-green-700" aria-label="Open menu">
            <Menu className="w-6 h-6" />
          </button>
          <div className="relative flex-1 max-w-sm sm:max-w-md lg:w-96">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search anything..." 
              className="w-full pl-10 pr-4 py-2.5 bg-slate-100 text-slate-900 placeholder:text-slate-400 border-none rounded-xl focus:ring-2 focus:ring-green-500/30 outline-none transition-all"
            />
          </div>
          
          <div className="flex items-center space-x-3 sm:space-x-6">
            <button className="relative p-2 text-slate-400 hover:text-green-700 transition-colors">
              <Bell className="w-6 h-6" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-tr from-green-700 to-[#d8a34a] shadow-lg flex items-center justify-center text-white font-bold">
              AD
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50/50 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
