
import React from 'react';
import WorkerDetails from '@/components/WorkerDetails';
import { MillProvider } from '@/context/MillContext';
import Layout from '@/components/Layout';

const WorkerDetailPage = () => {
  return (
    <MillProvider>
      <Layout>
        <WorkerDetails />
      </Layout>
    </MillProvider>
  );
};

export default WorkerDetailPage;
