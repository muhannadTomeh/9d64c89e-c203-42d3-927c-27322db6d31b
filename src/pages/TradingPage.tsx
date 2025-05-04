
import React from 'react';
import OilTrading from '@/components/OilTrading';
import { MillProvider } from '@/context/MillContext';
import Layout from '@/components/Layout';

const TradingPage = () => {
  return (
    <MillProvider>
      <Layout>
        <OilTrading />
      </Layout>
    </MillProvider>
  );
};

export default TradingPage;
