
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Scan, Camera, PackageCheck } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useCamera } from "@/hooks/useCamera";
import { Product } from "@/types/product";

const ScannerPage = () => {
  const [barcode, setBarcode] = useState("");
  const [scanning, setScanning] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const { stream, startCamera, stopCamera } = useCamera();
  const { toast } = useToast();

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setScanning(true);
    
    try {
      // Simulate API call to verify barcode against inventory
      const response = await fetch(`/api/inventory/verify/${barcode}`);
      const data = await response.json();
      
      setScannedProduct(data.product);
      toast({
        title: "Product Scanned",
        description: `${data.product?.name || 'Unknown product'} (SKU: ${barcode})`,
        duration: 3000,
      });

      // Update inventory count
      if (data.product) {
        await fetch('/api/inventory/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sku: barcode,
            action: 'scan',
          }),
        });
      }
    } catch (error) {
      toast({
        title: "Scan Error",
        description: "Failed to verify product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setScanning(false);
      setBarcode("");
    }
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

  // Simulated barcode detection from camera feed
  useEffect(() => {
    if (showCamera && stream) {
      const checkBarcode = setInterval(() => {
        // In a real implementation, this would use a barcode detection library
        // For now, we'll just simulate random successful scans
        if (Math.random() < 0.1) { // 10% chance of "detecting" a barcode
          const mockBarcode = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
          setBarcode(mockBarcode);
          handleScan(new Event('submit') as any);
        }
      }, 1000);

      return () => clearInterval(checkBarcode);
    }
  }, [showCamera, stream]);

  return (
    <div className="container pt-20 pb-8 animate-fadeIn">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Inventory Scanner</h2>
        <p className="text-gray-600">
          Scan products to verify inventory and reduce RTO discrepancies
        </p>
      </div>

      <Card className="p-6 max-w-md mx-auto">
        <form onSubmit={handleScan}>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Input
                type="text"
                placeholder="Enter or scan barcode"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={scanning || !barcode}>
                <Scan className="w-4 h-4 mr-2" />
                {scanning ? "Scanning..." : "Scan"}
              </Button>
            </div>

            <div className="flex justify-center">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCameraToggle}
                className="w-full"
              >
                <Camera className="w-4 h-4 mr-2" />
                {showCamera ? "Stop Camera" : "Start Camera"}
              </Button>
            </div>

            {showCamera && stream ? (
              <div className="border-2 border-dashed rounded-lg overflow-hidden">
                <video
                  autoPlay
                  ref={video => {
                    if (video) {
                      video.srcObject = stream;
                    }
                  }}
                  className="w-full h-[300px] object-cover"
                />
              </div>
            ) : (
              <div className="text-center p-8 border-2 border-dashed rounded-lg">
                {scanning ? (
                  <div className="animate-pulse">
                    <Scan className="w-12 h-12 mx-auto text-blue-500 mb-2" />
                    <p>Scanning...</p>
                  </div>
                ) : (
                  <div>
                    <Scan className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">
                      Ready to scan barcodes
                    </p>
                  </div>
                )}
              </div>
            )}

            {scannedProduct && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <PackageCheck className="w-5 h-5 text-green-500 mr-2" />
                  <div>
                    <h4 className="font-medium">{scannedProduct.name}</h4>
                    <p className="text-sm text-gray-600">
                      SKU: {scannedProduct.sku} | Stock: {scannedProduct.stock}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ScannerPage;
