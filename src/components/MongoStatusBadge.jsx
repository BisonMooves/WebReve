import React, { useEffect, useState } from 'react';
import { Database, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';

export default function MongoStatusBadge() {
  const [status, setStatus] = useState({
    connected: false,
    loading: true,
    error: null,
    hasPlaceholder: false
  });

  const checkStatus = async () => {
    try {
      setStatus((prev) => ({ ...prev, loading: true }));
      const res = await fetch('/api/status');
      if (res.ok) {
        const data = await res.json();
        setStatus({
          connected: data.connected,
          loading: false,
          error: data.error,
          hasPlaceholder: data.hasPlaceholder
        });
      } else {
        setStatus({
          connected: false,
          loading: false,
          error: `HTTP ${res.status}`,
          hasPlaceholder: false
        });
      }
    } catch {
      setStatus({
        connected: false,
        loading: false,
        error: 'API server connecting...',
        hasPlaceholder: false
      });
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  if (status.loading) {
    return (
      <div className="flex items-center gap-1.5 font-mono text-[10px] text-[#1A1512]/60 px-2.5 py-1 border border-[#1A1512]/20">
        <RefreshCw className="w-3 h-3 animate-spin text-[#C1512F]" />
        <span>CHECKING MONGODB ATLAS...</span>
      </div>
    );
  }

  if (status.connected) {
    return (
      <div className="flex items-center gap-1.5 font-mono text-[10px] text-white bg-[#1A1512] px-2.5 py-1 border border-[#1A1512]">
        <CheckCircle2 className="w-3 h-3 text-[#10B981]" />
        <span className="font-bold tracking-wider">MONGODB ATLAS CONNECTED</span>
      </div>
    );
  }

  if (status.hasPlaceholder) {
    return (
      <div
        className="flex items-center gap-1.5 font-mono text-[10px] text-[#C1512F] bg-[#C1512F]/10 px-2.5 py-1 border border-[#C1512F]/40 cursor-help"
        title="Replace <db_username> in host Environment Variables with your MongoDB Atlas database username."
      >
        <AlertTriangle className="w-3 h-3" />
        <span className="font-bold">SET DB USERNAME IN HOST ENV</span>
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-1.5 font-mono text-[10px] text-[#C1512F] bg-[#C1512F]/10 px-2.5 py-1 border border-[#C1512F]/30 cursor-help"
      title={status.error || 'MongoDB is not connected. Ensure MONGO_URL is set in Vercel/Render Environment Variables and IP 0.0.0.0/0 is allowed in Atlas.'}
    >
      <AlertTriangle className="w-3 h-3 text-[#C1512F]" />
      <span className="font-bold">MONGODB OFFLINE (LOCAL FALLBACK)</span>
    </div>
  );
}
