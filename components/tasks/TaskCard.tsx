'use client';

import { useState } from 'react';
import { Pencil, Trash2, Clock, CircleCheck as CheckCircle2, Circle, CircleAlert as AlertCircle } from 'lucide-react';
import { Task } from '@/services/api';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const statusConfig = {
  pending: {
    label: 'Pending',
    icon: Circle,
    className: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  },
  'in-progress': {
    label: 'In Progress',
    icon: Clock,
    className: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle2,
    className: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  },
};

const priorityConfig = {
  low: { label: 'Low', className: 'bg-slate-500/20 text-slate-400' },
  medium: { label: 'Medium', className: 'bg-blue-500/20 text-blue-400' },
  high: { label: 'High', className: 'bg-red-500/20 text-red-400' },
};

export default function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const status = statusConfig[task.status];
  const priority = priorityConfig[task.priority];
  const StatusIcon = status.icon;

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="group bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 hover:border-slate-600 hover:bg-slate-800/80 transition-all duration-200">
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-semibold text-white text-sm leading-snug line-clamp-2 flex-1">{task.title}</h3>
        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition shrink-0">
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 transition"
            title="Edit"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="flex gap-1">
              <button
                onClick={() => onDelete(task._id)}
                className="px-2 py-1 rounded-lg bg-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/30 transition"
              >
                Confirm
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-2 py-1 rounded-lg bg-slate-700 text-slate-400 text-xs font-medium hover:bg-slate-600 transition"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {task.description && (
        <p className="text-slate-400 text-xs leading-relaxed mb-3 line-clamp-2">{task.description}</p>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${status.className}`}>
          <StatusIcon className="w-3 h-3" />
          {status.label}
        </span>
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${priority.className}`}>
          <AlertCircle className="w-3 h-3" />
          {priority.label}
        </span>
        <span className="ml-auto text-xs text-slate-500">{formatDate(task.createdAt)}</span>
      </div>
    </div>
  );
}
