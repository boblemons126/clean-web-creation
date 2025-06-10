
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Plus, ChevronLeft, ChevronRight, Sparkles, Clock, MapPin } from "lucide-react";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameDay, isSameMonth, addMonths, subMonths } from "date-fns";

export const CalendarView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const { events, loading, fetchEvents } = useCalendarEvents();

  useEffect(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    fetchEvents(start.toISOString(), end.toISOString());
  }, [currentDate]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(direction === 'next' ? addMonths(currentDate, 1) : subMonths(currentDate, 1));
  };

  const renderCalendarGrid = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = "d";
    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const formattedDate = format(day, dateFormat);
        const cloneDay = day;
        const dayEvents = events.filter(event => 
          isSameDay(new Date(event.start_time), day)
        );

        days.push(
          <div
            className={`min-h-[140px] p-4 border-0 cursor-pointer transition-all duration-300 rounded-2xl ${
              !isSameMonth(day, monthStart) 
                ? 'text-slate-300 bg-slate-50/50' 
                : 'hover:bg-white hover:shadow-lg'
            } ${
              isSameDay(day, selectedDate) 
                ? 'bg-gradient-to-br from-blue-50 to-purple-50 ring-2 ring-blue-200 shadow-lg' 
                : ''
            }`}
            key={day.toString()}
            onClick={() => setSelectedDate(cloneDay)}
          >
            <div className={`text-lg font-bold mb-3 ${
              isSameDay(day, new Date()) 
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl w-8 h-8 flex items-center justify-center shadow-lg' 
                : ''
            }`}>
              {formattedDate}
            </div>
            <div className="space-y-2">
              {dayEvents.slice(0, 3).map((event, index) => (
                <div
                  key={event.id}
                  className="text-xs p-2 rounded-lg text-white truncate shadow-sm transition-transform hover:scale-105"
                  style={{ backgroundColor: event.calendar?.color || '#3b82f6' }}
                >
                  {event.title}
                </div>
              ))}
              {dayEvents.length > 3 && (
                <div className="text-xs text-slate-500 font-semibold">
                  +{dayEvents.length - 3} more
                </div>
              )}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7 gap-4" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="space-y-4">{rows}</div>;
  };

  const renderSelectedDateEvents = () => {
    const dayEvents = events.filter(event => 
      isSameDay(new Date(event.start_time), selectedDate)
    );

    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                <CalendarDays className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                {format(selectedDate, 'MMMM d, yyyy')}
              </span>
            </div>
            <Button 
              size="sm" 
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dayEvents.length === 0 ? (
            <div className="text-center py-12">
              <div className="relative inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl mb-4">
                <CalendarDays className="w-8 h-8 text-slate-400" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full"></div>
              </div>
              <p className="text-slate-500 font-medium">No events scheduled for this day</p>
            </div>
          ) : (
            <div className="space-y-4">
              {dayEvents.map((event) => (
                <Card key={event.id} className="border-0 bg-gradient-to-r from-white to-slate-50 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-bold text-lg text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">{event.title}</h4>
                        {event.description && (
                          <p className="text-slate-600 mb-4 leading-relaxed">{event.description}</p>
                        )}
                        <div className="flex items-center gap-6 text-sm text-slate-500">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2" />
                            <span className="font-medium">
                              {event.all_day ? 'All day' : `${format(new Date(event.start_time), 'HH:mm')} - ${format(new Date(event.end_time), 'HH:mm')}`}
                            </span>
                          </div>
                          {event.location && (
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-2" />
                              <span>{event.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <Badge 
                        variant="secondary" 
                        className="text-white font-semibold px-3 py-1 rounded-xl shadow-sm"
                        style={{ backgroundColor: event.calendar?.color || '#3b82f6' }}
                      >
                        {event.calendar?.name || 'Local'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardContent className="p-8">
          <div className="flex items-center justify-center h-96">
            <div className="flex flex-col items-center space-y-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center animate-pulse">
                  <CalendarDays className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full animate-bounce"></div>
              </div>
              <div className="text-center space-y-3">
                <div className="h-6 bg-gradient-to-r from-slate-200 to-slate-300 rounded-full animate-pulse w-48"></div>
                <div className="h-4 bg-gradient-to-r from-slate-100 to-slate-200 rounded-full animate-pulse w-36"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/50 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                <CalendarDays className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                {format(currentDate, 'MMMM yyyy')}
              </span>
            </CardTitle>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigateMonth('prev')}
                className="rounded-xl border-slate-200 hover:bg-slate-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentDate(new Date())}
                className="rounded-xl border-slate-200 hover:bg-slate-50 font-semibold"
              >
                Today
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigateMonth('next')}
                className="rounded-xl border-slate-200 hover:bg-slate-50"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          {/* Calendar Header */}
          <div className="grid grid-cols-7 gap-4 mb-6">
            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
              <div key={day} className="p-4 text-center font-bold text-slate-600 bg-gradient-to-r from-slate-50 to-blue-50/50 rounded-xl">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Grid */}
          {renderCalendarGrid()}
        </CardContent>
      </Card>

      {/* Selected Date Events */}
      {renderSelectedDateEvents()}
    </div>
  );
};
