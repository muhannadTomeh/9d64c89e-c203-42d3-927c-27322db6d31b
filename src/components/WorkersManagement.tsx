import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMillContext } from '@/context/MillContext';
import { Worker, WorkerShift, WorkerPayment, WorkerType } from '@/types';
import { toast } from 'sonner';
import { Search, Plus, Edit, DollarSign, Printer } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const WorkersManagement: React.FC = () => {
  const {
    workers,
    addWorker,
    workerShifts,
    addWorkerShift,
    workerPayments,
    addWorkerPayment
  } = useMillContext();
  const [searchQuery, setSearchQuery] = useState('');
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
      notes: notes.trim() !== '' ? notes : undefined
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
    const amount = worker.type === 'hourly' ? (worker.hourlyRate || 0) * hours : (worker.shiftRate || 0) * shifts;
    addWorkerShift({
      workerId: selectedWorkerId,
      date: new Date(),
      hours: worker.type === 'hourly' ? hours : undefined,
      shifts: worker.type === 'shift' ? shifts : undefined,
      amount,
      isPaid: false,
      notes: shiftNotes.trim() !== '' ? shiftNotes : undefined
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
      notes: paymentNotes.trim() !== '' ? paymentNotes : undefined
    });

    // Reset form
    setPaymentWorkerId('');
    setPaymentAmount(0);
    setPaymentNotes('');
    toast.success('تم تسجيل الدفعة بنجاح');
  };
  const getWorkerBalance = (workerId: string) => {
    const workerShiftTotal = workerShifts.filter(shift => shift.workerId === workerId).reduce((sum, shift) => sum + shift.amount, 0);
    const workerPaymentTotal = workerPayments.filter(payment => payment.workerId === workerId).reduce((sum, payment) => sum + payment.amount, 0);
    return workerShiftTotal - workerPaymentTotal;
  };
  const getWorkerPaidAmount = (workerId: string) => {
    return workerPayments.filter(payment => payment.workerId === workerId).reduce((sum, payment) => sum + payment.amount, 0);
  };
  const getWorkerTotalDue = (workerId: string) => {
    return workerShifts.filter(shift => shift.workerId === workerId).reduce((sum, shift) => sum + shift.amount, 0);
  };
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  const filteredWorkers = workers.filter(worker => worker.name.toLowerCase().includes(searchQuery.toLowerCase()));
  return <div className="space-y-6">
      <h2 className="text-2xl font-bold text-right">إدارة العمال</h2>
      
      <Tabs defaultValue="workers" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="workers">العمال</TabsTrigger>
          <TabsTrigger value="shifts">الشفتات</TabsTrigger>
          <TabsTrigger value="payments">الدفعات</TabsTrigger>
        </TabsList>
        
        {/* Workers Tab */}
        <TabsContent value="workers" className="space-y-6">
          {/* Search and Add Worker Button */}
          <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:space-y-0">
            <Button className="bg-green-600 hover:bg-green-700 order-2 md:order-1" onClick={() => {
              setName('');
              setPhoneNumber('');
              setWorkerType('hourly');
              setHourlyRate(0);
              setShiftRate(0);
              setNotes('');
            }}>
              <Plus className="ml-2 h-4 w-4" />
              إضافة عامل جديد
            </Button>
            <div className="relative w-full md:w-1/3 order-1 md:order-2">
              <Search className="absolute right-2 top-3 h-4 w-4 text-gray-400" />
              <Input className="pr-8 text-right" placeholder="بحث عن اسم العامل..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
          </div>
          
          {/* Workers Table */}
          <Card>
            <CardHeader className="bg-blue-600 text-white font-bold pb-2">
              <h3 className="text-center font-normal text-base">قائمة العمال ({filteredWorkers.length})</h3>
            </CardHeader>
            <CardContent className="p-0">
              {filteredWorkers.length === 0 ? <div className="text-center py-8 text-gray-500">
                  <p>لا يوجد عمال حالياً</p>
                </div> : <div className="overflow-x-auto">
                  <Table dir="rtl">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-center">الاسم</TableHead>
                        <TableHead className="text-center rounded-none">نوع العامل</TableHead>
                        <TableHead className="text-center">الراتب الكلي المستحق</TableHead>
                        <TableHead className="text-center">الراتب المدفوع</TableHead>
                        <TableHead className="text-center">المتبقي</TableHead>
                        <TableHead className="text-center">التفاصيل</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredWorkers.map(worker => {
                        const totalDue = getWorkerTotalDue(worker.id);
                        const totalPaid = getWorkerPaidAmount(worker.id);
                        const balance = getWorkerBalance(worker.id);
                        return <TableRow key={worker.id}>
                            <TableCell className="text-center">{worker.name}</TableCell>
                            <TableCell className="text-center">
                              {worker.type === 'hourly' ? 'بالساعة' : 'بالشفت'}
                            </TableCell>
                            <TableCell className="text-center">{totalDue} شيكل</TableCell>
                            <TableCell className="text-center">{totalPaid} شيكل</TableCell>
                            <TableCell className="text-center">
                              {balance} شيكل
                            </TableCell>
                            <TableCell className="text-center">
                              <Link to={`/workers/${worker.id}`}>
                                <Button variant="outline" size="sm" className="flex items-center">
                                  <Edit className="ml-1 h-4 w-4" />
                                  تفاصيل
                                </Button>
                              </Link>
                            </TableCell>
                          </TableRow>;
                      })}
                    </TableBody>
                  </Table>
                </div>}
            </CardContent>
          </Card>
          
          {/* Add Worker Form */}
          <Card>
            <CardHeader className="bg-green-600 text-white font-bold pb-2 text-right">
              <h3 className="text-lg">إضافة عامل جديد</h3>
            </CardHeader>
            <CardContent className="pt-4">
              <form onSubmit={handleAddWorker} className="space-y-4 text-right">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-right">اسم العامل الكامل</Label>
                  <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="أدخل اسم العامل" className="text-right" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">رقم الهاتف (اختياري)</Label>
                  <Input id="phoneNumber" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="أدخل رقم الهاتف" className="text-right" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="workerType">نوع العامل</Label>
                  <Select value={workerType} onValueChange={(value: WorkerType) => setWorkerType(value)}>
                    <SelectTrigger id="workerType" className="text-right">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">عامل بالساعة</SelectItem>
                      <SelectItem value="shift">عامل بالشفت</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {workerType === 'hourly' && <div className="space-y-2">
                    <Label htmlFor="hourlyRate">أجر الساعة (شيكل)</Label>
                    <Input id="hourlyRate" type="number" min="1" value={hourlyRate || ''} onChange={e => setHourlyRate(Number(e.target.value))} placeholder="أدخل أجر الساعة" className="text-right" />
                  </div>}
                
                {workerType === 'shift' && <div className="space-y-2">
                    <Label htmlFor="shiftRate">أجر الشفت (شيكل)</Label>
                    <Input id="shiftRate" type="number" min="1" value={shiftRate || ''} onChange={e => setShiftRate(Number(e.target.value))} placeholder="أدخل أجر الشفت" className="text-right" />
                  </div>}
                
                <div className="space-y-2">
                  <Label htmlFor="notes">ملاحظات (اختياري)</Label>
                  <Textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="أدخل أي ملاحظات إضافية" rows={3} className="text-right" />
                </div>
                
                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                  حفظ العامل
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Shifts Tab */}
        <TabsContent value="shifts" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Shifts List */}
            <Card className="md:col-span-2 order-2 md:order-1">
              <CardHeader className="bg-blue-600 text-white font-bold pb-2">
                <h3 className="text-lg">سجل الشفتات</h3>
              </CardHeader>
              <CardContent className="max-h-[500px] overflow-y-auto">
                {workerShifts.length === 0 ? <div className="text-center py-8 text-gray-500">
                    <p>لا يوجد شفتات مسجلة</p>
                  </div> : <div className="space-y-4">
                    {workerShifts.map(shift => {
                      const worker = workers.find(w => w.id === shift.workerId);
                      return <Card key={shift.id} className="border border-gray-200">
                          <CardContent className="p-4 text-right">
                            <div className="flex justify-between items-center mb-2 flex-row-reverse">
                              <h4 className="font-bold text-lg">{worker?.name}</h4>
                              <span className="text-sm text-gray-500">
                                {formatDate(shift.date)}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              {shift.hours && <div>
                                  <span className="font-semibold">عدد الساعات:</span> {shift.hours}
                                </div>}
                              {shift.shifts && <div>
                                  <span className="font-semibold">عدد الشفتات:</span> {shift.shifts}
                                </div>}
                              <div className="col-span-2">
                                <span className="font-semibold">المبلغ:</span> {shift.amount} شيكل
                              </div>
                              <div className="col-span-2">
                                <span className="font-semibold">الحالة:</span> {shift.isPaid ? 'مدفوع' : 'غير مدفوع'}
                              </div>
                            </div>
                            {shift.notes && <div className="mt-2 text-sm bg-gray-50 p-2 rounded text-right">
                                <span className="font-semibold">ملاحظات:</span> {shift.notes}
                              </div>}
                          </CardContent>
                        </Card>;
                    })}
                  </div>}
              </CardContent>
            </Card>

            {/* Add Shift Form */}
            <Card className="md:col-span-1 order-1 md:order-2">
              <CardHeader className="bg-primary text-white font-bold pb-2">
                <h3 className="text-lg text-right">تسجيل شفت جديد</h3>
              </CardHeader>
              <CardContent className="pt-4">
                <form onSubmit={handleAddShift} className="space-y-4 text-right">
                  <div className="space-y-2">
                    <Label htmlFor="worker">اختر العامل</Label>
                    <Select value={selectedWorkerId} onValueChange={setSelectedWorkerId}>
                      <SelectTrigger id="worker" className="text-right">
                        <SelectValue placeholder="اختر عامل" />
                      </SelectTrigger>
                      <SelectContent>
                        {workers.length === 0 ? <SelectItem value="empty" disabled>
                            لا يوجد عمال
                          </SelectItem> : workers.map(worker => <SelectItem key={worker.id} value={worker.id}>
                              {worker.name} ({worker.type === 'hourly' ? 'بالساعة' : 'بالشفت'})
                            </SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {selectedWorkerId && workers.find(w => w.id === selectedWorkerId)?.type === 'hourly' && <div className="space-y-2">
                      <Label htmlFor="hours">عدد الساعات</Label>
                      <Input id="hours" type="number" min="1" step="0.5" value={hours || ''} onChange={e => setHours(Number(e.target.value))} className="text-right" />
                    </div>}
                  
                  {selectedWorkerId && workers.find(w => w.id === selectedWorkerId)?.type === 'shift' && <div className="space-y-2">
                      <Label htmlFor="shifts">عدد الشفتات</Label>
                      <Input id="shifts" type="number" min="1" value={shifts || ''} onChange={e => setShifts(Number(e.target.value))} className="text-right" />
                    </div>}
                  
                  <div className="space-y-2">
                    <Label htmlFor="shiftNotes">ملاحظات (اختياري)</Label>
                    <Textarea id="shiftNotes" value={shiftNotes} onChange={e => setShiftNotes(e.target.value)} placeholder="أدخل أي ملاحظات إضافية" rows={3} className="text-right" />
                  </div>
                  
                  <Button type="submit" className="w-full">تسجيل الشفت</Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Payments List */}
            <Card className="md:col-span-2 order-2 md:order-1">
              <CardHeader className="bg-blue-600 text-white font-bold pb-2">
                <h3 className="text-lg">سجل الدفعات</h3>
              </CardHeader>
              <CardContent className="max-h-[500px] overflow-y-auto">
                {workerPayments.length === 0 ? <div className="text-center py-8 text-gray-500">
                    <p>لا يوجد دفعات مسجلة</p>
                  </div> : <div className="space-y-4">
                    {workerPayments.map(payment => {
                      const worker = workers.find(w => w.id === payment.workerId);
                      return <Card key={payment.id} className="border border-gray-200">
                          <CardContent className="p-4 text-right">
                            <div className="flex justify-between items-center mb-2 flex-row-reverse">
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
                            {payment.notes && <div className="mt-2 text-sm bg-gray-50 p-2 rounded text-right">
                                <span className="font-semibold">ملاحظات:</span> {payment.notes}
                              </div>}
                          </CardContent>
                        </Card>;
                    })}
                  </div>}
              </CardContent>
            </Card>
            
            {/* Add Payment Form */}
            <Card className="md:col-span-1 order-1 md:order-2">
              <CardHeader className="bg-primary text-white font-bold pb-2">
                <h3 className="text-lg text-right">تسجيل دفعة جديدة</h3>
              </CardHeader>
              <CardContent className="pt-4">
                <form onSubmit={handleAddPayment} className="space-y-4 text-right">
                  <div className="space-y-2">
                    <Label htmlFor="paymentWorker">اختر العامل</Label>
                    <Select value={paymentWorkerId} onValueChange={setPaymentWorkerId}>
                      <SelectTrigger id="paymentWorker" className="text-right">
                        <SelectValue placeholder="اختر عامل" />
                      </SelectTrigger>
                      <SelectContent>
                        {workers.length === 0 ? <SelectItem value="empty" disabled>
                            لا يوجد عمال
                          </SelectItem> : workers.map(worker => <SelectItem key={worker.id} value={worker.id}>
                              {worker.name} (المستحق: {getWorkerBalance(worker.id)} شيكل)
                            </SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="paymentAmount">المبلغ (شيكل)</Label>
                    <Input id="paymentAmount" type="number" min="1" value={paymentAmount || ''} onChange={e => setPaymentAmount(Number(e.target.value))} className="text-right" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="paymentNotes">ملاحظات (اختياري)</Label>
                    <Textarea id="paymentNotes" value={paymentNotes} onChange={e => setPaymentNotes(e.target.value)} placeholder="أدخل أي ملاحظات إضافية" rows={3} className="text-right" />
                  </div>
                  
                  <Button type="submit" className="w-full">تسجيل الدفعة</Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>;
};

export default WorkersManagement;
