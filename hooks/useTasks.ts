'use client';

import { useState, useCallback } from 'react';
import { taskService, Task, CreateTaskInput, TaskQueryParams } from '@/services/api';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });

  const fetchTasks = useCallback(async (params?: TaskQueryParams) => {
    setLoading(true);
    setError(null);
    try {
      const res = await taskService.getTasks(params);
      setTasks(res.data);
      setMeta(res.meta);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  const createTask = useCallback(async (data: CreateTaskInput) => {
    const res = await taskService.createTask(data);
    setTasks((prev) => [res.data, ...prev]);
    return res.data;
  }, []);

  const updateTask = useCallback(async (id: string, data: Partial<CreateTaskInput>) => {
    const res = await taskService.updateTask(id, data);
    setTasks((prev) => prev.map((t) => (t._id === id ? res.data : t)));
    return res.data;
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    await taskService.deleteTask(id);
    setTasks((prev) => prev.filter((t) => t._id !== id));
  }, []);

  return { tasks, loading, error, meta, fetchTasks, createTask, updateTask, deleteTask };
}
