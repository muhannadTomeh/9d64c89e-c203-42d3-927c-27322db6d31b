
import React from 'react';
import WorkersManagement from '@/components/WorkersManagement';
import { MillProvider } from '@/context/MillContext';
import Layout from '@/components/Layout';

const WorkersPage = () => {
  return (
    <MillProvider>
      <Layout>
        <div className="rtl" dir="rtl" style={{ direction: 'rtl', textAlign: 'right' }}>
          <WorkersManagement />
        </div>
      </Layout>
    </MillProvider>
  );
};

export default WorkersPage;
