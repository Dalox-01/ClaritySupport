'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckSquare, Plus, Trash2, Flag, Calendar, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { DraggableWindow } from '@/components/draggable-window';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  deadline?: string;
  tags: string[];
  createdAt: string;
}

interface TaskManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  zIndex?: number;
  onFocus?: () => void;
}

export function TaskManagerModal({ isOpen, onClose, zIndex = 40, onFocus }: TaskManagerModalProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newTaskDeadline, setNewTaskDeadline] = useState('');
  const [newTaskTags, setNewTaskTags] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');

  // Charger les tâches
  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem('mail-center-tasks');
      if (saved) {
        setTasks(JSON.parse(saved));
      }
    }
  }, [isOpen]);

  // Sauvegarder les tâches
  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem('mail-center-tasks', JSON.stringify(tasks));
    }
  }, [tasks]);

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) {
      toast.error('Veuillez entrer un titre de tâche');
      return;
    }

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      completed: false,
      priority: newTaskPriority,
      deadline: newTaskDeadline || undefined,
      tags: newTaskTags ? newTaskTags.split(',').map(t => t.trim()) : [],
      createdAt: new Date().toISOString(),
    };

    setTasks([newTask, ...tasks]);
    setNewTaskTitle('');
    setNewTaskDeadline('');
    setNewTaskTags('');
    toast.success('Tâche ajoutée !');
  };

  const handleToggleTask = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
    toast.success('Tâche supprimée');
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active' && task.completed) return false;
    if (filter === 'completed' && !task.completed) return false;
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
    return true;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'medium': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'low': return 'text-green-400 bg-green-500/20 border-green-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const stats = {
    total: tasks.length,
    active: tasks.filter(t => !t.completed).length,
    completed: tasks.filter(t => t.completed).length,
    high: tasks.filter(t => t.priority === 'high' && !t.completed).length,
  };

  return (
    <DraggableWindow
      title="Gestionnaire de Tâches"
      isOpen={isOpen}
      onClose={onClose}
      width="1000px"
      height="800px"
      zIndex={zIndex}
      onFocus={onFocus}
    >
      <div className="h-full flex flex-col bg-gradient-to-br from-[#1a1f3a] to-[#0f1320]">
        {/* Header info */}
        <div className="p-4 border-b border-blue-500/20 bg-blue-500/5">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="p-2 bg-blue-500/20 rounded-lg"
            >
              <CheckSquare className="w-5 h-5 text-blue-400" />
            </motion.div>
            <div>
              <p className="text-xs text-gray-400">
                {stats.active} actives • {stats.completed} terminées • {stats.high} prioritaires
              </p>
            </div>
          </div>
        </div>

        {/* Formulaire ajout */}
        <div className="p-4 border-b border-blue-500/20 bg-blue-500/5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                    placeholder="Nouvelle tâche..."
                    className="col-span-2 bg-[#0f1320] border border-blue-500/20 rounded-lg px-4 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                    className="bg-[#0f1320] border border-blue-500/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="low">🟢 Priorité basse</option>
                    <option value="medium">🟠 Priorité moyenne</option>
                    <option value="high">🔴 Priorité haute</option>
                  </select>
                  <input
                    type="date"
                    value={newTaskDeadline}
                    onChange={(e) => setNewTaskDeadline(e.target.value)}
                    className="bg-[#0f1320] border border-blue-500/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                  <input
                    type="text"
                    value={newTaskTags}
                    onChange={(e) => setNewTaskTags(e.target.value)}
                    placeholder="Tags (séparés par virgule)..."
                    className="bg-[#0f1320] border border-blue-500/20 rounded-lg px-4 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                  <Button
                    onClick={handleAddTask}
                    className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter
                  </Button>
                </div>
              </div>

              {/* Filtres */}
              <div className="p-4 border-b border-blue-500/20 flex gap-2 flex-wrap">
                <div className="flex gap-1">
                  {(['all', 'active', 'completed'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                        filter === f
                          ? 'bg-blue-500/30 text-blue-400 border border-blue-500/50'
                          : 'bg-gray-700/30 text-gray-400 border border-gray-600/30 hover:bg-gray-700/50'
                      }`}
                    >
                      {f === 'all' ? 'Toutes' : f === 'active' ? 'Actives' : 'Terminées'}
                    </button>
                  ))}
                </div>
                <div className="flex gap-1">
                  {(['all', 'high', 'medium', 'low'] as const).map(p => (
                    <button
                      key={p}
                      onClick={() => setPriorityFilter(p)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                        priorityFilter === p
                          ? 'bg-blue-500/30 text-blue-400 border border-blue-500/50'
                          : 'bg-gray-700/30 text-gray-400 border border-gray-600/30 hover:bg-gray-700/50'
                      }`}
                    >
                      {p === 'all' ? 'Toutes priorités' : p === 'high' ? '🔴 Haute' : p === 'medium' ? '🟠 Moyenne' : '🟢 Basse'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Liste des tâches */}
              <div className="flex-1 overflow-y-auto p-4">
                {filteredTasks.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckSquare className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                    <p className="text-gray-400">Aucune tâche à afficher</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredTasks.map((task, index) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-4 rounded-xl border transition-all group ${
                          task.completed
                            ? 'bg-green-500/10 border-green-500/30'
                            : 'bg-[#0f1320] border-blue-500/20 hover:border-blue-500/40'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => handleToggleTask(task.id)}
                            className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                              task.completed
                                ? 'bg-green-500 border-green-500'
                                : 'border-gray-500 hover:border-blue-400'
                            }`}
                          >
                            {task.completed && <span className="text-white text-xs">✓</span>}
                          </button>
                          
                          <div className="flex-1">
                            <h4 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-white'}`}>
                              {task.title}
                            </h4>
                            
                            <div className="flex flex-wrap gap-2 mt-2">
                              <span className={`text-xs px-2 py-1 rounded-lg border ${getPriorityColor(task.priority)}`}>
                                <Flag className="w-3 h-3 inline mr-1" />
                                {task.priority === 'high' ? 'Haute' : task.priority === 'medium' ? 'Moyenne' : 'Basse'}
                              </span>
                              
                              {task.deadline && (
                                <span className="text-xs px-2 py-1 rounded-lg border text-cyan-400 bg-cyan-500/20 border-cyan-500/30">
                                  <Calendar className="w-3 h-3 inline mr-1" />
                                  {new Date(task.deadline).toLocaleDateString('fr-FR')}
                                </span>
                              )}
                              
                              {task.tags.map((tag, idx) => (
                                <span key={idx} className="text-xs px-2 py-1 rounded-lg border text-purple-400 bg-purple-500/20 border-purple-500/30">
                                  <Tag className="w-3 h-3 inline mr-1" />
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDeleteTask(task.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:bg-red-500/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
    </DraggableWindow>
  );
}
