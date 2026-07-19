
import React from 'react';
import OilTrading from '@/components/OilTrading';
import { SupabaseMillProvider } from '@/context/SupabaseMillContext';
import Layout from '@/components/Layout';

const TradingPage = () => {
  return (
    <SupabaseMillProvider>
      <Layout>
        <OilTrading />
      </Layout>
    </SupabaseMillProvider>
  );
};

export default TradingPage;
