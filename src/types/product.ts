
export interface Product {
  id: number;
  name: string;
  sku: string;
  stock: number;
  price: number;
  lastRestocked: string;
  returnsCount: number;
  deliverySuccessRate: number;
  rtoRisk: 'low' | 'medium' | 'high';
  aging: number; // in days
}

export interface ProductFormData {
  name: string;
  sku: string;
  stock: number;
  price: number;
}
