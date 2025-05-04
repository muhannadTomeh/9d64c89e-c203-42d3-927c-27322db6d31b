
import React from 'react';
import QueueManagement from '@/components/QueueManagement';
import { MillProvider } from '@/context/MillContext';
import Layout from '@/components/Layout';

const QueuePage = () => {
  return (
    <MillProvider>
      <Layout>
        <QueueManagement />
      </Layout>
    </MillProvider>
  );
};

export default QueuePage;
