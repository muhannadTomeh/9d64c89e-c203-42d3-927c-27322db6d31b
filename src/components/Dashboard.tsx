import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { useMillContext } from '@/context/MillContext';
const Dashboard: React.FC = () => {
  const {
    settings,
    customers,
    invoices,
    getStatistics
  } = useMillContext();

  // Get queue customers (pending status)
  const queueCustomers = customers.filter(c => c.status === 'pending');

  // Get today's date without time to compare with invoices
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get today's invoices
  const todayInvoices = invoices.filter(invoice => {
    const invoiceDate = new Date(invoice.date);
    invoiceDate.setHours(0, 0, 0, 0);
    return invoiceDate.getTime() === today.getTime();
  });

  // Calculate today's totals
  const todayOilTotal = todayInvoices.reduce((sum, invoice) => sum + invoice.oilAmount, 0);
  const todayCashTotal = todayInvoices.reduce((sum, invoice) => sum + invoice.total.cash, 0);
  const todayOilPaymentTotal = todayInvoices.reduce((sum, invoice) => sum + invoice.total.oil, 0);
  const totalCustomersCount = customers.length;

  // Get overall statistics
  const stats = getStatistics();
  return <div className="space-y-6 font-arabic text-right">
      <div className="flex justify-between items-center border-b pb-4 mb-6">
        <p className="text-olive-600 font-medium">
          {new Date().toLocaleDateString('ar-EG', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
        </p>
        <h2 className="text-2xl font-bold text-olive-800">لوحة التحكم</h2>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="bg-white border-2 border-primary hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <h3 className="text-lg font-bold mb-2 text-primary">الزبائن في الطابور</h3>
            <p className="text-3xl font-bold text-primary">{queueCustomers.length}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-2 border-olive-600 hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <h3 className="text-lg font-bold mb-2 text-olive-600">زيت اليوم</h3>
            <p className="text-3xl font-bold text-olive-600">{todayOilTotal.toFixed(2)} كغم</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-2 border-sand-600 hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <h3 className="text-lg font-bold mb-2 text-sand-600">الزيت الكلي</h3>
            <p className="text-3xl font-bold text-sand-600">{stats.totalOilProduced.toFixed(2)} كغم</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-2 border-green-600 hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <h3 className="text-lg font-bold mb-2 text-green-600">المخزون الحالي</h3>
            <p className="text-3xl font-bold text-green-600">{stats.currentOilStock.toFixed(2)} كغم</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-2 border-blue-600 hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <h3 className="text-lg font-bold mb-2 text-blue-600">الكاش الحالي</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.currentCash.toFixed(2)} ₪</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-2 border-red-600 hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <h3 className="text-lg font-bold mb-2 text-red-600">إجمالي المصاريف</h3>
            <p className="text-3xl font-bold text-red-600">{stats.totalExpenses.toFixed(2)} ₪</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Constants Info */}
        <Card className="overflow-hidden bg-white hover:shadow-md transition-shadow">
          <div className="bg-white border-b-2 border-olive-600 p-4">
            <h3 className="text-lg font-bold text-olive-800 text-right">المعلومات الثابتة للموسم الحالي</h3>
          </div>
          <CardContent className="p-6 space-y-2 -  flex-row-reverse">
            <div className=" border-b pb-2 flex-row-reverse flex justify-between ">
              <span>{settings.oilSellPrice} شيكل/كغم</span>
              <span className="font-semibold">سعر بيع الزيت:</span>
            </div>
            <div className="flex-row-reverse border-b pb-2  flex justify-between ">
              <span>{settings.oilBuyPrice} شيكل/كغم</span>
              <span className="font-semibold">سعر شراء الزيت:</span>
            </div>
            <div className="flex justify-between border-b pb-2  flex-row-reverse">
              <span>{settings.oilReturnPercentage}%</span>
              <span className="font-semibold">نسبة الرد:</span>
            </div>
            <div className="flex justify-between border-b pb-2  flex-row-reverse">
              <span>{settings.cashReturnPrice} شيكل/كغم</span>
              <span className="font-semibold">سعر الرد النقدي:</span>
            </div>
            <div className="flex justify-between border-b pb-2  flex-row-reverse">
              <span>{settings.tankPrices.plastic} شيكل</span>
              <span className="font-semibold">سعر التنكة البلاستيك:</span>
            </div>
            <div className="flex justify-between  flex-row-reverse">
              <span>{settings.tankPrices.metal} شيكل</span>
              <span className="font-semibold">سعر التنكة الحديد:</span>
            </div>
            <Link to="/settings" className="block mt-4 text-primary hover:underline text-center">
              تعديل المعلومات
            </Link>
          </CardContent>
        </Card>
        
        {/* Statistics */}
        <Card className="overflow-hidden bg-white hover:shadow-md transition-shadow">
          <div className="bg-white border-b-2 border-sand-600 p-4">
            <h3 className="text-lg font-bold text-olive-800 text-right">إحصائيات اليوم</h3>
          </div>
          <CardContent className="p-6 space-y-2  flex-row-reverse">
            <div className="flex justify-between border-b pb-2  flex-row-reverse">
              <span>{queueCustomers.length}</span>
              <span className="font-semibold">عدد الزبائن في الطابور:</span>
            </div>
            <div className="flex justify-between border-b pb-2  flex-row-reverse">
              <span>{todayInvoices.length}</span>
              <span className="font-semibold">عدد الفواتير المصدرة اليوم:</span>
            </div>
            <div className="flex justify-between border-b pb-2  flex-row-reverse">
              <span>{todayOilTotal.toFixed(2)} كغم</span>
              <span className="font-semibold">إجمالي الزيت المعصور اليوم:</span>
            </div>
            <div className="flex justify-between border-b pb-2  flex-row-reverse">
              <span>{todayOilPaymentTotal.toFixed(2)} كغم</span>
              <span className="font-semibold">إجمالي الرد بالزيت:</span>
            </div>
            <div className="flex justify-between  flex-row-reverse">
              <span>{todayCashTotal.toFixed(2)} شيكل</span>
              <span className="font-semibold">إجمالي الرد النقدي:</span>
            </div>
            <div className="flex justify-between pt-2 border-t mt-2  flex-row-reverse">
              <span>{totalCustomersCount}</span>
              <span className="font-semibold">إجمالي عدد الزبائن:</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/queue" className="flex flex-col items-center justify-center bg-white border-2 border-primary hover:bg-primary/5 text-primary p-8 rounded-lg text-center shadow-sm transition-all hover:shadow-md">
          <h3 className="text-xl font-bold mb-2">إدارة الطابور</h3>
          <p>إضافة وإدارة الزبائن في قائمة الانتظار</p>
        </Link>
        
        <Link to="/invoices" className="flex flex-col items-center justify-center bg-white border-2 border-olive-600 hover:bg-olive-50 text-olive-600 p-8 rounded-lg text-center shadow-sm transition-all hover:shadow-md">
          <h3 className="text-xl font-bold mb-2">حساب الرد</h3>
          <p>حساب وإصدار فواتير للزبائن الحاليين</p>
        </Link>
        
        <Link to="/customers" className="flex flex-col items-center justify-center bg-white border-2 border-sand-600 hover:bg-sand-50 text-sand-600 p-8 rounded-lg text-center shadow-sm transition-all hover:shadow-md">
          <h3 className="text-xl font-bold mb-2">سجل الزبائن</h3>
          <p>عرض سجل الزبائن وتفاصيل المعاملات السابقة</p>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/workers" className="flex flex-col items-center justify-center bg-white border-2 border-blue-600 hover:bg-blue-50 text-blue-600 p-8 rounded-lg text-center shadow-sm transition-all hover:shadow-md">
          <h3 className="text-xl font-bold mb-2">إدارة العمال</h3>
          <p>تسجيل العمال وحساب أجورهم ودفعاتهم</p>
        </Link>
        
        <Link to="/trading" className="flex flex-col items-center justify-center bg-white border-2 border-green-600 hover:bg-green-50 text-green-600 p-8 rounded-lg text-center shadow-sm transition-all hover:shadow-md">
          <h3 className="text-xl font-bold mb-2">بيع وشراء الزيت</h3>
          <p>إدارة عمليات البيع والشراء ومتابعة المخزون</p>
        </Link>
        
        <Link to="/expenses" className="flex flex-col items-center justify-center bg-white border-2 border-red-600 hover:bg-red-50 text-red-600 p-8 rounded-lg text-center shadow-sm transition-all hover:shadow-md">
          <h3 className="text-xl font-bold mb-2">المصاريف اليومية</h3>
          <p>تسجيل وتتبع المصاريف اليومية للمعصرة</p>
        </Link>
      </div>
    </div>;
};
export default Dashboard;