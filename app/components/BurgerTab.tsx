'use client';
import ProductCollection, { type AddToCart } from './ProductCollection';
export default function BurgerTab({ handleAddToCart }: { handleAddToCart: AddToCart }) { return <ProductCollection endpoint="/api/burgers" title="Burgers" description="Something savoury from the Japhee kitchen." handleAddToCart={handleAddToCart} custom={false} />; }

