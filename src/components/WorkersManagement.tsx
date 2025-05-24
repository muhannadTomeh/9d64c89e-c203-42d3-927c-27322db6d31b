import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DatePicker } from '@/components/ui/date-picker';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useMillContext } from '@/context/MillContext';
import { Worker, WorkerShift, WorkerType } from '@/types';
import { toast } from 'sonner';
import { Search, Plus, Edit, DollarSign, Clock, Calendar, Briefcase, CheckCircle, XCircle, FileText, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

// Extend the Worker type to include the missing properties
interface ExtendedWorker extends Worker {
  jobTitle?: string;
  isActive?: boolean;
}
const WorkersManagement: React.FC = () => {
  const {
    workers,
    addWorker,
    updateWorker,
    workerShifts,
    addWorkerShift,
    workerPayments,
    addWorkerPayment
  } = useMillContext();
  const [searchQuery, setSearchQuery] = useState('');

  // Worker Form State
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [workerType, setWorkerType] = useState<WorkerType>('hourly');
  const [hourlyRate, setHourlyRate] = useState(0);
  const [shiftRate, setShiftRate] = useState(0);
  const [notes, setNotes] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [hireDate, setHireDate] = useState<Date>(new Date());
  const [isActive, setIsActive] = useState(true);

  // Shift recording state
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [sessionDate, setSessionDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('16:00');
  const [hours, setHours] = useState(0);
  const [shifts, setShifts] = useState(0);
  const [shiftNotes, setShiftNotes] = useState('');

  // Payment state
  const [paymentWorkerId, setPaymentWorkerId] = useState('');
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentNotes, setPaymentNotes] = useState('');
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedPaymentWorker, setSelectedPaymentWorker] = useState<ExtendedWorker | null>(null);
  const handleAddWorker = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() === '') {
      toast.error('الرجاء إدخال اسم العامل');
      return;
    }
    if (jobTitle.trim() === '') {
      toast.error('الرجاء إدخال المسمى الوظيفي');
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
      jobTitle: jobTitle.trim(),
      isActive: isActive
    } as any);
    resetWorkerForm();
    toast.success('تمت إضافة العامل بنجاح');
  };
  const resetWorkerForm = () => {
    setName('');
    setPhoneNumber('');
    setWorkerType('hourly');
    setHourlyRate(0);
    setShiftRate(0);
    setNotes('');
    setJobTitle('');
    setHireDate(new Date());
    setIsActive(true);
  };
  const handleAddShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkerId) {
      toast.error('الرجاء اختيار عامل');
      return;
    }
    const worker = workers.find(w => w.id === selectedWorkerId) as ExtendedWorker;
    if (!worker) {
      toast.error('العامل غير موجود');
      return;
    }
    let calculatedHours = hours;
    if (worker.type === 'hourly' && startTime && endTime) {
      const [startHour, startMin] = startTime.split(':').map(Number);
      const [endHour, endMin] = endTime.split(':').map(Number);
      calculatedHours = endHour - startHour + (endMin - startMin) / 60;
    }
    if (worker.type === 'hourly' && calculatedHours <= 0) {
      toast.error('الرجاء إدخال عدد ساعات صحيح');
      return;
    }
    if (worker.type === 'shift' && shifts <= 0) {
      toast.error('الرجاء إدخال عدد شفتات صحيح');
      return;
    }
    const amount = worker.type === 'hourly' ? (worker.hourlyRate || 0) * calculatedHours : (worker.shiftRate || 0) * shifts;
    addWorkerShift({
      workerId: selectedWorkerId,
      date: sessionDate,
      hours: worker.type === 'hourly' ? calculatedHours : undefined,
      shifts: worker.type === 'shift' ? shifts : undefined,
      amount,
      isPaid: false,
      notes: shiftNotes.trim() !== '' ? shiftNotes : undefined
    });
    setSelectedWorkerId('');
    setSessionDate(new Date());
    setStartTime('08:00');
    setEndTime('16:00');
    setHours(0);
    setShifts(0);
    setShiftNotes('');
    toast.success('تم تسجيل الشفت بنجاح');
  };
  const handleAddPayment = () => {
    if (!selectedPaymentWorker) {
      toast.error('الرجاء اختيار عامل');
      return;
    }
    if (paymentAmount <= 0) {
      toast.error('الرجاء إدخال مبلغ صحيح');
      return;
    }
    addWorkerPayment({
      workerId: selectedPaymentWorker.id,
      date: new Date(),
      amount: paymentAmount,
      notes: paymentNotes.trim() !== '' ? paymentNotes : undefined
    });
    setPaymentWorkerId('');
    setPaymentAmount(0);
    setPaymentNotes('');
    setSelectedPaymentWorker(null);
    setShowPaymentDialog(false);
    toast.success('تم تسجيل الدفعة بنجاح');
  };
  const openPaymentDialog = (worker: ExtendedWorker) => {
    setSelectedPaymentWorker(worker);
    setPaymentAmount(getWorkerBalance(worker.id));
    setShowPaymentDialog(true);
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
    return format(new Date(date), 'dd MMM yyyy', {
      locale: ar
    });
  };
  const filteredWorkers = workers.filter(worker => {
    const w = worker as ExtendedWorker;
    return w.name.toLowerCase().includes(searchQuery.toLowerCase()) || w.jobTitle && w.jobTitle.toLowerCase().includes(searchQuery.toLowerCase());
  });
  const getRecentShifts = () => {
    return [...workerShifts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
  };
  return <div className="space-y-6 font-arabic" dir="rtl">
      <h2 className="text-2xl font-bold text-right">إدارة العمال</h2>
      
      <Tabs defaultValue="worker-list" dir="rtl" className="w-full ">
        <TabsList dir="rtl" className="grid w-full grid-cols-4 text-right flex flex-row-reverse\n">
          <TabsTrigger value="worker-list" className="text-right order-4">قائمة العمال</TabsTrigger>
          <TabsTrigger value="add-worker" className="text-right order-3 ">إضافة عامل</TabsTrigger>
          <TabsTrigger value="work-sessions" className="text-right order-2">جلسات العمل</TabsTrigger>
          <TabsTrigger value="salary-payments" className="text-right order-1">سجل المدفوعات</TabsTrigger>
        </TabsList>
        
        {/* Workers List Tab */}
        <TabsContent value="worker-list" className="space-y-6">
          <div className="flex flex-row justify-between items-center pb-4   \\n flex flex-row-reverse">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="bg-olive-700 text-white hover:bg-olive-800">
                <X className="ml-2 h-4 w-4" />
                إلغاء
              </Button>
            </div>
            <h3 className="text-xl font-bold text-right">قائمة العمال</h3>
          </div>
          
          <div className="bg-olive-50/50 p-6 rounded-lg border border-olive-200  ">
            <div dir="rtl" className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 ">
              <div className="text-right order-2 md:order-1">
                <Label htmlFor="phone" className="block text-right font-medium mb-1">رقم الهاتف (اختياري)</Label>
                <Input id="phone" placeholder="أدخل رقم الهاتف" className="text-right" dir="rtl" tabIndex={2} />
              </div>
              
              <div className="text-right order-1 md:order-2">
                <Label htmlFor="name" className="block text-right font-medium mb-1">اسم العامل *</Label>
                <Input id="name" placeholder="أدخل اسم العامل" className="text-right" dir="rtl" tabIndex={1} />
              </div>
              
              <div className="text-right order-4 md:order-3">
                <Label htmlFor="rate" className="block text-right font-medium mb-1">سعر الساعة (شيكل) *</Label>
                <Input id="rate" type="number" placeholder="أدخل سعر الساعة" className="text-right" dir="rtl" tabIndex={4} />
              </div>
              
              <div className="text-right order-3 md:order-4">
                <Label htmlFor="workerType" className="block text-right font-medium mb-1">نوع العمل *</Label>
                <Select value={workerType} onValueChange={(value: WorkerType) => setWorkerType(value)}>
                  <SelectTrigger id="workerType" className="text-right" dir="rtl" tabIndex={3}>
                    <SelectValue placeholder="عامل بالساعة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">عامل بالساعة</SelectItem>
                    <SelectItem value="shift">عامل بالشفت</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-between flex flex-row-reverse\\n flex flex-row-reverse\n">
              <Button variant="outline" tabIndex={6}>
                إلغاء
              </Button>
              <Button className="bg-olive-700 hover:bg-olive-800 text-white" tabIndex={5}>
                إضافة العامل
              </Button>
            </div>
          </div>
          
          <div className="overflow-x-auto" dir="rtl">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">الاسم</TableHead>
                  <TableHead className="text-right">نوع العمل</TableHead>
                  <TableHead className="text-right">رقم الهاتف</TableHead>
                  <TableHead className="text-right">وحدات العمل</TableHead>
                  <TableHead className="text-right">سعر الوحدة (شيكل)</TableHead>
                  <TableHead className="text-right">المستحق (شيكل)</TableHead>
                  <TableHead className="text-right">المدفوع (شيكل)</TableHead>
                  <TableHead className="text-right">المتبقي (شيكل)</TableHead>
                  <TableHead className="text-right">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWorkers.map((worker, index) => {
                const w = worker as ExtendedWorker;
                const totalDue = getWorkerTotalDue(worker.id);
                const totalPaid = getWorkerPaidAmount(worker.id);
                const balance = getWorkerBalance(worker.id);
                return <TableRow key={worker.id}>
                      <TableCell className="font-medium text-right">{worker.name}</TableCell>
                      <TableCell className="text-right">{worker.type === 'hourly' ? 'بالساعة' : 'شفت'}</TableCell>
                      <TableCell className="text-right">{worker.phoneNumber || '-'}</TableCell>
                      <TableCell className="text-right">
                        {worker.type === 'hourly' ? workerShifts.filter(s => s.workerId === worker.id).reduce((sum, s) => sum + (s.hours || 0), 0) : workerShifts.filter(s => s.workerId === worker.id).reduce((sum, s) => sum + (s.shifts || 0), 0)}
                      </TableCell>
                      <TableCell className="text-right">
                        {worker.type === 'hourly' ? worker.hourlyRate : worker.shiftRate}
                      </TableCell>
                      <TableCell className="text-right">{totalDue}</TableCell>
                      <TableCell className="text-right">{totalPaid}</TableCell>
                      <TableCell className={`text-right ${balance > 0 ? 'text-red-600 font-bold' : 'text-green-600'}`}>
                        {balance}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button variant="ghost" size="icon" className="h-8 w-8 border border-olive-200">
                            <FileText className="h-4 w-4 text-olive-600" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 border border-olive-200">
                            <Edit className="h-4 w-4 text-olive-600" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 border border-olive-200" onClick={() => openPaymentDialog(w)} disabled={balance <= 0}>
                            <DollarSign className="h-4 w-4 text-olive-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>;
              })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        
        {/* Add Worker Tab */}
        <TabsContent value="add-worker" className="space-y-6">
          <Card>
            <CardHeader className="bg-olive-500 text-white text-right">
              <CardTitle className="text-right">إضافة عامل جديد</CardTitle>
              <CardDescription className="text-olive-50 text-right">
                أدخل بيانات العامل الجديد
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleAddWorker} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4" dir="rtl">
                  <div className="space-y-2 text-right order-2 md:order-1">
                    <Label htmlFor="jobTitle" className="block text-right">المسمى الوظيفي</Label>
                    <Input id="jobTitle" value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="مثال: عامل معصرة" className="text-right" dir="rtl" tabIndex={2} />
                  </div>
                  
                  <div className="space-y-2 text-right order-1 md:order-2">
                    <Label htmlFor="name" className="block text-right">الاسم الكامل للعامل</Label>
                    <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="أدخل اسم العامل" className="text-right" dir="rtl" tabIndex={1} />
                  </div>
                  
                  <div className="space-y-2 text-right order-4 md:order-3">
                    <Label htmlFor="hireDate" className="block text-right">تاريخ التوظيف</Label>
                    <div className="flex items-center border rounded-md border-olive-300 px-3 py-2" dir="rtl">
                      <DatePicker date={hireDate} setDate={setHireDate} locale={ar} className="w-full text-right" />
                      <Calendar className="h-4 w-4 text-olive-500 mr-2" />
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-right order-3 md:order-4">
                    <Label htmlFor="phoneNumber" className="block text-right">رقم الهاتف (اختياري)</Label>
                    <Input id="phoneNumber" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="أدخل رقم الهاتف" className="text-right" dir="rtl" tabIndex={3} />
                  </div>
                  
                  <div className="space-y-2 text-right order-6 md:order-5">
                    <Label htmlFor="isActive" className="block text-right">حالة العامل</Label>
                    <Select value={isActive ? "active" : "inactive"} onValueChange={value => setIsActive(value === "active")}>
                      <SelectTrigger id="isActive" className="text-right" dir="rtl" tabIndex={6}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">نشط</SelectItem>
                        <SelectItem value="inactive">غير نشط</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2 text-right order-5 md:order-6">
                    <Label htmlFor="workerType" className="block text-right">نوع العامل</Label>
                    <Select value={workerType} onValueChange={(value: WorkerType) => setWorkerType(value)}>
                      <SelectTrigger id="workerType" className="text-right" dir="rtl" tabIndex={5}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">عامل بالساعة</SelectItem>
                        <SelectItem value="shift">عامل بالشفت</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {workerType === 'hourly' && <div className="space-y-2 text-right order-7">
                      <Label htmlFor="hourlyRate" className="block text-right">أجر الساعة (شيكل)</Label>
                      <Input id="hourlyRate" type="number" min="1" value={hourlyRate || ''} onChange={e => setHourlyRate(Number(e.target.value))} placeholder="أدخل أجر الساعة" className="text-right" dir="rtl" tabIndex={7} />
                    </div>}
                  
                  {workerType === 'shift' && <div className="space-y-2 text-right order-7">
                      <Label htmlFor="shiftRate" className="block text-right">أجر الشفت (شيكل)</Label>
                      <Input id="shiftRate" type="number" min="1" value={shiftRate || ''} onChange={e => setShiftRate(Number(e.target.value))} placeholder="أدخل أجر الشفت" className="text-right" dir="rtl" tabIndex={7} />
                    </div>}
                  
                  <div className="space-y-2 md:col-span-2 text-right order-8">
                    <Label htmlFor="notes" className="block text-right">ملاحظات (اختياري)</Label>
                    <Textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="أدخل أي ملاحظات إضافية" rows={3} className="text-right" dir="rtl" tabIndex={8} />
                  </div>
                </div>
                
                <div className="flex justify-start">
                  <Button type="submit" className="bg-olive-500 hover:bg-olive-600" tabIndex={9}>
                    <Plus className="ml-2 h-4 w-4" />
                    حفظ بيانات العامل
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Work Sessions Tab */}
        <TabsContent value="work-sessions" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-1">
              <CardHeader className="bg-olive-500 text-white text-right">
                <CardTitle className="text-right">تسجيل جلسة عمل</CardTitle>
                <CardDescription className="text-olive-50 text-right">
                  أدخل بيانات جلسة عمل جديدة
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <form onSubmit={handleAddShift} className="space-y-4">
                  <div className="space-y-2 text-right">
                    <Label htmlFor="worker" className="block text-right">اختر العامل</Label>
                    <Select value={selectedWorkerId} onValueChange={setSelectedWorkerId}>
                      <SelectTrigger id="worker" className="text-right" dir="rtl">
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
                  
                  <div className="space-y-2 text-right">
                    <Label htmlFor="sessionDate" className="block text-right">تاريخ العمل</Label>
                    <div className="flex items-center border rounded-md border-olive-300 px-3 py-2" dir="rtl">
                      <DatePicker date={sessionDate} setDate={setSessionDate} locale={ar} className="w-full text-right" />
                      <Calendar className="h-4 w-4 text-olive-500 mr-2" />
                    </div>
                  </div>
                  
                  {selectedWorkerId && workers.find(w => w.id === selectedWorkerId)?.type === 'hourly' && <>
                      <div className="grid grid-cols-2 gap-3" dir="rtl">
                        <div className="space-y-2 text-right order-1">
                          <Label htmlFor="startTime" className="block text-right">وقت البدء</Label>
                          <div className="flex items-center border rounded-md border-olive-300 px-3 py-2" dir="rtl">
                            <Input id="startTime" type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="border-0 p-0 focus-visible:ring-0 focus:outline-none text-right" dir="rtl" />
                            <Clock className="h-4 w-4 text-olive-500 mr-2" />
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-right order-2">
                          <Label htmlFor="endTime" className="block text-right">وقت الانتهاء</Label>
                          <div className="flex items-center border rounded-md border-olive-300 px-3 py-2" dir="rtl">
                            <Input id="endTime" type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="border-0 p-0 focus-visible:ring-0 focus:outline-none text-right" dir="rtl" />
                            <Clock className="h-4 w-4 text-olive-500 mr-2" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-right">
                        <Label htmlFor="hours" className="block text-right">عدد الساعات (محسوب تلقائياً)</Label>
                        <Input id="hours" type="number" min="0" step="0.5" disabled value={(() => {
                      if (startTime && endTime) {
                        const [startHour, startMin] = startTime.split(':').map(Number);
                        const [endHour, endMin] = endTime.split(':').map(Number);
                        return endHour - startHour + (endMin - startMin) / 60;
                      }
                      return 0;
                    })()} className="bg-olive-50 text-right" dir="rtl" />
                      </div>
                    </>}
                  
                  {selectedWorkerId && workers.find(w => w.id === selectedWorkerId)?.type === 'shift' && <div className="space-y-2 text-right">
                      <Label htmlFor="shifts" className="block text-right">عدد الشفتات</Label>
                      <Input id="shifts" type="number" min="1" value={shifts || ''} onChange={e => setShifts(Number(e.target.value))} className="text-right" dir="rtl" />
                    </div>}
                  
                  <div className="space-y-2 text-right">
                    <Label htmlFor="shiftNotes" className="block text-right">ملاحظات (اختياري)</Label>
                    <Textarea id="shiftNotes" value={shiftNotes} onChange={e => setShiftNotes(e.target.value)} placeholder="أدخل أي ملاحظات إضافية" rows={3} className="text-right" dir="rtl" />
                  </div>
                  
                  <Button type="submit" className="w-full">
                    تسجيل جلسة العمل
                  </Button>
                </form>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader className="bg-olive-100 text-right">
                <CardTitle className="text-right">آخر جلسات العمل</CardTitle>
                <CardDescription className="text-right">أحدث 5 جلسات عمل</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {workerShifts.length === 0 ? <div className="text-center py-8 text-gray-500">
                    <p>لا يوجد جلسات عمل مسجلة</p>
                  </div> : <div className="overflow-x-auto" dir="rtl">
                    <Table className="border-none">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-right">اسم العامل</TableHead>
                          <TableHead className="text-right">التاريخ</TableHead>
                          <TableHead className="text-right">التفاصيل</TableHead>
                          <TableHead className="text-right">المبلغ</TableHead>
                          <TableHead className="text-right">الحالة</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getRecentShifts().map(shift => {
                      const worker = workers.find(w => w.id === shift.workerId) as ExtendedWorker;
                      return <TableRow key={shift.id}>
                              <TableCell className="font-medium text-right">{worker?.name}</TableCell>
                              <TableCell className="text-right">{formatDate(shift.date)}</TableCell>
                              <TableCell className="text-right">
                                {shift.hours !== undefined ? `${shift.hours} ساعة` : `${shift.shifts} شفت`}
                              </TableCell>
                              <TableCell className="text-right">{shift.amount} شيكل</TableCell>
                              <TableCell className="text-right">
                                {shift.isPaid ? <span className="text-green-600 flex items-center gap-1 justify-end">
                                    تم الدفع
                                    <CheckCircle className="h-4 w-4 ml-1" />
                                  </span> : <span className="text-amber-600 flex items-center gap-1 justify-end">
                                    معلق
                                    <Clock className="h-4 w-4 ml-1" />
                                  </span>}
                              </TableCell>
                            </TableRow>;
                    })}
                      </TableBody>
                    </Table>
                  </div>}
              </CardContent>
            </Card>
            
            <Card className="md:col-span-3">
              <CardHeader className="bg-olive-100 text-right">
                <CardTitle className="text-right">جميع جلسات العمل</CardTitle>
                <CardDescription className="text-right">سجل كامل لجميع جلسات العمل</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {workerShifts.length === 0 ? <div className="text-center py-8 text-gray-500">
                    <p>لا يوجد جلسات عمل مسجلة</p>
                  </div> : <div className="max-h-[500px] overflow-y-auto" dir="rtl">
                    <Table className="border-none">
                      <TableHeader className="sticky top-0 bg-white">
                        <TableRow>
                          <TableHead className="text-right">اسم العامل</TableHead>
                          <TableHead className="text-right">التاريخ</TableHead>
                          <TableHead className="text-right">التفاصيل</TableHead>
                          <TableHead className="text-right">نوع العمل</TableHead>
                          <TableHead className="text-right">المبلغ</TableHead>
                          <TableHead className="text-right">الحالة</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {[...workerShifts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(shift => {
                      const worker = workers.find(w => w.id === shift.workerId) as ExtendedWorker;
                      return <TableRow key={shift.id}>
                                <TableCell className="font-medium text-right">{worker?.name}</TableCell>
                                <TableCell className="text-right">{formatDate(shift.date)}</TableCell>
                                <TableCell className="text-right">
                                  {shift.hours !== undefined ? `${shift.hours} ساعة` : `${shift.shifts} شفت`}
                                </TableCell>
                                <TableCell className="text-right">
                                  {worker?.type === 'hourly' ? 'بالساعة' : 'بالشفت'}
                                </TableCell>
                                <TableCell className="text-right">{shift.amount} شيكل</TableCell>
                                <TableCell className="text-right">
                                  {shift.isPaid ? <span className="text-green-600 flex items-center gap-1 justify-end">
                                      تم الدفع
                                      <CheckCircle className="h-4 w-4 ml-1" />
                                    </span> : <span className="text-amber-600 flex items-center gap-1 justify-end">
                                      معلق
                                      <Clock className="h-4 w-4 ml-1" />
                                    </span>}
                                </TableCell>
                              </TableRow>;
                    })}
                      </TableBody>
                    </Table>
                  </div>}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="salary-payments" className="space-y-6">
          <Card>
            <CardHeader className="bg-olive-500 text-white text-right">
              <CardTitle className="text-right">سجل المدفوعات</CardTitle>
              <CardDescription className="text-olive-50 text-right">
                سجل مدفوعات العمال
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto" dir="rtl">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">اسم العامل</TableHead>
                      <TableHead className="text-right">إجمالي المستحقات</TableHead>
                      <TableHead className="text-right">إجمالي المدفوعات</TableHead>
                      <TableHead className="text-right">المبلغ المتبقي</TableHead>
                      <TableHead className="text-right">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workers.length === 0 ? <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          لا يوجد عمال مسجلين
                        </TableCell>
                      </TableRow> : workers.map(worker => {
                    const w = worker as ExtendedWorker;
                    const totalDue = getWorkerTotalDue(worker.id);
                    const totalPaid = getWorkerPaidAmount(worker.id);
                    const balance = getWorkerBalance(worker.id);
                    return <TableRow key={worker.id}>
                            <TableCell className="font-medium text-right">{worker.name}</TableCell>
                            <TableCell className="text-right">{totalDue} شيكل</TableCell>
                            <TableCell className="text-right">{totalPaid} شيكل</TableCell>
                            <TableCell className={`text-right ${balance > 0 ? 'text-red-600 font-bold' : 'text-green-600'}`}>
                              {balance} شيكل
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={() => openPaymentDialog(w)} disabled={balance <= 0}>
                                دفع الراتب
                                <DollarSign className="h-4 w-4 ml-1" />
                              </Button>
                            </TableCell>
                          </TableRow>;
                  })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-[500px]" dir="rtl">
          <DialogHeader className="text-right">
            <DialogTitle className="text-right">تسجيل دفعة جديدة</DialogTitle>
            <DialogDescription className="text-right">
              {selectedPaymentWorker && <>
                  <p className="text-lg font-bold mt-2 text-right">اسم العامل: {selectedPaymentWorker.name}</p>
                  <p className="text-right">المبلغ المستحق: {getWorkerBalance(selectedPaymentWorker.id)} شيكل</p>
                </>}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2 text-right">
              <Label htmlFor="paymentAmount" className="text-right block">المبلغ المراد دفعه (شيكل)</Label>
              <Input id="paymentAmount" type="number" min="0" className="text-right" value={paymentAmount} onChange={e => setPaymentAmount(Number(e.target.value))} dir="rtl" />
            </div>
            
            <div className="space-y-2 text-right">
              <Label htmlFor="paymentNotes" className="text-right block">ملاحظات (اختياري)</Label>
              <Textarea id="paymentNotes" className="text-right" placeholder="أي ملاحظات خاصة بالدفعة..." value={paymentNotes} onChange={e => setPaymentNotes(e.target.value)} dir="rtl" />
            </div>
          </div>
          
          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
              إلغاء
            </Button>
            <Button type="submit" className="bg-olive-600 hover:bg-olive-700" onClick={handleAddPayment}>
              تأكيد الدفع
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>;
};
export default WorkersManagement;