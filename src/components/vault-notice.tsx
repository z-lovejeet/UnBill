'use client';
import { useEffect, useState } from 'react';
import { useAuditStore } from '@/lib/store';
export function VaultNotice() {
  const [failed, setFailed] = useState(false);
  const error = useAuditStore((s) => s.vaultError);
  useEffect(() => {
    const handler = () => setFailed(true);
    window.addEventListener('unbill-vault-error', handler);
    return () => window.removeEventListener('unbill-vault-error', handler);
  }, []);
  if (!failed && !error) return null;
  return (
    <div
      role="alert"
      className="bg-amber-50 border-b border-amber-200 px-4 py-3 text-sm text-amber-950 print:hidden"
    >
      {error ||
        'The browser could not save encrypted history. Your current report remains visible, but may be lost on refresh. Copy or print what you need and check browser storage permissions.'}
    </div>
  );
}
