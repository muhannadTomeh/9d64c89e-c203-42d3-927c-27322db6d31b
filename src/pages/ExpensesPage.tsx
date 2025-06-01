
import React from 'react';
import ExpensesManagement from '@/components/ExpensesManagement';
import { SupabaseMillProvider } from '@/context/SupabaseMillContext';
import Layout from '@/components/Layout';

const ExpensesPage = () => {
  return (
    <SupabaseMillProvider>
      <Layout>
        <ExpensesManagement />
      </Layout>
    </SupabaseMillProvider>
  );
};

export default ExpensesPage;
