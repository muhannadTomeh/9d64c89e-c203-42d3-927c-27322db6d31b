
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useMillContext } from '@/context/MillContext';
import { Customer } from '@/types';
import { toast } from 'sonner';

const QueueManagement: React.FC = () => {
  const { customers, addCustomer, updateCustomerStatus, removeCustomerFromQueue } = useMillContext();
  const queuedCustomers = customers.filter(c => c.status === 'pending');
  
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [bagsCount, setBagsCount] = useState(0);
  const [notes, setNotes] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (name.trim() === '') {
      toast.error('الرجاء إدخال اسم الزبون');
      return;
    }
    
    if (bagsCount <= 0) {
      toast.error('الرجاء إدخال عدد صحيح للشوالات');
      return;
    }
    
    addCustomer({
      name: name.trim(),
      phoneNumber: phoneNumber.trim() !== '' ? phoneNumber : undefined,
      bagsCount,
      notes: notes.trim() !== '' ? notes : undefined,
    });
    
    // Reset form
    setName('');
    setPhoneNumber('');
    setBagsCount(0);
    setNotes('');
    
    toast.success('تمت إضافة الزبون إلى الطابور');
  };

  const handleRemoveFromQueue = (customer: Customer) => {
    removeCustomerFromQueue(customer.id);
    toast.success(`تم حذف ${customer.name} من الطابور`);
  };
  
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">إدارة الطابور</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Add Customer Form */}
        <Card className="md:col-span-1">
          <CardHeader className="bg-primary text-white font-bold pb-2">
            <h3 className="text-lg">إضافة زبون جديد</h3>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">اسم الزبون</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="أدخل اسم الزبون"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">رقم الهاتف (اختياري)</Label>
                <Input
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="أدخل رقم الهاتف"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bagsCount">عدد الشوالات</Label>
                <Input
                  id="bagsCount"
                  type="number"
                  min="1"
                  value={bagsCount || ''}
                  onChange={(e) => setBagsCount(Number(e.target.value))}
                  placeholder="أدخل عدد الشوالات"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">ملاحظات (اختياري)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="أدخل أي ملاحظات إضافية"
                  rows={3}
                />
              </div>
              
              <Button type="submit" className="w-full">إضافة للطابور</Button>
            </form>
          </CardContent>
        </Card>
        
        {/* Queue List */}
        <Card className="md:col-span-2">
          <CardHeader className="bg-olive-600 text-white font-bold pb-2">
            <h3 className="text-lg">قائمة الطابور ({queuedCustomers.length} زبون)</h3>
          </CardHeader>
          <CardContent className="max-h-[500px] overflow-y-auto">
            {queuedCustomers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>لا يوجد زبائن في الطابور حالياً</p>
              </div>
            ) : (
              <div className="space-y-4">
                {queuedCustomers.map((customer) => (
                  <Card key={customer.id} className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold text-lg">{customer.name}</h4>
                        <span className="text-sm text-gray-500">
                          {formatTime(customer.createdAt)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="font-semibold">عدد الشوالات:</span> {customer.bagsCount}
                        </div>
                        {customer.phoneNumber && (
                          <div>
                            <span className="font-semibold">الهاتف:</span> {customer.phoneNumber}
                          </div>
                        )}
                      </div>
                      {customer.notes && (
                        <div className="mt-2 text-sm bg-gray-50 p-2 rounded">
                          <span className="font-semibold">ملاحظات:</span> {customer.notes}
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-between p-2 bg-gray-50">
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleRemoveFromQueue(customer)}
                      >
                        إزالة من الطابور
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QueueManagement;
