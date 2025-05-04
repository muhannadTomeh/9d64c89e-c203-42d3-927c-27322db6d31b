
import React from 'react';
import Settings from '@/components/Settings';
import { MillProvider } from '@/context/MillContext';
import Layout from '@/components/Layout';

const SettingsPage = () => {
  return (
    <MillProvider>
      <Layout>
        <Settings />
      </Layout>
    </MillProvider>
  );
};

export default SettingsPage;
