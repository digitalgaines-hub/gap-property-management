import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

const FROM_EMAIL = 'G&A Property Management <noreply@gandamanagement.com>'

export async function sendPaymentReceipt(params: {
  to: string
  amount: number
  date: string
  propertyName?: string
}) {
  if (!resend) return

  await resend.emails.send({
    from: FROM_EMAIL,
    to: params.to,
    subject: `Payment Receipt — $${params.amount.toLocaleString()}`,
    html: `
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
  })
}

export async function sendPaymentFailed(params: {
  to: string
  amount: number
}) {
  if (!resend) return

  await resend.emails.send({
    from: FROM_EMAIL,
    to: params.to,
    subject: 'Payment Failed — Action Required',
    html: `
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
  })
}

export async function sendMaintenanceUpdate(params: {
  to: string
  title: string
  status: string
  message?: string
}) {
  if (!resend) return

  const statusLabel = params.status.replace('_', ' ').replace(/^\w/, c => c.toUpperCase())

  await resend.emails.send({
    from: FROM_EMAIL,
    to: params.to,
    subject: `Maintenance Update: ${params.title}`,
    html: `
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
  })
}

export async function sendInquiryNotification(params: {
  to: string
  name: string
  email: string
  phone: string | null
  inquiryType: string
  message: string
}) {
  if (!resend) return

  const typeLabel = params.inquiryType === 'leasing' ? 'Lease Application'
    : params.inquiryType === 'tour_request' ? 'Tour Request'
    : params.inquiryType === 'maintenance_emergency' ? 'Maintenance Emergency'
    : 'General Inquiry'

  await resend.emails.send({
    from: FROM_EMAIL,
    to: params.to,
    subject: `New ${typeLabel} from ${params.name}`,
    html: `
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
  })
}

export async function sendMaintenanceNotification(params: {
  to: string
  tenantName: string
  title: string
  priority: string
  category: string
}) {
  if (!resend) return

  await resend.emails.send({
    from: FROM_EMAIL,
    to: params.to,
    subject: `New Maintenance Request: ${params.title}`,
    html: `
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
  })
}
