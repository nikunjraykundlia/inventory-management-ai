
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  AlertTriangle,
  PackageCheck,
  BarChart3,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Package,
  ArrowUpCircle,
  ArrowDownCircle,
} from "lucide-react";
import { Product } from "@/types/product";
import { demoProducts } from "@/utils/demoData";

const PredictionPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [agingStats, setAgingStats] = useState({
    critical: 0,
    aging: 0,
    moderate: 0,
    fresh: 0,
  });
  const [restockRecommendations, setRestockRecommendations] = useState<Product[]>([]);

  useEffect(() => {
    const storedProducts = localStorage.getItem('inventory');
    const allProducts = storedProducts ? JSON.parse(storedProducts) : demoProducts;
    setProducts(allProducts);

    // Calculate aging statistics
    const stats = allProducts.reduce(
      (acc: any, product: Product) => {
        if (product.aging > 90) acc.critical++;
        else if (product.aging > 60) acc.aging++;
        else if (product.aging > 30) acc.moderate++;
        else acc.fresh++;
        return acc;
      },
      { critical: 0, aging: 0, moderate: 0, fresh: 0 }
    );
    setAgingStats(stats);

    // Generate restock recommendations
    const recommendations = allProducts
      .filter((p: Product) => p.stock < 20 || (p.deliverySuccessRate > 85 && p.stock < 50))
      .sort((a: Product, b: Product) => a.stock - b.stock)
      .slice(0, 5);
    setRestockRecommendations(recommendations);
  }, []);

  const getAgingColor = (days: number) => {
    if (days > 90) return "text-red-500";
    if (days > 60) return "text-orange-500";
    if (days > 30) return "text-yellow-500";
    return "text-green-500";
  };

  const getStockStatus = (stock: number, successRate: number) => {
    if (stock < 10) return { label: "Critical", color: "text-red-500" };
    if (stock < 20) return { label: "Low", color: "text-orange-500" };
    if (successRate > 85 && stock < 50) return { label: "Restock Soon", color: "text-yellow-500" };
    return { label: "Healthy", color: "text-green-500" };
  };

  const calculateRestockQuantity = (product: Product) => {
    const baseQuantity = 50;
    const successRateMultiplier = product.deliverySuccessRate / 100;
    const rtoRiskMultiplier = product.rtoRisk === 'high' ? 0.7 : product.rtoRisk === 'medium' ? 0.85 : 1;
    return Math.round(baseQuantity * successRateMultiplier * rtoRiskMultiplier);
  };

  return (
    <div className="container pt-20 pb-8 animate-fadeIn">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Inventory Prediction Models</h2>
        <p className="text-gray-600">
          Advanced analytics and predictions for inventory management
        </p>
      </div>

      {/* Aging Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <ArrowDownCircle className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-sm text-gray-600">Fresh Stock</p>
              <p className="text-xl font-semibold">{agingStats.fresh}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-yellow-500" />
            <div>
              <p className="text-sm text-gray-600">Moderate Aging</p>
              <p className="text-xl font-semibold">{agingStats.moderate}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            <div>
              <p className="text-sm text-gray-600">Aging Stock</p>
              <p className="text-xl font-semibold">{agingStats.aging}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <div>
              <p className="text-sm text-gray-600">Critical Aging</p>
              <p className="text-xl font-semibold">{agingStats.critical}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Restock Recommendations */}
      <Card className="p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">Restock Recommendations</h3>
        <div className="space-y-4">
          {restockRecommendations.map((product) => (
            <div key={product.id} className="flex items-center justify-between border-b pb-4">
              <div>
                <h4 className="font-medium">{product.name}</h4>
                <p className="text-sm text-gray-600">
                  SKU: {product.sku} | Current Stock: {product.stock}
                </p>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="mb-1">
                  Recommended Restock: {calculateRestockQuantity(product)} units
                </Badge>
                <p className={`text-sm ${getStockStatus(product.stock, product.deliverySuccessRate).color}`}>
                  {getStockStatus(product.stock, product.deliverySuccessRate).label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Product Aging Analysis */}
      <h3 className="text-lg font-semibold mb-4">Product Aging Analysis</h3>
      <div className="grid gap-6">
        {products.map((product) => (
          <Card key={product.id} className="p-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-4">
                <Package className="w-8 h-8 text-gray-400" />
                <div>
                  <h4 className="font-medium">{product.name}</h4>
                  <p className="text-sm text-gray-600">
                    SKU: {product.sku} | Stock: {product.stock} units
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between md:justify-end space-x-4">
                <div className="text-right">
                  <p className={`font-medium ${getAgingColor(product.aging)}`}>
                    {product.aging} days old
                  </p>
                  <p className="text-sm text-gray-600">
                    Success Rate: {product.deliverySuccessRate.toFixed(1)}%
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={`${
                    product.rtoRisk === "high"
                      ? "border-red-500 text-red-500"
                      : product.rtoRisk === "medium"
                      ? "border-yellow-500 text-yellow-500"
                      : "border-green-500 text-green-500"
                  }`}
                >
                  {product.rtoRisk.toUpperCase()} RTO
                </Badge>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PredictionPage;
