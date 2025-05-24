
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMillContext } from '@/context/MillContext';
import { Invoice } from '@/types';
import { ChevronDown, ChevronUp, FileText, Phone, User, Calendar, Droplets, Search, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const CustomerInvoiceDetails: React.FC<{ invoice: Invoice }> = ({ invoice }) => {
  const date = new Date(invoice.date);
  
  return (
    <Card className="mb-4 border border-olive-200 shadow-sm">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-olive-600" />
            <h4 className="font-bold text-olive-800">فاتورة رقم: #{invoice.id.split('-')[1]}</h4>
          </div>
          <div className="flex items-center gap-2 text-sm text-olive-600">
            <Calendar className="h-4 w-4" />
            <span>
              {format(date, 'dd MMM yyyy - HH:mm', { locale: ar })}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-olive-600" />
              <span className="font-semibold">كمية الزيت:</span> 
              <span className="font-bold text-olive-800">{invoice.oilAmount} كغم</span>
            </div>
            <div>
              <span className="font-semibold">طريقة الدفع:</span>{' '}
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                invoice.paymentMethod === 'oil' ? 'bg-green-100 text-green-800' :
                invoice.paymentMethod === 'cash' ? 'bg-blue-100 text-blue-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                {invoice.paymentMethod === 'oil' && 'دفع بالزيت'}
                {invoice.paymentMethod === 'cash' && 'دفع نقداً'}
                {invoice.paymentMethod === 'mixed' && 'دفع مختلط'}
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div>
              <span className="font-semibold">التنكات:</span>{' '}
              {invoice.tanks.length === 0 ? (
                <span className="text-gray-500">لا يوجد</span>
              ) : (
                <div className="inline-flex gap-2">
                  {invoice.tanks.map((tank, index) => (
                    <span key={index} className="bg-olive-100 text-olive-800 px-2 py-1 rounded text-xs">
                      {tank.count} {tank.type === 'plastic' ? 'بلاستيك' : 'حديد'}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="bg-olive-50 p-4 rounded-lg border border-olive-200">
          <h5 className="font-semibold mb-3 text-olive-800 flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            تفاصيل الدفع
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {invoice.paymentMethod === 'oil' && (
              <>
                <div className="space-y-1">
                  <div>الرد (زيت): <span className="font-medium">{invoice.returnAmount.oil.toFixed(2)} كغم</span></div>
                  <div>ثمن التنكات (زيت): <span className="font-medium">{invoice.tanksPayment.oil.toFixed(2)} كغم</span></div>
                </div>
                <div className="bg-white p-3 rounded border">
                  <div className="font-bold text-olive-800">الإجمالي: {invoice.total.oil.toFixed(2)} كغم زيت</div>
                </div>
              </>
            )}
            
            {invoice.paymentMethod === 'cash' && (
              <>
                <div className="space-y-1">
                  <div>الرد (نقداً): <span className="font-medium">{invoice.returnAmount.cash.toFixed(2)} شيكل</span></div>
                  <div>ثمن التنكات: <span className="font-medium">{invoice.tanksPayment.cash.toFixed(2)} شيكل</span></div>
                </div>
                <div className="bg-white p-3 rounded border">
                  <div className="font-bold text-olive-800">الإجمالي: {invoice.total.cash.toFixed(2)} شيكل</div>
                </div>
              </>
            )}
            
            {invoice.paymentMethod === 'mixed' && (
              <>
                <div className="space-y-1">
                  <div>الرد (زيت): <span className="font-medium">{invoice.returnAmount.oil.toFixed(2)} كغم</span></div>
                  <div>ثمن التنكات (نقداً): <span className="font-medium">{invoice.tanksPayment.cash.toFixed(2)} شيكل</span></div>
                </div>
                <div className="bg-white p-3 rounded border">
                  <div className="font-bold text-olive-800">
                    الإجمالي: {invoice.total.oil.toFixed(2)} كغم زيت + {invoice.total.cash.toFixed(2)} شيكل
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        
        {invoice.notes && (
          <div className="mt-4 p-3 bg-gray-50 rounded border-r-4 border-olive-500">
            <span className="font-semibold text-gray-700">ملاحظات:</span>
            <p className="text-gray-600 mt-1">{invoice.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const CustomersHistory: React.FC = () => {
  const { invoices } = useMillContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCustomerId, setExpandedCustomerId] = useState<string | null>(null);
  
  // Get unique customer IDs
  const uniqueCustomerIds = [...new Set(invoices.map(invoice => invoice.customerId))];
  
  // Get customer data (name, phone, invoices)
  const customerData = uniqueCustomerIds.map(customerId => {
    const customerInvoices = invoices.filter(invoice => invoice.customerId === customerId);
    const { customerName, customerPhone } = customerInvoices[0];
    
    return {
      id: customerId,
      name: customerName,
      phone: customerPhone || 'غير متوفر',
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
  
  const toggleCustomerExpanded = (customerId: string) => {
    setExpandedCustomerId(expandedCustomerId === customerId ? null : customerId);
  };
  
  return (
    <div className="space-y-6 font-arabic" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-bold text-olive-800 flex items-center gap-3">
          <User className="h-8 w-8" />
          سجل الزبائن
        </h2>
        
        <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-olive-200 shadow-sm">
          <Input
            placeholder="بحث عن زبون بالاسم أو رقم الهاتف..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md text-right border-0 focus-visible:ring-0"
            dir="rtl"
          />
          <Search className="h-4 w-4 text-olive-500" />
        </div>
      </div>
      
      <Card className="shadow-lg">
        <CardHeader className="bg-olive-600 text-white">
          <h3 className="text-lg font-semibold text-right">قائمة الزبائن</h3>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-olive-50">
                  <TableHead className="text-right font-bold text-olive-800 w-[250px]">معلومات الزبون</TableHead>
                  <TableHead className="text-right font-bold text-olive-800">عدد الزيارات</TableHead>
                  <TableHead className="text-right font-bold text-olive-800">إجمالي الزيت (كغم)</TableHead>
                  <TableHead className="text-right font-bold text-olive-800">آخر زيارة</TableHead>
                  <TableHead className="text-right font-bold text-olive-800 w-[120px]">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-olive-600">
                      <div className="flex flex-col items-center gap-3">
                        <User className="h-12 w-12 text-olive-300" />
                        <p className="text-lg">لم يتم العثور على أي زبون</p>
                        {searchTerm && (
                          <p className="text-sm text-gray-500">جرب البحث بكلمات مختلفة</p>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map((customer) => (
                    <React.Fragment key={customer.id}>
                      <TableRow className={`border-b border-olive-100 hover:bg-olive-50/50 transition-colors ${
                        expandedCustomerId === customer.id ? 'bg-olive-50' : ''
                      }`}>
                        <TableCell className="text-right">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-olive-600" />
                              <span className="font-medium text-olive-800">{customer.name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone className="h-3 w-3" />
                              <span>{customer.phone}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="bg-olive-100 text-olive-800 px-3 py-1 rounded-full text-sm font-medium">
                            {customer.invoiceCount}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center gap-2">
                            <Droplets className="h-4 w-4 text-blue-500" />
                            <span className="font-semibold text-olive-700">{customer.totalOil.toFixed(2)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-sm text-gray-600">
                          {format(new Date(customer.latestInvoice.date), 'dd MMM yyyy', { locale: ar })}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="gap-2 border-olive-200 hover:bg-olive-50"
                            onClick={() => toggleCustomerExpanded(customer.id)}
                          >
                            <span>التفاصيل</span>
                            {expandedCustomerId === customer.id ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                      {expandedCustomerId === customer.id && (
                        <TableRow>
                          <TableCell colSpan={5} className="bg-olive-50/30 px-6 py-6">
                            <div className="space-y-4">
                              <div className="flex items-center gap-3 mb-4">
                                <FileText className="h-5 w-5 text-olive-600" />
                                <h4 className="font-bold text-lg text-olive-800">سجل الفواتير - {customer.name}</h4>
                                <span className="bg-olive-200 text-olive-800 px-2 py-1 rounded text-sm">
                                  {customer.invoices.length} فاتورة
                                </span>
                              </div>
                              <div className="max-h-[600px] overflow-y-auto space-y-4">
                                {customer.invoices.map((invoice) => (
                                  <CustomerInvoiceDetails key={invoice.id} invoice={invoice} />
                                ))}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomersHistory;
