
import React from 'react';
import Dashboard from '@/components/Dashboard';
import { MillProvider } from '@/context/MillContext';
import Layout from '@/components/Layout';

const Index = () => {
  return (
    <MillProvider>
      <Layout>
        <div className="font-arabic">
          <Dashboard />
        </div>
      </Layout>
    </MillProvider>
  );
};

export default Index;
