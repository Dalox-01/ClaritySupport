'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Plus, Trash2, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { DraggableWindow } from '@/components/draggable-window';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  notified?: boolean;
}

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  zIndex?: number;
  onFocus?: () => void;
}

export function CalendarModal({ isOpen, onClose, zIndex = 40, onFocus }: CalendarModalProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventTime, setNewEventTime] = useState('09:00');

  // Charger les événements
  useEffect(() => {
    const saved = localStorage.getItem('mail-center-calendar-events');
    if (saved) {
      setEvents(JSON.parse(saved));
    }
  }, [isOpen]);

  // Sauvegarder les événements
  useEffect(() => {
    if (events.length > 0) {
      localStorage.setItem('mail-center-calendar-events', JSON.stringify(events));
    }
  }, [events]);

  // Vérifier les notifications
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      events.forEach(event => {
        if (event.date === today && event.time === currentTime && !event.notified) {
          toast.info(`📅 Rappel: ${event.title}`, {
            duration: 10000,
          });
          // Marquer comme notifié
          setEvents(prev => prev.map(e => 
            e.id === event.id ? { ...e, notified: true } : e
          ));
        }
      });
    }, 60000); // Vérifier toutes les minutes

    return () => clearInterval(interval);
  }, [events]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleAddEvent = () => {
    if (!selectedDate || !newEventTitle.trim()) {
      toast.error('Veuillez sélectionner une date et entrer un titre');
      return;
    }

    const newEvent: Event = {
      id: Date.now().toString(),
      title: newEventTitle,
      date: selectedDate,
      time: newEventTime,
      notified: false,
    };

    setEvents([...events, newEvent]);
    setNewEventTitle('');
    setNewEventTime('09:00');
    toast.success('Événement ajouté avec succès !');
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter(e => e.id !== id));
    toast.success('Événement supprimé');
  };

  const getEventsForDate = (date: string) => {
    return events.filter(e => e.date === date);
  };

  const formatDateString = (year: number, month: number, day: number) => {
    return `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  };

  return (
    <DraggableWindow
      title="Calendrier & Rappels"
      isOpen={isOpen}
      onClose={onClose}
      width="1000px"
      height="750px"
      zIndex={zIndex}
      onFocus={onFocus}
    >
      <div className="h-full flex flex-col bg-gradient-to-br from-[#1a1f3a] to-[#0f1320]">
        {/* Header info */}
        <div className="p-4 border-b border-blue-500/20 bg-blue-500/5">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="p-2 bg-blue-500/20 rounded-lg"
            >
              <CalendarIcon className="w-5 h-5 text-blue-400" />
            </motion.div>
            <div>
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <Bell className="w-3 h-3" />
                Notifications automatiques activées
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Calendrier */}
            <div>
                  {/* Navigation mois */}
                  <div className="flex items-center justify-between mb-4">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handlePreviousMonth}
                      className="text-gray-400 hover:text-white"
                    >
                      ←
                    </Button>
                    <h4 className="text-lg font-semibold text-white">
                      {currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                    </h4>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleNextMonth}
                      className="text-gray-400 hover:text-white"
                    >
                      →
                    </Button>
                  </div>

                  {/* Jours de la semaine */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
                      <div key={day} className="text-center text-xs font-semibold text-gray-400 py-2">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Grille du calendrier */}
                  <div className="grid grid-cols-7 gap-1">
                    {/* Jours vides avant le début du mois */}
                    {Array.from({ length: startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1 }).map((_, idx) => (
                      <div key={`empty-${idx}`} className="aspect-square" />
                    ))}

                    {/* Jours du mois */}
                    {Array.from({ length: daysInMonth }).map((_, idx) => {
                      const day = idx + 1;
                      const dateString = formatDateString(currentDate.getFullYear(), currentDate.getMonth(), day);
                      const dayEvents = getEventsForDate(dateString);
                      const isSelected = selectedDate === dateString;
                      const isToday = dateString === new Date().toISOString().split('T')[0];

                      return (
                        <motion.button
                          key={day}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedDate(dateString)}
                          className={`
                            aspect-square rounded-lg text-sm font-medium transition-all relative
                            ${isSelected ? 'bg-blue-500/30 text-blue-300 border-2 border-blue-400' : ''}
                            ${isToday && !isSelected ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' : ''}
                            ${!isSelected && !isToday ? 'bg-gray-700/30 text-gray-300 border border-gray-600/30 hover:bg-gray-700/50' : ''}
                          `}
                        >
                          {day}
                          {dayEvents.length > 0 && (
                            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                              {dayEvents.slice(0, 3).map((_, i) => (
                                <div key={i} className="w-1 h-1 rounded-full bg-orange-400" />
                              ))}
                            </div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Panneau événements */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">
                    {selectedDate ? (
                      `Événements du ${new Date(selectedDate + 'T00:00').toLocaleDateString('fr-FR')}`
                    ) : (
                      'Sélectionnez une date'
                    )}
                  </h4>

                  {selectedDate && (
                    <div className="space-y-4">
                      {/* Formulaire ajout */}
                      <div className="p-4 bg-[#0f1320] border border-blue-500/20 rounded-xl">
                        <input
                          type="text"
                          value={newEventTitle}
                          onChange={(e) => setNewEventTitle(e.target.value)}
                          placeholder="Titre de l'événement..."
                          className="w-full bg-transparent border-none text-white placeholder:text-gray-500 focus:outline-none mb-2"
                        />
                        <div className="flex gap-2">
                          <input
                            type="time"
                            value={newEventTime}
                            onChange={(e) => setNewEventTime(e.target.value)}
                            className="flex-1 bg-gray-700/30 border border-gray-600/30 rounded-lg px-3 py-2 text-white text-sm"
                          />
                          <Button
                            size="sm"
                            onClick={handleAddEvent}
                            className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Ajouter
                          </Button>
                        </div>
                      </div>

                      {/* Liste événements */}
                      <div className="space-y-2 max-h-[400px] overflow-y-auto">
                        {getEventsForDate(selectedDate).length === 0 ? (
                          <p className="text-center text-gray-500 text-sm py-8">
                            Aucun événement pour cette date
                          </p>
                        ) : (
                          getEventsForDate(selectedDate).map(event => (
                            <motion.div
                              key={event.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="p-3 bg-[#0f1320] border border-blue-500/20 rounded-lg flex items-center justify-between group"
                            >
                              <div className="flex-1">
                                <p className="text-white font-medium">{event.title}</p>
                                <p className="text-xs text-gray-400 flex items-center gap-1">
                                  <Bell className="w-3 h-3" />
                                  {event.time}
                                </p>
                              </div>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleDeleteEvent(event.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:bg-red-500/20"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </motion.div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
    </DraggableWindow>
  );
}
