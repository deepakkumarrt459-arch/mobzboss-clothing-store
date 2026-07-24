'use client'

import { useMemo, useState } from 'react'
import type { Order } from '@/types/order'
import { buildInvoicePdf } from '@/lib/invoice'
import Button from '@/components/ui/Button'

interface InvoiceActionsProps {
  order: Order
}

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export default function InvoiceActions({ order }: InvoiceActionsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const invoiceLabel = useMemo(() => order.invoiceNumber ?? 'invoice', [order.invoiceNumber])

  const generatePdf = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const pdfBytes = await buildInvoicePdf(order)
      return new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' })
    } catch (error) {
      console.error('Invoice PDF generation failed', error)
      setError('Unable to generate invoice PDF. Please try again later.')
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = async () => {
    const blob = await generatePdf()
    if (blob) {
      downloadBlob(`${invoiceLabel}.pdf`, blob)
    }
  }

  const handlePreview = async () => {
    const blob = await generatePdf()
    if (blob) {
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank')
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        <Button type="button" onClick={handleDownload} disabled={isLoading}>
          {isLoading ? 'Generating…' : 'Download Invoice'}
        </Button>
        <Button variant="ghost" type="button" onClick={handlePreview} disabled={isLoading}>
          {isLoading ? 'Generating…' : 'Preview Invoice'}
        </Button>
      </div>
      {error ? <p className="text-sm text-[#F56565]">{error}</p> : null}
    </div>
  )
}
