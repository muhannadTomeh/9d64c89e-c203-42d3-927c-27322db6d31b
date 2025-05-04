
import React from 'react';
import ExpensesManagement from '@/components/ExpensesManagement';
import { MillProvider } from '@/context/MillContext';
import Layout from '@/components/Layout';

const ExpensesPage = () => {
  return (
    <MillProvider>
      <Layout>
        <ExpensesManagement />
      </Layout>
    </MillProvider>
  );
};

export default ExpensesPage;
