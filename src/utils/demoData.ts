
import { Product } from '../types/product';

const generateDemoProducts = (): Product[] => {
  const products: Product[] = [];
  const names = ['Shirt', 'Pants', 'Shoes', 'Watch', 'Bag'];
  const categories = ['Classic', 'Premium', 'Sport', 'Casual', 'Luxury'];

  // Generate seasonal patterns for RTO risk
  const seasonalPattern = (day: number): number => {
    return 75 + 15 * Math.sin(day * Math.PI / 180) + Math.random() * 5;
  };

  // Price-based patterns
  const getPriceBasedRisk = (price: number): number => {
    if (price < 1000) return 80 + Math.random() * 10;
    if (price > 5000) return 70 + Math.random() * 15;
    return 75 + Math.random() * 12;
  };

  for (let i = 1; i <= 200; i++) { // Increased to 200 products
    const name = `${categories[Math.floor(Math.random() * categories.length)]} ${
      names[Math.floor(Math.random() * names.length)]
    }`;
    
    const price = Math.floor(Math.random() * 10000) + 500;
    const dayOfYear = Math.floor(Math.random() * 365);
    
    const baseSuccessRate = seasonalPattern(dayOfYear);
    const priceAdjustedRate = getPriceBasedRisk(price);
    const deliverySuccessRate = (baseSuccessRate + priceAdjustedRate) / 2;
    
    const returnsCount = Math.floor((100 - deliverySuccessRate) * Math.random());
    const rtoRisk = deliverySuccessRate > 85 ? 'low' : deliverySuccessRate > 75 ? 'medium' : 'high';

    products.push({
      id: i,
      name,
      sku: `SKU${i.toString().padStart(5, '0')}`,
      stock: Math.floor(Math.random() * 200) + 50,
      price,
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

// Helper function to calculate RTO risk based on product attributes
export const calculateRTORisk = (products: Product[], newProduct: Partial<Product>): {
  rtoRisk: 'low' | 'medium' | 'high';
  deliverySuccessRate: number;
} => {
  // Find similar products by price range
  const similarProducts = products.filter(p => 
    Math.abs(p.price - (newProduct.price || 0)) < 1000
  );

  if (similarProducts.length === 0) {
    return {
      rtoRisk: 'medium',
      deliverySuccessRate: 80
    };
  }

  // Calculate weighted average based on price similarity
  const weightedRates = similarProducts.map(p => ({
    rate: p.deliverySuccessRate,
    weight: 1 / (Math.abs(p.price - (newProduct.price || 0)) + 1)
  }));

  const totalWeight = weightedRates.reduce((acc, curr) => acc + curr.weight, 0);
  const deliverySuccessRate = weightedRates.reduce(
    (acc, curr) => acc + (curr.rate * curr.weight), 
    0
  ) / totalWeight;

  return {
    deliverySuccessRate,
    rtoRisk: deliverySuccessRate > 85 ? 'low' : deliverySuccessRate > 75 ? 'medium' : 'high'
  };
};

export const demoProducts = generateDemoProducts();
