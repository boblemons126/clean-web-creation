
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarPlus, RefreshCw, Unlink, Calendar, Sparkles, CheckCircle, XCircle } from "lucide-react";
import { useCalendarAccounts } from "@/hooks/useCalendarAccounts";
import { format } from "date-fns";

const CALENDAR_PROVIDERS = [
  { 
    name: 'Google Calendar', 
    icon: '📅', 
    color: 'from-blue-500 to-blue-600',
    description: 'Sync with your Google account'
  },
  { 
    name: 'Outlook Calendar', 
    icon: '📧', 
    color: 'from-blue-600 to-indigo-600',
    description: 'Connect to Microsoft Outlook'
  },
  { 
    name: 'iCloud Calendar', 
    icon: '🍎', 
    color: 'from-slate-500 to-slate-600',
    description: 'Apple iCloud integration'
  }
];

export const CalendarAccountManager: React.FC = () => {
  const { accounts, loading, connectAccount, syncAccount, disconnectAccount } = useCalendarAccounts();

  if (loading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardContent className="p-8">
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center space-y-6">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center animate-pulse">
                  <RefreshCw className="w-8 h-8 text-white animate-spin" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full animate-bounce"></div>
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
          <CardTitle className="flex items-center gap-4">
            <div className="relative">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Calendar Accounts
              </h2>
              <p className="text-slate-500 text-sm font-medium">
                Connect and manage your calendar providers
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CALENDAR_PROVIDERS.map((provider) => {
              const account = accounts.find(acc => acc.provider.name === provider.name);
              
              return (
                <Card 
                  key={provider.name} 
                  className="border-0 bg-gradient-to-br from-white to-slate-50/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 bg-gradient-to-br ${provider.color} rounded-2xl shadow-lg text-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                          {provider.icon}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 text-lg">{provider.name}</h3>
                          <p className="text-slate-500 text-sm">{provider.description}</p>
                        </div>
                      </div>
                      {account && (
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-5 h-5 text-emerald-500" />
                          <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 font-semibold">
                            Connected
                          </Badge>
                        </div>
                      )}
                    </div>
                    
                    {account ? (
                      <div className="space-y-4">
                        <div className="p-4 bg-white/60 rounded-xl border border-slate-100">
                          <div className="text-sm space-y-2">
                            <div className="flex justify-between">
                              <span className="text-slate-600 font-medium">Account:</span>
                              <span className="text-slate-800 font-semibold">{account.account_name}</span>
                            </div>
                            {account.last_sync_at && (
                              <div className="flex justify-between">
                                <span className="text-slate-600 font-medium">Last Sync:</span>
                                <span className="text-slate-800 font-semibold">
                                  {format(new Date(account.last_sync_at), 'MMM d, HH:mm')}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-3">
                          <Button 
                            size="sm" 
                            onClick={() => syncAccount(account.id, account.provider.name)}
                            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Sync Now
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => disconnectAccount(account.id)}
                            className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                          >
                            <Unlink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                          <div className="flex items-center justify-center text-slate-500 py-2">
                            <XCircle className="w-5 h-5 mr-2" />
                            <span className="font-medium">Not connected</span>
                          </div>
                        </div>
                        <Button 
                          onClick={() => connectAccount(provider.name)}
                          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          <CalendarPlus className="h-4 w-4 mr-2" />
                          Connect Account
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          {accounts.length === 0 && (
            <div className="text-center py-16 mt-8">
              <div className="relative inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl mb-6">
                <Calendar className="h-12 w-12 text-slate-400" />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-700 mb-2">No accounts connected yet</h3>
              <p className="text-slate-500 mb-6 max-w-md mx-auto leading-relaxed">
                Connect your calendar providers above to start syncing events and managing your schedule across all platforms.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
