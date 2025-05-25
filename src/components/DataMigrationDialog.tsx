
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useSupabaseMillContext } from '@/context/SupabaseMillContext';
import { useToast } from '@/hooks/use-toast';
import { Database, Upload, Download } from 'lucide-react';

const DataMigrationDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { migrateLocalData, exportLocalData } = useSupabaseMillContext();
  const { toast } = useToast();

  const handleMigrateData = async () => {
    setIsLoading(true);
    try {
      await migrateLocalData();
      setIsOpen(false);
      toast({
        title: "تم نقل البيانات بنجاح",
        description: "تم نقل جميع البيانات المحلية إلى قاعدة البيانات",
      });
    } catch (error) {
      toast({
        title: "خطأ في نقل البيانات",
        description: "حدث خطأ أثناء نقل البيانات",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = () => {
    const data = exportLocalData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mill-data-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "تم تصدير البيانات",
      description: "تم تصدير نسخة احتياطية من البيانات المحلية",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Database size={16} />
          إدارة البيانات
        </Button>
      </DialogTrigger>
      <DialogContent className="font-arabic" dir="rtl">
        <DialogHeader>
          <DialogTitle>إدارة البيانات</DialogTitle>
          <DialogDescription>
            يمكنك نقل البيانات المحلية إلى قاعدة البيانات أو تصدير نسخة احتياطية
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h3 className="font-semibold text-amber-800 mb-2">نقل البيانات المحلية</h3>
            <p className="text-amber-700 text-sm mb-3">
              سيتم نقل جميع البيانات المحفوظة محلياً إلى قاعدة البيانات السحابية
            </p>
            <Button 
              onClick={handleMigrateData}
              disabled={isLoading}
              className="w-full flex items-center gap-2"
            >
              <Upload size={16} />
              {isLoading ? "جاري النقل..." : "نقل البيانات"}
            </Button>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">تصدير نسخة احتياطية</h3>
            <p className="text-blue-700 text-sm mb-3">
              تصدير نسخة احتياطية من البيانات المحلية كملف JSON
            </p>
            <Button 
              onClick={handleExportData}
              variant="outline"
              className="w-full flex items-center gap-2"
            >
              <Download size={16} />
              تصدير البيانات
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DataMigrationDialog;
