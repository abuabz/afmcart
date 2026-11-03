import Footer from "@/components/footer"
import Header from "@/components/light-header"
import ProductDetailSkeleton from "@/components/product-detail-skeleton"

export default function ProductLoading() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <ProductDetailSkeleton />
      <Footer />
    </div>
  )
}
