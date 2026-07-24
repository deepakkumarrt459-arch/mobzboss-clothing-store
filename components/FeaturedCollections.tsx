import React from 'react'
import Image from 'next/image'

const collections = [
  {
    title: 'Urban Archive',
    description: 'Matte black tailoring layered with premium texture and subtle hardware.',
    image: 'https://placehold.co/400x500/111111/F5F5F5?text=Urban+Archive',
  },
  {
    title: 'Golden Hour',
    description: 'Warm brown accents and luxe finishes for elevated evening styling.',
    image: 'https://placehold.co/400x500/2B2B2B/F5F5F5?text=Golden+Hour',
  },
  {
    title: 'Midnight Capsule',
    description: 'Iconic silhouettes built for confidence, comfort, and premium wearability.',
    image: 'https://placehold.co/400x500/111111/F5F5F5?text=Midnight+Capsule',
  },
]

export default function FeaturedCollections() {
  return (
    <section id="collections" className="bg-[#111111] py-20 text-[#F5F5F5]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#C9A227]/80">Collections</p>
          <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">Curated stories in premium materials.</h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[#D9D0A7]">
            Discover tailored streetwear collections that lean into vintage glamour, luxury textures, and lasting versatility.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {collections.map((collection) => (
            <article
              key={collection.title}
              className="group overflow-hidden rounded-[2rem] border border-[#7A5C3E]/20 bg-[#1C1C1C] shadow-[0_30px_80px_-40px_rgba(0,0,0,0.8)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_40px_100px_-40px_rgba(0,0,0,0.9)]"
            >
              <div className="overflow-hidden relative h-[320px] w-full">
                <Image src={collection.image} alt={collection.title} fill className="object-cover transition duration-500 group-hover:scale-105" unoptimized />
              </div>
              <div className="space-y-4 p-6">
                <span className="inline-flex rounded-full bg-[#C9A227]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[#C9A227]">
                  Signature Edit
                </span>
                <h3 className="text-2xl font-semibold text-[#F5F5F5]">{collection.title}</h3>
                <p className="text-sm leading-7 text-[#D9D0A7]">{collection.description}</p>
                
                <a
                  href="#trending"
                  className="inline-flex rounded-full border border-[#C9A227]/30 bg-[#C9A227]/10 px-5 py-3 text-sm font-semibold text-[#C9A227] transition duration-300 hover:bg-[#C9A227] hover:text-[#111111]"
                >
                  Explore More
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
