'use client';

import { Suspense } from 'react';
import { usePageTracking } from '@/hooks/usePageTracking';

function Tracker() {
  usePageTracking();
  return null;
}

export default function PageTracker() {
  return (
    <Suspense fallback={null}>
      <Tracker />
    </Suspense>
  );
}