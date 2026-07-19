
import React from 'react';
import { Link } from 'react-router-dom';
import { useSupabaseMillContext } from '@/context/SupabaseMillContext';
import {
  Users, Droplet, Package, Wallet, Banknote, Receipt,
  Clock, FileText, UsersRound, HardHat, ShoppingCart, ArrowLeft,
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const {
    settings,
    customers,
    invoices,
    getStatistics,
    currentSeason,
    userProfile
  } = useSupabaseMillContext();

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

  const kpis = [
    { label: 'الزبائن في الطابور', value: `${queueCustomers.length}`, accent: 'bg-gold', tint: 'bg-sand-50', icon: Users, iconColor: 'text-gold' },
    { label: 'زيت اليوم', value: `${todayOilTotal.toFixed(1)} كغم`, accent: 'bg-emerald', tint: 'bg-olive-50', icon: Droplet, iconColor: 'text-emerald' },
    { label: 'الزيت الكلي', value: `${stats.totalOilProduced.toFixed(1)} كغم`, accent: 'bg-emerald-deep', tint: 'bg-olive-50', icon: Package, iconColor: 'text-emerald-deep' },
    { label: 'المخزون الحالي', value: `${stats.currentOilStock.toFixed(1)} كغم`, accent: 'bg-emerald', tint: 'bg-olive-50', icon: Package, iconColor: 'text-emerald' },
    { label: 'الكاش الحالي', value: `${stats.currentCash.toFixed(0)} ₪`, accent: 'bg-gold', tint: 'bg-sand-50', icon: Banknote, iconColor: 'text-gold' },
    { label: 'إجمالي المصاريف', value: `${stats.totalExpenses.toFixed(0)} ₪`, accent: 'bg-destructive', tint: 'bg-destructive/5', icon: Wallet, iconColor: 'text-destructive' },
  ];

  const settingsRows = [
    { label: 'سعر بيع الزيت', value: `${settings.oilSellPrice} شيكل/كغم` },
    { label: 'سعر شراء الزيت', value: `${settings.oilBuyPrice} شيكل/كغم` },
    { label: 'نسبة الرد', value: `${settings.oilReturnPercentage}%` },
    { label: 'سعر الرد النقدي', value: `${settings.cashReturnPrice} شيكل/كغم` },
    { label: 'سعر التنكة البلاستيك', value: `${settings.tankPrices.plastic} شيكل` },
    { label: 'سعر التنكة الحديد', value: `${settings.tankPrices.metal} شيكل` },
  ];

  const statsRows = [
    { label: 'عدد الزبائن في الطابور', value: `${queueCustomers.length}` },
    { label: 'عدد الفواتير المصدرة اليوم', value: `${todayInvoices.length}` },
    { label: 'إجمالي الزيت المعصور اليوم', value: `${todayOilTotal.toFixed(2)} كغم` },
    { label: 'إجمالي الرد بالزيت', value: `${todayOilPaymentTotal.toFixed(2)} كغم` },
    { label: 'إجمالي الرد النقدي', value: `${todayCashTotal.toFixed(2)} شيكل` },
    { label: 'إجمالي عدد الزبائن', value: `${totalCustomersCount}` },
  ];

  const quickActions = [
    { to: '/queue', title: 'إدارة الطابور', desc: 'إضافة وإدارة الزبائن في قائمة الانتظار', icon: Clock, tint: 'bg-olive-50', color: 'text-emerald' },
    { to: '/invoices', title: 'حساب الرد', desc: 'حساب وإصدار فواتير للزبائن الحاليين', icon: FileText, tint: 'bg-sand-50', color: 'text-gold' },
    { to: '/customers', title: 'سجل الزبائن', desc: 'عرض سجل الزبائن وتفاصيل المعاملات', icon: UsersRound, tint: 'bg-olive-50', color: 'text-emerald-deep' },
    { to: '/workers', title: 'إدارة العمال', desc: 'تسجيل العمال وحساب أجورهم ودفعاتهم', icon: HardHat, tint: 'bg-sand-50', color: 'text-gold' },
    { to: '/trading', title: 'بيع وشراء الزيت', desc: 'إدارة عمليات البيع والشراء والمخزون', icon: ShoppingCart, tint: 'bg-olive-50', color: 'text-emerald' },
    { to: '/expenses', title: 'المصاريف اليومية', desc: 'تسجيل وتتبع المصاريف اليومية', icon: Receipt, tint: 'bg-destructive/5', color: 'text-destructive' },
  ];

  return (
    <div className="space-y-8 font-arabic text-right">
      {/* Page header */}
      <header className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold text-emerald-deep tracking-tight">
            لوحة التحكم
          </h1>
          <p className="text-emerald mt-2 font-medium">
            {currentSeason
              ? `الموسم النشط: ${currentSeason.name} · ${currentSeason.year}`
              : 'لا يوجد موسم نشط'}
            {userProfile && (
              <span className="text-emerald-deep/50 mr-2">
                · {userProfile.role === 'admin' ? 'مدير النظام' : 'مستخدم'}
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/queue"
            className="px-5 py-2.5 bg-white border-2 border-gold text-emerald-deep rounded-xl font-bold hover:bg-gold hover:text-emerald-deep transition-all shadow-sm text-sm"
          >
            إضافة زبون
          </Link>
          <Link
            to="/invoices"
            className="px-5 py-2.5 bg-emerald text-white rounded-xl font-bold shadow-lg shadow-emerald-deep/20 hover:bg-emerald-deep transition-all text-sm"
          >
            حساب فاتورة جديدة
          </Link>
        </div>
      </header>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div
              key={k.label}
              className="relative bg-white p-5 rounded-2xl shadow-sm border border-sand-100 overflow-hidden group hover:shadow-md transition-all"
            >
              <div className={`absolute right-0 top-0 h-full w-1 ${k.accent}`} />
              <div className={`w-9 h-9 rounded-lg ${k.tint} flex items-center justify-center mb-3`}>
                <Icon className={`w-4 h-4 ${k.iconColor}`} />
              </div>
              <p className="text-[11px] font-bold text-emerald-deep/60 uppercase tracking-wider mb-1">
                {k.label}
              </p>
              <h3 className="font-display text-xl font-extrabold text-emerald-deep leading-tight">
                {k.value}
              </h3>
            </div>
          );
        })}
      </div>

      {/* Info panels + Season card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Season constants */}
        <div className="lg:col-span-1 bg-white rounded-3xl shadow-sm border border-sand-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-sand-100 flex justify-between items-center bg-cream/40">
            <h3 className="font-display font-bold text-emerald-deep">أسعار الموسم</h3>
            <Link to="/settings" className="text-emerald text-xs font-bold hover:underline">
              تعديل
            </Link>
          </div>
          <div className="p-6 space-y-3">
            {settingsRows.map((r) => (
              <div key={r.label} className="flex justify-between items-center pb-2 border-b border-sand-100/70 last:border-0">
                <span className="text-emerald-deep font-semibold text-sm">{r.value}</span>
                <span className="text-emerald-deep/60 text-sm">{r.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Today's stats */}
        <div className="lg:col-span-1 bg-white rounded-3xl shadow-sm border border-sand-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-sand-100 flex justify-between items-center bg-cream/40">
            <h3 className="font-display font-bold text-emerald-deep">إحصائيات اليوم</h3>
            <span className="text-[10px] font-bold text-gold bg-gold/10 px-2 py-1 rounded-full uppercase tracking-wider">
              مباشر
            </span>
          </div>
          <div className="p-6 space-y-3">
            {statsRows.map((r) => (
              <div key={r.label} className="flex justify-between items-center pb-2 border-b border-sand-100/70 last:border-0">
                <span className="font-display text-emerald-deep font-bold text-sm">{r.value}</span>
                <span className="text-emerald-deep/60 text-sm">{r.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Season status */}
        <div className="lg:col-span-1 bg-emerald-deep p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
          <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-gold/10 blur-2xl" />
          <div className="absolute top-4 left-4 opacity-20">
            <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
            </svg>
          </div>
          <p className="text-[11px] text-gold tracking-widest uppercase font-bold mb-2">حالة الموسم</p>
          <h3 className="font-display text-2xl font-extrabold mb-1">
            {currentSeason?.name || 'لا يوجد موسم نشط'}
          </h3>
          <p className="text-cream/70 text-sm mb-6">
            {currentSeason ? `عام ${currentSeason.year}` : 'قم بإنشاء موسم جديد للبدء'}
          </p>
          <div className="space-y-4 relative">
            <div className="flex justify-between items-center py-2 border-b border-white/10">
              <span className="text-sm font-bold text-gold">{stats.currentOilStock.toFixed(1)} كغم</span>
              <span className="text-xs text-cream/60">المخزون الحالي</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/10">
              <span className="text-sm font-bold">{totalCustomersCount}</span>
              <span className="text-xs text-cream/60">إجمالي الزبائن</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm font-bold">{invoices.length}</span>
              <span className="text-xs text-cream/60">إجمالي الفواتير</span>
            </div>
          </div>
          <Link
            to="/settings"
            className="mt-6 flex items-center justify-center gap-2 w-full py-2.5 bg-gold text-emerald-deep rounded-xl font-bold text-sm hover:brightness-110 transition-all"
          >
            إدارة المواسم
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Quick actions */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold text-emerald-deep">اختصارات سريعة</h2>
          <div className="h-px flex-1 bg-sand-200 mx-4" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {quickActions.map((a) => {
            const Icon = a.icon;
            return (
              <Link
                key={a.to}
                to={a.to}
                className="group bg-white p-6 rounded-2xl border border-sand-100 shadow-sm hover:shadow-lg hover:border-gold transition-all flex items-start gap-4"
              >
                <div className={`w-12 h-12 rounded-xl ${a.tint} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-6 h-6 ${a.color}`} />
                </div>
                <div className="flex-1 text-right">
                  <h3 className="font-display text-lg font-bold text-emerald-deep mb-1">{a.title}</h3>
                  <p className="text-sm text-emerald-deep/60 leading-relaxed">{a.desc}</p>
                </div>
                <ArrowLeft className="w-4 h-4 text-emerald-deep/30 group-hover:text-gold group-hover:-translate-x-1 transition-all self-center" />
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
