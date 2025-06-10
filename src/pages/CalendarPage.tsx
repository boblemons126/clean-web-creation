
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarView } from "@/components/calendar/CalendarView";
import { CalendarAccountManager } from "@/components/calendar/CalendarAccountManager";
import { Calendar, Settings, Sparkles } from "lucide-react";

const CalendarPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="container mx-auto p-8">
        <div className="mb-10">
          <div className="flex items-center space-x-4 mb-4">
            <div className="relative">
              <div className="p-4 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 rounded-3xl shadow-lg">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Calendar
              </h1>
              <p className="text-slate-500 mt-2 text-lg">
                Manage your calendars and sync with Google Calendar, Outlook, and iCloud
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="calendar" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl p-2 mb-8">
            <TabsTrigger 
              value="calendar" 
              className="flex items-center space-x-3 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 font-semibold py-3"
            >
              <Calendar className="w-5 h-5" />
              <span>Calendar View</span>
            </TabsTrigger>
            <TabsTrigger 
              value="accounts"
              className="flex items-center space-x-3 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 font-semibold py-3"
            >
              <Settings className="w-5 h-5" />
              <span>Calendar Accounts</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="calendar" className="mt-8">
            <CalendarView />
          </TabsContent>
          
          <TabsContent value="accounts" className="mt-8">
            <CalendarAccountManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CalendarPage;
