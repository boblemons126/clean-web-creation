
import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Plus, ChevronLeft, ChevronRight, CalendarDays, Sparkles } from 'lucide-react';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameDay, isSameMonth, addMonths, subMonths } from 'date-fns';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const CalendarWidget = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { events, loading } = useCalendarEvents();

  const today = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // Generate calendar days
  const calendarDays = [];
  
  // Previous month days
  for (let i = firstDay - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const date = new Date(year, month - 1, day);
    calendarDays.push({
      day,
      date,
      isCurrentMonth: false,
      isToday: false,
      hasEvents: events.some(event => isSameDay(new Date(event.start_time), date))
    });
  }
  
  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const isToday = isSameDay(today, date);
    const hasEvents = events.some(event => isSameDay(new Date(event.start_time), date));
    
    calendarDays.push({
      day,
      date,
      isCurrentMonth: true,
      isToday,
      hasEvents
    });
  }
  
  // Next month days to fill the grid
  const remainingDays = 42 - calendarDays.length;
  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(year, month + 1, day);
    calendarDays.push({
      day,
      date,
      isCurrentMonth: false,
      isToday: false,
      hasEvents: events.some(event => isSameDay(new Date(event.start_time), date))
    });
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getTodaysEvents = () => {
    return events.filter(event => isSameDay(new Date(event.start_time), today));
  };

  const getUpcomingEvents = () => {
    const now = new Date();
    return events
      .filter(event => new Date(event.start_time) > now)
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
      .slice(0, 2);
  };

  if (loading) {
    return (
      <Card className="h-full bg-gradient-to-br from-slate-50 via-white to-blue-50/30 border-0 shadow-xl backdrop-blur-sm">
        <CardContent className="p-8">
          <div className="flex items-center justify-center h-80">
            <div className="flex flex-col items-center space-y-6">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center animate-pulse">
                  <CalendarDays className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full animate-bounce"></div>
              </div>
              <div className="text-center space-y-3">
                <div className="h-6 bg-gradient-to-r from-slate-200 to-slate-300 rounded-full animate-pulse w-40"></div>
                <div className="h-4 bg-gradient-to-r from-slate-100 to-slate-200 rounded-full animate-pulse w-32"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full bg-gradient-to-br from-slate-50 via-white to-blue-50/30 border-0 shadow-xl backdrop-blur-sm overflow-hidden group hover:shadow-2xl transition-all duration-500">
      <CardContent className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link 
            to="/calendar" 
            className="flex items-center space-x-4 group/link transition-all duration-300"
          >
            <div className="relative">
              <div className="p-4 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 rounded-2xl shadow-lg group-hover/link:shadow-xl transition-all duration-300 group-hover/link:scale-105">
                <Calendar className="w-7 h-7 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent group-hover/link:from-blue-600 group-hover/link:to-purple-600 transition-all duration-300">
                Calendar
              </h2>
              <p className="text-sm text-slate-500 font-medium">
                {events.length} {events.length === 1 ? 'event' : 'events'} scheduled
              </p>
            </div>
          </Link>
          
          <div className="flex items-center space-x-1 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-2 border border-white/20">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth('prev')}
              className="h-9 w-9 p-0 hover:bg-blue-50 rounded-xl transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </Button>
            <span className="text-slate-800 font-bold min-w-[120px] text-center text-sm px-3 py-1">
              {monthNames[month]} {year}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth('next')}
              className="h-9 w-9 p-0 hover:bg-blue-50 rounded-xl transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </Button>
          </div>
        </div>

        {/* Mini Calendar Grid */}
        <div className="mb-8">
          {/* Week days header */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {weekDays.map(day => (
              <div key={day} className="text-center text-xs font-bold text-slate-400 py-2">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((dayInfo, index) => (
              <div
                key={index}
                className={`
                  relative h-10 flex items-center justify-center text-sm rounded-2xl cursor-pointer
                  transition-all duration-200 hover:scale-110 transform
                  ${dayInfo.isCurrentMonth 
                    ? dayInfo.isToday 
                      ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold shadow-lg scale-105' 
                      : 'text-slate-700 hover:bg-blue-50 font-semibold'
                    : 'text-slate-300 hover:text-slate-400'
                  }
                `}
              >
                {dayInfo.day}
                {dayInfo.hasEvents && dayInfo.isCurrentMonth && (
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full shadow-sm"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Events Section */}
        <div className="space-y-6">
          {/* Today's Events */}
          {getTodaysEvents().length > 0 && (
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-2 h-2 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full"></div>
                <h3 className="text-sm font-bold text-slate-800">Today</h3>
                <div className="h-px bg-gradient-to-r from-slate-200 to-transparent flex-1"></div>
              </div>
              <div className="space-y-3">
                {getTodaysEvents().slice(0, 2).map((event) => (
                  <Card
                    key={event.id}
                    className="border-0 bg-white/60 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group/event"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-slate-800 font-bold text-sm truncate mb-2 group-hover/event:text-blue-600 transition-colors">
                            {event.title}
                          </h4>
                          <div className="flex items-center text-xs text-slate-500 space-x-4">
                            <div className="flex items-center">
                              <Clock className="w-3 h-3 mr-1.5" />
                              <span>
                                {event.all_day 
                                  ? 'All day' 
                                  : format(new Date(event.start_time), 'h:mm a')
                                }
                              </span>
                            </div>
                            {event.location && (
                              <div className="flex items-center">
                                <MapPin className="w-3 h-3 mr-1.5" />
                                <span className="truncate">{event.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        {event.calendar?.color && (
                          <div 
                            className="w-4 h-4 rounded-full flex-shrink-0 mt-0.5 ring-2 ring-white shadow-sm"
                            style={{ backgroundColor: event.calendar.color }}
                          ></div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Events */}
          {getUpcomingEvents().length > 0 && (
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"></div>
                <h3 className="text-sm font-bold text-slate-800">Upcoming</h3>
                <div className="h-px bg-gradient-to-r from-slate-200 to-transparent flex-1"></div>
              </div>
              <div className="space-y-3">
                {getUpcomingEvents().map((event) => (
                  <Card
                    key={event.id}
                    className="border-0 bg-white/40 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group/event"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-slate-800 font-bold text-sm truncate mb-2 group-hover/event:text-blue-600 transition-colors">
                            {event.title}
                          </h4>
                          <div className="flex items-center text-xs text-slate-500">
                            <Clock className="w-3 h-3 mr-1.5" />
                            <span>{format(new Date(event.start_time), 'MMM d, h:mm a')}</span>
                          </div>
                        </div>
                        {event.calendar?.color && (
                          <div 
                            className="w-4 h-4 rounded-full flex-shrink-0 mt-0.5 ring-2 ring-white shadow-sm"
                            style={{ backgroundColor: event.calendar.color }}
                          ></div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* No Events State */}
          {getTodaysEvents().length === 0 && getUpcomingEvents().length === 0 && (
            <div className="text-center py-12">
              <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl mb-6">
                <CalendarDays className="w-10 h-10 text-slate-400" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center">
                  <Plus className="w-3 h-3 text-white" />
                </div>
              </div>
              <h3 className="text-slate-700 font-bold mb-2 text-lg">Your schedule is clear</h3>
              <p className="text-slate-500 text-sm mb-6">No events scheduled for today</p>
              <Link 
                to="/calendar"
                className="inline-flex items-center space-x-2 text-sm bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-2xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                <Plus className="w-4 h-4" />
                <span>Create your first event</span>
              </Link>
            </div>
          )}

          {/* View All Link */}
          {(getTodaysEvents().length > 0 || getUpcomingEvents().length > 0) && (
            <div className="pt-6 border-t border-slate-100">
              <Link 
                to="/calendar"
                className="flex items-center justify-center space-x-3 text-sm bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-4 rounded-2xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105 group/cta"
              >
                <CalendarDays className="w-4 h-4 group-hover/cta:rotate-12 transition-transform" />
                <span>View full calendar</span>
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CalendarWidget;
