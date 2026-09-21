import React, { useEffect, useState } from 'react';
import { socket } from '../socket';
import { Activity, ShieldCheck, Cpu, Database, RefreshCw } from 'lucide-react';

export default function LiveDataSource() {
  const [containers, setContainers] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [updatedIds, setUpdatedIds] = useState(new Set());
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onContainerStats(data) {
      if (data && data.containers) {
        setContainers(data.containers);
        setLastUpdated(new Date(data.timestamp || Date.now()));

        // Trigger pulse highlight on row update
        const ids = new Set(data.containers.map(c => c.containerId));
        setUpdatedIds(ids);
        setTimeout(() => setUpdatedIds(new Set()), 800);
      }
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('container-stats', onContainerStats);

    // Initial REST fallback if socket is reconnecting
    fetch('/api/containers/live')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.containers) {
          setContainers(data.containers);
          setLastUpdated(new Date());
        }
      })
      .catch(err => console.error('Error fetching live stats initial state:', err));

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('container-stats', onContainerStats);
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Proof of Authenticity Banner */}
      <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/40 to-slate-800/80 border border-blue-500/30 rounded-xl p-5 shadow-lg backdrop-blur-sm">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-white tracking-tight">Real-Time Docker Engine Telemetry</h2>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                isConnected ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                {isConnected ? 'Socket Connected (2s Poll)' : 'Connecting...'}
              </span>
            </div>
            <p className="text-sm text-slate-300">
              <strong className="text-blue-300">Authenticity Guarantee:</strong> This data is read directly from the host's Docker Engine API in real time via <code className="bg-slate-800 text-blue-400 px-1.5 py-0.5 rounded text-xs">dockerode</code> — not simulated or fabricated. You can verify these CPU &amp; Memory numbers directly against Docker Desktop's dashboard.
            </p>
          </div>
        </div>
      </div>

      {/* Container Telemetry Table */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl overflow-hidden shadow-xl backdrop-blur-sm">
        <div className="px-6 py-4 border-b border-slate-700/60 flex items-center justify-between bg-slate-800/80">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-blue-400" />
            <h3 className="font-semibold text-white">Live Monitored Docker Workloads</h3>
            <span className="text-xs bg-slate-700 text-slate-300 px-2.5 py-0.5 rounded-full font-medium">
              {containers.length} Containers
            </span>
          </div>
          {lastUpdated && (
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 text-slate-400 animate-spin" style={{ animationDuration: '3s' }} />
              Last polled: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-700/60 bg-slate-900/50 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-6">Container Name</th>
                <th className="py-3.5 px-4">Team</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">CPU Usage / Limit</th>
                <th className="py-3.5 px-4">Memory Usage / Limit</th>
                <th className="py-3.5 px-4">Hourly Cost</th>
                <th className="py-3.5 px-6 text-right">Utilization Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/40 text-sm">
              {containers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <RefreshCw className="w-8 h-8 animate-spin text-blue-400" />
                      <p className="font-medium">Connecting to Docker Engine API...</p>
                    </div>
                  </td>
                </tr>
              ) : (
                containers.map((c) => {
                  const isUpdated = updatedIds.has(c.containerId);
                  const isIdle = c.cpuPercent < 5;

                  return (
                    <tr
                      key={c.containerId || c.containerName}
                      className={`transition-colors duration-300 ${
                        isUpdated ? 'bg-blue-500/10' : 'hover:bg-slate-700/30'
                      }`}
                    >
                      <td className="py-4 px-6 font-mono text-sm font-semibold text-white">
                        <div className="flex items-center gap-2">
                          <Database className="w-4 h-4 text-blue-400 shrink-0" />
                          <span>{c.containerName}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-700/70 text-slate-300 border border-slate-600/50 capitalize">
                          {c.team}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                          Running
                        </span>
                      </td>
                      <td className="py-4 px-4 font-mono text-xs">
                        <div className="space-y-1">
                          <div className="flex justify-between text-slate-300">
                            <span className="font-semibold text-white">{c.cpuPercent}%</span>
                            <span className="text-slate-400">({c.cpuUsedCores} / {c.cpuLimitCores} Cores)</span>
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-1.5 rounded-full transition-all duration-500 ${
                                isIdle ? 'bg-amber-400' : 'bg-emerald-400'
                              }`}
                              style={{ width: `${Math.min(100, (c.cpuUsedCores / c.cpuLimitCores) * 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-mono text-xs">
                        <div className="space-y-1">
                          <div className="flex justify-between text-slate-300">
                            <span className="font-semibold text-white">{c.memUsedMB} MB</span>
                            <span className="text-slate-400">/ {c.memLimitMB} MB ({c.memPercent}%)</span>
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="h-1.5 bg-blue-400 rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(100, c.memPercent)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-200 font-mono">
                        ₹{c.costPerHour?.toFixed(2)}/hr
                      </td>
                      <td className="py-4 px-6 text-right">
                        {isIdle ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/30">
                            Idle (Wasteful)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            Active (Efficient)
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
