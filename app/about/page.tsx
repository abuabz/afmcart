"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Blocks, Gem, Gift, Heart, Sparkles } from "lucide-react";
import Header from "@/components/light-header";
import Footer from "@/components/footer";
import ScrollReveal from "@/components/ui/scroll-reveal";

const departments = [
  {
    title: "Gifts",
    copy: "Thoughtful little finds for celebrations, thank-yous, and just-because days.",
    href: "/products?search=gift",
    image: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=1000&q=85",
    icon: Gift,
  },
  {
    title: "Toys",
    copy: "Playthings for curious minds, happy afternoons, and everyday imagination.",
    href: "/products?search=toy",
    image: "https://images.unsplash.com/photo-1558060370-d644479cb6f7?auto=format&fit=crop&w=1000&q=85",
    icon: Blocks,
  },
  {
    title: "Jewellery",
    copy: "Small keepsakes and finishing touches chosen to make a moment feel special.",
    href: "/products?search=jewel",
    image: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=1000&q=85",
    icon: Gem,
  },
];

const values = [
  { title: "Picked with care", copy: "We bring together playful, useful, and thoughtful finds for different ages and occasions." },
  { title: "A little joy, nearby", copy: "Afm cart is based in Valiyora, Vengara, serving our community and online shoppers." },
  { title: "Here when you need us", copy: "Our team is available to help with product questions, delivery details, and order updates." },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Header />
      <main>
        <section className="bg-[#f4faf3] pt-28 sm:pt-32">
          <div className="mx-auto grid max-w-7xl items-center gap-8 px-5 pb-14 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-12 lg:pb-20">
            <div className="order-2 lg:order-1">
              <p className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.16em] text-green-800"><Sparkles className="h-4 w-4" /> A little about us</p>
              <h1 className="mt-5 max-w-xl text-5xl font-black leading-[1.04] text-slate-950 sm:text-6xl">Good things make <span className="text-green-700">good moments.</span></h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">Afm cart is a friendly place to find gifts, toys, and jewellery for the people and moments that matter to you.</p>
              <Link href="/products" className="mt-8 inline-flex h-12 items-center gap-3 rounded-full bg-green-800 px-6 text-sm font-bold text-white transition-colors hover:bg-green-900">Explore the shop <ArrowRight className="h-4 w-4" /></Link>
            </div>
            <div className="relative order-1 aspect-[1.3/1] overflow-hidden rounded-lg bg-[#eadbce] lg:order-2">
              <Image src={departments[0].image} alt="Thoughtfully wrapped gifts" fill priority unoptimized sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              <p className="absolute bottom-5 left-5 text-lg font-bold text-white sm:bottom-7 sm:left-7 sm:text-2xl">Thoughtful finds, for every kind of day.</p>
            </div>
          </div>
          <div className="h-1 bg-gradient-to-r from-green-800 via-[#d8a34a] to-[#b56a78]" />
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
          <ScrollReveal animation="fade-in-up">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-green-800">Our point of view</p>
            <div className="mt-3 grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
              <h2 className="text-3xl font-black leading-tight text-slate-950 sm:text-4xl">A shop for giving, playing, and keeping.</h2>
              <p className="text-base leading-7 text-slate-600">Some things are chosen for a birthday. Some are picked up on an ordinary day. We bring together a mix of gifts, toys, and jewellery so finding a small delight feels simple and personal.</p>
            </div>
          </ScrollReveal>
        </section>

        <section className="bg-[#f7f8f4] py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
            <div className="mb-8"><p className="text-xs font-extrabold uppercase tracking-[0.16em] text-green-800">Explore Afm cart</p><h2 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">A little something for everyone</h2></div>
            <div className="grid gap-4 sm:grid-cols-3 sm:gap-5">
              {departments.map((department) => {
                const DepartmentIcon = department.icon;
                return (
                  <Link key={department.title} href={department.href} className="group relative isolate min-h-[300px] overflow-hidden rounded-lg sm:min-h-[360px]">
                    <Image src={department.image} alt={department.title} fill unoptimized sizes="(max-width: 640px) 100vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                    <span className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-green-900"><DepartmentIcon className="h-5 w-5" /></span>
                    <span className="absolute bottom-5 left-5 right-5 text-white sm:bottom-7 sm:left-7"><span className="text-2xl font-black">{department.title}</span><span className="mt-2 block max-w-xs text-sm leading-5 text-white/85">{department.copy}</span></span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
          <div className="grid gap-8 md:grid-cols-3">
            {values.map((value, index) => <ScrollReveal key={value.title} animation="fade-in-up" delay={index * 80}><article className="h-full border-t-2 border-green-700 pt-5"><Heart className="h-5 w-5 text-green-800" /><h3 className="mt-4 text-lg font-extrabold text-slate-950">{value.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{value.copy}</p></article></ScrollReveal>)}
          </div>
        </section>

        <section className="bg-[#f4faf3] px-5 py-14 text-center sm:px-8">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-green-800">Come say hello</p>
          <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-black text-slate-950 sm:text-4xl">Find us in Valiyora, Vengara.</h2>
          <Link href="/contact" className="mt-6 inline-flex h-11 items-center gap-2 rounded-full border border-green-900/20 px-5 text-sm font-bold text-green-900 hover:bg-white">Contact Afm cart <ArrowRight className="h-4 w-4" /></Link>
        </section>
      </main>
      <Footer />
    </div>
  );
}
