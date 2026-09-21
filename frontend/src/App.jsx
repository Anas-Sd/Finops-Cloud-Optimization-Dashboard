import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Activity,
  BarChart3,
  AlertOctagon,
  Users,
  Layers,
  Lightbulb,
  Server,
  RefreshCw,
  FileText,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Menu,
  X,
  Zap,
  Globe
} from 'lucide-react';

import LiveDataSource from './components/LiveDataSource';
import CostAnalyticsTab from './components/tabs/CostAnalyticsTab';
import WasteRightSizingTab from './components/tabs/WasteRightSizingTab';
import TeamCostAttributionTab from './components/tabs/TeamCostAttributionTab';
import ResourceProfileTab from './components/tabs/ResourceProfileTab';
import RecommendationsAuditTab from './components/tabs/RecommendationsAuditTab';
import ExecutiveReportModal from './components/ExecutiveReportModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('live');
  const [summaryData, setSummaryData] = useState(null);
  const [teamsData, setTeamsData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [wasteData, setWasteData] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Filter States
  const [teamFilter, setTeamFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [summaryRes, teamsRes, trendRes, wasteRes, recsRes, analyticsRes] = await Promise.all([
        axios.get('/api/costs/summary'),
        axios.get('/api/costs/by-team'),
        axios.get('/api/costs/trend'),
        axios.get('/api/waste'),
        axios.get('/api/waste/recommendations'),
        axios.get('/api/costs/analytics')
      ]);

      if (summaryRes.data?.success) setSummaryData(summaryRes.data.summary);
      if (teamsRes.data?.success) setTeamsData(teamsRes.data.teams);
      if (trendRes.data?.success) setTrendData(trendRes.data.trend);
      if (wasteRes.data?.success) setWasteData(wasteRes.data.containers);
      if (recsRes.data?.success) setRecommendations(recsRes.data.recommendations);
      if (analyticsRes.data?.success) setAnalyticsData(analyticsRes.data.analytics);
    } catch (err) {
      console.error('Error fetching dashboard REST endpoints:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Filtered Waste Containers
  const filteredWaste = wasteData.filter(w => {
    const matchesTeam = teamFilter === 'All' || w.team.toLowerCase() === teamFilter.toLowerCase();
    const matchesSeverity = severityFilter === 'All' || w.severity === severityFilter;
    return matchesTeam && matchesSeverity;
  });

  // Filtered Recommendations
  const filteredRecs = recommendations.filter(r => {
    const matchesTeam = teamFilter === 'All' || r.team.toLowerCase() === teamFilter.toLowerCase();
    const matchesSeverity = severityFilter === 'All' || r.severity === severityFilter;
    return matchesTeam && matchesSeverity;
  });

  const tabs = [
    { id: 'live', label: 'Live Telemetry Stream', icon: Activity, badge: 'Live 2s' },
    { id: 'analytics', label: 'Cost Analytics', icon: BarChart3 },
    { id: 'waste', label: 'Waste & Right-Sizing', icon: AlertOctagon, alertCount: wasteData.length },
    { id: 'attribution', label: 'Team Cost Attribution', icon: Users },
    { id: 'profile', label: 'Resource Correlation', icon: Layers },
    { id: 'recommendations', label: 'Recommendations & Audit', icon: Lightbulb }
  ];

  const currentTabObj = tabs.find(t => t.id === activeTab) || tabs[0];

  return (
    <div className="min-h-screen bg-[#090d16] text-[#dae2fd] flex font-sans antialiased selection:bg-sky-500/30 selection:text-sky-200">
      {/* Sidebar for Desktop */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#0f172a]/95 border-r border-[#1e293b] flex flex-col justify-between transition-transform duration-300 backdrop-blur-xl md:translate-x-0 ${
        isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6 space-y-8">
          {/* Sidebar Top Branding */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-tr from-sky-500 to-indigo-600 rounded-xl text-slate-950 shadow-lg shadow-sky-500/20 font-bold">
                <Zap className="w-6 h-6 fill-slate-950" />
              </div>
              <div>
                <h1 className="font-extrabold text-base text-white tracking-tight leading-snug">
                  KubeScale FinOps
                </h1>
                <span className="text-[10px] bg-sky-500/15 text-sky-300 font-extrabold px-2 py-0.5 rounded border border-sky-500/30 tracking-wide uppercase font-mono">
                  v2.4 Console
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="md:hidden text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cluster Selector Pill */}
          <div className="bg-[#090d16]/80 p-3 rounded-xl border border-[#1e293b] flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 text-slate-300">
              <Globe className="w-3.5 h-3.5 text-sky-400" />
              <span className="truncate">docker-desktop-local</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>

          {/* Navigation Menu Links */}
          <nav className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 block mb-2 font-mono">
              Telemetry Modules
            </span>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsMobileSidebarOpen(false);
                    if (tab.id !== 'live') fetchDashboardData();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all group ${
                    isActive
                      ? 'bg-sky-500 text-slate-950 shadow-lg shadow-sky-500/25 font-extrabold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-[#1e293b]/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400 group-hover:text-sky-400'}`} />
                    <span>{tab.label}</span>
                  </div>

                  {tab.badge && (
                    <span className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-mono ${
                      isActive ? 'bg-slate-950/20 text-slate-950 border border-slate-950/30' : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      {tab.badge}
                    </span>
                  )}

                  {tab.alertCount > 0 && !tab.badge && (
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                    }`}>
                      {tab.alertCount} Flags
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Bottom Footer Status */}
        <div className="p-6 border-t border-[#1e293b] bg-[#0f172a]/40 space-y-3">
          <div className="flex items-center gap-2 text-xs text-slate-300 font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Docker Engine Socket Active</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-normal font-mono">
            Telemetry Stream: /var/run/docker.sock
          </p>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-72 flex flex-col min-w-0">
        {/* Top Command Header Bar */}
        <header className="bg-[#0f172a]/80 border-b border-[#1e293b] sticky top-0 z-40 backdrop-blur-md px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden text-slate-400 hover:text-white p-2 rounded-lg bg-[#1e293b]"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
                {currentTabObj.label}
              </h2>
              <p className="text-xs text-slate-400 hidden sm:block font-mono">
                Real-Time Cloud Cost Optimisation Console &bull; Docker Engine API
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-extrabold rounded-xl shadow-lg shadow-sky-500/20 transition-all"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Export Audit Report</span>
            </button>

            <button
              onClick={fetchDashboardData}
              disabled={isLoading}
              className="flex items-center gap-2 px-3.5 py-2 bg-[#1e293b] hover:bg-[#334155] border border-[#334155] text-slate-200 text-xs font-semibold rounded-xl transition-all font-mono"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </header>

        {/* Tab View Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-8">
          {activeTab === 'live' && <LiveDataSource />}

          {activeTab === 'analytics' && (
            <CostAnalyticsTab
              summaryData={summaryData}
              analyticsData={analyticsData}
              teamsData={teamsData}
              trendData={trendData}
            />
          )}

          {activeTab === 'waste' && (
            <WasteRightSizingTab
              analyticsData={analyticsData}
              wasteData={filteredWaste}
              summaryData={summaryData}
            />
          )}

          {activeTab === 'attribution' && (
            <TeamCostAttributionTab
              analyticsData={analyticsData}
              teamsData={teamsData}
            />
          )}

          {activeTab === 'profile' && (
            <ResourceProfileTab
              analyticsData={analyticsData}
            />
          )}

          {activeTab === 'recommendations' && (
            <RecommendationsAuditTab
              recommendations={filteredRecs}
              teamFilter={teamFilter}
              setTeamFilter={setTeamFilter}
              severityFilter={severityFilter}
              setSeverityFilter={setSeverityFilter}
              onOpenReportModal={() => setIsReportModalOpen(true)}
            />
          )}
        </main>

        {/* Executive Report Modal */}
        <ExecutiveReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          summary={summaryData}
          analytics={analyticsData}
          waste={wasteData}
        />

        {/* Footer */}
        <footer className="border-t border-[#1e293b] bg-[#090d16]/80 py-4 px-8 text-center text-xs text-slate-400 font-mono">
          <p>KubeScale FinOps Intelligence &bull; Docker Telemetry Engine &bull; Capstone Project</p>
        </footer>
      </div>
    </div>
  );
}
