
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
} from "recharts";

const RTOPredictionPage = () => {
  const [data] = useState([
    { date: "2024-01", rto: 35 },
    { date: "2024-02", rto: 42 },
    { date: "2024-03", rto: 28 },
    { date: "2024-04", rto: 38 },
  ]);

  const parameters = [
    "Previous Order History",
    "Pincode",
    "Order Value",
    "Time of Order",
    "Address Quality",
  ];

  return (
    <div className="container pt-20 pb-8 animate-fadeIn">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">RTO Prediction Model</h2>
        <p className="text-gray-600">
          Predicting return chances based on customer parameters
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">RTO Trend Analysis</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="rto"
                  stroke="#2563EB"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Prediction Parameters</h3>
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
        </Card>
      </div>
    </div>
  );
};

export default RTOPredictionPage;
