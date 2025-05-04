
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMillContext } from '@/context/MillContext';
import { toast } from 'sonner';

const ExpensesManagement: React.FC = () => {
  const { expenses, addExpense, getStatistics } = useMillContext();
  
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [amount, setAmount] = useState(0);
  const [notes, setNotes] = useState('');
  
  const stats = getStatistics();
  
  // Common expense categories
  const expenseCategories = [
    'صيانة',
    'وقود',
    'طعام',
    'نقل',
    'كهرباء',
    'مياه',
    'أدوات',
    'أخرى',
  ];
  
  // Get unique categories from existing expenses
  const uniqueCategories = Array.from(
    new Set([
      ...expenseCategories,
      ...expenses.map((expense) => expense.category)
    ])
  ).filter(c => c !== 'أخرى');
  
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalCategory = category === 'أخرى' ? customCategory.trim() : category;
    
    if (!finalCategory) {
      toast.error('الرجاء اختيار صنف المصروف');
      return;
    }
    
    if (amount <= 0) {
      toast.error('الرجاء إدخال مبلغ صحيح');
      return;
    }
    
    addExpense({
      category: finalCategory,
      amount,
      notes: notes.trim() !== '' ? notes : undefined,
    });
    
    // Reset form
    setCategory('');
    setCustomCategory('');
    setAmount(0);
    setNotes('');
    
    toast.success('تم تسجيل المصروف بنجاح');
  };
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  // Group expenses by date (newest first)
  const sortedExpenses = [...expenses].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  // Group expenses by date
  const expensesByDate = sortedExpenses.reduce((groups: Record<string, typeof expenses>, expense) => {
    const dateStr = formatDate(expense.date);
    if (!groups[dateStr]) {
      groups[dateStr] = [];
    }
    groups[dateStr].push(expense);
    return groups;
  }, {});
  
  // Calculate totals by category
  const totalsByCategory: Record<string, number> = expenses.reduce((totals: Record<string, number>, expense) => {
    if (!totals[expense.category]) {
      totals[expense.category] = 0;
    }
    totals[expense.category] += expense.amount;
    return totals;
  }, {});
  
  // Sort categories by total amount (descending)
  const sortedCategories = Object.entries(totalsByCategory)
    .sort(([, a], [, b]) => b - a)
    .map(([category]) => category);
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">إدارة المصاريف</h2>
      
      <Card className="bg-red-600 text-white">
        <CardContent className="p-6 text-center">
          <h3 className="text-lg font-bold mb-2">إجمالي المصاريف</h3>
          <p className="text-3xl font-bold">{stats.totalExpenses.toFixed(2)} شيكل</p>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Add Expense Form */}
        <Card className="md:col-span-1">
          <CardHeader className="bg-primary text-white font-bold pb-2">
            <h3 className="text-lg">تسجيل مصروف جديد</h3>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">صنف المصروف</Label>
                <Select
                  value={category}
                  onValueChange={setCategory}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="اختر صنف المصروف" />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                    <SelectItem value="أخرى">أخرى</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {category === 'أخرى' && (
                <div className="space-y-2">
                  <Label htmlFor="customCategory">أدخل صنف المصروف</Label>
                  <Input
                    id="customCategory"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="أدخل صنف المصروف الجديد"
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="amount">المبلغ (شيكل)</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={amount || ''}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  placeholder="أدخل المبلغ"
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
              
              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">
                تسجيل المصروف
              </Button>
            </form>
          </CardContent>
        </Card>
        
        {/* Expenses List */}
        <Card className="md:col-span-2">
          <CardHeader className="bg-red-600 text-white font-bold pb-2">
            <h3 className="text-lg">سجل المصاريف</h3>
          </CardHeader>
          <CardContent className="max-h-[500px] overflow-y-auto p-4">
            {expenses.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>لا يوجد مصاريف مسجلة</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(expensesByDate).map(([date, items]) => {
                  const dailyTotal = items.reduce((sum, expense) => sum + expense.amount, 0);
                  
                  return (
                    <div key={date} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-md">{date}</h4>
                        <p className="text-red-600 font-semibold">{dailyTotal.toFixed(2)} شيكل</p>
                      </div>
                      <div className="space-y-2">
                        {items.map((expense) => (
                          <Card key={expense.id} className="border border-gray-200">
                            <CardContent className="p-3">
                              <div className="flex justify-between items-center">
                                <div className="font-semibold">{expense.category}</div>
                                <div className="text-red-600">{expense.amount.toFixed(2)} شيكل</div>
                              </div>
                              {expense.notes && (
                                <div className="mt-2 text-sm text-gray-500">
                                  {expense.notes}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card className="overflow-hidden">
        <CardHeader className="bg-blue-600 text-white font-bold pb-2">
          <h3 className="text-lg">إحصائيات المصاريف حسب الصنف</h3>
        </CardHeader>
        <CardContent className="pt-4">
          {sortedCategories.length > 0 ? (
            <div className="space-y-2">
              {sortedCategories.map((category) => {
                const amount = totalsByCategory[category];
                const percentage = (amount / stats.totalExpenses) * 100;
                
                return (
                  <div key={category} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{category}</span>
                      <span>{amount.toFixed(2)} شيكل ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded overflow-hidden">
                      <div 
                        className="h-full bg-red-600"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>لا يوجد مصاريف مسجلة</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpensesManagement;
