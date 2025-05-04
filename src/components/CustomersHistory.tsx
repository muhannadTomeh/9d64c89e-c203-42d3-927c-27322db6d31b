
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useMillContext } from '@/context/MillContext';
import { Invoice } from '@/types';

const CustomerInvoiceDetails: React.FC<{ invoice: Invoice }> = ({ invoice }) => {
  const date = new Date(invoice.date);
  
  return (
    <Card className="mb-4 border border-gray-200">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-bold">فاتورة رقم: {invoice.id.split('-')[1]}</h4>
          <span className="text-sm text-gray-500">
            {date.toLocaleDateString('ar-EG')} {date.toLocaleTimeString('ar-EG', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-sm mb-2">
          <div><span className="font-semibold">كمية الزيت:</span> {invoice.oilAmount} كغم</div>
          <div>
            <span className="font-semibold">طريقة الدفع:</span>{' '}
            {invoice.paymentMethod === 'oil' && 'دفع بالزيت'}
            {invoice.paymentMethod === 'cash' && 'دفع نقداً'}
            {invoice.paymentMethod === 'mixed' && 'دفع مختلط'}
          </div>
        </div>
        
        <div className="text-sm bg-gray-50 p-3 rounded mb-2">
          <h5 className="font-semibold mb-1">تفاصيل الدفع:</h5>
          {invoice.paymentMethod === 'oil' && (
            <>
              <div>الرد (زيت): {invoice.returnAmount.oil.toFixed(2)} كغم</div>
              <div>ثمن التنكات (زيت): {invoice.tanksPayment.oil.toFixed(2)} كغم</div>
              <div className="font-bold mt-1">الإجمالي: {invoice.total.oil.toFixed(2)} كغم زيت</div>
            </>
          )}
          
          {invoice.paymentMethod === 'cash' && (
            <>
              <div>الرد (نقداً): {invoice.returnAmount.cash.toFixed(2)} شيكل</div>
              <div>ثمن التنكات: {invoice.tanksPayment.cash.toFixed(2)} شيكل</div>
              <div className="font-bold mt-1">الإجمالي: {invoice.total.cash.toFixed(2)} شيكل</div>
            </>
          )}
          
          {invoice.paymentMethod === 'mixed' && (
            <>
              <div>الرد (زيت): {invoice.returnAmount.oil.toFixed(2)} كغم</div>
              <div>ثمن التنكات (نقداً): {invoice.tanksPayment.cash.toFixed(2)} شيكل</div>
              <div className="font-bold mt-1">
                الإجمالي: {invoice.total.oil.toFixed(2)} كغم زيت + {invoice.total.cash.toFixed(2)} شيكل
              </div>
            </>
          )}
        </div>
        
        <div className="text-sm">
          <span className="font-semibold">التنكات:</span>{' '}
          {invoice.tanks.length === 0 ? (
            'لا يوجد'
          ) : (
            invoice.tanks.map((tank, index) => (
              <span key={index}>
                {tank.count} {tank.type === 'plastic' ? 'بلاستيك' : 'حديد'}
                {index < invoice.tanks.length - 1 ? ' + ' : ''}
              </span>
            ))
          )}
        </div>
        
        {invoice.notes && (
          <div className="text-sm mt-2">
            <span className="font-semibold">ملاحظات:</span> {invoice.notes}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const CustomersHistory: React.FC = () => {
  const { invoices } = useMillContext();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Get unique customer IDs
  const uniqueCustomerIds = [...new Set(invoices.map(invoice => invoice.customerId))];
  
  // Get customer data (name, phone, invoices)
  const customerData = uniqueCustomerIds.map(customerId => {
    const customerInvoices = invoices.filter(invoice => invoice.customerId === customerId);
    const { customerName, customerPhone } = customerInvoices[0];
    
    return {
      id: customerId,
      name: customerName,
      phone: customerPhone,
      invoiceCount: customerInvoices.length,
      totalOil: customerInvoices.reduce((sum, invoice) => sum + invoice.oilAmount, 0),
      latestInvoice: customerInvoices.reduce((latest, invoice) => 
        new Date(invoice.date) > new Date(latest.date) ? invoice : latest
      ),
      invoices: customerInvoices.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    };
  });
  
  // Filter customers based on search term
  const filteredCustomers = customerData.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.phone && customer.phone.includes(searchTerm))
  );
  
  const [expandedCustomerId, setExpandedCustomerId] = useState<string | null>(null);
  
  const toggleCustomerExpanded = (customerId: string) => {
    setExpandedCustomerId(expandedCustomerId === customerId ? null : customerId);
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">سجل الزبائن</h2>
      
      <div className="flex">
        <Input
          placeholder="بحث عن زبون بالاسم أو رقم الهاتف..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>
      
      <div className="space-y-6">
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <p>لم يتم العثور على أي زبون بهذا الاسم</p>
          </div>
        ) : (
          filteredCustomers.map((customer) => (
            <Card key={customer.id} className="overflow-hidden">
              <CardHeader className="bg-olive-600 text-white p-4 cursor-pointer flex justify-between items-center" 
                onClick={() => toggleCustomerExpanded(customer.id)}>
                <div>
                  <h3 className="text-lg font-bold">{customer.name}</h3>
                  {customer.phone && <p className="text-sm">{customer.phone}</p>}
                </div>
                <div className="text-left">
                  <p className="text-sm">عدد الزيارات: {customer.invoiceCount}</p>
                  <p className="text-sm">إجمالي الزيت: {customer.totalOil.toFixed(2)} كغم</p>
                </div>
              </CardHeader>
              
              {expandedCustomerId === customer.id && (
                <CardContent className="p-4">
                  <h4 className="font-bold text-lg mb-4">سجل الفواتير:</h4>
                  {customer.invoices.map((invoice) => (
                    <CustomerInvoiceDetails key={invoice.id} invoice={invoice} />
                  ))}
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default CustomersHistory;
