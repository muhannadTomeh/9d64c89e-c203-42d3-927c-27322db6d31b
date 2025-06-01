import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useSupabaseMillContext } from '@/context/SupabaseMillContext';
import { Customer, PaymentMethod, TankType } from '@/types';
import { calculateInvoice } from '@/utils/calculations';
import { toast } from 'sonner';

const InvoiceCalculator: React.FC = () => {
  const { customers, invoices, addInvoice, settings, removeCustomerFromQueue } = useSupabaseMillContext();
  const queuedCustomers = customers.filter(c => c.status === 'pending');
  
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [oilAmount, setOilAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('oil');
  const [plasticTanks, setPlasticTanks] = useState(0);
  const [metalTanks, setMetalTanks] = useState(0);
  const [notes, setNotes] = useState('');
  const [calculationResult, setCalculationResult] = useState<ReturnType<typeof calculateInvoice> | null>(null);
  
  const selectedCustomer = queuedCustomers.find(c => c.id === selectedCustomerId);
  
  useEffect(() => {
    // Reset calculation result when inputs change
    setCalculationResult(null);
  }, [oilAmount, paymentMethod, plasticTanks, metalTanks, selectedCustomerId]);
  
  const handleCalculate = () => {
    if (!selectedCustomerId) {
      toast.error('الرجاء اختيار زبون من القائمة');
      return;
    }
    
    if (oilAmount <= 0) {
      toast.error('الرجاء إدخال كمية زيت صحيحة');
      return;
    }
    
    const tanks: TankType[] = [];
    if (plasticTanks > 0) {
      tanks.push({ type: 'plastic', count: plasticTanks });
    }
    if (metalTanks > 0) {
      tanks.push({ type: 'metal', count: metalTanks });
    }
    
    const result = calculateInvoice(oilAmount, tanks, paymentMethod, settings);
    setCalculationResult(result);
  };
  
  const handleCreateInvoice = () => {
    if (!selectedCustomer || !calculationResult) return;
    
    const tanks: TankType[] = [];
    if (plasticTanks > 0) {
      tanks.push({ type: 'plastic', count: plasticTanks });
    }
    if (metalTanks > 0) {
      tanks.push({ type: 'metal', count: metalTanks });
    }
    
    // Create invoice
    addInvoice({
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      customerPhone: selectedCustomer.phoneNumber,
      oilAmount,
      paymentMethod,
      tanks,
      returnAmount: calculationResult.returnAmount,
      tanksPayment: calculationResult.tanksPayment,
      total: calculationResult.total,
      notes: notes.trim() !== '' ? notes : undefined,
    });
    
    // Remove customer from queue
    removeCustomerFromQueue(selectedCustomer.id);
    
    // Reset form
    setSelectedCustomerId('');
    setOilAmount(0);
    setPaymentMethod('oil');
    setPlasticTanks(0);
    setMetalTanks(0);
    setNotes('');
    setCalculationResult(null);
    
    toast.success('تم إصدار الفاتورة بنجاح');
  };
  
  const renderPaymentMethodDetails = () => {
    if (!calculationResult) return null;
    
    switch (paymentMethod) {
      case 'oil':
        return (
          <>
            <div className="flex justify-between border-b py-2">
              <span className="font-semibold">الرد (زيت):</span>
              <span>{calculationResult.returnAmount.oil.toFixed(2)} كغم</span>
            </div>
            <div className="flex justify-between border-b py-2">
              <span className="font-semibold">ثمن التنكات (زيت):</span>
              <span>{calculationResult.tanksPayment.oil.toFixed(2)} كغم</span>
            </div>
            <div className="flex justify-between py-2 font-bold text-lg">
              <span>الإجمالي:</span>
              <span>{calculationResult.total.oil.toFixed(2)} كغم زيت</span>
            </div>
          </>
        );
        
      case 'cash':
        return (
          <>
            <div className="flex justify-between border-b py-2">
              <span className="font-semibold">الرد (نقداً):</span>
              <span>{calculationResult.returnAmount.cash.toFixed(2)} شيكل</span>
            </div>
            <div className="flex justify-between border-b py-2">
              <span className="font-semibold">ثمن التنكات:</span>
              <span>{calculationResult.tanksPayment.cash.toFixed(2)} شيكل</span>
            </div>
            <div className="flex justify-between py-2 font-bold text-lg">
              <span>الإجمالي:</span>
              <span>{calculationResult.total.cash.toFixed(2)} شيكل</span>
            </div>
          </>
        );
        
      case 'mixed':
        return (
          <>
            <div className="flex justify-between border-b py-2">
              <span className="font-semibold">الرد (زيت):</span>
              <span>{calculationResult.returnAmount.oil.toFixed(2)} كغم</span>
            </div>
            <div className="flex justify-between border-b py-2">
              <span className="font-semibold">ثمن التنكات (نقداً):</span>
              <span>{calculationResult.tanksPayment.cash.toFixed(2)} شيكل</span>
            </div>
            <div className="flex justify-between py-2 font-bold text-lg">
              <span>الإجمالي:</span>
              <span>
                {calculationResult.total.oil.toFixed(2)} كغم زيت + {' '}
                {calculationResult.total.cash.toFixed(2)} شيكل
              </span>
            </div>
          </>
        );
    }
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">حساب الفاتورة</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Invoice Form */}
        <Card>
          <CardHeader className="bg-primary text-white font-bold pb-2">
            <h3 className="text-lg">معلومات الفاتورة</h3>
          </CardHeader>
          <CardContent className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customer">اختر الزبون</Label>
              <Select
                value={selectedCustomerId}
                onValueChange={setSelectedCustomerId}
              >
                <SelectTrigger id="customer">
                  <SelectValue placeholder="اختر زبون من الطابور" />
                </SelectTrigger>
                <SelectContent>
                  {queuedCustomers.length === 0 ? (
                    <SelectItem value="empty" disabled>
                      لا يوجد زبائن في الطابور
                    </SelectItem>
                  ) : (
                    queuedCustomers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name} ({customer.bagsCount} شوال)
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="oilAmount">كمية الزيت المنتجة (كغم)</Label>
              <Input
                id="oilAmount"
                type="number"
                step="0.1"
                min="0"
                value={oilAmount || ''}
                onChange={(e) => setOilAmount(Number(e.target.value))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">طريقة الدفع</Label>
              <Select
                value={paymentMethod}
                onValueChange={(value: PaymentMethod) => setPaymentMethod(value)}
              >
                <SelectTrigger id="paymentMethod">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="oil">دفع بالزيت</SelectItem>
                  <SelectItem value="cash">دفع نقداً</SelectItem>
                  <SelectItem value="mixed">دفع مختلط (زيت + نقد)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="plasticTanks">عدد التنكات البلاستيك</Label>
                <Input
                  id="plasticTanks"
                  type="number"
                  min="0"
                  value={plasticTanks || ''}
                  onChange={(e) => setPlasticTanks(Number(e.target.value))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="metalTanks">عدد التنكات الحديد</Label>
                <Input
                  id="metalTanks"
                  type="number"
                  min="0"
                  value={metalTanks || ''}
                  onChange={(e) => setMetalTanks(Number(e.target.value))}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">ملاحظات (اختياري)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="أدخل أي ملاحظات إضافية"
                rows={2}
              />
            </div>
            
            <Button
              onClick={handleCalculate}
              className="w-full bg-olive-600 hover:bg-olive-700"
            >
              حساب الفاتورة
            </Button>
          </CardContent>
        </Card>
        
        {/* Invoice Preview */}
        <Card>
          <CardHeader className="bg-sand-600 text-white font-bold pb-2">
            <h3 className="text-lg">معاينة الفاتورة</h3>
          </CardHeader>
          <CardContent className="py-4">
            {!selectedCustomer ? (
              <div className="text-center py-8 text-gray-500">
                <p>يرجى اختيار زبون لعرض معاينة الفاتورة</p>
              </div>
            ) : !calculationResult ? (
              <div className="text-center py-8 text-gray-500">
                <p>أدخل المعلومات واضغط على "حساب الفاتورة" لمعاينة النتيجة</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-gray-100 p-4 rounded-md">
                  <div className="text-center mb-4">
                    <h4 className="font-bold text-xl">فاتورة معصرة الزيتون</h4>
                    <p className="text-sm text-gray-500">
                      {new Date().toLocaleDateString('ar-EG')}
                    </p>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="font-semibold">اسم الزبون:</span>
                      <span>{selectedCustomer.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">طريقة الدفع:</span>
                      <span>
                        {paymentMethod === 'oil' && 'دفع بالزيت'}
                        {paymentMethod === 'cash' && 'دفع نقداً'}
                        {paymentMethod === 'mixed' && 'دفع مختلط (زيت + نقد)'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">إجمالي الزيت المنتج:</span>
                      <span>{oilAmount} كغم</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="font-semibold">عدد التنكات:</span>
                      <span>
                        {plasticTanks > 0 && `${plasticTanks} بلاستيك`}
                        {plasticTanks > 0 && metalTanks > 0 && ' + '}
                        {metalTanks > 0 && `${metalTanks} حديد`}
                        {plasticTanks === 0 && metalTanks === 0 && 'لا يوجد'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-300 pt-4">
                    {renderPaymentMethodDetails()}
                  </div>
                  
                  {notes && (
                    <div className="mt-4 border-t pt-2 text-sm">
                      <span className="font-semibold">ملاحظات:</span> {notes}
                    </div>
                  )}
                </div>
                
                <Button
                  onClick={handleCreateInvoice}
                  className="w-full"
                >
                  إصدار الفاتورة
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InvoiceCalculator;
