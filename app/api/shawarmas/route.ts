import { NextResponse } from 'next/server';

const shawarmas = [
  {
    id: '1',
    name: 'Classic Chicken Shawarma',
    description: 'Tender chicken marinated in Middle Eastern spices, wrapped with garlic sauce and pickles',
    price: 550,
    rating: 5,
    image: '/images/1.jpg', // Use local image
    spicyLevel: 2
  },
  {
    id: '2',
    name: 'Beef Shawarma Deluxe',
    description: 'Premium beef with tahini sauce, fresh veggies',
    // price: 650,
    rating: 5,
    image: '/images/2.jpg', // Use local image
    spicyLevel: 1
  },
];

export async function GET() {
  return NextResponse.json(shawarmas);
}