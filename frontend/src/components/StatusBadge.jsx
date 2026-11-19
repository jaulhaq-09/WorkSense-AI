import React from 'react';

export const WorkloadBadge = ({ status, utilization }) => {
  const s = (status || '').toLowerCase();
  
  let styles = 'bg-slate-800/80 text-slate-300 border-slate-700';
  let dotColor = 'bg-slate-400';
  let label = 'Unknown';

  if (s === 'overloaded') {
    styles = 'bg-rose-500/15 text-rose-300 border-rose-500/30 shadow-sm shadow-rose-500/10';
    dotColor = 'bg-rose-400 animate-pulse';
    label = 'Overloaded';
  } else if (s === 'high') {
    styles = 'bg-amber-500/15 text-amber-300 border-amber-500/30';
    dotColor = 'bg-amber-400';
    label = 'High Workload';
  } else if (s === 'balanced') {
    styles = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
    dotColor = 'bg-emerald-400';
    label = 'Balanced';
  } else if (s === 'underutilized') {
    styles = 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
    dotColor = 'bg-cyan-400';
    label = 'Underutilized';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm ${styles}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />
      <span>{label}</span>
      {utilization !== undefined && (
        <span className="font-mono text-[11px] opacity-80">({Number(utilization).toFixed(1)}%)</span>
      )}
    </span>
  );
};

export const PriorityBadge = ({ priority }) => {
  const p = (priority || 'medium').toLowerCase();
  const map = {
    critical: {
      style: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
      dot: 'bg-rose-400'
    },
    urgent: {
      style: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
      dot: 'bg-rose-400'
    },
    high: {
      style: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      dot: 'bg-amber-400'
    },
    medium: {
      style: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
      dot: 'bg-sky-400'
    },
    low: {
      style: 'bg-slate-700/50 text-slate-300 border-slate-600/50',
      dot: 'bg-slate-400'
    },
  };

  const current = map[p] || map.medium;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium border ${current.style} capitalize`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${current.dot}`} />
      {p}
    </span>
  );
};

export const ComplexityBadge = ({ complexity }) => {
  const c = (complexity || 'medium').toLowerCase();
  const map = {
    critical: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    hard: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    medium: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    easy: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${map[c] || map.medium} capitalize`}>
      {c}
    </span>
  );
};

export const TaskStatusBadge = ({ status }) => {
  const s = (status || 'pending').toLowerCase();
  const map = {
    completed: {
      style: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      label: 'Completed',
      dot: 'bg-emerald-400'
    },
    in_progress: {
      style: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
      label: 'In Progress',
      dot: 'bg-indigo-400 animate-pulse'
    },
    blocked: {
      style: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
      label: 'Blocked',
      dot: 'bg-rose-400'
    },
    pending: {
      style: 'bg-slate-800/80 text-slate-300 border-slate-700/60',
      label: 'Pending',
      dot: 'bg-slate-400'
    },
  };

  const current = map[s] || map.pending;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold border ${current.style}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${current.dot}`} />
      <span>{current.label}</span>
    </span>
  );
};
