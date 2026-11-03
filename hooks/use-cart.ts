"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

interface VariationDetail {
  name: string
  value: string
}

export interface CartItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
  variations?: VariationDetail[] // Add variations to differentiate items (e.g., blue jeep vs. red jeep)
}

interface CartStore {
  items: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (id: string, variations?: VariationDetail[]) => void
  updateQuantity: (id: string, variations: VariationDetail[] | undefined, quantity: number) => void
  clearCart: () => void
  getCartTotal: () => number
  getCartCount: () => number
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addToCart: (item) => {
        const items = get().items
        const existingItemIndex = items.findIndex(
          (i) =>
            i.id === item.id &&
            JSON.stringify(i.variations) === JSON.stringify(item.variations)
        )

        if (existingItemIndex !== -1) {
          // Update quantity if the item with the same id and variations exists
          const updatedItems = [...items]
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: updatedItems[existingItemIndex].quantity + item.quantity,
          }
          set({ items: updatedItems })
        } else {
          // Add as a new item
          set({ items: [...items, item] })
        }
      },

      removeFromCart: (id, variations) => {
        set({
          items: get().items.filter(
            (item) =>
              !(
                item.id === id &&
                JSON.stringify(item.variations) === JSON.stringify(variations)
              )
          ),
        })
      },

      updateQuantity: (id, variations, quantity) => {
        const items = get().items
        const existingItemIndex = items.findIndex(
          (i) =>
            i.id === id &&
            JSON.stringify(i.variations) === JSON.stringify(variations)
        )

        if (quantity <= 0) {
          if (existingItemIndex !== -1) {
            get().removeFromCart(id, variations)
          }
          return
        }

        if (existingItemIndex !== -1) {
          const updatedItems = [...items]
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity,
          }
          set({ items: updatedItems })
        }
      },

      clearCart: () => {
        set({ items: [] })
      },

      getCartTotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0)
      },

      getCartCount: () => {
        return get().items.length // Count unique items (e.g., blue jeep and red jeep are 2 items)
      },
    }),
    {
      name: "cart-storage",
    }
  )
)