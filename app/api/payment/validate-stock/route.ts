import { NextRequest, NextResponse } from 'next/server'
import { initAdmin, getAdminDb } from '@/lib/firebaseAdmin'

export async function POST(request: NextRequest) {
  try {
    initAdmin()
    const adminDb = getAdminDb()
    const body = await request.json()
    const items = Array.isArray(body?.items) ? body.items : []

    if (items.length === 0) {
      return NextResponse.json(
        { error: 'No cart items provided for stock validation.' },
        { status: 400 }
      )
    }

    const issues: Array<{
      productId: string
      requested: number
      available: number
      name?: string
    }> = []

    for (const item of items) {
      const productId = String(item?.productId || '')
      const requested = Number(item?.quantity || 0)

      if (!productId || requested <= 0) continue

      const productRef = adminDb.doc(`products/${productId}`)
      const snapshot = await productRef.get()

      if (!snapshot.exists) {
        issues.push({ productId, requested, available: 0, name: String(item?.name ?? 'Unknown product') })
        continue
      }

      const data = snapshot.data() as Record<string, unknown> | undefined
      const available = typeof data?.stock === 'number' ? (data.stock as number) : 0

      if (available < requested) {
        issues.push({
          productId,
          requested,
          available,
          name: String(item?.name ?? 'Unknown product'),
        })
      }
    }

    if (issues.length > 0) {
      return NextResponse.json(
        {
          valid: false,
          error: 'Some items are unavailable or exceed available stock.',
          issues,
        },
        { status: 409 }
      )
    }

    return NextResponse.json({ valid: true })
  } catch (error) {
    console.error('========== STOCK VALIDATION ERROR ==========')
    console.error(error)

    return NextResponse.json(
      {
        error: 'Unable to validate stock at this time.',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}