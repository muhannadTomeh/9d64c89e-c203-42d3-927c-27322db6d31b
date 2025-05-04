
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMillContext } from '@/context/MillContext';
import { toast } from 'sonner';

const Settings: React.FC = () => {
  const { settings, updateSettings } = useMillContext();
  
  const [oilReturnPercentage, setOilReturnPercentage] = useState(settings.oilReturnPercentage);
  const [oilBuyPrice, setOilBuyPrice] = useState(settings.oilBuyPrice);
  const [oilSellPrice, setOilSellPrice] = useState(settings.oilSellPrice);
  const [cashReturnPrice, setCashReturnPrice] = useState(settings.cashReturnPrice);
  const [plasticTankPrice, setPlasticTankPrice] = useState(settings.tankPrices.plastic);
  const [metalTankPrice, setMetalTankPrice] = useState(settings.tankPrices.metal);
  
  const handleSaveSettings = () => {
    // Validate inputs
    if (
      oilReturnPercentage <= 0 ||
      oilBuyPrice <= 0 ||
      oilSellPrice <= 0 ||
      cashReturnPrice <= 0 ||
      plasticTankPrice <= 0 ||
      metalTankPrice <= 0
    ) {
      toast.error('جميع القيم يجب أن تكون موجبة');
      return;
    }
    
    updateSettings({
      oilReturnPercentage,
      oilBuyPrice,
      oilSellPrice,
      cashReturnPrice,
      tankPrices: {
        plastic: plasticTankPrice,
        metal: metalTankPrice,
      },
    });
    
    toast.success('تم حفظ الإعدادات بنجاح');
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">إعدادات النظام</h2>
      
      <Card>
        <CardHeader className="bg-primary text-white font-bold pb-2">
          <h3 className="text-lg">إعدادات الحساب</h3>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="oilReturnPercentage">نسبة الرد بالزيت (%)</Label>
              <Input
                id="oilReturnPercentage"
                type="number"
                step="0.1"
                min="0"
                value={oilReturnPercentage}
                onChange={(e) => setOilReturnPercentage(Number(e.target.value))}
              />
              <p className="text-sm text-gray-500">النسبة المئوية للرد بالزيت (مثال: 6%)</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cashReturnPrice">سعر الرد النقدي (شيكل/كغم)</Label>
              <Input
                id="cashReturnPrice"
                type="number"
                step="0.1"
                min="0"
                value={cashReturnPrice}
                onChange={(e) => setCashReturnPrice(Number(e.target.value))}
              />
              <p className="text-sm text-gray-500">سعر الرد النقدي لكل كيلوغرام من الزيت</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="oilBuyPrice">سعر شراء الزيت (شيكل/كغم)</Label>
              <Input
                id="oilBuyPrice"
                type="number"
                step="0.1"
                min="0"
                value={oilBuyPrice}
                onChange={(e) => setOilBuyPrice(Number(e.target.value))}
              />
              <p className="text-sm text-gray-500">السعر الذي تشتري به الزيت من الزبائن</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="oilSellPrice">سعر بيع الزيت (شيكل/كغم)</Label>
              <Input
                id="oilSellPrice"
                type="number"
                step="0.1"
                min="0"
                value={oilSellPrice}
                onChange={(e) => setOilSellPrice(Number(e.target.value))}
              />
              <p className="text-sm text-gray-500">السعر الذي تبيع به الزيت للزبائن</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="plasticTankPrice">سعر التنكة البلاستيك (شيكل)</Label>
              <Input
                id="plasticTankPrice"
                type="number"
                step="0.1"
                min="0"
                value={plasticTankPrice}
                onChange={(e) => setPlasticTankPrice(Number(e.target.value))}
              />
              <p className="text-sm text-gray-500">سعر التنكة البلاستيك الواحدة</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="metalTankPrice">سعر التنكة الحديد (شيكل)</Label>
              <Input
                id="metalTankPrice"
                type="number"
                step="0.1"
                min="0"
                value={metalTankPrice}
                onChange={(e) => setMetalTankPrice(Number(e.target.value))}
              />
              <p className="text-sm text-gray-500">سعر التنكة الحديد الواحدة</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-gray-50 p-4">
          <Button onClick={handleSaveSettings} className="w-full md:w-auto">
            حفظ الإعدادات
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Settings;
