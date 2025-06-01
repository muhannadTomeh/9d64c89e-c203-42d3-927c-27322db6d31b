
import React from 'react';
import Dashboard from '@/components/Dashboard';
import { SupabaseMillProvider } from '@/context/SupabaseMillContext';
import Layout from '@/components/Layout';

const Index = () => {
  return (
    <SupabaseMillProvider>
      <Layout>
        <div className="font-arabic">
          <Dashboard />
        </div>
      </Layout>
    </SupabaseMillProvider>
  );
};

export default Index;
