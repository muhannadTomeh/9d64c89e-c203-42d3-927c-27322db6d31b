
import React from 'react';
import WorkersManagement from '@/components/WorkersManagement';
import { SupabaseMillProvider } from '@/context/SupabaseMillContext';
import Layout from '@/components/Layout';

const WorkersPage = () => {
  return (
    <SupabaseMillProvider>
      <Layout>
        <div className="font-arabic" dir="rtl">
          <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-right text-olive-800">إدارة العمال</h1>
          <WorkersManagement />
        </div>
      </Layout>
    </SupabaseMillProvider>
  );
};

export default WorkersPage;
