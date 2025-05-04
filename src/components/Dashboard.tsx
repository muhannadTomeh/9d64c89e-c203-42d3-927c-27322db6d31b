
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { useMillContext } from '@/context/MillContext';

const Dashboard: React.FC = () => {
  const { settings, customers, invoices } = useMillContext();
  
  // Get queue customers (pending status)
  const queueCustomers = customers.filter((c) => c.status === 'pending');
  
  // Get today's date without time to compare with invoices
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Get today's invoices
  const todayInvoices = invoices.filter((invoice) => {
    const invoiceDate = new Date(invoice.date);
    invoiceDate.setHours(0, 0, 0, 0);
    return invoiceDate.getTime() === today.getTime();
  });
  
  // Calculate today's totals
  const todayOilTotal = todayInvoices.reduce(
    (sum, invoice) => sum + invoice.oilAmount,
    0
  );
  
  const todayCashTotal = todayInvoices.reduce(
    (sum, invoice) => sum + invoice.total.cash,
    0
  );
  
  const todayOilPaymentTotal = todayInvoices.reduce(
    (sum, invoice) => sum + invoice.total.oil,
    0
  );

  const totalCustomersCount = customers.length;
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">لوحة التحكم</h2>
        <p className="text-gray-500">
          {new Date().toLocaleDateString('ar-EG', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Constants Info */}
        <Card className="overflow-hidden">
          <div className="bg-olive-600 p-4 text-white font-bold">
            <h3 className="text-lg">المعلومات الثابتة للموسم الحالي</h3>
          </div>
          <CardContent className="p-6 space-y-2">
            <div className="flex justify-between border-b pb-2">
              <span className="font-semibold">سعر بيع الزيت:</span>
              <span>{settings.oilSellPrice} شيكل/كغم</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-semibold">سعر شراء الزيت:</span>
              <span>{settings.oilBuyPrice} شيكل/كغم</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-semibold">نسبة الرد:</span>
              <span>{settings.oilReturnPercentage}%</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-semibold">سعر الرد النقدي:</span>
              <span>{settings.cashReturnPrice} شيكل/كغم</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-semibold">سعر التنكة البلاستيك:</span>
              <span>{settings.tankPrices.plastic} شيكل</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">سعر التنكة الحديد:</span>
              <span>{settings.tankPrices.metal} شيكل</span>
            </div>
            <Link
              to="/settings"
              className="block mt-4 text-primary hover:underline text-center"
            >
              تعديل المعلومات
            </Link>
          </CardContent>
        </Card>
        
        {/* Statistics */}
        <Card className="overflow-hidden">
          <div className="bg-sand-600 p-4 text-white font-bold">
            <h3 className="text-lg">إحصائيات اليوم</h3>
          </div>
          <CardContent className="p-6 space-y-2">
            <div className="flex justify-between border-b pb-2">
              <span className="font-semibold">عدد الزبائن في الطابور:</span>
              <span>{queueCustomers.length}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-semibold">عدد الفواتير المصدرة اليوم:</span>
              <span>{todayInvoices.length}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-semibold">إجمالي الزيت المعصور اليوم:</span>
              <span>{todayOilTotal.toFixed(2)} كغم</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-semibold">إجمالي الرد بالزيت:</span>
              <span>{todayOilPaymentTotal.toFixed(2)} كغم</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">إجمالي الرد النقدي:</span>
              <span>{todayCashTotal.toFixed(2)} شيكل</span>
            </div>
            <div className="flex justify-between pt-2 border-t mt-2">
              <span className="font-semibold">إجمالي عدد الزبائن:</span>
              <span>{totalCustomersCount}</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link 
          to="/queue"
          className="bg-primary hover:bg-primary/90 text-white p-8 rounded-lg text-center shadow-md transition-transform hover:scale-105"
        >
          <h3 className="text-xl font-bold mb-2">إدارة الطابور</h3>
          <p>إضافة وإدارة الزبائن في قائمة الانتظار</p>
        </Link>
        
        <Link 
          to="/invoices"
          className="bg-olive-600 hover:bg-olive-700 text-white p-8 rounded-lg text-center shadow-md transition-transform hover:scale-105"
        >
          <h3 className="text-xl font-bold mb-2">حساب الرد</h3>
          <p>حساب وإصدار فواتير للزبائن الحاليين</p>
        </Link>
        
        <Link 
          to="/customers"
          className="bg-sand-600 hover:bg-sand-700 text-white p-8 rounded-lg text-center shadow-md transition-transform hover:scale-105"
        >
          <h3 className="text-xl font-bold mb-2">سجل الزبائن</h3>
          <p>عرض سجل الزبائن وتفاصيل المعاملات السابقة</p>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
