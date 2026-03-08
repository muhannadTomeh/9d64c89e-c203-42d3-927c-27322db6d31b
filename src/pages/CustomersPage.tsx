
import React from 'react';
import CustomersHistory from '@/components/CustomersHistory';
import { SupabaseMillProvider } from '@/context/SupabaseMillContext';
import Layout from '@/components/Layout';

const CustomersPage = () => {
  return (
    <SupabaseMillProvider>
      <Layout>
        <div className="rtl">
          <CustomersHistory />
        </div>
      </Layout>
    </SupabaseMillProvider>
  );
};

export default CustomersPage;
