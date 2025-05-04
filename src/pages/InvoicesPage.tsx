
import React from 'react';
import InvoiceCalculator from '@/components/InvoiceCalculator';
import { MillProvider } from '@/context/MillContext';
import Layout from '@/components/Layout';

const InvoicesPage = () => {
  return (
    <MillProvider>
      <Layout>
        <InvoiceCalculator />
      </Layout>
    </MillProvider>
  );
};

export default InvoicesPage;
