import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Package,
  AlertTriangle,
  Plus,
  Camera,
  Edit,
  TrendingUp,
  Clock,
  ArrowUpCircle,
  ArrowDownCircle,
} from "lucide-react";
import { useCamera } from "@/hooks/useCamera";
import { demoProducts } from "@/utils/demoData";
import { Product, ProductFormData } from "@/types/product";
import { useToast } from "@/components/ui/use-toast";
import { calculateRTORisk } from "@/utils/demoData";

const InventoryPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    sku: "",
    stock: 0,
    price: 0,
  });
  
  const { stream, startCamera, stopCamera } = useCamera();
  const { toast } = useToast();

  useEffect(() => {
    const storedProducts = localStorage.getItem('inventory');
    if (storedProducts) {
      setProducts(JSON.parse(storedProducts));
    } else {
      setProducts(demoProducts);
      localStorage.setItem('inventory', JSON.stringify(demoProducts));
    }
  }, []);

  const rtoAnalytics = {
    high: products.filter(p => p.rtoRisk === 'high').length,
    medium: products.filter(p => p.rtoRisk === 'medium').length,
    low: products.filter(p => p.rtoRisk === 'low').length,
  };

  const handleCameraToggle = async () => {
    if (showCamera) {
      stopCamera();
      setShowCamera(false);
    } else {
      await startCamera();
      setShowCamera(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const orderParams = {
      price: formData.price,
      addressLength: 100,
      orderTime: new Date(),
      previousOrders: Math.floor(Math.random() * 5),
      previousReturns: Math.floor(Math.random() * 2),
    };

    const prediction = calculateRTORisk(products, formData, orderParams);
    
    const newProduct: Product = {
      id: editingProduct?.id || products.length + 1,
      ...formData,
      lastRestocked: new Date().toISOString(),
      returnsCount: 0,
      deliverySuccessRate: prediction.deliverySuccessRate,
      rtoRisk: prediction.rtoRisk,
      aging: 0,
    };

    let updatedProducts: Product[];
    if (editingProduct) {
      updatedProducts = products.map(p => p.id === editingProduct.id ? newProduct : p);
      setProducts(updatedProducts);
      toast({
        title: "Product Updated",
        description: (
          <div className="space-y-2">
            <p>RTO Risk Level: {prediction.rtoRisk.toUpperCase()}</p>
            <p>Success Rate: {prediction.deliverySuccessRate.toFixed(1)}%</p>
            <div className="text-sm">
              {prediction.riskFactors.map((factor, i) => (
                <p key={i}>
                  {factor.factor}: {factor.impact > 0 ? "+" : ""}{factor.impact}%
                </p>
              ))}
            </div>
          </div>
        ),
      });
    } else {
      updatedProducts = [...products, newProduct];
      setProducts(updatedProducts);
      toast({
        title: "Product Added",
        description: (
          <div className="space-y-2">
            <p>RTO Risk Level: {prediction.rtoRisk.toUpperCase()}</p>
            <p>Success Rate: {prediction.deliverySuccessRate.toFixed(1)}%</p>
            <div className="text-sm">
              {prediction.riskFactors.map((factor, i) => (
                <p key={i}>
                  {factor.factor}: {factor.impact > 0 ? "+" : ""}{factor.impact}%
                </p>
              ))}
            </div>
          </div>
        ),
      });
    }

    localStorage.setItem('inventory', JSON.stringify(updatedProducts));

    setFormData({ name: "", sku: "", stock: 0, price: 0 });
    setEditingProduct(null);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      stock: product.stock,
      price: product.price,
    });
  };

  const getAgingStatus = (days: number) => {
    if (days <= 30) return { label: "Fresh", color: "text-green-500" };
    if (days <= 60) return { label: "Moderate", color: "text-yellow-500" };
    if (days <= 90) return { label: "Aging", color: "text-orange-500" };
    return { label: "Critical", color: "text-red-500" };
  };

  return (
    <div className="container pt-20 pb-8 animate-fadeIn">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">
          Inventory Prediction & Aging
        </h2>
        <p className="text-gray-600">
          Monitor stock levels and inventory aging analysis
        </p>
      </div>

      <Card className="p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">RTO Risk Distribution</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <ArrowUpCircle className="w-5 h-5 text-red-500" />
            <div>
              <p className="text-sm text-gray-600">High Risk</p>
              <p className="text-xl font-semibold">{rtoAnalytics.high}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            <div>
              <p className="text-sm text-gray-600">Medium Risk</p>
              <p className="text-xl font-semibold">{rtoAnalytics.medium}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <ArrowDownCircle className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-sm text-gray-600">Low Risk</p>
              <p className="text-xl font-semibold">{rtoAnalytics.low}</p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6 mb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              placeholder="Product Name"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              placeholder="SKU"
              value={formData.sku}
              onChange={e => setFormData({ ...formData, sku: e.target.value })}
              required
            />
            <Input
              type="number"
              placeholder="Stock"
              value={formData.stock}
              onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })}
              required
            />
            <Input
              type="number"
              placeholder="Price"
              value={formData.price}
              onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
              required
            />
          </div>
          <div className="flex justify-between items-center">
            <Button type="submit">
              {editingProduct ? "Update Product" : "Add Product"}
            </Button>
            <Button type="button" variant="outline" onClick={handleCameraToggle}>
              <Camera className="w-4 h-4 mr-2" />
              {showCamera ? "Stop Camera" : "Start Camera"}
            </Button>
          </div>
        </form>

        {showCamera && stream && (
          <div className="mt-4">
            <video
              autoPlay
              ref={video => {
                if (video) {
                  video.srcObject = stream;
                }
              }}
              className="w-full max-w-md mx-auto rounded-lg border"
            />
          </div>
        )}
      </Card>

      <div className="grid gap-6">
        {products.map((product) => (
          <Card key={product.id} className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-4">
                <Package className="w-8 h-8 text-gray-400" />
                <div>
                  <h3 className="text-lg font-medium">{product.name}</h3>
                  <p className="text-sm text-gray-500">
                    SKU: {product.sku} | Stock: {product.stock} units | Price: ₹{product.price}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between md:justify-end space-x-4">
                <Badge
                  variant="outline"
                  className={`${
                    product.rtoRisk === "high"
                      ? "border-destructive text-destructive"
                      : product.rtoRisk === "medium"
                      ? "border-orange-500 text-orange-500"
                      : "border-green-500 text-green-500"
                  }`}
                >
                  {product.rtoRisk.toUpperCase()} RTO Risk
                </Badge>
                <Button variant="ghost" size="icon" onClick={() => handleEdit(product)}>
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="mt-4 grid md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2 text-sm">
                <Clock className="w-4 h-4" />
                <span className={getAgingStatus(product.aging).color}>
                  {getAgingStatus(product.aging).label} ({product.aging} days)
                </span>
              </div>
              
              <div className="flex items-center space-x-2 text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>Success Rate: {product.deliverySuccessRate.toFixed(1)}%</span>
              </div>

              <div className="flex items-center space-x-2 text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>Returns: {product.returnsCount}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default InventoryPage;
