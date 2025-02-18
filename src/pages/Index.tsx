
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { demoProducts } from "@/utils/demoData";
import { Product } from "@/types/product";

const RTOPredictionPage = () => {
  const [products, setProducts] = useState<Product[]>(demoProducts);
  const [rtoTrends, setRtoTrends] = useState<any[]>([]);

  // Calculate RTO trends from products
  useEffect(() => {
    const calculateTrends = () => {
      const monthlyData: { [key: string]: { count: number; rtoCount: number } } = {};
      
      products.forEach(product => {
        const date = new Date(product.lastRestocked);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { count: 0, rtoCount: 0 };
        }
        
        monthlyData[monthKey].count++;
        // Calculate RTO count based on deliverySuccessRate
        const rtoCount = (100 - product.deliverySuccessRate) / 100;
        monthlyData[monthKey].rtoCount += rtoCount;
      });

      const trends = Object.entries(monthlyData)
        .map(([date, data]) => ({
          date,
          rto: Number((data.rtoCount / data.count * 100).toFixed(1)),
          products: data.count
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      setRtoTrends(trends);
    };

    calculateTrends();
  }, [products]);

  const parameters = [
    "Previous Order History",
    "Product Price Range",
    "Seasonal Patterns",
    "Category Performance",
    "Delivery Success Rate"
  ];

  // Listen for product updates from localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const updatedProducts = JSON.parse(localStorage.getItem('inventory') || '[]');
      if (updatedProducts.length > 0) {
        setProducts(updatedProducts);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <div className="container pt-20 pb-8 animate-fadeIn">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">RTO Prediction Model</h2>
        <p className="text-gray-600">
          Real-time RTO analysis and prediction based on inventory data
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">RTO Trend Analysis</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rtoTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => value.split('-')[1]}
                />
                <YAxis 
                  yAxisId="left"
                  tick={{ fontSize: 12 }}
                  label={{ value: 'RTO Rate (%)', angle: -90, position: 'insideLeft' }}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right"
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Products Count', angle: 90, position: 'insideRight' }}
                />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="rto"
                  stroke="#2563EB"
                  strokeWidth={2}
                  name="RTO Rate"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="products"
                  stroke="#10B981"
                  strokeWidth={2}
                  name="Products"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Model Parameters</h3>
          <div className="space-y-4">
            {parameters.map((param) => (
              <div
                key={param}
                className="flex items-center p-3 bg-gray-50 rounded-lg"
              >
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                <span>{param}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium mb-2">Current Statistics</h4>
            <div className="space-y-2 text-sm">
              <p>Total Products: {products.length}</p>
              <p>Average RTO Rate: {
                (products.reduce((acc, p) => acc + (100 - p.deliverySuccessRate), 0) / products.length).toFixed(1)
              }%</p>
              <p>Products Added This Month: {
                products.filter(p => {
                  const date = new Date(p.lastRestocked);
                  const now = new Date();
                  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                }).length
              }</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RTOPredictionPage;
