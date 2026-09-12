'use client';
import ProductCollection, { type AddToCart } from './ProductCollection';
export default function ShawarmaTab({ handleAddToCart }: { handleAddToCart: AddToCart }) { return <ProductCollection endpoint="/api/shawarmas" title="Shawarma" description="Take a savoury break and find your favourite." handleAddToCart={handleAddToCart} custom={false} />; }

