
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Scan, Camera } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useCamera } from "@/hooks/useCamera";

const ScannerPage = () => {
  const [barcode, setBarcode] = useState("");
  const [scanning, setScanning] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const { stream, startCamera, stopCamera } = useCamera();
  const { toast } = useToast();

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    setScanning(true);
    
    // Simulate scanning process
    setTimeout(() => {
      setScanning(false);
      toast({
        title: "Scan Complete",
        description: `Barcode ${barcode} has been processed`,
        duration: 3000,
      });
      setBarcode("");
    }, 1500);
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

  return (
    <div className="container pt-20 pb-8 animate-fadeIn">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Barcode Scanner</h2>
        <p className="text-gray-600">
          Scan products to update inventory and track discrepancies
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
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ScannerPage;
