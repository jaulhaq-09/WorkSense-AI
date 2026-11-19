import React from 'react';

export const WorkloadBadge = ({ status, utilization, size = 'sm' }) => {
  const s = (status || '').toLowerCase();

  let styles = 'bg-zinc-800/40 text-zinc-300 border-zinc-700/50';
  let dotColor = 'bg-zinc-400';
  let label = 'Unknown';

  if (s === 'overloaded') {
    styles = 'bg-rose-500/[0.08] text-rose-300 border-rose-500/25';
    dotColor = 'bg-rose-400 animate-pulse';
    label = 'Overloaded';
  } else if (s === 'high') {
    styles = 'bg-amber-500/[0.08] text-amber-300 border-amber-500/25';
    dotColor = 'bg-amber-400';
    label = 'High Load';
  } else if (s === 'balanced') {
    styles = 'bg-emerald-500/[0.08] text-emerald-300 border-emerald-500/25';
    dotColor = 'bg-emerald-400';
    label = 'Balanced';
  } else if (s === 'underutilized') {
    styles = 'bg-sky-500/[0.08] text-sky-300 border-sky-500/25';
    dotColor = 'bg-sky-400';
    label = 'Available';
  }

  const pad = size === 'xs' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium border backdrop-blur-sm ${pad} ${styles}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />
      <span>{label}</span>
      {utilization !== undefined && (
        <span className="font-mono text-[10px] opacity-75">({Number(utilization).toFixed(0)}%)</span>
      )}
    </span>
  );
};

export const PriorityBadge = ({ priority }) => {
  const p = (priority || 'medium').toLowerCase();
  const map = {
    critical: {
      dot: 'bg-rose-400',
      text: 'text-rose-300',
      label: 'Urgent'
    },
    urgent: {
      dot: 'bg-rose-400',
      text: 'text-rose-300',
      label: 'Urgent'
    },
    high: {
      dot: 'bg-amber-400',
      text: 'text-amber-300',
      label: 'High'
    },
    medium: {
      dot: 'bg-zinc-400',
      text: 'text-zinc-300',
      label: 'Medium'
    },
    low: {
      dot: 'bg-zinc-500',
      text: 'text-zinc-400',
      label: 'Low'
    },
  };

  const current = map[p] || map.medium;

  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium text-zinc-300 bg-zinc-900/60 border border-white/[0.06]">
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${current.dot}`} />
      <span className={current.text}>{current.label}</span>
    </span>
  );
};

export const ComplexityBadge = ({ complexity }) => {
  const c = (complexity || 'medium').toLowerCase();
  const map = {
    critical: { text: 'text-purple-300', weight: '2.0x' },
    hard: { text: 'text-indigo-300', weight: '1.5x' },
    medium: { text: 'text-zinc-300', weight: '1.2x' },
    easy: { text: 'text-zinc-400', weight: '1.0x' },
  };

  const current = map[c] || map.medium;

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-zinc-900/60 border border-white/[0.06] text-zinc-300">
      <span className={`capitalize ${current.text}`}>{c}</span>
      <span className="text-[10px] text-zinc-500 font-mono">({current.weight})</span>
    </span>
  );
};

export const TaskStatusBadge = ({ status }) => {
  const s = (status || 'pending').toLowerCase();
  const map = {
    completed: {
      style: 'bg-emerald-500/[0.08] text-emerald-300 border-emerald-500/25',
      label: 'Completed',
      dot: 'bg-emerald-400'
    },
    in_progress: {
      style: 'bg-indigo-500/[0.08] text-indigo-300 border-indigo-500/25',
      label: 'In Progress',
      dot: 'bg-indigo-400 animate-pulse'
    },
    blocked: {
      style: 'bg-rose-500/[0.08] text-rose-300 border-rose-500/25',
      label: 'Blocked',
      dot: 'bg-rose-400'
    },
    pending: {
      style: 'bg-zinc-800/40 text-zinc-400 border-zinc-700/40',
      label: 'Pending',
      dot: 'bg-zinc-500'
    },
  };

  const current = map[s] || map.pending;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium border ${current.style}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${current.dot}`} />
      <span>{current.label}</span>
    </span>
  );
};
