
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Package, AlertTriangle } from "lucide-react";

const InventoryPage = () => {
  const inventoryItems = [
    {
      id: 1,
      name: "Product A",
      stock: 150,
      prediction: "Restock needed",
      aging: "30 days",
      status: "warning",
    },
    {
      id: 2,
      name: "Product B",
      stock: 300,
      prediction: "Sufficient stock",
      aging: "15 days",
      status: "success",
    },
    // Add more items as needed
  ];

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

      <div className="grid gap-6">
        {inventoryItems.map((item) => (
          <Card key={item.id} className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Package className="w-8 h-8 text-gray-400" />
                <div>
                  <h3 className="text-lg font-medium">{item.name}</h3>
                  <p className="text-sm text-gray-500">
                    Current Stock: {item.stock} units
                  </p>
                </div>
              </div>
              <Badge
                variant="outline"
                className={`${
                  item.status === "warning"
                    ? "border-warning text-warning"
                    : "border-success text-success"
                }`}
              >
                {item.prediction}
              </Badge>
            </div>
            <div className="mt-4 flex items-center text-sm text-gray-500">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Aging: {item.aging}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default InventoryPage;
