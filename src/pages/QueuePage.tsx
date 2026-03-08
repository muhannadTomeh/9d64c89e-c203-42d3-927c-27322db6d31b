
import React from 'react';
import QueueManagement from '@/components/QueueManagement';
import { SupabaseMillProvider } from '@/context/SupabaseMillContext';
import Layout from '@/components/Layout';

const QueuePage = () => {
  return (
    <SupabaseMillProvider>
      <Layout>
        <QueueManagement />
      </Layout>
    </SupabaseMillProvider>
  );
};

export default QueuePage;
