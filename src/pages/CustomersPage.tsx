
import React from 'react';
import CustomersHistory from '@/components/CustomersHistory';
import { MillProvider } from '@/context/MillContext';
import Layout from '@/components/Layout';

const CustomersPage = () => {
  return (
    <MillProvider>
      <Layout>
        <div className="rtl">
          <CustomersHistory />
        </div>
      </Layout>
    </MillProvider>
  );
};

export default CustomersPage;
