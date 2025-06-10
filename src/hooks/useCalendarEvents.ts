
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  location?: string;
  start_time: string;
  end_time: string;
  all_day: boolean;
  calendar_id: string;
  calendar?: {
    name: string;
    color: string;
  };
  attendees: any[];
  reminders: any[];
  status: string;
}

export const useCalendarEvents = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchEvents = async (startDate?: string, endDate?: string, calendarIds?: string[]) => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (startDate) params.append('start', startDate);
      if (endDate) params.append('end', endDate);
      if (calendarIds && calendarIds.length > 0) {
        params.append('calendars', calendarIds.join(','));
      }

      const { data, error } = await supabase.functions.invoke('calendar-events', {
        body: null,
        method: 'GET'
      });

      if (error) throw error;
      setEvents(data.events || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error",
        description: "Failed to fetch calendar events",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (eventData: Partial<CalendarEvent>) => {
    try {
      const { data, error } = await supabase.functions.invoke('calendar-events', {
        body: eventData,
        method: 'POST'
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Event created successfully"
      });

      await fetchEvents();
      return data.event;
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: "Error",
        description: "Failed to create event",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateEvent = async (eventData: Partial<CalendarEvent>) => {
    try {
      const { data, error } = await supabase.functions.invoke('calendar-events', {
        body: eventData,
        method: 'PUT'
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Event updated successfully"
      });

      await fetchEvents();
      return data.event;
    } catch (error) {
      console.error('Error updating event:', error);
      toast({
        title: "Error",
        description: "Failed to update event",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      const { error } = await supabase.functions.invoke('calendar-events', {
        body: null,
        method: 'DELETE'
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Event deleted successfully"
      });

      await fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return {
    events,
    loading,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent
  };
};
