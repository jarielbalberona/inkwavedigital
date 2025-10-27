import { createFileRoute, redirect } from '@tanstack/react-router';
import { DashboardLayout } from '../components/DashboardLayout';
import { useSuperAdmin } from '../hooks/useSuperAdmin';

export const Route = createFileRoute('/')({
  component: DashboardLayout,
  beforeLoad: () => {
    // This will redirect to appropriate default page based on role
    // The actual redirect logic will be in DashboardLayout
  },
});

