import { Product } from '../types/product';

const generateDemoProducts = (): Product[] => {
  const products: Product[] = [];
  const names = ['Shirt', 'Pants', 'Shoes', 'Watch', 'Bag'];
  const categories = ['Classic', 'Premium', 'Sport', 'Casual', 'Luxury'];

  const seasonalPattern = (day: number): number => {
    return 75 + 15 * Math.sin(day * Math.PI / 180) + Math.random() * 5;
  };

  const getPriceBasedRisk = (price: number): number => {
    if (price < 1000) return 80 + Math.random() * 10;
    if (price > 5000) return 70 + Math.random() * 15;
    return 75 + Math.random() * 12;
  };

  for (let i = 1; i <= 200; i++) {
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

interface OrderParameters {
  price: number;
  addressLength?: number;
  pincode?: string;
  orderTime?: Date;
  previousOrders?: number;
  previousReturns?: number;
}

export const calculateRTORisk = (products: Product[], newProduct: Partial<Product>, orderParams?: OrderParameters): {
  rtoRisk: 'low' | 'medium' | 'high';
  deliverySuccessRate: number;
  riskFactors: { factor: string; impact: number }[];
} => {
  const similarProducts = products.filter(p => 
    Math.abs(p.price - (newProduct.price || 0)) < 1000
  );

  let baseSuccessRate = similarProducts.length > 0 
    ? similarProducts.reduce((acc, p) => acc + p.deliverySuccessRate, 0) / similarProducts.length
    : 85;

  const riskFactors: { factor: string; impact: number }[] = [];

  if (orderParams) {
    const priceImpact = orderParams.price > 5000 ? -5 : orderParams.price > 2000 ? -2 : 0;
    riskFactors.push({ factor: "Price Range", impact: priceImpact });
    baseSuccessRate += priceImpact;

    if (orderParams.addressLength) {
      const addressImpact = orderParams.addressLength < 50 ? -5 : 
                          orderParams.addressLength > 150 ? -3 : 2;
      riskFactors.push({ factor: "Address Quality", impact: addressImpact });
      baseSuccessRate += addressImpact;
    }

    if (orderParams.previousOrders !== undefined) {
      const orderHistoryImpact = orderParams.previousOrders === 0 ? -3 :
                                orderParams.previousOrders > 5 ? 5 : 2;
      riskFactors.push({ factor: "Order History", impact: orderHistoryImpact });
      baseSuccessRate += orderHistoryImpact;
    }

    if (orderParams.previousReturns !== undefined) {
      const returnsImpact = orderParams.previousReturns > 2 ? -8 :
                           orderParams.previousReturns > 0 ? -4 : 2;
      riskFactors.push({ factor: "Returns History", impact: returnsImpact });
      baseSuccessRate += returnsImpact;
    }

    if (orderParams.orderTime) {
      const hour = orderParams.orderTime.getHours();
      const timeImpact = (hour >= 10 && hour <= 18) ? 2 : -2;
      riskFactors.push({ factor: "Order Timing", impact: timeImpact });
      baseSuccessRate += timeImpact;
    }
  }

  baseSuccessRate = Math.min(Math.max(baseSuccessRate, 50), 98);

  const rtoRisk = baseSuccessRate > 85 ? 'low' : baseSuccessRate > 75 ? 'medium' : 'high';

  return {
    rtoRisk,
    deliverySuccessRate: baseSuccessRate,
    riskFactors
  };
};

export const demoProducts = generateDemoProducts();
