
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMillContext } from '@/context/MillContext';
import { Worker, WorkerShift, WorkerPayment, WorkerType } from '@/types';
import { toast } from 'sonner';

const WorkersManagement: React.FC = () => {
  const { workers, addWorker, workerShifts, addWorkerShift, workerPayments, addWorkerPayment } = useMillContext();
  
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [workerType, setWorkerType] = useState<WorkerType>('hourly');
  const [hourlyRate, setHourlyRate] = useState(0);
  const [shiftRate, setShiftRate] = useState(0);
  const [notes, setNotes] = useState('');
  
  // Shift recording state
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [hours, setHours] = useState(0);
  const [shifts, setShifts] = useState(0);
  const [shiftNotes, setShiftNotes] = useState('');
  
  // Payment recording state
  const [paymentWorkerId, setPaymentWorkerId] = useState('');
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentNotes, setPaymentNotes] = useState('');
  
  const handleAddWorker = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (name.trim() === '') {
      toast.error('الرجاء إدخال اسم العامل');
      return;
    }
    
    if (workerType === 'hourly' && hourlyRate <= 0) {
      toast.error('الرجاء إدخال أجر ساعة صحيح');
      return;
    }
    
    if (workerType === 'shift' && shiftRate <= 0) {
      toast.error('الرجاء إدخال أجر الشفت');
      return;
    }
    
    addWorker({
      name: name.trim(),
      phoneNumber: phoneNumber.trim() !== '' ? phoneNumber : undefined,
      type: workerType,
      hourlyRate: workerType === 'hourly' ? hourlyRate : undefined,
      shiftRate: workerType === 'shift' ? shiftRate : undefined,
      notes: notes.trim() !== '' ? notes : undefined,
    });
    
    // Reset form
    setName('');
    setPhoneNumber('');
    setWorkerType('hourly');
    setHourlyRate(0);
    setShiftRate(0);
    setNotes('');
    
    toast.success('تمت إضافة العامل بنجاح');
  };
  
  const handleAddShift = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedWorkerId) {
      toast.error('الرجاء اختيار عامل');
      return;
    }
    
    const worker = workers.find(w => w.id === selectedWorkerId);
    
    if (!worker) {
      toast.error('العامل غير موجود');
      return;
    }
    
    if (worker.type === 'hourly' && hours <= 0) {
      toast.error('الرجاء إدخال عدد ساعات صحيح');
      return;
    }
    
    if (worker.type === 'shift' && shifts <= 0) {
      toast.error('الرجاء إدخال عدد شفتات صحيح');
      return;
    }
    
    const amount = worker.type === 'hourly' 
      ? (worker.hourlyRate || 0) * hours 
      : (worker.shiftRate || 0) * shifts;
    
    addWorkerShift({
      workerId: selectedWorkerId,
      date: new Date(),
      hours: worker.type === 'hourly' ? hours : undefined,
      shifts: worker.type === 'shift' ? shifts : undefined,
      amount,
      isPaid: false,
      notes: shiftNotes.trim() !== '' ? shiftNotes : undefined,
    });
    
    // Reset form
    setSelectedWorkerId('');
    setHours(0);
    setShifts(0);
    setShiftNotes('');
    
    toast.success('تم تسجيل الشفت بنجاح');
  };
  
  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!paymentWorkerId) {
      toast.error('الرجاء اختيار عامل');
      return;
    }
    
    if (paymentAmount <= 0) {
      toast.error('الرجاء إدخال مبلغ صحيح');
      return;
    }
    
    addWorkerPayment({
      workerId: paymentWorkerId,
      date: new Date(),
      amount: paymentAmount,
      notes: paymentNotes.trim() !== '' ? paymentNotes : undefined,
    });
    
    // Reset form
    setPaymentWorkerId('');
    setPaymentAmount(0);
    setPaymentNotes('');
    
    toast.success('تم تسجيل الدفعة بنجاح');
  };
  
  const getWorkerBalance = (workerId: string) => {
    const workerShiftTotal = workerShifts
      .filter(shift => shift.workerId === workerId)
      .reduce((sum, shift) => sum + shift.amount, 0);
    
    const workerPaymentTotal = workerPayments
      .filter(payment => payment.workerId === workerId)
      .reduce((sum, payment) => sum + payment.amount, 0);
    
    return workerShiftTotal - workerPaymentTotal;
  };
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">إدارة العمال</h2>
      
      <Tabs defaultValue="workers" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="workers">العمال</TabsTrigger>
          <TabsTrigger value="shifts">الشفتات</TabsTrigger>
          <TabsTrigger value="payments">الدفعات</TabsTrigger>
        </TabsList>
        
        {/* Workers Tab */}
        <TabsContent value="workers" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Add Worker Form */}
            <Card className="md:col-span-1">
              <CardHeader className="bg-primary text-white font-bold pb-2">
                <h3 className="text-lg">إضافة عامل جديد</h3>
              </CardHeader>
              <CardContent className="pt-4">
                <form onSubmit={handleAddWorker} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">اسم العامل</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="أدخل اسم العامل"
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
                    <Label htmlFor="workerType">نوع العامل</Label>
                    <Select
                      value={workerType}
                      onValueChange={(value: WorkerType) => setWorkerType(value)}
                    >
                      <SelectTrigger id="workerType">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">عامل بالساعة</SelectItem>
                        <SelectItem value="shift">عامل بالشفت</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {workerType === 'hourly' && (
                    <div className="space-y-2">
                      <Label htmlFor="hourlyRate">أجر الساعة (شيكل)</Label>
                      <Input
                        id="hourlyRate"
                        type="number"
                        min="1"
                        value={hourlyRate || ''}
                        onChange={(e) => setHourlyRate(Number(e.target.value))}
                        placeholder="أدخل أجر الساعة"
                      />
                    </div>
                  )}
                  
                  {workerType === 'shift' && (
                    <div className="space-y-2">
                      <Label htmlFor="shiftRate">أجر الشفت (شيكل)</Label>
                      <Input
                        id="shiftRate"
                        type="number"
                        min="1"
                        value={shiftRate || ''}
                        onChange={(e) => setShiftRate(Number(e.target.value))}
                        placeholder="أدخل أجر الشفت"
                      />
                    </div>
                  )}
                  
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
                  
                  <Button type="submit" className="w-full">إضافة عامل</Button>
                </form>
              </CardContent>
            </Card>
            
            {/* Workers List */}
            <Card className="md:col-span-2">
              <CardHeader className="bg-blue-600 text-white font-bold pb-2">
                <h3 className="text-lg">قائمة العمال ({workers.length})</h3>
              </CardHeader>
              <CardContent className="max-h-[500px] overflow-y-auto">
                {workers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>لا يوجد عمال حالياً</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {workers.map((worker) => (
                      <Card key={worker.id} className="border border-gray-200">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-bold text-lg">{worker.name}</h4>
                            <span className="text-sm text-gray-500">
                              {worker.type === 'hourly' ? 'عامل بالساعة' : 'عامل بالشفت'}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            {worker.phoneNumber && (
                              <div>
                                <span className="font-semibold">الهاتف:</span> {worker.phoneNumber}
                              </div>
                            )}
                            {worker.type === 'hourly' && (
                              <div>
                                <span className="font-semibold">أجر الساعة:</span> {worker.hourlyRate} شيكل
                              </div>
                            )}
                            {worker.type === 'shift' && (
                              <div>
                                <span className="font-semibold">أجر الشفت:</span> {worker.shiftRate} شيكل
                              </div>
                            )}
                            <div className="col-span-2">
                              <span className="font-semibold">الرصيد المستحق:</span> {getWorkerBalance(worker.id)} شيكل
                            </div>
                          </div>
                          {worker.notes && (
                            <div className="mt-2 text-sm bg-gray-50 p-2 rounded">
                              <span className="font-semibold">ملاحظات:</span> {worker.notes}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Shifts Tab */}
        <TabsContent value="shifts" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Add Shift Form */}
            <Card className="md:col-span-1">
              <CardHeader className="bg-primary text-white font-bold pb-2">
                <h3 className="text-lg">تسجيل شفت جديد</h3>
              </CardHeader>
              <CardContent className="pt-4">
                <form onSubmit={handleAddShift} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="worker">اختر العامل</Label>
                    <Select
                      value={selectedWorkerId}
                      onValueChange={setSelectedWorkerId}
                    >
                      <SelectTrigger id="worker">
                        <SelectValue placeholder="اختر عامل" />
                      </SelectTrigger>
                      <SelectContent>
                        {workers.length === 0 ? (
                          <SelectItem value="empty" disabled>
                            لا يوجد عمال
                          </SelectItem>
                        ) : (
                          workers.map((worker) => (
                            <SelectItem key={worker.id} value={worker.id}>
                              {worker.name} ({worker.type === 'hourly' ? 'بالساعة' : 'بالشفت'})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {selectedWorkerId && workers.find(w => w.id === selectedWorkerId)?.type === 'hourly' && (
                    <div className="space-y-2">
                      <Label htmlFor="hours">عدد الساعات</Label>
                      <Input
                        id="hours"
                        type="number"
                        min="1"
                        step="0.5"
                        value={hours || ''}
                        onChange={(e) => setHours(Number(e.target.value))}
                      />
                    </div>
                  )}
                  
                  {selectedWorkerId && workers.find(w => w.id === selectedWorkerId)?.type === 'shift' && (
                    <div className="space-y-2">
                      <Label htmlFor="shifts">عدد الشفتات</Label>
                      <Input
                        id="shifts"
                        type="number"
                        min="1"
                        value={shifts || ''}
                        onChange={(e) => setShifts(Number(e.target.value))}
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="shiftNotes">ملاحظات (اختياري)</Label>
                    <Textarea
                      id="shiftNotes"
                      value={shiftNotes}
                      onChange={(e) => setShiftNotes(e.target.value)}
                      placeholder="أدخل أي ملاحظات إضافية"
                      rows={3}
                    />
                  </div>
                  
                  <Button type="submit" className="w-full">تسجيل الشفت</Button>
                </form>
              </CardContent>
            </Card>
            
            {/* Shifts List */}
            <Card className="md:col-span-2">
              <CardHeader className="bg-blue-600 text-white font-bold pb-2">
                <h3 className="text-lg">سجل الشفتات</h3>
              </CardHeader>
              <CardContent className="max-h-[500px] overflow-y-auto">
                {workerShifts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>لا يوجد شفتات مسجلة</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {workerShifts.map((shift) => {
                      const worker = workers.find(w => w.id === shift.workerId);
                      return (
                        <Card key={shift.id} className="border border-gray-200">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="font-bold text-lg">{worker?.name}</h4>
                              <span className="text-sm text-gray-500">
                                {formatDate(shift.date)}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              {shift.hours && (
                                <div>
                                  <span className="font-semibold">عدد الساعات:</span> {shift.hours}
                                </div>
                              )}
                              {shift.shifts && (
                                <div>
                                  <span className="font-semibold">عدد الشفتات:</span> {shift.shifts}
                                </div>
                              )}
                              <div className="col-span-2">
                                <span className="font-semibold">المبلغ:</span> {shift.amount} شيكل
                              </div>
                              <div className="col-span-2">
                                <span className="font-semibold">الحالة:</span> {shift.isPaid ? 'مدفوع' : 'غير مدفوع'}
                              </div>
                            </div>
                            {shift.notes && (
                              <div className="mt-2 text-sm bg-gray-50 p-2 rounded">
                                <span className="font-semibold">ملاحظات:</span> {shift.notes}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Add Payment Form */}
            <Card className="md:col-span-1">
              <CardHeader className="bg-primary text-white font-bold pb-2">
                <h3 className="text-lg">تسجيل دفعة جديدة</h3>
              </CardHeader>
              <CardContent className="pt-4">
                <form onSubmit={handleAddPayment} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="paymentWorker">اختر العامل</Label>
                    <Select
                      value={paymentWorkerId}
                      onValueChange={setPaymentWorkerId}
                    >
                      <SelectTrigger id="paymentWorker">
                        <SelectValue placeholder="اختر عامل" />
                      </SelectTrigger>
                      <SelectContent>
                        {workers.length === 0 ? (
                          <SelectItem value="empty" disabled>
                            لا يوجد عمال
                          </SelectItem>
                        ) : (
                          workers.map((worker) => (
                            <SelectItem key={worker.id} value={worker.id}>
                              {worker.name} (المستحق: {getWorkerBalance(worker.id)} شيكل)
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="paymentAmount">المبلغ (شيكل)</Label>
                    <Input
                      id="paymentAmount"
                      type="number"
                      min="1"
                      value={paymentAmount || ''}
                      onChange={(e) => setPaymentAmount(Number(e.target.value))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="paymentNotes">ملاحظات (اختياري)</Label>
                    <Textarea
                      id="paymentNotes"
                      value={paymentNotes}
                      onChange={(e) => setPaymentNotes(e.target.value)}
                      placeholder="أدخل أي ملاحظات إضافية"
                      rows={3}
                    />
                  </div>
                  
                  <Button type="submit" className="w-full">تسجيل الدفعة</Button>
                </form>
              </CardContent>
            </Card>
            
            {/* Payments List */}
            <Card className="md:col-span-2">
              <CardHeader className="bg-blue-600 text-white font-bold pb-2">
                <h3 className="text-lg">سجل الدفعات</h3>
              </CardHeader>
              <CardContent className="max-h-[500px] overflow-y-auto">
                {workerPayments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>لا يوجد دفعات مسجلة</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {workerPayments.map((payment) => {
                      const worker = workers.find(w => w.id === payment.workerId);
                      return (
                        <Card key={payment.id} className="border border-gray-200">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="font-bold text-lg">{worker?.name}</h4>
                              <span className="text-sm text-gray-500">
                                {formatDate(payment.date)}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="col-span-2">
                                <span className="font-semibold">المبلغ:</span> {payment.amount} شيكل
                              </div>
                            </div>
                            {payment.notes && (
                              <div className="mt-2 text-sm bg-gray-50 p-2 rounded">
                                <span className="font-semibold">ملاحظات:</span> {payment.notes}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkersManagement;
