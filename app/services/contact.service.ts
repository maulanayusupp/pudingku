import { request } from './http'
import type { ContactInput, ContactResult } from '#shared/types/order'

/**
 * Contact form submission.
 *
 * The endpoint validates the message and returns a reference, but no mail
 * provider is configured, so nothing is delivered. The contact page therefore
 * also shows the direct email address as the reliable channel.
 */
export const contactService = {
  send(payload: ContactInput): Promise<ContactResult> {
    return request<ContactResult>('/api/contact', {
      method: 'POST',
      body: payload,
    })
  },
}
