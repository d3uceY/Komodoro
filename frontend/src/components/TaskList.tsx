import { useState, useRef, useEffect } from 'react'
import { Check, MoreVertical, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTaskContext } from '@/context/TaskContext'

export default function TaskList() {
  const { tasks, addTask, deleteTask, deleteAllTasks, setTaskStatus, clearFinishedTasks } = useTaskContext()

  const [showAddForm, setShowAddForm] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false)
  const [taskMenuOpen, setTaskMenuOpen] = useState<string | null>(null)

  const headerMenuRef = useRef<HTMLDivElement>(null)
  const taskMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (headerMenuRef.current && !headerMenuRef.current.contains(e.target as Node)) {
        setHeaderMenuOpen(false)
      }
      if (taskMenuRef.current && !taskMenuRef.current.contains(e.target as Node)) {
        setTaskMenuOpen(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleToggleDone(e: React.MouseEvent, task: { id: string; status: string }) {
    e.stopPropagation()
    await setTaskStatus(task.id, task.status === 'done' ? 'active' : 'done')
  }

  async function handleSetActive(task: { id: string; status: string }) {
    if (task.status === 'active') return
    await setTaskStatus(task.id, 'active')
  }

  async function handleDeleteTask(id: string) {
    await deleteTask(id)
    setTaskMenuOpen(null)
  }

  async function handleClearFinished() {
    await clearFinishedTasks()
    setHeaderMenuOpen(false)
  }

  async function handleClearAll() {
    await deleteAllTasks()
    setHeaderMenuOpen(false)
  }

  async function handleSaveTask() {
    if (!newTaskTitle.trim()) return
    await addTask(newTaskTitle.trim())
    setNewTaskTitle('')
    setShowAddForm(false)
  }

  function handleCancelAdd() {
    setNewTaskTitle('')
    setShowAddForm(false)
  }

  return (
    <div className="w-full max-w-md rounded-xl overflow-hidden bg-[#9B3535] shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4">
        <h2 className="text-white text-lg font-semibold tracking-wide">Tasks</h2>
        <div className="relative" ref={headerMenuRef}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setHeaderMenuOpen((o) => !o)}
            className="text-white/80 hover:text-white hover:bg-white/10"
          >
            <MoreVertical size={20} />
          </Button>
          {headerMenuOpen && (
            <div className="absolute right-0 top-9 z-50 w-48 rounded-lg bg-white shadow-lg py-1 text-sm text-gray-800">
              <button
                onClick={handleClearFinished}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
              >
                Clear finished tasks
              </button>
              <button
                onClick={handleClearAll}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors text-red-600"
              >
                Clear all tasks
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Task list */}
      <div className="flex flex-col gap-2 px-3 pb-3">
        {tasks.map((task) => {
          const isDone = task.status === 'done'
          return (
            <div
              key={task.id}
              onClick={() => handleSetActive(task)}
              className={`flex items-center gap-3 bg-white rounded-lg px-3 py-3 cursor-pointer select-none transition-all ${
                !isDone ? 'border-l-4 border-l-gray-800' : 'border-l-4 border-l-transparent'
              }`}
            >
              {/* Check/circle button */}
              <button
                onClick={(e) => handleToggleDone(e, task)}
                className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                  isDone
                    ? 'bg-gray-700 border-gray-700 text-white'
                    : 'border-gray-400 bg-white hover:border-gray-600'
                }`}
              >
                {isDone && <Check size={12} strokeWidth={3} />}
              </button>

              {/* Title */}
              <span
                className={`flex-1 text-sm leading-snug ${
                  isDone ? 'line-through text-gray-400' : 'text-gray-800'
                }`}
              >
                {task.title}
              </span>

              {/* Per-task 3-dot menu */}
              <div
                className="relative"
                ref={taskMenuOpen === task.id ? taskMenuRef : null}
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setTaskMenuOpen((open) => (open === task.id ? null : task.id))}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                >
                  <MoreVertical size={16} />
                </Button>
                {taskMenuOpen === task.id && (
                  <div className="absolute right-0 top-8 z-50 w-36 rounded-lg bg-white shadow-lg border border-gray-100 py-1 text-sm text-gray-800">
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600 transition-colors"
                    >
                      Delete task
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {/* Add task form */}
        {showAddForm ? (
          <div className="bg-white rounded-lg px-4 py-4 shadow-sm">
            <input
              autoFocus
              type="text"
              placeholder="What are you working on?"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveTask()
                if (e.key === 'Escape') handleCancelAdd()
              }}
              className="w-full text-sm text-gray-800 placeholder:text-gray-400 placeholder:italic outline-none border-b border-gray-200 pb-2 mb-4"
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={handleCancelAdd}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveTask}
                disabled={!newTaskTitle.trim()}
                className="bg-gray-800 text-white hover:bg-gray-700"
              >
                Save
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="ghost"
            onClick={() => setShowAddForm(true)}
            className="w-full border-2 border-dashed border-white/30 text-white/70 hover:border-white/50 hover:text-white/90 hover:bg-transparent gap-2"
          >
            <Plus size={16} />
            Add Task
          </Button>
        )}
      </div>
    </div>
  )
}
