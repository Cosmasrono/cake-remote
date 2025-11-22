import { NextResponse } from 'next/server';

const pizzas = [
  {
    id: '1',
    name: 'Margherita Classic',
    description: 'Fresh mozzarella, tomato sauce, basil, and extra virgin olive oil',
    // price: 950,
    rating: 5,
    image: '/images/7.jpg', // Use local image
    size: 'Medium',
    isVeg: true,
  },
];

export async function GET() {
  return NextResponse.json(pizzas);
}