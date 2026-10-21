'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { AdminFeedbackInboxPage } from '@/components/UniversalFeedbackSystem';

export default function ZyvoriqAdminFeedbackPage() {
  const router = useRouter();
  return (
    <AdminFeedbackInboxPage
      appId="zyvoriq"
      appName="Zyvoriq Content Studio"
      onBackToApp={() => router.push('/swarm-MUI')}
    />
  );
}
