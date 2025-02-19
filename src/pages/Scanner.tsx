
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Scan, Camera, PackageCheck, Upload } from "lucide-react";
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
      // Get products from localStorage
      const storedProducts = JSON.parse(localStorage.getItem('inventory') || '[]');
      const product = storedProducts.find((p: Product) => p.sku === barcode);
      
      if (product) {
        setScannedProduct(product);
        toast({
          title: "Product Found",
          description: `${product.name} (SKU: ${barcode})`,
          duration: 3000,
        });
      } else {
        toast({
          title: "Product Not Found",
          description: "This barcode is not registered in the inventory.",
          variant: "destructive",
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if the file is an image
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please upload an image file containing a barcode.",
        variant: "destructive",
      });
      return;
    }

    setScanning(true);
    try {
      // In a real implementation, this would use a barcode detection library
      // For demo purposes, we'll simulate reading the barcode from the uploaded image
      const storedProducts = JSON.parse(localStorage.getItem('inventory') || '[]');
      const randomProduct = storedProducts[Math.floor(Math.random() * storedProducts.length)];
      
      if (randomProduct) {
        setBarcode(randomProduct.sku);
        handleScan(new Event('submit') as any);
      } else {
        toast({
          title: "No Products Found",
          description: "No products are registered in the inventory.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Upload Error",
        description: "Failed to process the barcode image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setScanning(false);
    }
  };

  // Simulated barcode detection from camera feed
  useEffect(() => {
    if (showCamera && stream) {
      const checkBarcode = setInterval(() => {
        // Get products from localStorage for simulation
        const storedProducts = JSON.parse(localStorage.getItem('inventory') || '[]');
        
        if (storedProducts.length > 0 && Math.random() < 0.1) { // 10% chance of "detecting" a barcode
          // Randomly select a product from inventory for simulation
          const randomProduct = storedProducts[Math.floor(Math.random() * storedProducts.length)];
          setBarcode(randomProduct.sku);
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

            <div className="flex justify-between space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCameraToggle}
                className="flex-1"
              >
                <Camera className="w-4 h-4 mr-2" />
                {showCamera ? "Stop Camera" : "Start Camera"}
              </Button>

              <div className="relative flex-1">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="barcode-upload"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => document.getElementById('barcode-upload')?.click()}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Barcode
                </Button>
              </div>
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
