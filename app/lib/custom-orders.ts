export const CUSTOM_ORDER_STATUSES = ['pending', 'in_progress', 'quoted', 'completed', 'declined'] as const;
export type CustomOrderStatus = (typeof CUSTOM_ORDER_STATUSES)[number];

export const STATUS_LABELS: Record<string, string> = { pending: 'New enquiry', in_progress: 'In progress', quoted: 'Quoted', completed: 'Completed', declined: 'Declined' };

// A short, human-readable reference both the customer and the team can quote.
export function orderReference(id: string) {
  return 'JC-' + id.slice(-6).toUpperCase();
}

export interface CustomOrderDetails {
  name?: string | null;
  phone?: string | null;
  occasion?: string | null;
  date?: string | null;
  flavor?: string | null;
  size?: string | null;
  message?: string | null;
  inspirationLink?: string | null;
}

export function customOrderSummary(details: CustomOrderDetails, reference?: string) {
  const rows: [string, string | null | undefined][] = [
    ['Reference', reference],
    ['Name', details.name],
    ['Phone', details.phone],
    ['Occasion', details.occasion],
    ['Preferred date', details.date],
    ['Flavour', details.flavor],
    ['Size / tiers', details.size],
    ['Message on cake', details.message],
    ['Inspiration', details.inspirationLink],
  ];
  return rows.filter(([, value]) => value && value.trim()).map(([label, value]) => `${label}: ${value!.trim()}`);
}
