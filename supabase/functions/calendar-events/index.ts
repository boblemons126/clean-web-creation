
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

    const url = new URL(req.url)
    const method = req.method

    switch (method) {
      case 'GET':
        return await getEvents(supabase, user.user.id, url.searchParams)
      case 'POST':
        const createData = await req.json()
        return await createEvent(supabase, user.user.id, createData)
      case 'PUT':
        const updateData = await req.json()
        return await updateEvent(supabase, user.user.id, updateData)
      case 'DELETE':
        const eventId = url.searchParams.get('eventId')
        return await deleteEvent(supabase, user.user.id, eventId!)
      default:
        throw new Error('Method not allowed')
    }
  } catch (error) {
    console.error('Calendar events error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function getEvents(supabase: any, userId: string, params: URLSearchParams) {
  const startDate = params.get('start') || new Date().toISOString()
  const endDate = params.get('end') || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  const calendarIds = params.get('calendars')?.split(',')

  let query = supabase
    .from('events')
    .select(`
      *,
      calendar:calendars(*)
    `)
    .eq('user_id', userId)
    .gte('start_time', startDate)
    .lte('end_time', endDate)
    .order('start_time')

  if (calendarIds && calendarIds.length > 0) {
    query = query.in('calendar_id', calendarIds)
  }

  const { data: events, error } = await query

  if (error) throw error

  return new Response(
    JSON.stringify({ events }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function createEvent(supabase: any, userId: string, eventData: any) {
  const { data: event, error } = await supabase
    .from('events')
    .insert({
      user_id: userId,
      calendar_id: eventData.calendar_id,
      title: eventData.title,
      description: eventData.description,
      location: eventData.location,
      start_time: eventData.start_time,
      end_time: eventData.end_time,
      all_day: eventData.all_day || false,
      attendees: eventData.attendees || [],
      reminders: eventData.reminders || [],
      is_local: true
    })
    .select()
    .single()

  if (error) throw error

  return new Response(
    JSON.stringify({ event }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function updateEvent(supabase: any, userId: string, eventData: any) {
  const { data: event, error } = await supabase
    .from('events')
    .update({
      title: eventData.title,
      description: eventData.description,
      location: eventData.location,
      start_time: eventData.start_time,
      end_time: eventData.end_time,
      all_day: eventData.all_day,
      attendees: eventData.attendees,
      reminders: eventData.reminders
    })
    .eq('id', eventData.id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error

  return new Response(
    JSON.stringify({ event }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function deleteEvent(supabase: any, userId: string, eventId: string) {
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', eventId)
    .eq('user_id', userId)

  if (error) throw error

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}
