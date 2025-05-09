
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DatePicker } from '@/components/ui/date-picker';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useMillContext } from '@/context/MillContext';
import { Worker, WorkerShift, WorkerPayment, WorkerType } from '@/types';
import { toast } from 'sonner';
import { Search, Plus, Edit, DollarSign, Clock, Calendar, User, Briefcase, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

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
  const [selectedPaymentWorker, setSelectedPaymentWorker] = useState<Worker | null>(null);

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
    });

    // Reset form
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
    const worker = workers.find(w => w.id === selectedWorkerId);
    if (!worker) {
      toast.error('العامل غير موجود');
      return;
    }
    
    // Calculate hours if hourly worker
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
    
    const amount = worker.type === 'hourly' 
      ? (worker.hourlyRate || 0) * calculatedHours 
      : (worker.shiftRate || 0) * shifts;
    
    addWorkerShift({
      workerId: selectedWorkerId,
      date: sessionDate,
      hours: worker.type === 'hourly' ? calculatedHours : undefined,
      shifts: worker.type === 'shift' ? shifts : undefined,
      amount,
      isPaid: false,
      notes: shiftNotes.trim() !== '' ? shiftNotes : undefined,
    });

    // Reset form
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

    // Reset form
    setPaymentWorkerId('');
    setPaymentAmount(0);
    setPaymentNotes('');
    setSelectedPaymentWorker(null);
    setShowPaymentDialog(false);
    toast.success('تم تسجيل الدفعة بنجاح');
  };
  
  const openPaymentDialog = (worker: Worker) => {
    setSelectedPaymentWorker(worker);
    setPaymentAmount(getWorkerBalance(worker.id));
    setShowPaymentDialog(true);
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
  
  const getWorkerPaidAmount = (workerId: string) => {
    return workerPayments
      .filter(payment => payment.workerId === workerId)
      .reduce((sum, payment) => sum + payment.amount, 0);
  };
  
  const getWorkerTotalDue = (workerId: string) => {
    return workerShifts
      .filter(shift => shift.workerId === workerId)
      .reduce((sum, shift) => sum + shift.amount, 0);
  };
  
  const formatDate = (date: Date) => {
    return format(new Date(date), 'dd MMM yyyy', { locale: ar });
  };
  
  const filteredWorkers = workers.filter(worker => 
    worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (worker.jobTitle && worker.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  const getRecentShifts = () => {
    return [...workerShifts]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  };

  return (
    <div className="space-y-6" dir="rtl">
      <h2 className="text-2xl font-bold text-right">إدارة العمال</h2>
      
      <Tabs defaultValue="worker-list" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="worker-list">قائمة العمال</TabsTrigger>
          <TabsTrigger value="add-worker">إضافة عامل</TabsTrigger>
          <TabsTrigger value="work-sessions">جلسات العمل</TabsTrigger>
          <TabsTrigger value="salary-payments">سجل المدفوعات</TabsTrigger>
        </TabsList>
        
        {/* Workers List Tab */}
        <TabsContent value="worker-list" className="space-y-6">
          <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:space-y-0">
            <div className="relative w-full md:w-1/3">
              <Search className="absolute right-2 top-3 h-4 w-4 text-gray-400" />
              <Input 
                className="pr-8 text-right" 
                placeholder="بحث عن اسم العامل أو المسمى الوظيفي..." 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)} 
              />
            </div>
          </div>
          
          {filteredWorkers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>لا يوجد عمال مسجلين</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredWorkers.map(worker => {
                const balance = getWorkerBalance(worker.id);
                return (
                  <Card key={worker.id} className="border border-olive-200 hover:shadow-md transition-shadow">
                    <CardHeader className={`bg-olive-50 ${worker.isActive ? 'border-r-4 border-olive-500' : 'border-r-4 border-red-500'}`}>
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg text-olive-900">{worker.name}</CardTitle>
                        <div className={`text-xs font-semibold px-2 py-1 rounded ${worker.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {worker.isActive ? 'نشط' : 'غير نشط'}
                        </div>
                      </div>
                      <CardDescription className="text-olive-700">
                        <div className="flex items-center gap-1">
                          <Briefcase className="h-4 w-4" />
                          <span>{worker.jobTitle || 'عامل'}</span>
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="space-y-3 text-right">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-sm text-olive-600">نوع العمل:</p>
                            <p className="font-semibold text-olive-900">
                              {worker.type === 'hourly' ? 'بالساعة' : 'بالشفت'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-olive-600">الأجر:</p>
                            <p className="font-semibold text-olive-900">
                              {worker.type === 'hourly' 
                                ? `${worker.hourlyRate} شيكل/ساعة` 
                                : `${worker.shiftRate} شيكل/شفت`}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-olive-600">تاريخ التوظيف:</p>
                            <p className="font-semibold text-olive-900">{formatDate(worker.createdAt)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-olive-600">المستحقات:</p>
                            <p className={`font-bold ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {balance} شيكل
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t border-olive-100 pt-3">
                      <Link to={`/workers/${worker.id}`}>
                        <Button variant="outline" size="sm" className="flex items-center gap-1">
                          <Edit className="h-4 w-4 ml-1" />
                          تعديل
                        </Button>
                      </Link>
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="flex items-center gap-1"
                        onClick={() => openPaymentDialog(worker)}
                        disabled={balance <= 0}
                      >
                        <DollarSign className="h-4 w-4 ml-1" />
                        دفع الراتب
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
        
        {/* Add Worker Tab */}
        <TabsContent value="add-worker" className="space-y-6">
          <Card>
            <CardHeader className="bg-olive-500 text-white">
              <CardTitle className="text-right">إضافة عامل جديد</CardTitle>
              <CardDescription className="text-olive-50 text-right">
                أدخل بيانات العامل الجديد
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleAddWorker} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="block text-right">اسم العامل الكامل</Label>
                    <Input 
                      id="name" 
                      value={name} 
                      onChange={e => setName(e.target.value)} 
                      placeholder="أدخل اسم العامل" 
                      className="text-right"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="jobTitle" className="block text-right">المسمى الوظيفي</Label>
                    <Input 
                      id="jobTitle" 
                      value={jobTitle} 
                      onChange={e => setJobTitle(e.target.value)} 
                      placeholder="مثال: عامل معصرة" 
                      className="text-right"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber" className="block text-right">رقم الهاتف (اختياري)</Label>
                    <Input 
                      id="phoneNumber" 
                      value={phoneNumber} 
                      onChange={e => setPhoneNumber(e.target.value)} 
                      placeholder="أدخل رقم الهاتف" 
                      className="text-right"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="hireDate" className="block text-right">تاريخ التوظيف</Label>
                    <div className="flex items-center border rounded-md border-olive-300 px-3 py-2">
                      <DatePicker
                        date={hireDate}
                        setDate={setHireDate}
                        locale={ar}
                        className="w-full"
                      />
                      <Calendar className="h-4 w-4 text-olive-500 mr-2" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="workerType" className="block text-right">نوع العامل</Label>
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
                  
                  {workerType === 'hourly' && (
                    <div className="space-y-2">
                      <Label htmlFor="hourlyRate" className="block text-right">أجر الساعة (شيكل)</Label>
                      <Input 
                        id="hourlyRate" 
                        type="number" 
                        min="1" 
                        value={hourlyRate || ''} 
                        onChange={e => setHourlyRate(Number(e.target.value))} 
                        placeholder="أدخل أجر الساعة" 
                        className="text-right"
                      />
                    </div>
                  )}
                  
                  {workerType === 'shift' && (
                    <div className="space-y-2">
                      <Label htmlFor="shiftRate" className="block text-right">أجر الشفت (شيكل)</Label>
                      <Input 
                        id="shiftRate" 
                        type="number" 
                        min="1" 
                        value={shiftRate || ''} 
                        onChange={e => setShiftRate(Number(e.target.value))} 
                        placeholder="أدخل أجر الشفت" 
                        className="text-right"
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="isActive" className="block text-right">حالة العامل</Label>
                    <Select value={isActive ? "active" : "inactive"} onValueChange={(value) => setIsActive(value === "active")}>
                      <SelectTrigger id="isActive" className="text-right">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">نشط</SelectItem>
                        <SelectItem value="inactive">غير نشط</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="notes" className="block text-right">ملاحظات (اختياري)</Label>
                    <Textarea 
                      id="notes" 
                      value={notes} 
                      onChange={e => setNotes(e.target.value)} 
                      placeholder="أدخل أي ملاحظات إضافية" 
                      rows={3} 
                      className="text-right"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button type="submit" className="bg-olive-500 hover:bg-olive-600">
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
            {/* Add Work Session Form */}
            <Card className="md:col-span-1">
              <CardHeader className="bg-olive-500 text-white text-right">
                <CardTitle>تسجيل جلسة عمل</CardTitle>
                <CardDescription className="text-olive-50">
                  أدخل بيانات جلسة عمل جديدة
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <form onSubmit={handleAddShift} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="worker" className="block text-right">اختر العامل</Label>
                    <Select value={selectedWorkerId} onValueChange={setSelectedWorkerId}>
                      <SelectTrigger id="worker" className="text-right">
                        <SelectValue placeholder="اختر عامل" />
                      </SelectTrigger>
                      <SelectContent>
                        {workers.length === 0 ? (
                          <SelectItem value="empty" disabled>
                            لا يوجد عمال
                          </SelectItem>
                        ) : (
                          workers.map(worker => (
                            <SelectItem key={worker.id} value={worker.id}>
                              {worker.name} ({worker.type === 'hourly' ? 'بالساعة' : 'بالشفت'})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sessionDate" className="block text-right">تاريخ العمل</Label>
                    <div className="flex items-center border rounded-md border-olive-300 px-3 py-2">
                      <DatePicker
                        date={sessionDate}
                        setDate={setSessionDate}
                        locale={ar}
                        className="w-full"
                      />
                      <Calendar className="h-4 w-4 text-olive-500 mr-2" />
                    </div>
                  </div>
                  
                  {selectedWorkerId && workers.find(w => w.id === selectedWorkerId)?.type === 'hourly' && (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="startTime" className="block text-right">وقت البدء</Label>
                          <div className="flex items-center border rounded-md border-olive-300 px-3 py-2">
                            <Input
                              id="startTime"
                              type="time"
                              value={startTime}
                              onChange={e => setStartTime(e.target.value)}
                              className="border-0 p-0 focus-visible:ring-0 focus:outline-none text-right"
                            />
                            <Clock className="h-4 w-4 text-olive-500 mr-2" />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="endTime" className="block text-right">وقت الانتهاء</Label>
                          <div className="flex items-center border rounded-md border-olive-300 px-3 py-2">
                            <Input
                              id="endTime"
                              type="time"
                              value={endTime}
                              onChange={e => setEndTime(e.target.value)}
                              className="border-0 p-0 focus-visible:ring-0 focus:outline-none text-right"
                            />
                            <Clock className="h-4 w-4 text-olive-500 mr-2" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="hours" className="block text-right">عدد الساعات (محسوب تلقائياً)</Label>
                        <Input
                          id="hours"
                          type="number"
                          min="0"
                          step="0.5"
                          disabled
                          value={(() => {
                            if (startTime && endTime) {
                              const [startHour, startMin] = startTime.split(':').map(Number);
                              const [endHour, endMin] = endTime.split(':').map(Number);
                              return endHour - startHour + (endMin - startMin) / 60;
                            }
                            return 0;
                          })()}
                          className="bg-olive-50 text-right"
                        />
                      </div>
                    </>
                  )}
                  
                  {selectedWorkerId && workers.find(w => w.id === selectedWorkerId)?.type === 'shift' && (
                    <div className="space-y-2">
                      <Label htmlFor="shifts" className="block text-right">عدد الشفتات</Label>
                      <Input
                        id="shifts"
                        type="number"
                        min="1"
                        value={shifts || ''}
                        onChange={e => setShifts(Number(e.target.value))}
                        className="text-right"
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="shiftNotes" className="block text-right">ملاحظات (اختياري)</Label>
                    <Textarea
                      id="shiftNotes"
                      value={shiftNotes}
                      onChange={e => setShiftNotes(e.target.value)}
                      placeholder="أدخل أي ملاحظات إضافية"
                      rows={3}
                      className="text-right"
                    />
                  </div>
                  
                  <Button type="submit" className="w-full">
                    تسجيل جلسة العمل
                  </Button>
                </form>
              </CardContent>
            </Card>
            
            {/* Recent Work Sessions */}
            <Card className="md:col-span-2">
              <CardHeader className="bg-olive-100 text-right">
                <CardTitle>آخر جلسات العمل</CardTitle>
                <CardDescription>أحدث 5 جلسات عمل</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {workerShifts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>لا يوجد جلسات عمل مسجلة</p>
                  </div>
                ) : (
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
                        const worker = workers.find(w => w.id === shift.workerId);
                        return (
                          <TableRow key={shift.id}>
                            <TableCell className="font-medium text-right">{worker?.name}</TableCell>
                            <TableCell className="text-right">{formatDate(shift.date)}</TableCell>
                            <TableCell className="text-right">
                              {shift.hours !== undefined
                                ? `${shift.hours} ساعة`
                                : `${shift.shifts} شفت`}
                            </TableCell>
                            <TableCell className="text-right">{shift.amount} شيكل</TableCell>
                            <TableCell className="text-right">
                              {shift.isPaid ? (
                                <span className="text-green-600 flex items-center gap-1">
                                  <CheckCircle className="h-4 w-4 ml-1" />
                                  تم الدفع
                                </span>
                              ) : (
                                <span className="text-amber-600 flex items-center gap-1">
                                  <Clock className="h-4 w-4 ml-1" />
                                  معلق
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
            
            {/* All Work Sessions */}
            <Card className="md:col-span-3">
              <CardHeader className="bg-olive-100 text-right">
                <CardTitle>جميع جلسات العمل</CardTitle>
                <CardDescription>سجل كامل لجميع جلسات العمل</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {workerShifts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>لا يوجد جلسات عمل مسجلة</p>
                  </div>
                ) : (
                  <div className="max-h-[500px] overflow-y-auto">
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
                        {[...workerShifts]
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .map(shift => {
                            const worker = workers.find(w => w.id === shift.workerId);
                            return (
                              <TableRow key={shift.id}>
                                <TableCell className="font-medium text-right">{worker?.name}</TableCell>
                                <TableCell className="text-right">{formatDate(shift.date)}</TableCell>
                                <TableCell className="text-right">
                                  {shift.hours !== undefined
                                    ? `${shift.hours} ساعة`
                                    : `${shift.shifts} شفت`}
                                </TableCell>
                                <TableCell className="text-right">
                                  {worker?.type === 'hourly' ? 'بالساعة' : 'بالشفت'}
                                </TableCell>
                                <TableCell className="text-right">{shift.amount} شيكل</TableCell>
                                <TableCell className="text-right">
                                  {shift.isPaid ? (
                                    <span className="text-green-600 flex items-center gap-1">
                                      <CheckCircle className="h-4 w-4 ml-1" />
                                      تم الدفع
                                    </span>
                                  ) : (
                                    <span className="text-amber-600 flex items-center gap-1">
                                      <Clock className="h-4 w-4 ml-1" />
                                      معلق
                                    </span>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Salary Payments Tab */}
        <TabsContent value="salary-payments" className="space-y-6">
          <Card>
            <CardHeader className="bg-olive-500 text-white text-right">
              <CardTitle>سجل المدفوعات</CardTitle>
              <CardDescription className="text-olive-50">
                سجل مدفوعات العمال
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
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
                  {workers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        لا يوجد عمال مسجلين
                      </TableCell>
                    </TableRow>
                  ) : (
                    workers.map(worker => {
                      const totalDue = getWorkerTotalDue(worker.id);
                      const totalPaid = getWorkerPaidAmount(worker.id);
                      const balance = getWorkerBalance(worker.id);
                      return (
                        <TableRow key={worker.id}>
                          <TableCell className="font-medium text-right">{worker.name}</TableCell>
                          <TableCell className="text-right">{totalDue} شيكل</TableCell>
                          <TableCell className="text-right">{totalPaid} شيكل</TableCell>
                          <TableCell className={`text-right ${balance > 0 ? 'text-red-600 font-bold' : 'text-green-600'}`}>
                            {balance} شيكل
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex items-center gap-1" 
                              onClick={() => openPaymentDialog(worker)}
                              disabled={balance <= 0}
                            >
                              <DollarSign className="h-4 w-4 ml-1" />
                              دفع الراتب
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="bg-olive-100 text-right">
              <CardTitle>سجل الدفعات السابقة</CardTitle>
              <CardDescription>تاريخ جميع الدفعات</CardDescription>
            </CardHeader>
            <CardContent className="p-0 max-h-[500px] overflow-y-auto">
              {workerPayments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>لا يوجد دفعات مسجلة</p>
                </div>
              ) : (
                <Table>
                  <TableHeader className="sticky top-0 bg-white">
                    <TableRow>
                      <TableHead className="text-right">اسم العامل</TableHead>
                      <TableHead className="text-right">التاريخ</TableHead>
                      <TableHead className="text-right">المبلغ</TableHead>
                      <TableHead className="text-right">ملاحظات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...workerPayments]
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map(payment => {
                        const worker = workers.find(w => w.id === payment.workerId);
                        return (
                          <TableRow key={payment.id}>
                            <TableCell className="font-medium text-right">{worker?.name}</TableCell>
                            <TableCell className="text-right">{formatDate(payment.date)}</TableCell>
                            <TableCell className="text-right">{payment.amount} شيكل</TableCell>
                            <TableCell className="text-right">{payment.notes || '-'}</TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-right">دفع الراتب</DialogTitle>
            <DialogDescription className="text-right">
              تسجيل دفعة جديدة للعامل {selectedPaymentWorker?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="paymentAmount" className="text-right col-span-1">
                المبلغ
              </Label>
              <div className="col-span-3">
                <Input
                  id="paymentAmount"
                  type="number"
                  min="1"
                  max={selectedPaymentWorker ? getWorkerBalance(selectedPaymentWorker.id) : 0}
                  value={paymentAmount || ''}
                  onChange={e => setPaymentAmount(Number(e.target.value))}
                  className="text-right"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="paymentNotes" className="text-right col-span-1">
                ملاحظات
              </Label>
              <div className="col-span-3">
                <Textarea
                  id="paymentNotes"
                  value={paymentNotes}
                  onChange={e => setPaymentNotes(e.target.value)}
                  className="text-right"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="flex flex-row-reverse justify-start gap-2">
            <Button type="button" variant="outline" onClick={() => setShowPaymentDialog(false)}>
              إلغاء
            </Button>
            <Button type="button" onClick={handleAddPayment}>
              <DollarSign className="ml-2 h-4 w-4" />
              تأكيد الدفع
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkersManagement;
