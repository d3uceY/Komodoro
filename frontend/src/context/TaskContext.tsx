import { createContext, useContext, useEffect, useState } from 'react'
import {
  GetTasks,
  AddTask,
  DeleteTaskByID,
  SetTaskStatus,
  ClearFinishedTasks,
  DeleteAllTasks,
} from '../../wailsjs/go/main/App'
import type { utils } from '../../wailsjs/go/models'

type Task = utils.Task

interface TaskContextValue {
  tasks: Task[]
  addTask: (title: string) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  deleteAllTasks: () => Promise<void>
  setTaskStatus: (id: string, status: string) => Promise<void>
  clearFinishedTasks: () => Promise<void>
}

const TaskContext = createContext<TaskContextValue | null>(null)

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([])

  async function loadTasks() {
    const result = await GetTasks()
    setTasks(result ?? [])
  }

  useEffect(() => {
    loadTasks()
  }, [])

  async function addTask(title: string) {
    await AddTask(title)
    await loadTasks()
  }

  async function deleteTask(id: string) {
    await DeleteTaskByID(id)
    await loadTasks()
  }

  async function deleteAllTasks() {
    await DeleteAllTasks()
    await loadTasks()
  }

  async function setTaskStatus(id: string, status: string) {
    await SetTaskStatus(id, status)
    await loadTasks()
  }

  async function clearFinishedTasks() {
    await ClearFinishedTasks()
    await loadTasks()
  }

  return (
    <TaskContext value={{ tasks, addTask, deleteTask, deleteAllTasks, setTaskStatus, clearFinishedTasks }}>
      {children}
    </TaskContext>
  )
}

export function useTaskContext() {
  const ctx = useContext(TaskContext)
  if (!ctx) throw new Error('useTaskContext must be used within a TaskProvider')
  return ctx
}
