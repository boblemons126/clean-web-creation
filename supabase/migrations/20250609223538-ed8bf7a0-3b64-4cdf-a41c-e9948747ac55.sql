
-- Create calendar providers table
CREATE TABLE public.calendar_providers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  api_endpoint TEXT,
  auth_type TEXT NOT NULL, -- 'oauth2', 'basic', 'api_key'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user calendar accounts table
CREATE TABLE public.user_calendar_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  provider_id UUID REFERENCES public.calendar_providers NOT NULL,
  account_name TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sync_enabled BOOLEAN NOT NULL DEFAULT true,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create calendars table
CREATE TABLE public.calendars (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  account_id UUID REFERENCES public.user_calendar_accounts,
  external_calendar_id TEXT,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3b82f6',
  is_primary BOOLEAN NOT NULL DEFAULT false,
  is_local BOOLEAN NOT NULL DEFAULT false, -- true for calendars created in our app
  timezone TEXT DEFAULT 'UTC',
  visibility TEXT DEFAULT 'private', -- 'private', 'public', 'shared'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  calendar_id UUID REFERENCES public.calendars NOT NULL,
  external_event_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  all_day BOOLEAN NOT NULL DEFAULT false,
  recurrence_rule TEXT, -- RRULE format
  status TEXT DEFAULT 'confirmed', -- 'confirmed', 'tentative', 'cancelled'
  visibility TEXT DEFAULT 'private',
  creator_email TEXT,
  organizer_email TEXT,
  attendees JSONB DEFAULT '[]'::jsonb,
  reminders JSONB DEFAULT '[]'::jsonb,
  is_local BOOLEAN NOT NULL DEFAULT false,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sync log table for tracking synchronization
CREATE TABLE public.sync_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  account_id UUID REFERENCES public.user_calendar_accounts NOT NULL,
  sync_type TEXT NOT NULL, -- 'full', 'incremental'
  status TEXT NOT NULL, -- 'success', 'error', 'partial'
  events_synced INTEGER DEFAULT 0,
  errors_count INTEGER DEFAULT 0,
  error_details JSONB,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.calendar_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_calendar_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for calendar_providers (public read access)
CREATE POLICY "Anyone can view calendar providers" 
  ON public.calendar_providers 
  FOR SELECT 
  USING (true);

-- RLS Policies for user_calendar_accounts
CREATE POLICY "Users can view their own calendar accounts" 
  ON public.user_calendar_accounts 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own calendar accounts" 
  ON public.user_calendar_accounts 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calendar accounts" 
  ON public.user_calendar_accounts 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calendar accounts" 
  ON public.user_calendar_accounts 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS Policies for calendars
CREATE POLICY "Users can view their own calendars" 
  ON public.calendars 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own calendars" 
  ON public.calendars 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calendars" 
  ON public.calendars 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calendars" 
  ON public.calendars 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS Policies for events
CREATE POLICY "Users can view their own events" 
  ON public.events 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own events" 
  ON public.events 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own events" 
  ON public.events 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own events" 
  ON public.events 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS Policies for sync_logs
CREATE POLICY "Users can view their own sync logs" 
  ON public.sync_logs 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sync logs" 
  ON public.sync_logs 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Insert default calendar providers
INSERT INTO public.calendar_providers (name, api_endpoint, auth_type) VALUES
  ('Google Calendar', 'https://www.googleapis.com/calendar/v3', 'oauth2'),
  ('Outlook Calendar', 'https://graph.microsoft.com/v1.0', 'oauth2'),
  ('iCloud Calendar', 'https://caldav.icloud.com', 'basic'),
  ('Local Calendar', null, 'none');

-- Create indexes for better performance
CREATE INDEX idx_user_calendar_accounts_user_id ON public.user_calendar_accounts(user_id);
CREATE INDEX idx_calendars_user_id ON public.calendars(user_id);
CREATE INDEX idx_calendars_account_id ON public.calendars(account_id);
CREATE INDEX idx_events_user_id ON public.events(user_id);
CREATE INDEX idx_events_calendar_id ON public.events(calendar_id);
CREATE INDEX idx_events_start_time ON public.events(start_time);
CREATE INDEX idx_events_end_time ON public.events(end_time);
CREATE INDEX idx_sync_logs_user_id ON public.sync_logs(user_id);
CREATE INDEX idx_sync_logs_account_id ON public.sync_logs(account_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_user_calendar_accounts_updated_at 
  BEFORE UPDATE ON public.user_calendar_accounts 
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_calendars_updated_at 
  BEFORE UPDATE ON public.calendars 
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_events_updated_at 
  BEFORE UPDATE ON public.events 
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
