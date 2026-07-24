import nodemailer from 'nodemailer'
import type { SendMailOptions } from 'nodemailer'
import { error as logError } from './logger'
import { getOrderEmailTemplate } from './emailTemplates'
import { buildInvoicePdf } from './invoice'
import type { Order, OrderEmailType } from '@/types/order'

const smtpHost = process.env.SMTP_HOST
const smtpPort = Number(process.env.SMTP_PORT || '0')
const smtpUser = process.env.SMTP_USER
const smtpPassword = process.env.SMTP_PASSWORD
const emailFrom = process.env.EMAIL_FROM || `MobzBoss <no-reply@mobzboss.com>`

let cachedTransporter: ReturnType<typeof nodemailer.createTransport> | null = null

function getTransporter() {
  if (cachedTransporter) {
    return cachedTransporter
  }

  if (!smtpHost || !smtpPort || !smtpUser || !smtpPassword) {
    return null
  }

  cachedTransporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPassword,
    },
  })

  return cachedTransporter
}

interface EmailResult {
  success: boolean
  error?: string
}

export async function sendEmail(options: SendMailOptions): Promise<EmailResult> {
  const transporter = getTransporter()

  if (!transporter) {
    const error = 'SMTP credentials are not configured.'
    logError(error)
    return { success: false, error }
  }

  try {
    await transporter.sendMail({
      from: emailFrom,
      ...options,
    })
    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logError('Failed to send email', message)
    return { success: false, error: message }
  }
}

export async function sendOrderNotificationEmail(order: Order, emailType: OrderEmailType) {
  const template = getOrderEmailTemplate(emailType, order)
  const mailOptions: SendMailOptions = {
    to: order.email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  }

  if ((emailType === 'order_confirmed' || emailType === 'order_delivered') && order.invoiceNumber) {
    try {
      const invoicePdf = await buildInvoicePdf(order)
      mailOptions.attachments = [
        {
          filename: `${order.invoiceNumber}.pdf`,
          content: Buffer.from(invoicePdf),
          contentType: 'application/pdf',
        },
      ]
    } catch (attachmentError) {
      const message = attachmentError instanceof Error ? attachmentError.message : String(attachmentError)
      logError('Failed to generate invoice attachment', message)
    }
  }

  return sendEmail(mailOptions)
}
