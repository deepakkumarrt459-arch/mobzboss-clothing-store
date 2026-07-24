import { NextRequest } from 'next/server'
import { initAdmin, getAdminDb } from '@/lib/firebaseAdmin'
import { validationError, successResponse, serverError } from '@/lib/apiResponse'
import { error as logError } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    initAdmin()
    const adminDb = getAdminDb()
    const body = await request.json()
    const items = Array.isArray(body?.items) ? body.items : []

    if (items.length === 0) {
      return validationError('No items to validate')
    }

    const issues: Array<{
      productId: string
      requested: number
      available: number
      name?: string
    }> = []

    for (const item of items) {
      const productId = String(item?.productId || '').trim()
      const requested = Number(item?.quantity || 0)
      const name = String(item?.name || 'Product')

      if (!productId || requested <= 0) continue

      try {
        const productRef = adminDb.doc(`products/${productId}`)
        const snapshot = await productRef.get()

        if (!snapshot.exists) {
          issues.push({ productId, requested, available: 0, name })
          continue
        }

        const data = snapshot.data() as Record<string, unknown> | undefined
        const available = typeof data?.stock === 'number' ? Math.max(0, data.stock as number) : 0

        if (available < requested) {
          issues.push({ productId, requested, available, name })
        }
      } catch (itemError) {
        // Skip individual item errors, continue validation
        logError(`[Stock Validation] Error checking product ${productId}`, itemError)
      }
    }

    if (issues.length > 0) {
      return validationError('Some items are unavailable or insufficient stock', 409)
    }

    return successResponse({ valid: true }, 'All items in stock')
  } catch (error) {
    return serverError('Stock validation failed', error)
  }
}