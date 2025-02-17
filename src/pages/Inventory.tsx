import { useState } from "react";
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
  X,
} from "lucide-react";
import { useCamera } from "@/hooks/useCamera";
import { demoProducts } from "@/utils/demoData";
import { Product, ProductFormData } from "@/types/product";
import { useToast } from "@/components/ui/use-toast";
import { calculateRTORisk } from "@/utils/demoData";

const InventoryPage = () => {
  const [products, setProducts] = useState<Product[]>(demoProducts);
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
    const prediction = calculateRTORisk(products, formData);
    
    const newProduct: Product = {
      id: editingProduct?.id || products.length + 1,
      ...formData,
      lastRestocked: new Date().toISOString(),
      returnsCount: 0,
      deliverySuccessRate: prediction.deliverySuccessRate,
      rtoRisk: prediction.rtoRisk,
      aging: 0,
    };

    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? newProduct : p));
      toast({
        title: "Product Updated",
        description: `${newProduct.name} has been updated with RTO risk: ${prediction.rtoRisk}`,
      });
    } else {
      setProducts([...products, newProduct]);
      toast({
        title: "Product Added",
        description: `${newProduct.name} has been added with RTO risk: ${prediction.rtoRisk}`,
      });
    }

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
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Package className="w-8 h-8 text-gray-400" />
                <div>
                  <h3 className="text-lg font-medium">{product.name}</h3>
                  <p className="text-sm text-gray-500">
                    SKU: {product.sku} | Stock: {product.stock} units | Price: ₹{product.price}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge
                  variant="outline"
                  className={`${
                    product.rtoRisk === "high"
                      ? "border-warning text-warning"
                      : product.rtoRisk === "medium"
                      ? "border-orange-500 text-orange-500"
                      : "border-success text-success"
                  }`}
                >
                  {product.rtoRisk.toUpperCase()} RTO Risk
                </Badge>
                <Button variant="ghost" size="icon" onClick={() => handleEdit(product)}>
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-gray-500">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Aging: {product.aging} days | Success Rate: {product.deliverySuccessRate.toFixed(1)}%
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default InventoryPage;
