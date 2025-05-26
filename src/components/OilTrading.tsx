import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMillContext } from '@/context/MillContext';
import { TradeType } from '@/types';
import { toast } from 'sonner';
const OilTrading: React.FC = () => {
  const {
    oilTrades,
    addOilTrade,
    getStatistics
  } = useMillContext();
  const [tradeType, setTradeType] = useState<TradeType>('sell');
  const [amount, setAmount] = useState(0);
  const [price, setPrice] = useState(0);
  const [personName, setPersonName] = useState('');
  const [notes, setNotes] = useState('');
  const stats = getStatistics();
  const currentOilStock = stats.currentOilStock;
  const handleAddTrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      toast.error('الرجاء إدخال كمية صحيحة');
      return;
    }
    if (price <= 0) {
      toast.error('الرجاء إدخال سعر صحيح');
      return;
    }

    // Check if we have enough stock for selling
    if (tradeType === 'sell' && amount > currentOilStock) {
      toast.error(`لا يوجد كمية كافية في المخزون. المتوفر: ${currentOilStock.toFixed(2)} كغم`);
      return;
    }
    addOilTrade({
      type: tradeType,
      amount,
      price,
      personName: personName.trim() !== '' ? personName : undefined,
      notes: notes.trim() !== '' ? notes : undefined
    });

    // Reset form
    setAmount(0);
    setPrice(0);
    setPersonName('');
    setNotes('');
    toast.success(`تم تسجيل عملية ${tradeType === 'buy' ? 'شراء' : 'بيع'} بنجاح`);
  };
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Sort trades by date (newest first)
  const sortedTrades = [...oilTrades].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Filter trades by type
  const sellTrades = sortedTrades.filter(trade => trade.type === 'sell');
  const buyTrades = sortedTrades.filter(trade => trade.type === 'buy');
  return <div className="space-y-6">
      <h2 className="text-2xl font-bold">بيع وشراء الزيت</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="bg-green-600 text-white">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-bold mb-2">المخزون الحالي من الزيت</h3>
            <p className="text-3xl font-bold">{currentOilStock.toFixed(2)} كغم</p>
          </CardContent>
        </Card>
        
        <Card className="bg-blue-600 text-white">
          <CardContent className="p-6 text-center bg-green-900">
            <h3 className="text-lg font-bold mb-2">الكاش الحالي</h3>
            <p className="text-3xl font-bold">{stats.currentCash.toFixed(2)} شيكل</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Add Trade Form */}
        <Card className="md:col-span-1">
          <CardHeader className="bg-primary text-white font-bold pb-2">
            <h3 className="text-lg">تسجيل عملية جديدة</h3>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleAddTrade} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tradeType">نوع العملية</Label>
                <Select value={tradeType} onValueChange={(value: TradeType) => setTradeType(value)}>
                  <SelectTrigger id="tradeType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sell">بيع زيت</SelectItem>
                    <SelectItem value="buy">شراء زيت</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="amount">الكمية (كغم)</Label>
                <Input id="amount" type="number" min="0.1" step="0.1" value={amount || ''} onChange={e => setAmount(Number(e.target.value))} placeholder="أدخل الكمية" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="price">السعر (شيكل/كغم)</Label>
                <Input id="price" type="number" min="0.1" step="0.1" value={price || ''} onChange={e => setPrice(Number(e.target.value))} placeholder="أدخل السعر" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="total">الإجمالي</Label>
                <Input id="total" type="number" value={(amount * price).toFixed(2)} readOnly className="bg-gray-100" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="personName">
                  {tradeType === 'buy' ? 'اسم المورد (اختياري)' : 'اسم المشتري (اختياري)'}
                </Label>
                <Input id="personName" value={personName} onChange={e => setPersonName(e.target.value)} placeholder="أدخل الاسم" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">ملاحظات (اختياري)</Label>
                <Textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="أدخل أي ملاحظات إضافية" rows={3} />
              </div>
              
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                {tradeType === 'buy' ? 'تسجيل عملية شراء' : 'تسجيل عملية بيع'}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        {/* Trades List */}
        <Card className="md:col-span-2">
          <CardHeader className="bg-green-600 text-white font-bold pb-2">
            <h3 className="text-lg">سجل العمليات</h3>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs defaultValue="all">
              <TabsList className="grid w-full grid-cols-3  ">
                <TabsTrigger value="all">الكل</TabsTrigger>
                <TabsTrigger value="sell">عمليات البيع</TabsTrigger>
                <TabsTrigger value="buy">عمليات الشراء</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="p-4">
                {sortedTrades.length === 0 ? <div className="text-center py-8 text-gray-500">
                    <p>لا يوجد عمليات مسجلة</p>
                  </div> : <div className="space-y-4 max-h-[400px] overflow-y-auto">
                    {sortedTrades.map(trade => <Card key={trade.id} className={`border ${trade.type === 'sell' ? 'border-green-200' : 'border-blue-200'}`}>
                        <CardContent className="p-4  text-right\n">
                          <div className=" flex flex-row-reverse\n">
                            <h4 className={`font-bold text-lg ${trade.type === 'sell' ? 'text-green-600' : 'text-blue-600'}`}>
                              {trade.type === 'sell' ? 'بيع' : 'شراء'} زيت
                            </h4>
                            <span className="text-sm text-gray-500">
                              {formatDate(trade.date)}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="font-semibold">الكمية:</span> {trade.amount} كغم
                            </div>
                            <div>
                              <span className="font-semibold">السعر:</span> {trade.price} شيكل/كغم
                            </div>
                            <div className="col-span-2">
                              <span className="font-semibold">الإجمالي:</span> {trade.total.toFixed(2)} شيكل
                            </div>
                            {trade.personName && <div className="col-span-2">
                                <span className="font-semibold">
                                  {trade.type === 'sell' ? 'المشتري:' : 'المورد:'}
                                </span> {trade.personName}
                              </div>}
                          </div>
                          {trade.notes && <div className="mt-2 text-sm bg-gray-50 p-2 rounded">
                              <span className="font-semibold">ملاحظات:</span> {trade.notes}
                            </div>}
                        </CardContent>
                      </Card>)}
                  </div>}
              </TabsContent>
              
              <TabsContent value="sell" className="p-4">
                {sellTrades.length === 0 ? <div className="text-center py-8 text-gray-500">
                    <p>لا يوجد عمليات بيع مسجلة</p>
                  </div> : <div className="space-y-4 max-h-[400px] overflow-y-auto">
                    {sellTrades.map(trade => <Card key={trade.id} className="border border-green-200">
                        <CardContent className="p-4 text-right">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-bold text-lg text-green-600">
                              بيع زيت
                            </h4>
                            <span className="text-sm text-gray-500">
                              {formatDate(trade.date)}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="font-semibold">الكمية:</span> {trade.amount} كغم
                            </div>
                            <div>
                              <span className="font-semibold">السعر:</span> {trade.price} شيكل/كغم
                            </div>
                            <div className="col-span-2">
                              <span className="font-semibold">الإجمالي:</span> {trade.total.toFixed(2)} شيكل
                            </div>
                            {trade.personName && <div className="col-span-2">
                                <span className="font-semibold">المشتري:</span> {trade.personName}
                              </div>}
                          </div>
                          {trade.notes && <div className="mt-2 text-sm bg-gray-50 p-2 rounded">
                              <span className="font-semibold">ملاحظات:</span> {trade.notes}
                            </div>}
                        </CardContent>
                      </Card>)}
                  </div>}
              </TabsContent>
              
              <TabsContent value="buy" className="p-4">
                {buyTrades.length === 0 ? <div className="text-center py-8 text-gray-500">
                    <p>لا يوجد عمليات شراء مسجلة</p>
                  </div> : <div className="space-y-4 max-h-[400px] overflow-y-auto">
                    {buyTrades.map(trade => <Card key={trade.id} className="border border-blue-200">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-bold text-lg text-blue-600">
                              شراء زيت
                            </h4>
                            <span className="text-sm text-gray-500">
                              {formatDate(trade.date)}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="font-semibold">الكمية:</span> {trade.amount} كغم
                            </div>
                            <div>
                              <span className="font-semibold">السعر:</span> {trade.price} شيكل/كغم
                            </div>
                            <div className="col-span-2">
                              <span className="font-semibold">الإجمالي:</span> {trade.total.toFixed(2)} شيكل
                            </div>
                            {trade.personName && <div className="col-span-2">
                                <span className="font-semibold">المورد:</span> {trade.personName}
                              </div>}
                          </div>
                          {trade.notes && <div className="mt-2 text-sm bg-gray-50 p-2 rounded">
                              <span className="font-semibold">ملاحظات:</span> {trade.notes}
                            </div>}
                        </CardContent>
                      </Card>)}
                  </div>}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>;
};
export default OilTrading;