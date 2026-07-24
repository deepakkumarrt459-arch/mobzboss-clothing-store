import { PDFDocument, rgb, StandardFonts, type PDFFont } from 'pdf-lib'
import type { Order } from '@/types/order'

const LOGO_TEXT = 'MobzBoss'
const PAGE_WIDTH = 595
const PAGE_HEIGHT = 842
const MARGIN = 40

function formatCurrency(amount = 0) {
  return `Rs. ${amount.toFixed(2)}`
}

function formatDate(date?: Date) {
  return date
    ? new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(date)
    : 'N/A'
}

function buildInvoiceRows(order: Order) {
  const items = order.items.map((item) => ({
    name: item.name,
    quantity: item.quantity,
    unitPrice: item.price,
    subtotal: item.price * item.quantity,
  }))

  const taxAmount = typeof order.tax === 'number' ? order.tax : 0
  const discountAmount = typeof order.discount === 'number' ? order.discount : 0
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0)
  const total = order.total

  // Calculate shipping: total = subtotal + shipping + tax - discount
  // Therefore: shipping = total - subtotal - tax + discount
  const shippingAmount = Math.max(0, total - subtotal - taxAmount + discountAmount)

  return { items, subtotal, taxAmount, discountAmount, shippingAmount, total }
}

export function getNextInvoiceNumberFromLast(lastInvoiceNumber?: string) {
  const year = new Date().getFullYear()
  const prefix = `INV-${year}`
  if (!lastInvoiceNumber || !lastInvoiceNumber.startsWith(prefix)) {
    return `${prefix}00001`
  }

  const match = lastInvoiceNumber.match(/(\d+)$/)
  if (!match) {
    return `${prefix}00001`
  }

  const next = Number(match[1]) + 1
  return `${prefix}${String(next).padStart(5, '0')}`
}

export async function buildInvoicePdf(order: Order): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  const { items, subtotal, taxAmount, discountAmount, shippingAmount, total } = buildInvoiceRows(order)
  const invoiceDate = formatDate(order.invoiceGeneratedAt ?? order.createdAt)
  const invoiceNumber = order.invoiceNumber ?? 'N/A'

  const drawText = (text: string, x: number, y: number, size = 10, options: { color?: ReturnType<typeof rgb>; font?: PDFFont } = {}) => {
    page.drawText(text, {
      x,
      y,
      size,
      font: options.font ?? helvetica,
      color: options.color ?? rgb(0, 0, 0),
    })
  }

  page.drawRectangle({
    x: 0,
    y: PAGE_HEIGHT - 120,
    width: PAGE_WIDTH,
    height: 120,
    color: rgb(0.06, 0.06, 0.06),
  })

  drawText(LOGO_TEXT, MARGIN, PAGE_HEIGHT - 60, 28, { font: helveticaBold, color: rgb(1, 0.12, 0.16) })
  drawText('Professional Invoice', MARGIN, PAGE_HEIGHT - 85, 11, { color: rgb(1, 1, 1) })

  drawText(`Invoice #: ${invoiceNumber}`, PAGE_WIDTH - MARGIN - 220, PAGE_HEIGHT - 60, 11, { font: helveticaBold })
  drawText(`Date: ${invoiceDate}`, PAGE_WIDTH - MARGIN - 220, PAGE_HEIGHT - 78, 10)
  drawText(`Order ID: ${order.id ?? 'N/A'}`, PAGE_WIDTH - MARGIN - 220, PAGE_HEIGHT - 96, 10)

  const headingY = PAGE_HEIGHT - 150
  drawText('Bill To:', MARGIN, headingY, 12, { font: helveticaBold, color: rgb(0.9, 0.9, 0.9) })
  drawText(order.customerName, MARGIN, headingY - 18, 10)
  drawText(order.email, MARGIN, headingY - 33, 10)
  drawText(order.phone, MARGIN, headingY - 48, 10)
  drawText(order.address, MARGIN, headingY - 63, 10)

  drawText('Payment', PAGE_WIDTH / 2 + 50, headingY, 12, { font: helveticaBold, color: rgb(0.9, 0.9, 0.9) })
  drawText(`Method: ${order.paymentMethod ?? 'N/A'}`, PAGE_WIDTH / 2 + 50, headingY - 18, 10)
  drawText(`Status: ${order.paymentStatus}`, PAGE_WIDTH / 2 + 50, headingY - 33, 10)
  drawText(`Order status: ${order.status.replace(/_/g, ' ')}`, PAGE_WIDTH / 2 + 50, headingY - 48, 10)

  const tableTop = headingY - 100
  const tableLeft = MARGIN
  const tableRight = PAGE_WIDTH - MARGIN
  const rowHeight = 20

  page.drawLine({
    start: { x: tableLeft, y: tableTop },
    end: { x: tableRight, y: tableTop },
    thickness: 1,
    color: rgb(0.4, 0.4, 0.4),
  })

  const columns = [
    { label: 'Product', x: tableLeft, width: 220 },
    { label: 'Qty', x: tableLeft + 230, width: 50 },
    { label: 'Unit', x: tableLeft + 290, width: 80 },
    { label: 'Subtotal', x: tableLeft + 380, width: 100 },
  ]

  columns.forEach((column) => drawText(column.label, column.x, tableTop - 16, 10, { font: helveticaBold }))

  let y = tableTop - 36
  items.forEach((item) => {
    drawText(item.name, columns[0].x, y, 10)
    drawText(String(item.quantity), columns[1].x, y, 10)
    drawText(formatCurrency(item.unitPrice), columns[2].x, y, 10)
    drawText(formatCurrency(item.subtotal), columns[3].x, y, 10)
    y -= rowHeight
  })

  const summaryTop = y - 20
  drawText('Subtotal', PAGE_WIDTH - MARGIN - 170, summaryTop, 10, { font: helveticaBold })
  drawText(formatCurrency(subtotal), PAGE_WIDTH - MARGIN - 40, summaryTop, 10)
  drawText('Shipping', PAGE_WIDTH - MARGIN - 170, summaryTop - 18, 10, { font: helveticaBold })
  drawText(formatCurrency(shippingAmount), PAGE_WIDTH - MARGIN - 40, summaryTop - 18, 10)
  drawText('Tax', PAGE_WIDTH - MARGIN - 170, summaryTop - 36, 10, { font: helveticaBold })
  drawText(formatCurrency(taxAmount), PAGE_WIDTH - MARGIN - 40, summaryTop - 36, 10)
  drawText('Discount', PAGE_WIDTH - MARGIN - 170, summaryTop - 54, 10, { font: helveticaBold })
  drawText(formatCurrency(discountAmount), PAGE_WIDTH - MARGIN - 40, summaryTop - 54, 10)
  page.drawLine({
    start: { x: PAGE_WIDTH - MARGIN - 170, y: summaryTop - 64 },
    end: { x: PAGE_WIDTH - MARGIN - 40, y: summaryTop - 64 },
    thickness: 1,
    color: rgb(0.4, 0.4, 0.4),
  })
  drawText('Grand Total', PAGE_WIDTH - MARGIN - 170, summaryTop - 80, 12, { font: helveticaBold })
  drawText(formatCurrency(total), PAGE_WIDTH - MARGIN - 40, summaryTop - 80, 12, { font: helveticaBold })

  const noteTop = summaryTop - 100
  drawText('Coupon Code: ' + (order.couponCode ?? 'None'), MARGIN, noteTop, 10)
  drawText('Thank you for shopping with MobzBoss.', MARGIN, noteTop - 18, 10)

  page.drawText('MobzBoss', {
    x: MARGIN,
    y: 30,
    size: 10,
    font: helveticaBold,
    color: rgb(1, 0.12, 0.16),
  })

  return pdfDoc.save()
}

export async function getNextInvoiceNumber(adminDb: import('firebase-admin').firestore.Firestore) {
  const year = new Date().getFullYear()
  const prefix = `INV-${year}`
  const invoiceQuery = adminDb
    .collection('orders')
    .where('invoiceNumber', '!=', null)
    .orderBy('invoiceNumber', 'desc')
    .limit(1)

  const snapshot = await invoiceQuery.get()
  if (snapshot.empty) {
    return `${prefix}00001`
  }

  const last = snapshot.docs[0].data().invoiceNumber as string | undefined
  return getNextInvoiceNumberFromLast(last)
}
