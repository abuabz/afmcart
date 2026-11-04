"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Blocks, Gift, Gem, Heart, Sparkles, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/light-header";
import Footer from "@/components/footer";

interface StoreCategory {
  _id: string;
  M04_category_name: string;
  M04_image: string | null;
  M04_M04_parent_category_id: string | null;
}

interface StoreProduct {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  image: string | null;
}

interface Department {
  title: string;
  subtitle: string;
  query: string;
  keywords: string[];
  image: string;
  imageAlt: string;
  icon: typeof Gift;
  theme: string;
}

const departments: Department[] = [
  {
    title: "Gifts",
    subtitle: "Little surprises, big feelings",
    query: "gift",
    keywords: ["gift", "present", "celebration"],
    image: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Thoughtfully wrapped gifts ready to give",
    icon: Gift,
    theme: "bg-[#f5e8dc]",
  },
  {
    title: "Toys",
    subtitle: "Made for everyday wonder",
    query: "toy",
    keywords: ["toy", "play", "kids"],
    image: "https://images.unsplash.com/photo-1558060370-d644479cb6f7?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Colorful toys for creative play",
    icon: Blocks,
    theme: "bg-[#e6f0e5]",
  },
  {
    title: "Jewellery",
    subtitle: "Keepsakes with a little sparkle",
    query: "jewel",
    keywords: ["jewel", "jewelry", "jewellery", "accessory"],
    image: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Delicate jewellery pieces",
    icon: Gem,
    theme: "bg-[#f0e9f1]",
  },
];

export default function HomePage() {
  const { data: categories = [] } = useQuery<StoreCategory[]>({
    queryKey: ["storefrontCategories"],
    queryFn: async () => {
      const response = await fetch("/api/v1/customer/product-category?limit=100");
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.msg || "Could not load categories");
      return payload.data.productCategories;
    },
  });

  const { data: products = [] } = useQuery<StoreProduct[]>({
    queryKey: ["storefrontDepartmentProducts"],
    queryFn: async () => {
      const departmentResults = await Promise.all(departments.map(async (department) => {
        const response = await fetch(`/api/v1/customer/product-sku?search=${encodeURIComponent(department.query)}`);
        const payload = await response.json();
        if (!response.ok || !payload.success) throw new Error(payload.msg || "Could not load department products");
        return payload.data.products_skus as Array<{
          _id: string;
          M06_product_sku_name: string;
          M06_price: number;
          M06_MRP: number;
          M06_thumbnail_image: string | null;
        }>;
      }));

      const seen = new Set<string>();
      const picks: StoreProduct[] = [];
      for (let index = 0; picks.length < 4; index += 1) {
        let foundAtIndex = false;
        for (const result of departmentResults) {
          const sku = result[index];
          if (!sku || seen.has(sku._id)) continue;
          seen.add(sku._id);
          foundAtIndex = true;
          picks.push({
            id: sku._id,
            name: sku.M06_product_sku_name,
            price: sku.M06_price,
            originalPrice: sku.M06_MRP,
            image: sku.M06_thumbnail_image,
          });
          if (picks.length === 4) break;
        }
        if (!foundAtIndex) break;
      }

      return picks;
    },
  });

  const departmentHref = (department: Department) => {
    const category = categories.find((item) =>
      department.keywords.some((keyword) => item.M04_category_name.toLowerCase().includes(keyword))
    );
    return category ? `/products?categoryID=${category._id}` : `/products?search=${department.query}`;
  };

  return (
    <div className="min-h-screen bg-white text-[#18261d] selection:bg-green-100">
      <Header />

      <main>
        <section className="relative overflow-hidden bg-[#f4faf3] pt-24">
          <div className="mx-auto grid min-h-[650px] max-w-7xl items-center gap-8 px-5 pb-12 sm:px-8 lg:grid-cols-[0.94fr_1.06fr] lg:gap-10 lg:px-12 lg:pb-16">
            <div className="relative z-10 order-2 pb-3 lg:order-1 lg:py-12">
              <p className="mb-5 inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.18em] text-green-800">
                <Sparkles className="h-4 w-4" /> A little joy, thoughtfully picked
              </p>
              <h1 className="max-w-2xl text-5xl font-black leading-[1.02] text-[#17261b] sm:text-6xl lg:text-7xl">
                Find the <span className="text-green-700">feeling</span> behind the gift.
              </h1>
              <p className="mt-6 max-w-lg text-base leading-7 text-gray-600 sm:text-lg">
                Toys to spark their imagination, keepsakes to mark the moment, and lovely little things just because.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={departmentHref(departments[0])}
                  className="inline-flex h-12 items-center gap-3 rounded-full bg-green-800 px-6 text-sm font-bold text-white transition-colors hover:bg-green-900"
                >
                  Shop gifts <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="#departments"
                  className="inline-flex h-12 items-center rounded-full border border-green-900/15 px-6 text-sm font-bold text-green-900 transition-colors hover:bg-white"
                >
                  Explore departments
                </Link>
              </div>
              <div className="mt-10 flex items-center gap-3 text-sm text-gray-600">
                <span className="flex -space-x-2" aria-hidden="true">
                  <span className="h-8 w-8 rounded-full border-2 border-[#f4faf3] bg-[#edb99d]" />
                  <span className="h-8 w-8 rounded-full border-2 border-[#f4faf3] bg-[#7eaa84]" />
                  <span className="h-8 w-8 rounded-full border-2 border-[#f4faf3] bg-[#e6bc62]" />
                </span>
                <span>For the little moments and the big ones</span>
              </div>
            </div>

            <div className="relative order-1 mx-auto w-full max-w-[560px] lg:order-2">
              <div className="relative aspect-[1.18/1] overflow-hidden rounded-[10px] bg-[#e8d8ca]">
                <Image
                  src={departments[0].image}
                  alt={departments[0].imageAlt}
                  fill
                  priority
                  unoptimized
                  sizes="(max-width: 1024px) 100vw, 52vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 text-white sm:bottom-8 sm:left-8">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/85">Make it memorable</p>
                  <p className="mt-1 text-2xl font-extrabold sm:text-3xl">The joy is in the giving.</p>
                </div>
              </div>
              <div className="absolute -bottom-5 right-4 flex max-w-[220px] items-center gap-3 rounded-lg bg-white p-3 shadow-xl sm:-right-5 sm:bottom-8 sm:p-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f0e9f1] text-[#6b4c6e]">
                  <Gem className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-bold text-gray-500">A thoughtful detail</span>
                  <span className="block truncate text-sm font-extrabold text-gray-900">Always worth keeping</span>
                </span>
              </div>
              <span className="absolute -right-2 -top-3 -z-0 hidden h-24 w-24 rounded-full border border-green-800/20 sm:block" aria-hidden="true" />
            </div>
          </div>
          <div className="h-1 w-full bg-gradient-to-r from-green-800 via-[#d8a34a] to-[#b56a78]" />
        </section>

        <section id="departments" className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
          <div className="mb-8 flex items-end justify-between gap-4 sm:mb-10">
            <div>
              <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.18em] text-green-800">Find your kind of lovely</p>
              <h2 className="text-3xl font-black text-gray-950 sm:text-4xl">Shop by department</h2>
            </div>
            <Link href="/products" className="hidden items-center gap-2 pb-1 text-sm font-bold text-green-800 hover:text-green-950 sm:inline-flex">
              All products <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 sm:gap-5">
            {departments.map((department) => {
              const category = categories.find((item) =>
                department.keywords.some((keyword) => item.M04_category_name.toLowerCase().includes(keyword))
              );
              const DepartmentIcon = department.icon;

              return (
                <Link key={department.title} href={departmentHref(department)} className="group relative isolate min-h-[320px] overflow-hidden rounded-lg sm:min-h-[390px]">
                  <Image
                    src={category?.M04_image || department.image}
                    alt={category?.M04_category_name || department.imageAlt}
                    fill
                    unoptimized
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <span className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-green-900">
                    <DepartmentIcon className="h-5 w-5" />
                  </span>
                  <span className="absolute bottom-5 left-5 right-5 text-white sm:bottom-7 sm:left-7">
                    <span className="block text-xs font-bold uppercase tracking-[0.14em] text-white/80">{department.subtitle}</span>
                    <span className="mt-1 flex items-center justify-between text-3xl font-black">
                      {department.title}<ArrowUpRight className="h-6 w-6 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {products.length > 0 && (
          <section className="bg-[#f7f8f4] py-16 sm:py-20">
            <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
              <div className="mb-8 flex items-end justify-between gap-4 sm:mb-10">
                <div>
                  <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.18em] text-green-800">Picked for you</p>
                  <h2 className="text-3xl font-black text-gray-950 sm:text-4xl">Fresh finds</h2>
                </div>
                <Link href="/products" className="inline-flex items-center gap-2 pb-1 text-sm font-bold text-green-800 hover:text-green-950">
                  View all <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
                {products.map((product) => (
                  <Link key={product.id} href={`/products/${product.id}`} className="group min-w-0 overflow-hidden rounded-lg border border-gray-200/80 bg-white transition-shadow hover:shadow-lg">
                    <div className="relative aspect-square bg-white p-4">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          unoptimized
                          sizes="(max-width: 640px) 50vw, 25vw"
                          className="object-contain p-3 transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className={`flex h-full items-center justify-center ${departments[0].theme}`}>
                          <Gift className="h-10 w-10 text-green-800/60" />
                        </div>
                      )}
                      {product.originalPrice > product.price && (
                        <span className="absolute left-3 top-3 rounded-sm bg-[#b56a78] px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">Special price</span>
                      )}
                    </div>
                    <div className="p-3 sm:p-4">
                      <p className="line-clamp-2 min-h-10 text-sm font-bold leading-5 text-gray-900">{product.name}</p>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <span className="text-sm font-extrabold text-green-900">₹{product.price.toLocaleString("en-IN")}</span>
                        <span className="flex items-center gap-1 text-xs font-semibold text-amber-600"><Star className="h-3.5 w-3.5 fill-current" /> 4.8</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="mx-auto grid max-w-7xl gap-8 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1fr_auto] lg:items-center lg:px-12">
          <div>
            <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.18em] text-[#a75e70]">A little something, just because</p>
            <h2 className="max-w-2xl text-3xl font-black leading-tight text-gray-950 sm:text-4xl">Good things don’t need a special occasion.</h2>
            <p className="mt-4 max-w-xl leading-7 text-gray-600">Browse a collection made for birthdays, celebrations, and the lovely ordinary days in between.</p>
          </div>
          <Link href="/products" className="inline-flex h-12 w-fit items-center gap-3 rounded-full bg-[#a75e70] px-6 text-sm font-bold text-white transition-colors hover:bg-[#87485a]">
            Find something lovely <Heart className="h-4 w-4" />
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
