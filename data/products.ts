export interface Product {
  id: string
  name: string
  category: 'Outerwear' | 'Tops' | 'Bottoms' | 'Accessories' | 'Essentials'
  price: string
  description: string
  image: string
  badge?: string
}

export const products: Product[] = [
  {
    id: 'mbs-001',
    name: 'Commander Jacket',
    category: 'Outerwear',
    price: '$360',
    description: 'Structured matte shell with tailored shoulders and luxe hardware details.',
    image: 'https://placehold.co/400x500/111111/F5F5F5?text=Commander+Jacket',
    badge: 'Best Seller',
  },
  {
    id: 'mbs-002',
    name: 'Artisan Leather Trench',
    category: 'Outerwear',
    price: '$520',
    description: 'Longline silhouette in premium leather with warm gold accents.',
    image: 'https://placehold.co/400x500/2B2B2B/F5F5F5?text=Leather+Trench',
  },
  {
    id: 'mbs-003',
    name: 'Vintage Gold Logo Tee',
    category: 'Tops',
    price: '$95',
    description: 'Soft cotton tee with subtle vintage branding and an elevated fit.',
    image: 'https://placehold.co/400x500/111111/F5F5F5?text=Gold+Logo+Tee',
  },
  {
    id: 'mbs-004',
    name: 'Signature Cargo Pants',
    category: 'Bottoms',
    price: '$220',
    description: 'Refined cargo construction with premium stitch detail and tapered lines.',
    image: 'https://placehold.co/400x500/2B2B2B/F5F5F5?text=Cargo+Pants',
  },
  {
    id: 'mbs-005',
    name: 'Icon Knit Hoodie',
    category: 'Tops',
    price: '$180',
    description: 'Sculpted fit and plush knit for effortless layering and edge.',
    image: 'https://placehold.co/400x500/111111/F5F5F5?text=Knit+Hoodie',
  },
  {
    id: 'mbs-006',
    name: 'Luxe Twill Shirt',
    category: 'Tops',
    price: '$185',
    description: 'Crisp twill with vintage-inspired details and a relaxed drape.',
    image: 'https://placehold.co/400x500/2B2B2B/F5F5F5?text=Twill+Shirt',
  },
  {
    id: 'mbs-007',
    name: 'Tailored Denim',
    category: 'Bottoms',
    price: '$210',
    description: 'Premium denim with structured tailoring and a clean finish.',
    image: 'https://placehold.co/400x500/111111/F5F5F5?text=Tailored+Denim',
  },
  {
    id: 'mbs-008',
    name: 'Heritage Bomber',
    category: 'Outerwear',
    price: '$340',
    description: 'Timeless bomber form with tactile fabric and luxury trimming.',
    image: 'https://placehold.co/400x500/2B2B2B/F5F5F5?text=Heritage+Bomber',
  },
  {
    id: 'mbs-009',
    name: 'Structured Blazer',
    category: 'Essentials',
    price: '$390',
    description: 'Sharp silhouette with a vintage-inspired pattern and soft tailoring.',
    image: 'https://placehold.co/400x500/111111/F5F5F5?text=Structured+Blazer',
  },
  {
    id: 'mbs-010',
    name: 'Modern Chore Coat',
    category: 'Outerwear',
    price: '$270',
    description: 'Utility-forward layering piece with premium finishing and fit.',
    image: 'https://placehold.co/400x500/2B2B2B/F5F5F5?text=Chore+Coat',
  },
  {
    id: 'mbs-011',
    name: 'Leather Track Shorts',
    category: 'Bottoms',
    price: '$160',
    description: 'Refined athletic-inspired shorts in soft leather with streamlined details.',
    image: 'https://placehold.co/400x500/111111/F5F5F5?text=Track+Shorts',
  },
  {
    id: 'mbs-012',
    name: 'Premium Beanie',
    category: 'Accessories',
    price: '$65',
    description: 'A minimal winter staple with a vintage textured knit and luxe finish.',
    image: 'https://placehold.co/400x500/2B2B2B/F5F5F5?text=Premium+Beanie',
  },
]
