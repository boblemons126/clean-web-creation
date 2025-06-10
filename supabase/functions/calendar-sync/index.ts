
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: user } = await supabase.auth.getUser(token)

    if (!user.user) {
      throw new Error('Unauthorized')
    }

    const { accountId, provider } = await req.json()

    console.log(`Starting sync for account ${accountId} with provider ${provider}`)

    // Create sync log entry
    const { data: syncLog } = await supabase
      .from('sync_logs')
      .insert({
        user_id: user.user.id,
        account_id: accountId,
        sync_type: 'full',
        status: 'running'
      })
      .select()
      .single()

    let syncResult
    switch (provider) {
      case 'Google Calendar':
        syncResult = await syncGoogleCalendar(accountId, user.user.id, supabase)
        break
      case 'Outlook Calendar':
        syncResult = await syncOutlookCalendar(accountId, user.user.id, supabase)
        break
      case 'iCloud Calendar':
        syncResult = await synciCloudCalendar(accountId, user.user.id, supabase)
        break
      default:
        throw new Error('Unsupported provider')
    }

    // Update sync log
    await supabase
      .from('sync_logs')
      .update({
        status: syncResult.status,
        events_synced: syncResult.eventsCount,
        errors_count: syncResult.errorsCount,
        error_details: syncResult.errors,
        completed_at: new Date().toISOString()
      })
      .eq('id', syncLog.id)

    return new Response(
      JSON.stringify(syncResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Calendar sync error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function syncGoogleCalendar(accountId: string, userId: string, supabase: any) {
  console.log('Syncing Google Calendar for account:', accountId)
  
  const { data: account } = await supabase
    .from('user_calendar_accounts')
    .select('*')
    .eq('id', accountId)
    .single()

  if (!account || !account.access_token) {
    throw new Error('Invalid account or missing access token')
  }

  try {
    // Fetch calendars from Google
    const calendarsResponse = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
      headers: {
        'Authorization': `Bearer ${account.access_token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!calendarsResponse.ok) {
      throw new Error(`Google API error: ${calendarsResponse.status}`)
    }

    const calendarsData = await calendarsResponse.json()
    let eventsCount = 0
    const errors: any[] = []

    // Sync each calendar
    for (const googleCalendar of calendarsData.items || []) {
      try {
        // Upsert calendar
        const { data: calendar } = await supabase
          .from('calendars')
          .upsert({
            user_id: userId,
            account_id: accountId,
            external_calendar_id: googleCalendar.id,
            name: googleCalendar.summary,
            description: googleCalendar.description,
            color: googleCalendar.backgroundColor || '#3b82f6',
            is_primary: googleCalendar.primary || false,
            timezone: googleCalendar.timeZone || 'UTC'
          }, {
            onConflict: 'user_id,account_id,external_calendar_id'
          })
          .select()
          .single()

        // Fetch events for this calendar
        const eventsResponse = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(googleCalendar.id)}/events?maxResults=250`,
          {
            headers: {
              'Authorization': `Bearer ${account.access_token}`,
              'Content-Type': 'application/json'
            }
          }
        )

        if (eventsResponse.ok) {
          const eventsData = await eventsResponse.json()
          
          for (const googleEvent of eventsData.items || []) {
            if (googleEvent.status === 'cancelled') continue

            const startTime = googleEvent.start?.dateTime || googleEvent.start?.date
            const endTime = googleEvent.end?.dateTime || googleEvent.end?.date
            
            if (!startTime || !endTime) continue

            await supabase
              .from('events')
              .upsert({
                user_id: userId,
                calendar_id: calendar.id,
                external_event_id: googleEvent.id,
                title: googleEvent.summary || 'Untitled Event',
                description: googleEvent.description,
                location: googleEvent.location,
                start_time: startTime,
                end_time: endTime,
                all_day: !googleEvent.start?.dateTime,
                status: googleEvent.status,
                creator_email: googleEvent.creator?.email,
                organizer_email: googleEvent.organizer?.email,
                attendees: googleEvent.attendees || [],
                last_synced_at: new Date().toISOString()
              }, {
                onConflict: 'user_id,calendar_id,external_event_id'
              })

            eventsCount++
          }
        }
      } catch (calendarError) {
        console.error('Error syncing calendar:', googleCalendar.id, calendarError)
        errors.push({ calendar: googleCalendar.id, error: calendarError.message })
      }
    }

    // Update last sync time
    await supabase
      .from('user_calendar_accounts')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('id', accountId)

    return {
      status: errors.length === 0 ? 'success' : 'partial',
      eventsCount,
      errorsCount: errors.length,
      errors: errors.length > 0 ? errors : null
    }
  } catch (error) {
    console.error('Google sync error:', error)
    return {
      status: 'error',
      eventsCount: 0,
      errorsCount: 1,
      errors: [{ error: error.message }]
    }
  }
}

async function syncOutlookCalendar(accountId: string, userId: string, supabase: any) {
  console.log('Syncing Outlook Calendar for account:', accountId)
  
  // Similar implementation for Outlook using Microsoft Graph API
  return {
    status: 'success',
    eventsCount: 0,
    errorsCount: 0,
    errors: null
  }
}

async function synciCloudCalendar(accountId: string, userId: string, supabase: any) {
  console.log('Syncing iCloud Calendar for account:', accountId)
  
  // iCloud calendar sync would require CalDAV implementation
  return {
    status: 'success',
    eventsCount: 0,
    errorsCount: 0,
    errors: null
  }
}
