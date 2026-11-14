import React from 'react';

export const WorkloadBadge = ({ status, utilization }) => {
  const s = (status || '').toLowerCase();
  
  let styles = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotColor = 'bg-slate-400';
  let label = 'Unknown';

  if (s === 'overloaded') {
    styles = 'bg-rose-50 text-rose-700 border-rose-200';
    dotColor = 'bg-rose-500 animate-pulse';
    label = 'Overloaded';
  } else if (s === 'high') {
    styles = 'bg-orange-50 text-orange-700 border-orange-200';
    dotColor = 'bg-orange-500';
    label = 'High Workload';
  } else if (s === 'balanced') {
    styles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    dotColor = 'bg-emerald-500';
    label = 'Balanced';
  } else if (s === 'underutilized') {
    styles = 'bg-amber-50 text-amber-700 border-amber-200';
    dotColor = 'bg-amber-500';
    label = 'Underutilized';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${styles}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span>{label}</span>
      {utilization !== undefined && (
        <span className="font-mono text-[11px] opacity-80">({utilization.toFixed(1)}%)</span>
      )}
    </span>
  );
};

export const PriorityBadge = ({ priority }) => {
  const p = (priority || 'medium').toLowerCase();
  const map = {
    critical: 'bg-red-100 text-red-800 border-red-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    medium: 'bg-blue-100 text-blue-800 border-blue-200',
    low: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${map[p] || map.medium} capitalize`}>
      {p}
    </span>
  );
};

export const ComplexityBadge = ({ complexity }) => {
  const c = (complexity || 'medium').toLowerCase();
  const map = {
    critical: 'bg-purple-100 text-purple-800 border-purple-200',
    hard: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    medium: 'bg-sky-100 text-sky-800 border-sky-200',
    easy: 'bg-teal-100 text-teal-800 border-teal-200',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${map[c] || map.medium} capitalize`}>
      {c}
    </span>
  );
};

export const TaskStatusBadge = ({ status }) => {
  const s = (status || 'pending').toLowerCase();
  const map = {
    completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
    blocked: 'bg-rose-100 text-rose-800 border-rose-200',
    pending: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const labelMap = {
    completed: 'Completed',
    in_progress: 'In Progress',
    blocked: 'Blocked',
    pending: 'Pending',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${map[s] || map.pending}`}>
      {labelMap[s] || s}
    </span>
  );
};
