
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useMillContext } from '@/context/MillContext';
import { Worker, WorkerShift, WorkerPayment, WorkerType } from '@/types';
import { toast } from 'sonner';
import { DollarSign, Printer, Edit, Calendar, User, ArrowLeft } from 'lucide-react';

const WorkerDetails: React.FC = () => {
  const { workerId } = useParams<{ workerId: string }>();
  const navigate = useNavigate();
  const { 
    workers, 
    updateWorker, 
    removeWorker, 
    workerShifts, 
    addWorkerShift,
    updateWorkerShift,
    workerPayments, 
    addWorkerPayment 
  } = useMillContext();

  const [worker, setWorker] = useState<Worker | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  
  // Edit form state
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [workerType, setWorkerType] = useState<WorkerType>('hourly');
  const [hourlyRate, setHourlyRate] = useState(0);
  const [shiftRate, setShiftRate] = useState(0);
  const [notes, setNotes] = useState('');

  // Payment form state
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentNotes, setPaymentNotes] = useState('');
  
  // Shift recording state
  const [isAddingShift, setIsAddingShift] = useState(false);
  const [hours, setHours] = useState(0);
  const [shifts, setShifts] = useState(0);
  const [shiftNotes, setShiftNotes] = useState('');

  useEffect(() => {
    if (workerId) {
      const foundWorker = workers.find(w => w.id === workerId);
      if (foundWorker) {
        setWorker(foundWorker);
        
        // Initialize edit form
        setName(foundWorker.name);
        setPhoneNumber(foundWorker.phoneNumber || '');
        setWorkerType(foundWorker.type);
        setHourlyRate(foundWorker.hourlyRate || 0);
        setShiftRate(foundWorker.shiftRate || 0);
        setNotes(foundWorker.notes || '');
      } else {
        toast.error('العامل غير موجود');
        navigate('/workers');
      }
    }
  }, [workerId, workers, navigate]);

  if (!worker) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-xl">جاري التحميل...</p>
      </div>
    );
  }

  const workerShiftsList = workerShifts.filter(shift => shift.workerId === worker.id);
  const workerPaymentsList = workerPayments.filter(payment => payment.workerId === worker.id);

  const totalEarnings = workerShiftsList.reduce((sum, shift) => sum + shift.amount, 0);
  const totalPaid = workerPaymentsList.reduce((sum, payment) => sum + payment.amount, 0);
  const balance = totalEarnings - totalPaid;

  const handleUpdateWorker = (e: React.FormEvent) => {
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
    
    const updatedWorker = updateWorker(worker.id, {
      name: name.trim(),
      phoneNumber: phoneNumber.trim() !== '' ? phoneNumber : undefined,
      type: workerType,
      hourlyRate: workerType === 'hourly' ? hourlyRate : undefined,
      shiftRate: workerType === 'shift' ? shiftRate : undefined,
      notes: notes.trim() !== '' ? notes : undefined,
    });
    
    setWorker(updatedWorker);
    setIsEditing(false);
    toast.success('تم تحديث بيانات العامل بنجاح');
  };

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (paymentAmount <= 0) {
      toast.error('الرجاء إدخال مبلغ صحيح');
      return;
    }
    
    addWorkerPayment({
      workerId: worker.id,
      date: new Date(),
      amount: paymentAmount,
      notes: paymentNotes.trim() !== '' ? paymentNotes : undefined,
    });
    
    setPaymentAmount(0);
    setPaymentNotes('');
    setIsAddingPayment(false);
    
    toast.success('تم تسجيل الدفعة بنجاح');
  };

  const handleAddShift = (e: React.FormEvent) => {
    e.preventDefault();
    
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
      workerId: worker.id,
      date: new Date(),
      hours: worker.type === 'hourly' ? hours : undefined,
      shifts: worker.type === 'shift' ? shifts : undefined,
      amount,
      isPaid: false,
      notes: shiftNotes.trim() !== '' ? shiftNotes : undefined,
    });
    
    setHours(0);
    setShifts(0);
    setShiftNotes('');
    setIsAddingShift(false);
    
    toast.success('تم تسجيل الشفت بنجاح');
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
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={() => navigate('/workers')}>
          <ArrowLeft className="ml-2 h-4 w-4" />
          العودة إلى العمال
        </Button>
        <h2 className="text-2xl font-bold">بيانات العامل: {worker.name}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Worker Summary Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="bg-blue-600 text-white font-bold pb-2">
            <div className="flex justify-between items-center">
              <h3 className="text-lg">ملخص العامل</h3>
              <User className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <span className="font-semibold block">الاسم:</span> 
                <span className="text-lg">{worker.name}</span>
              </div>
              
              {worker.phoneNumber && (
                <div>
                  <span className="font-semibold block">رقم الهاتف:</span>
                  <span>{worker.phoneNumber}</span>
                </div>
              )}
              
              <div>
                <span className="font-semibold block">نوع العامل:</span>
                <span>{worker.type === 'hourly' ? 'عامل بالساعة' : 'عامل بالشفت'}</span>
              </div>
              
              {worker.type === 'hourly' && worker.hourlyRate && (
                <div>
                  <span className="font-semibold block">أجر الساعة:</span>
                  <span>{worker.hourlyRate} شيكل</span>
                </div>
              )}
              
              {worker.type === 'shift' && worker.shiftRate && (
                <div>
                  <span className="font-semibold block">أجر الشفت:</span>
                  <span>{worker.shiftRate} شيكل</span>
                </div>
              )}
              
              <div className="pt-4 border-t">
                <span className="font-semibold block">إجمالي المستحقات:</span>
                <span className="text-lg">{totalEarnings} شيكل</span>
              </div>
              
              <div>
                <span className="font-semibold block">إجمالي المدفوعات:</span>
                <span className="text-lg">{totalPaid} شيكل</span>
              </div>
              
              <div className="pt-2">
                <span className="font-semibold block">المتبقي:</span>
                <span className={`text-xl font-bold ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {balance} شيكل
                </span>
              </div>
              
              {worker.notes && (
                <div className="pt-4 border-t">
                  <span className="font-semibold block">ملاحظات:</span>
                  <p className="bg-gray-50 p-2 rounded mt-1">{worker.notes}</p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="ml-2 h-4 w-4" />
              تعديل بيانات العامل
            </Button>
            
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => window.print()}
            >
              <Printer className="ml-2 h-4 w-4" />
              طباعة كشف العامل
            </Button>
          </CardFooter>
        </Card>
        
        <div className="lg:col-span-2">
          <Tabs defaultValue="shifts" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="shifts">سجل العمل</TabsTrigger>
              <TabsTrigger value="payments">سجل الدفعات</TabsTrigger>
            </TabsList>
            
            {/* Shifts Tab */}
            <TabsContent value="shifts" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg">سجل العمل</h3>
                <Button 
                  onClick={() => setIsAddingShift(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Calendar className="ml-2 h-4 w-4" />
                  إضافة شفت جديد
                </Button>
              </div>
              
              {isAddingShift ? (
                <Card>
                  <CardHeader className="bg-green-600 text-white font-bold pb-2">
                    <h3 className="text-lg">إضافة شفت جديد</h3>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <form onSubmit={handleAddShift} className="space-y-4">
                      {worker.type === 'hourly' && (
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
                      
                      {worker.type === 'shift' && (
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
                          rows={2}
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
                          حفظ
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => setIsAddingShift(false)}
                        >
                          إلغاء
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              ) : null}
              
              {workerShiftsList.length === 0 ? (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-md">
                  <p>لا يوجد شفتات مسجلة لهذا العامل</p>
                </div>
              ) : (
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">التاريخ</TableHead>
                        {worker.type === 'hourly' ? (
                          <TableHead className="text-right">الساعات</TableHead>
                        ) : (
                          <TableHead className="text-right">الشفتات</TableHead>
                        )}
                        <TableHead className="text-right">المبلغ</TableHead>
                        <TableHead className="text-right">ملاحظات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {workerShiftsList.map((shift) => (
                        <TableRow key={shift.id}>
                          <TableCell>{formatDate(shift.date)}</TableCell>
                          <TableCell>
                            {worker.type === 'hourly' 
                              ? `${shift.hours} ساعة` 
                              : `${shift.shifts} شفت`
                            }
                          </TableCell>
                          <TableCell>{shift.amount} شيكل</TableCell>
                          <TableCell>{shift.notes || '-'}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-gray-50 font-semibold">
                        <TableCell colSpan={2} className="text-left">المجموع</TableCell>
                        <TableCell>{totalEarnings} شيكل</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
            
            {/* Payments Tab */}
            <TabsContent value="payments" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg">سجل الدفعات</h3>
                <Button 
                  onClick={() => setIsAddingPayment(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <DollarSign className="ml-2 h-4 w-4" />
                  إضافة دفعة جديدة
                </Button>
              </div>
              
              {isAddingPayment ? (
                <Card>
                  <CardHeader className="bg-green-600 text-white font-bold pb-2">
                    <h3 className="text-lg">إضافة دفعة جديدة</h3>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <form onSubmit={handleAddPayment} className="space-y-4">
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
                          rows={2}
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
                          حفظ
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => setIsAddingPayment(false)}
                        >
                          إلغاء
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              ) : null}
              
              {workerPaymentsList.length === 0 ? (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-md">
                  <p>لا يوجد دفعات مسجلة لهذا العامل</p>
                </div>
              ) : (
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">التاريخ</TableHead>
                        <TableHead className="text-right">المبلغ</TableHead>
                        <TableHead className="text-right">ملاحظات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {workerPaymentsList.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>{formatDate(payment.date)}</TableCell>
                          <TableCell>{payment.amount} شيكل</TableCell>
                          <TableCell>{payment.notes || '-'}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-gray-50 font-semibold">
                        <TableCell className="text-left">المجموع</TableCell>
                        <TableCell>{totalPaid} شيكل</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              )}
              
              <div className="mt-4 p-4 border rounded-md bg-gray-50">
                <div className="flex justify-between text-lg">
                  <span className="font-bold">المتبقي:</span>
                  <span className={balance > 0 ? 'text-red-600 font-bold' : 'text-green-600 font-bold'}>
                    {balance} شيكل
                  </span>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Edit Worker Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="bg-blue-600 text-white font-bold pb-2">
              <h3 className="text-lg">تعديل بيانات العامل</h3>
            </CardHeader>
            <CardContent className="pt-4">
              <form onSubmit={handleUpdateWorker} className="space-y-4">
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
                  <div className="pt-2">
                    <RadioGroup 
                      value={workerType} 
                      onValueChange={(value: WorkerType) => setWorkerType(value)}
                      className="flex space-x-4 space-x-reverse"
                    >
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <RadioGroupItem value="hourly" id="hourly" />
                        <Label htmlFor="hourly">عامل بالساعة</Label>
                      </div>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <RadioGroupItem value="shift" id="shift" />
                        <Label htmlFor="shift">عامل بالشفت</Label>
                      </div>
                    </RadioGroup>
                  </div>
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
                
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    حفظ التعديلات
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setIsEditing(false)}
                  >
                    إلغاء
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default WorkerDetails;
