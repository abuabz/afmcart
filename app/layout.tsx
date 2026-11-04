import type React from "react"
import type { Metadata, Viewport } from "next"
import { Nunito } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import ToastProvider from "@/components/toast-provider"

const nunito = Nunito({ subsets: ["latin"], weight: ["400", "600", "700", "900"] })

export const viewport: Viewport = {
  themeColor: "#ffffff",
  colorScheme: "light",
}

export const metadata: Metadata = {
  title: "Afm cart | Gifts, Toys & Jewellery",
  description: "Find thoughtful gifts, playful toys, and jewellery at Afm cart in Valiyora, Vengara, Malappuram.",
  applicationName: "Afm cart",
  authors: [{ name: "Afm cart" }],
  keywords: [
    "gifts in Malappuram", 
    "toys in Vengara", 
    "jewellery in Kerala", 
    "gift shop in Malappuram",
    "kids toys Kerala",
    "Afm cart gifts", 
    "jewellery Vengara",
    "Afm cart", 
    "toys Malappuram"
  ],
  creator: "Afm cart",
  publisher: "Afm cart",
  icons: {
    icon: "/afm-cart-icon.svg",
    shortcut: "/afm-cart-icon.svg",
    apple: "/afm-cart-icon.svg",
  },
}

import Providers from "./providers"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={nunito.className}>
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            disableTransitionOnChange
          >
            {children}
            <ToastProvider />
          </ThemeProvider>
        </Providers>
        
        {/* Local Business SEO Schema Markup */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Store",
              "name": "Afm cart",
              "description": "Shop toys, cycles, and kids' rides from Afm cart in Valiyora, Vengara, Malappuram.",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Vengara",
                "addressRegion": "Kerala",
                "addressCountry": "IN"
              },
              "telephone": "+919207104571",
              "email": "Afmcarts@gmail.com"
            })
          }}
        />
      </body>
    </html>
  )
}
