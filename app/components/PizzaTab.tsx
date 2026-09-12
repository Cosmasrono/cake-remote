'use client';
import ProductCollection, { type AddToCart } from './ProductCollection';
export default function PizzaTab({ handleAddToCart }: { handleAddToCart: AddToCart }) { return <ProductCollection endpoint="/api/pizzas" title="Pizza" description="Made for sharing, whatever the occasion." handleAddToCart={handleAddToCart} custom={false} />; }

