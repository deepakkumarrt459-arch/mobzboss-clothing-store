// NextResponse intentionally not required in this handler
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { successResponse, serverError } from '@/lib/apiResponse'

export async function GET(request: Request, { params }: { params: Promise<{ productId: string }> }) {
  try {
    const { productId } = await params

    if (!db) {
      return successResponse([], 'No reviews available')
    }

    const reviewsRef = collection(db, 'products', productId, 'reviews')
    const q = query(reviewsRef, orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)

    const reviews = snapshot.docs.map((docSnap) => {
      const data = docSnap.data()
      return {
        id: docSnap.id,
        userId: data.userId,
        userName: data.userName,
        rating: data.rating,
        review: data.review,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : null,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : null,
      }
    })

    return successResponse(reviews, 'Reviews retrieved successfully')
  } catch (error) {
    return serverError('Failed to fetch reviews', error)
  }
}

