'use client';
import ProductCollection, { type AddToCart } from './ProductCollection';
export default function CakesTab({ handleAddToCart }: { handleAddToCart: AddToCart }) { return <ProductCollection endpoint="/api/cakes" title="Cakes for the occasion." description="A thoughtful centrepiece. A favourite flavour. A reason to gather." handleAddToCart={handleAddToCart} custom={true} />; }

