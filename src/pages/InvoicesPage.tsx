
import React from 'react';
import InvoiceCalculator from '@/components/InvoiceCalculator';
import { SupabaseMillProvider } from '@/context/SupabaseMillContext';
import Layout from '@/components/Layout';

const InvoicesPage = () => {
  return (
    <SupabaseMillProvider>
      <Layout>
        <InvoiceCalculator />
      </Layout>
    </SupabaseMillProvider>
  );
};

export default InvoicesPage;
