
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
  BarChart,
  Bar,
} from "recharts";
import { demoProducts } from "@/utils/demoData";
import { Product } from "@/types/product";

const RTOPredictionPage = () => {
  const [products, setProducts] = useState<Product[]>(demoProducts);
  const [rtoTrends, setRtoTrends] = useState<any[]>([]);
  const [agingAnalysis, setAgingAnalysis] = useState<any[]>([]);

  // Calculate RTO trends and aging analysis from products
  useEffect(() => {
    const calculateAnalytics = () => {
      // Monthly RTO Trends
      const monthlyData: { [key: string]: { count: number; rtoCount: number } } = {};
      
      products.forEach(product => {
        const date = new Date(product.lastRestocked);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { count: 0, rtoCount: 0 };
        }
        
        monthlyData[monthKey].count++;
        const rtoCount = (100 - product.deliverySuccessRate) / 100;
        monthlyData[monthKey].rtoCount += rtoCount;
      });

      // Calculate aging analysis
      const agingGroups = {
        '0-30': 0,
        '31-60': 0,
        '61-90': 0,
        '90+': 0
      };

      products.forEach(product => {
        if (product.aging <= 30) agingGroups['0-30']++;
        else if (product.aging <= 60) agingGroups['31-60']++;
        else if (product.aging <= 90) agingGroups['61-90']++;
        else agingGroups['90+']++;
      });

      setAgingAnalysis(Object.entries(agingGroups).map(([range, count]) => ({
        range,
        count
      })));

      const trends = Object.entries(monthlyData)
        .map(([date, data]) => ({
          date,
          rto: Number((data.rtoCount / data.count * 100).toFixed(1)),
          products: data.count
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      setRtoTrends(trends);
    };

    calculateAnalytics();
  }, [products]);

  const predictiveParameters = [
    {
      name: "Previous Order History",
      description: "Analysis of customer's past order behavior"
    },
    {
      name: "Delivery Location",
      description: "Pincode-based delivery success patterns"
    },
    {
      name: "Order Value",
      description: "Correlation between order value and RTO probability"
    },
    {
      name: "Order Timing",
      description: "Time and day of order placement"
    },
    {
      name: "Address Quality",
      description: "Completeness and accuracy of delivery address"
    },
    {
      name: "Address Length",
      description: "Character count and detail level of address"
    }
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
          Advanced RTO prediction based on multiple parameters and historical data analysis
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
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
          <h3 className="text-lg font-medium mb-4">Inventory Aging Analysis</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agingAnalysis}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis label={{ value: 'Number of Products', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Bar dataKey="count" fill="#2563EB" name="Products" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <h3 className="text-lg font-medium mb-4">Predictive Parameters</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {predictiveParameters.map((param) => (
              <div
                key={param.name}
                className="p-4 bg-gray-50 rounded-lg space-y-2"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <h4 className="font-medium">{param.name}</h4>
                </div>
                <p className="text-sm text-gray-600 pl-4">{param.description}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium mb-2">Current Statistics</h4>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm text-gray-600">Total Products</p>
                <p className="text-xl font-semibold">{products.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Average RTO Rate</p>
                <p className="text-xl font-semibold">
                  {(products.reduce((acc, p) => acc + (100 - p.deliverySuccessRate), 0) / products.length).toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Products Added This Month</p>
                <p className="text-xl font-semibold">
                  {products.filter(p => {
                    const date = new Date(p.lastRestocked);
                    const now = new Date();
                    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RTOPredictionPage;
