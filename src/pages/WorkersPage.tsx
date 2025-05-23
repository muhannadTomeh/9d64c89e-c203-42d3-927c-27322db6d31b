
import React from 'react';
import WorkersManagement from '@/components/WorkersManagement';
import { MillProvider } from '@/context/MillContext';
import Layout from '@/components/Layout';

const WorkersPage = () => {
  return (
    <MillProvider>
      <Layout>
        <div className="font-arabic">
          <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-right text-olive-800">إدارة العمال</h1>
          <WorkersManagement />
        </div>
      </Layout>
    </MillProvider>
  );
};

export default WorkersPage;
