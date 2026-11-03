"use client";

import type React from "react";
import { useState } from "react";
import {
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Clock,
  Heart,
  ArrowUp,
  ShoppingCart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

const quickLinks = [
  { name: "Home", href: "/" },
  { name: "About Us", href: "/about" },
  { name: "Products", href: "/products" },
  { name: "Track Order", href: "/track-order" },
  { name: "Contact", href: "/contact" },
];

const productCategories = [
  { name: "Gifts", href: "/products?search=gift" },
  { name: "Toys", href: "/products?search=toy" },
  { name: "Jewellery", href: "/products?search=jewel" },
  { name: "Children's Picks", href: "/products?search=kids" },
];

export default function Footer() {
  const [email, setEmail] = useState("");

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // This is a basic example. In production, you should use a proper backend service
      await fetch("/api/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          to: "Afmcarts@gmail.com",
        }),
      });
      console.log("Newsletter subscription:", email);
      setEmail("");
    } catch (error) {
      console.error("Error subscribing to newsletter:", error);
    }
  };

  return (
    <footer className="bg-[#f7fcf7] border-t border-green-100 pt-16 pb-8 relative overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "radial-gradient(#b8dbbd 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Section */}
          <div className="space-y-6">
            <Link href="/" className="inline-flex items-center gap-2.5 text-xl font-black text-gray-950">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-700">
                <ShoppingCart className="h-5 w-5" aria-hidden="true" />
              </span>
              <span>afm <span className="text-green-700">cart</span></span>
            </Link>
            <p className="text-slate-600 leading-relaxed text-sm">
              Thoughtful gifts, playful toys, and little keepsakes in Valiyora.
            </p>

            <div className="flex space-x-3">
              <Link href="mailto:Afmcarts@gmail.com" aria-label="Email AFM Cart">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full bg-white border-green-100 hover:bg-green-700 hover:border-green-700 hover:text-white transition-all shadow-sm"
                >
                  <Mail className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="https://wa.me/919207104571" target="_blank" aria-label="Message AFM Cart on WhatsApp">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full bg-white border-green-100 hover:bg-green-700 hover:border-green-700 hover:text-white transition-all shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="tel:+919207104571" aria-label="Call AFM Cart">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full bg-white border-green-100 hover:bg-green-700 hover:border-green-700 hover:text-white transition-all shadow-sm"
                >
                  <Phone className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-slate-900 mb-6">Quick Links</h4>
            <ul className="space-y-4">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-slate-600 hover:text-green-700 transition-colors text-sm hover:translate-x-1 inline-block transform"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories & Services */}
          <div>
            <h4 className="font-bold text-slate-900 mb-6">Explore</h4>
            <ul className="space-y-4">
              {productCategories.slice(0, 5).map((category) => (
                <li key={category.name}>
                  <Link
                    href={category.href}
                    className="text-slate-600 hover:text-green-700 transition-colors text-sm hover:translate-x-1 inline-block transform"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div className="space-y-6">
            <h4 className="font-bold text-slate-900 mb-6">Get in Touch</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 text-sm text-slate-600">
                <MapPin className="w-5 h-5 text-green-700 shrink-0 mt-0.5" />
                <span>Valiyora, Vengara, Malappuram, Kerala</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-slate-600">
                <Phone className="w-5 h-5 text-green-700 shrink-0" />
                <a href="tel:+919207104571" className="hover:text-green-800 transition-colors">+91 92071 04571</a>
              </div>
              <div className="flex items-center space-x-3 text-sm text-slate-600">
                <Mail className="w-5 h-5 text-green-700 shrink-0" />
                <a href="mailto:Afmcarts@gmail.com" className="hover:text-green-800 transition-colors">Afmcarts@gmail.com</a>
              </div>
            </div>

            <div className="pt-4">
              <h5 className="font-bold text-slate-900 text-sm mb-2">Newsletter</h5>
              <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white border-green-100 focus:border-green-500 focus:ring-green-100 rounded-lg text-sm shadow-sm"
                  required
                />
                <Button
                  type="submit"
                  className="bg-green-700 hover:bg-green-800 text-white font-bold rounded-lg transition-colors shadow-sm"
                >
                  Join
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-200 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-xs">
            © {new Date().getFullYear()} Afm cart. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link href="/privacy" className="text-slate-500 hover:text-slate-900 text-xs transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-slate-500 hover:text-slate-900 text-xs transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>

      <Button
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 bg-white hover:bg-green-700 hover:text-white text-green-800 border border-green-100 shadow-lg hover:shadow-xl rounded-full w-12 h-12 p-0 flex items-center justify-center transition-all duration-300 z-40 group"
      >
        <ArrowUp className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
      </Button>
    </footer>
  );
}