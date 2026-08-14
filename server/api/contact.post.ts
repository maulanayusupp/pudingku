import { generateReference } from '#shared/utils/reference'
import type { ContactInput, ContactResult } from '#shared/types/order'

/**
 * POST /api/contact — DEMO ONLY.
 *
 * Validates the message and returns a reference. No email is sent and nothing
 * is stored: there is no mail provider configured in this build. The contact
 * page tells visitors to email directly and shows this limitation, so nobody
 * assumes a message was delivered.
 */
export default defineEventHandler(async (event): Promise<ContactResult> => {
  const body = await readBody<Partial<ContactInput>>(event)
  const fields: Record<string, string> = {}

  const name = body?.name?.trim() ?? ''
  const email = body?.email?.trim() ?? ''
  const subject = body?.subject?.trim() ?? ''
  const message = body?.message?.trim() ?? ''

  if (name.length < 2) fields.name = 'validation.required'
  if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email)) fields.email = 'validation.email'
  if (subject.length < 3) fields.subject = 'validation.required'
  if (message.length < 10) fields.message = 'validation.minLength'
  if (message.length > 4000) fields.message = 'validation.maxLength'

  if (Object.keys(fields).length > 0) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Validation failed',
      data: { message: 'validation.formHasErrors', fields },
    })
  }

  return {
    reference: generateReference('MSG'),
    receivedAt: new Date().toISOString(),
    status: 'queued-demo',
  }
})
