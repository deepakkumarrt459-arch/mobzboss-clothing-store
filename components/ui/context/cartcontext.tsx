"use client";

import React, { createContext, useContext, useEffect, useState } from 'react'
import { Product } from '../../../types/product'

export interface CartItem {
	product: Product
	quantity: number
}

interface CartContextValue {
	items: CartItem[]
	addToCart: (product: Product, quantity?: number) => void
	removeFromCart: (productId: string) => void
	increaseQuantity: (productId: string) => void
	decreaseQuantity: (productId: string) => void
	clearCart: () => void
	count: number
	subtotal: number
	isOpen: boolean
	openCart: () => void
	closeCart: () => void
	toggleCart: () => void
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

const STORAGE_KEY = 'mobzboss_cart_v1'

export const CartProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
	const [items, setItems] = useState<CartItem[]>([])
	const [isOpen, setIsOpen] = useState(false)

	useEffect(() => {
		try {
			const raw = localStorage.getItem(STORAGE_KEY)
			if (raw) setItems(JSON.parse(raw))
		} catch (e) {
			console.error('Failed to load cart from localStorage', e)
		}
	}, [])

	useEffect(() => {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
		} catch (e) {
			console.error('Failed to save cart to localStorage', e)
		}
	}, [items])

	const addToCart = (product: Product, quantity = 1) => {
		setItems((prev) => {
			const idx = prev.findIndex((p) => p.product.id === product.id)
			if (idx > -1) {
				const copy = [...prev]
				copy[idx] = { ...copy[idx], quantity: copy[idx].quantity + quantity }
				return copy
			}
			return [...prev, { product, quantity }]
		})
		setIsOpen(true)
	}

	const removeFromCart = (productId: string) => {
		setItems((prev) => prev.filter((p) => p.product.id !== productId))
	}

	const increaseQuantity = (productId: string) => {
		setItems((prev) => prev.map((p) => (p.product.id === productId ? { ...p, quantity: p.quantity + 1 } : p)))
	}

	const decreaseQuantity = (productId: string) => {
		setItems((prev) => {
			const copy = prev.map((p) => (p.product.id === productId ? { ...p, quantity: p.quantity - 1 } : p))
			return copy.filter((p) => p.quantity > 0)
		})
	}

	const clearCart = () => setItems([])

	const count = items.reduce((s, it) => s + it.quantity, 0)
	const subtotal = items.reduce((s, it) => s + it.product.price * it.quantity, 0)

	const openCart = () => setIsOpen(true)
	const closeCart = () => setIsOpen(false)
	const toggleCart = () => setIsOpen((v) => !v)

	return (
		<CartContext.Provider
			value={{ items, addToCart, removeFromCart, increaseQuantity, decreaseQuantity, clearCart, count, subtotal, isOpen, openCart, closeCart, toggleCart }}
		>
			{children}
		</CartContext.Provider>
	)
}

export const useCart = () => {
	const ctx = useContext(CartContext)
	if (!ctx) throw new Error('useCart must be used within CartProvider')
	return ctx
}

export default CartContext

