'use client';

import { useState, useEffect } from 'react';
import { useErpStore } from '@/store/useErpStore';
import { whatsapp } from '@/lib/whatsapp';
import {
  ShieldAlert,
  Server,
  Cloud,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Cpu,
  Database,
  BarChart,
  HardDrive
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart as RBarChart,
  Bar as RBar,
  XAxis as RXAxis,
  YAxis as RYAxis,
  Tooltip as RTooltip,
  Cell as RCell
} from 'recharts';

export default function AdminPage() {
  const { loadData } = useErpStore();
  const [logs, setLogs] = useState<any[]>([]);
  const [latency, setLatency] = useState(145);

  useEffect(() => {
    loadData();
    // Load WhatsApp edge function status logs
    setLogs(whatsapp.getLogs());
  }, [loadData]);

  // Simulate cloud telemetry
  const handleSimulatePulse = () => {
    setLatency(Math.floor(80 + Math.random() * 90));
  };

  // SaaS distribution
  const saasDistributionData = [
    { tier: 'Starter Free', shops: 450, color: '#64748B' },
    { tier: 'Premium Cloud', shops: 180, color: '#2563EB' },
    { tier: 'Enterprise Multi', shops: 24, color: '#14B8A6' },
  ];

  return (
    <div className="space-y-6">
      
      {/* SaaS Diagnostics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-success/10 text-success flex items-center justify-center">
            <Server size={18} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-mutedtxt uppercase">Server Clusters</p>
            <p className="text-sm font-bold font-poppins text-success flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-success"></span>
              Healthy &bull; 99.98%
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Cpu size={18} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-mutedtxt uppercase">Supabase Edge Latency</p>
            <p className="text-sm font-bold font-mono text-primary flex items-center gap-1.5">
              {latency} ms
              <button onClick={handleSimulatePulse} title="Trigger telemetry sweep" className="p-0.5 hover:bg-slate-100 rounded">
                <RefreshCw size={10} className="animate-spin duration-1000" />
              </button>
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
            <Database size={18} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-mutedtxt uppercase">Active Connections</p>
            <p className="text-sm font-bold font-poppins text-slate-800 dark:text-white">654 Retailers</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-warning/10 text-warning flex items-center justify-center">
            <HardDrive size={18} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-mutedtxt uppercase">Vercel CPU Load</p>
            <p className="text-sm font-bold font-poppins text-warning">14.3% CPU</p>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SaaS Plan Distribution graph */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-2xl shadow-sm space-y-4">
          <h4 className="font-poppins font-bold text-sm text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <BarChart size={16} className="text-primary" />
            SaaS Plan Distribution (Active Shops)
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RBarChart data={saasDistributionData} layout="radial" innerRadius="30%" outerRadius="100%" barSize={15} startAngle={180} endAngle={0}>
                <RTooltip />
                <RBar dataKey="shops" name="Active Outlets" radius={[10, 10, 0, 0]}>
                  {saasDistributionData.map((entry, idx) => (
                    <RCell key={`cell-${idx}`} fill={entry.color} />
                  ))}
                </RBar>
                <RXAxis dataKey="tier" stroke="#94A3B8" fontSize={10} tickLine={false} />
                <RYAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
              </RBarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* API Integration Diagnostics Status lights */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-2xl shadow-sm space-y-4">
          <h4 className="font-poppins font-bold text-sm text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <ShieldAlert size={16} className="text-primary" />
            SaaS API Integrations Diagnostics
          </h4>

          <div className="space-y-4 pt-2">
            {/* WhatsApp Cloud API */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/40 dark:border-slate-800/40">
              <div className="space-y-0.5">
                <p className="font-bold text-xs">WhatsApp Business API</p>
                <p className="text-[10px] text-slate-400">Trigger: PDF Delivery</p>
              </div>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-success/15 text-success flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
                ACTIVE
              </span>
            </div>

            {/* Twilio SMS API */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/40 dark:border-slate-800/40">
              <div className="space-y-0.5">
                <p className="font-bold text-xs">Razorpay Subscriptions</p>
                <p className="text-[10px] text-slate-400">Trigger: Licensing Checkouts</p>
              </div>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-success/15 text-success flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
                ACTIVE
              </span>
            </div>

            {/* Supabase edge services */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/40 dark:border-slate-800/40">
              <div className="space-y-0.5">
                <p className="font-bold text-xs">Supabase Edge Engine</p>
                <p className="text-[10px] text-slate-400">Trigger: Sync Triggers</p>
              </div>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-success/15 text-success flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
                ACTIVE
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Cloud Auditing Logs */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-850">
          <h4 className="font-poppins font-bold text-sm text-slate-800 dark:text-white uppercase tracking-wider">
            WhatsApp Delivery & Edge Execution Audits
          </h4>
        </div>
        
        <div className="overflow-x-auto">
          {logs.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              <Cloud className="mx-auto mb-2 text-slate-300" size={24} />
              No active API delivery audits cached in this terminal.
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200/60 text-slate-600 dark:text-slate-400 text-xs font-bold font-poppins">
                  <th className="px-6 py-3">Audit ID</th>
                  <th className="px-6 py-3">Target number</th>
                  <th className="px-6 py-3">Message status</th>
                  <th className="px-6 py-3">Log Details</th>
                  <th className="px-6 py-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-xs font-medium">
                {logs.map(lg => (
                  <tr key={lg.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-3 font-mono">{lg.id}</td>
                    <td className="px-6 py-3 font-mono">+{lg.phone}</td>
                    <td className="px-6 py-3">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        lg.status === 'sent' 
                          ? 'bg-success/15 text-success' 
                          : 'bg-error/15 text-error'
                      }`}>
                        {lg.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-slate-500">{lg.message}</td>
                    <td className="px-6 py-3 text-slate-400 font-mono">{new Date(lg.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
}
