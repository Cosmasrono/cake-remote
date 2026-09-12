export interface MenuProduct { id: string; name: string; description: string; price: number | null; image: string }
export const menu: Record<string, MenuProduct[]> = {
  shawarmas: [
    { id: 'shawarma-chicken', name: 'Classic Chicken Shawarma', description: 'Tender chicken marinated in Middle Eastern spices, wrapped with garlic sauce and pickles', price: 550, image: '/images/1.jpg' },
    { id: 'shawarma-beef', name: 'Beef Shawarma Deluxe', description: 'Premium beef with tahini sauce, fresh veggies', price: null, image: '/images/2.jpg' },
  ],
  burgers: [{ id: 'burger-classic', name: 'Classic Burger', description: 'A savoury favourite from the Japhee kitchen', price: null, image: '/images/4.jpg' }],
  pizzas: [{ id: 'pizza-margherita', name: 'Margherita Classic', description: 'Fresh mozzarella, tomato sauce, basil, and extra virgin olive oil', price: null, image: '/images/7.jpg' }],
};

