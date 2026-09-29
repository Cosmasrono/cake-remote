export interface PosProduct {
  id: string;
  name: string;
  category: 'Cakes' | 'Shawarmas' | 'Burgers' | 'Pizzas' | 'Custom';
  price: number;
  image: string;
  description?: string;
}

export interface PosCartItem {
  id: string;
  productId: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  notes?: string;
  image?: string;
}

export interface PosSalePayload {
  items: PosCartItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: 'CASH' | 'MPESA';
  amountPaid: number;
  changeDue: number;
  mpesaCode?: string;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
  /** Set when this sale settles a website order or custom-cake enquiry. */
  onlineOrder?: { id: string; source: string };
}


export function formatKes(amount: number): string {
  return 'KSh ' + Number(amount || 0).toLocaleString('en-KE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}
