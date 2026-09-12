import { customOrderSummary, type CustomOrderDetails } from './custom-orders';

export const WHATSAPP_NUMBER = '0725830546';
// wa.me needs the international form, with no plus sign and no leading zero.
const WHATSAPP_INTERNATIONAL = '254725830546';

export function whatsappLink(message?: string, number: string = WHATSAPP_INTERNATIONAL) {
  const base = `https://wa.me/${number}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

// Kenyan numbers are usually written 07…, +2547…, or 2547…; wa.me accepts only the last form.
export function toWhatsAppNumber(phone: string) {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('254')) return digits;
  if (digits.startsWith('0')) return '254' + digits.slice(1);
  if (digits.length === 9) return '254' + digits;
  return digits;
}

export function customCakeMessage(details: CustomOrderDetails = {}, reference?: string) {
  const summary = customOrderSummary(details, reference);
  return [
    '*Custom cake enquiry — Japhe\'s Cakes*',
    'Hello Japhe, I would like to enquire about a custom cake.',
    ...(summary.length ? ['', ...summary] : []),
    '',
    'Kindly advise on availability and cost. Thank you.',
  ].join('\n');
}

export function adminReplyMessage(name: string, reference: string) {
  return `Hello ${name.split(' ')[0] || name}, thank you for your custom cake enquiry with Japhe's Cakes (reference ${reference}). I would like to confirm a few details so we can prepare your quote.`;
}
