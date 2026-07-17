import React from 'react';
import StatsCard from '@/components/dashboard/StatsCard';
import PropertyRiskChart from '@/components/dashboard/PropertyRiskChart';
import ReportStatusChart from '@/components/dashboard/ReportStatusChart';
import MarketTrendsChart from '@/components/dashboard/MarketTrendsChart';
import TasksTable from '@/components/dashboard/TasksTable';
import { Building2, FileText, Activity, AlertCircle, Calendar, Plus } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-8">
      
      {/* Header Section */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-[32px] font-extrabold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-gray-500 mt-1">Portfolio overview and real-time risk surveillance for <span className="font-semibold text-gray-700">Q4 2023</span>.</p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition shadow-sm">
            <Calendar size={16} />
            <span>Oct 24, 2023</span>
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 rounded-xl text-sm font-medium text-white transition shadow-sm">
            <Plus size={18} />
            <span>Add Property</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Total Properties" 
          value="1,284" 
          icon={<Building2 size={20} strokeWidth={2.5} />} 
          trendValue="12%" 
          trendUp={true} 
        />
        <StatsCard 
          title="Reports Generated" 
          value="842" 
          icon={<FileText size={20} strokeWidth={2.5} />} 
          trendValue="8%" 
          trendUp={true} 
        />
        <StatsCard 
          title="Avg Risk Score" 
          value="42/100" 
          icon={<Activity size={20} strokeWidth={2.5} />} 
          trendValue="4%" 
          trendUp={false} 
        />
        <StatsCard 
          title="Active Alerts" 
          value="12" 
          icon={<AlertCircle size={20} strokeWidth={2.5} />} 
          trendValue="3" 
          trendUp={true} 
        />
      </div>

      {/* Middle Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PropertyRiskChart />
        </div>
        <div className="lg:col-span-1">
          <ReportStatusChart />
        </div>
      </div>

      {/* Market Trends */}
      <MarketTrendsChart />

      {/* Recent Tasks */}
      <TasksTable />

    </div>
  );
}