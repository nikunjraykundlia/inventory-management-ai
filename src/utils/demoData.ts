
import { Product } from '../types/product';

const generateDemoProducts = (): Product[] => {
  const products: Product[] = [];
  const names = ['Shirt', 'Pants', 'Shoes', 'Watch', 'Bag'];
  const categories = ['Classic', 'Premium', 'Sport', 'Casual', 'Luxury'];

  for (let i = 1; i <= 100; i++) {
    const name = `${categories[Math.floor(Math.random() * categories.length)]} ${
      names[Math.floor(Math.random() * names.length)]
    }`;
    const returnsCount = Math.floor(Math.random() * 50);
    const deliverySuccessRate = 65 + Math.random() * 30; // Between 65% and 95%
    const rtoRisk = deliverySuccessRate > 85 ? 'low' : deliverySuccessRate > 75 ? 'medium' : 'high';

    products.push({
      id: i,
      name,
      sku: `SKU${i.toString().padStart(5, '0')}`,
      stock: Math.floor(Math.random() * 200) + 50,
      price: Math.floor(Math.random() * 10000) + 500,
      lastRestocked: new Date(
        Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000
      ).toISOString(),
      returnsCount,
      deliverySuccessRate,
      rtoRisk,
      aging: Math.floor(Math.random() * 60) + 1,
    });
  }

  return products;
};

export const demoProducts = generateDemoProducts();
