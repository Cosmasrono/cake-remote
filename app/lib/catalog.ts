export interface MenuProduct { id: string; name: string; description: string; price: number | null; image: string }
// The savoury menu is fixed, so it lives here rather than in the database.
// A null price shows as "Price to be confirmed" and cannot be added to the bag.
export const menu: Record<string, MenuProduct[]> = {
  shawarmas: [
    { id: 'shawarma-chicken', name: 'Classic Chicken Shawarma', description: 'Tender chicken marinated in Middle Eastern spices, wrapped with garlic sauce and pickles', price: 550, image: '/images/1.jpg' },
    { id: 'shawarma-beef', name: 'Beef Shawarma Deluxe', description: 'Premium beef with tahini sauce and fresh vegetables', price: 700, image: '/images/2.jpg' },
    { id: 'shawarma-chicken-large', name: 'Chicken Shawarma, Large', description: 'A double portion of chicken with garlic sauce, pickles, and fries folded in', price: 750, image: '/images/3.jpg' },
    { id: 'shawarma-mixed', name: 'Mixed Shawarma', description: 'Chicken and beef together, with tahini and garlic sauce', price: 800, image: '/images/6.jpg' },
    { id: 'shawarma-veg', name: 'Falafel Shawarma', description: 'Spiced chickpea falafel with hummus, salad, and pickles', price: 500, image: '/images/8.jpg' },
  ],
  burgers: [
    { id: 'burger-classic', name: 'Classic Beef Burger', description: 'Char-grilled beef patty, lettuce, tomato, and house burger sauce', price: 650, image: '/images/4.jpg' },
    { id: 'burger-cheese', name: 'Double Cheeseburger', description: 'Two beef patties with melted cheddar, onions, and pickles', price: 900, image: '/images/5.jpg' },
    { id: 'burger-chicken', name: 'Crispy Chicken Burger', description: 'Buttermilk-fried chicken fillet with slaw and garlic mayo', price: 700, image: '/images/9.jpg' },
    { id: 'burger-veg', name: 'Garden Veggie Burger', description: 'Black bean and vegetable patty with avocado and tomato relish', price: 600, image: '/images/8.jpg' },
  ],
  pizzas: [
    { id: 'pizza-margherita', name: 'Margherita Classic', description: 'Fresh mozzarella, tomato sauce, basil, and extra virgin olive oil', price: 850, image: '/images/7.jpg' },
    { id: 'pizza-pepperoni', name: 'Pepperoni', description: 'Mozzarella and a generous layer of pepperoni on tomato sauce', price: 1100, image: '/images/6.jpg' },
    { id: 'pizza-chicken-bbq', name: 'BBQ Chicken', description: 'Barbecue chicken, red onion, and coriander on a smoky base', price: 1250, image: '/images/9.jpg' },
    { id: 'pizza-veg', name: 'Garden Vegetable', description: 'Peppers, mushrooms, red onion, sweetcorn, and black olives', price: 1000, image: '/images/8.jpg' },
    { id: 'pizza-meat-feast', name: 'Meat Feast', description: 'Beef, chicken, pepperoni, and sausage with mozzarella', price: 1450, image: '/images/5.jpg' },
  ],
};
