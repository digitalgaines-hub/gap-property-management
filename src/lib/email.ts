import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'

const FROM_EMAIL = 'G&A Property Management <noreply@gandamanagement.com>'

let _ses: SESClient | null = null

function getSES(): SESClient | null {
  if (_ses) return _ses
  if (!process.env.AWS_SES_ACCESS_KEY_ID || !process.env.AWS_SES_SECRET_ACCESS_KEY) return null
  _ses = new SESClient({
    region: process.env.AWS_SES_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_SES_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY,
    },
  })
  return _ses
}

async function sendEmail(to: string, subject: string, html: string) {
  const ses = getSES()
  if (!ses) return

  await ses.send(new SendEmailCommand({
    Source: FROM_EMAIL,
    Destination: { ToAddresses: [to] },
    Message: {
      Subject: { Data: subject, Charset: 'UTF-8' },
      Body: { Html: { Data: html, Charset: 'UTF-8' } },
    },
  }))
}

export async function sendPaymentReceipt(params: {
  to: string
  amount: number
  date: string
  propertyName?: string
}) {
  await sendEmail(
    params.to,
    `Payment Receipt — $${params.amount.toLocaleString()}`,
    `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #2563EB, #1E40AF); padding: 24px; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 20px;">G&A Property Management</h1>
        </div>
        <div style="padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <h2 style="color: #1f2937; margin-top: 0;">Payment Received</h2>
          <p style="color: #4b5563;">Thank you! We have received your rent payment.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr><td style="padding: 8px 0; color: #6b7280;">Amount</td><td style="padding: 8px 0; text-align: right; font-weight: bold; color: #1f2937;">$${params.amount.toLocaleString()}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">Date</td><td style="padding: 8px 0; text-align: right; color: #1f2937;">${params.date}</td></tr>
            ${params.propertyName ? `<tr><td style="padding: 8px 0; color: #6b7280;">Property</td><td style="padding: 8px 0; text-align: right; color: #1f2937;">${params.propertyName}</td></tr>` : ''}
          </table>
          <p style="color: #6b7280; font-size: 14px;">If you have any questions, contact us at (502) 783-7573.</p>
        </div>
      </div>
    `,
  )
}

export async function sendPaymentFailed(params: {
  to: string
  amount: number
}) {
  await sendEmail(
    params.to,
    'Payment Failed — Action Required',
    `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #2563EB, #1E40AF); padding: 24px; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 20px;">G&A Property Management</h1>
        </div>
        <div style="padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <h2 style="color: #dc2626; margin-top: 0;">Payment Failed</h2>
          <p style="color: #4b5563;">Your rent payment of <strong>$${params.amount.toLocaleString()}</strong> could not be processed.</p>
          <p style="color: #4b5563;">Please log in to the tenant portal to retry your payment or contact us for assistance.</p>
          <p style="color: #6b7280; font-size: 14px; margin-top: 16px;">Contact us at (502) 783-7573.</p>
        </div>
      </div>
    `,
  )
}

export async function sendMaintenanceUpdate(params: {
  to: string
  title: string
  status: string
  message?: string
}) {
  const statusLabel = params.status.replace('_', ' ').replace(/^\w/, c => c.toUpperCase())

  await sendEmail(
    params.to,
    `Maintenance Update: ${params.title}`,
    `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #2563EB, #1E40AF); padding: 24px; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 20px;">G&A Property Management</h1>
        </div>
        <div style="padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <h2 style="color: #1f2937; margin-top: 0;">Maintenance Request Update</h2>
          <p style="color: #4b5563;">Your maintenance request <strong>&ldquo;${params.title}&rdquo;</strong> has been updated.</p>
          <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 0; color: #1f2937;"><strong>Status:</strong> ${statusLabel}</p>
            ${params.message ? `<p style="margin: 8px 0 0; color: #4b5563;">${params.message}</p>` : ''}
          </div>
          <p style="color: #6b7280; font-size: 14px;">Log in to the tenant portal to view full details.</p>
        </div>
      </div>
    `,
  )
}

export async function sendInquiryNotification(params: {
  to: string
  name: string
  email: string
  phone: string | null
  inquiryType: string
  message: string
}) {
  const typeLabel = params.inquiryType === 'leasing' ? 'Lease Application'
    : params.inquiryType === 'tour_request' ? 'Tour Request'
    : params.inquiryType === 'maintenance_emergency' ? 'Maintenance Emergency'
    : 'General Inquiry'

  await sendEmail(
    params.to,
    `New ${typeLabel} from ${params.name}`,
    `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #2563EB, #1E40AF); padding: 24px; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 20px;">G&A Property Management</h1>
        </div>
        <div style="padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <h2 style="color: #1f2937; margin-top: 0;">New ${typeLabel}</h2>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr><td style="padding: 8px 0; color: #6b7280;">Name</td><td style="padding: 8px 0; text-align: right; color: #1f2937;">${params.name}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">Email</td><td style="padding: 8px 0; text-align: right; color: #1f2937;"><a href="mailto:${params.email}">${params.email}</a></td></tr>
            ${params.phone ? `<tr><td style="padding: 8px 0; color: #6b7280;">Phone</td><td style="padding: 8px 0; text-align: right; color: #1f2937;"><a href="tel:${params.phone}">${params.phone}</a></td></tr>` : ''}
            <tr><td style="padding: 8px 0; color: #6b7280;">Type</td><td style="padding: 8px 0; text-align: right; color: #1f2937;">${typeLabel}</td></tr>
          </table>
          <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 0; color: #4b5563; white-space: pre-wrap;">${params.message}</p>
          </div>
          <p style="color: #6b7280; font-size: 14px;">Log in to the owner portal to view and respond.</p>
        </div>
      </div>
    `,
  )
}

export async function sendMaintenanceNotification(params: {
  to: string
  tenantName: string
  title: string
  priority: string
  category: string
}) {
  await sendEmail(
    params.to,
    `New Maintenance Request: ${params.title}`,
    `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #2563EB, #1E40AF); padding: 24px; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 20px;">G&A Property Management</h1>
        </div>
        <div style="padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <h2 style="color: #1f2937; margin-top: 0;">New Maintenance Request</h2>
          <p style="color: #4b5563;">${params.tenantName} has submitted a new maintenance request.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr><td style="padding: 8px 0; color: #6b7280;">Title</td><td style="padding: 8px 0; text-align: right; color: #1f2937;">${params.title}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">Priority</td><td style="padding: 8px 0; text-align: right; color: ${params.priority === 'emergency' ? '#dc2626' : '#1f2937'}; font-weight: bold;">${params.priority}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">Category</td><td style="padding: 8px 0; text-align: right; color: #1f2937;">${params.category}</td></tr>
          </table>
          <p style="color: #6b7280; font-size: 14px;">Log in to the owner portal to manage this request.</p>
        </div>
      </div>
    `,
  )
}
