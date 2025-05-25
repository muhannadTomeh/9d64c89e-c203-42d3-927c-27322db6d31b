
import React from 'react';
import WorkerDetails from '@/components/WorkerDetails';
import { SupabaseMillProvider } from '@/context/SupabaseMillContext';
import Layout from '@/components/Layout';

const WorkerDetailPage = () => {
  return (
    <SupabaseMillProvider>
      <Layout>
        <WorkerDetails />
      </Layout>
    </SupabaseMillProvider>
  );
};

export default WorkerDetailPage;
