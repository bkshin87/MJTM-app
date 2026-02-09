// supabase/functions/notify-event-created/index.ts
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { title, eventId } = await req.json()

    console.log('notify-event-created called', { title, eventId })

    // Supabase Service Client 생성
    const supabaseUrl = Deno.env.get('PUBLIC_URL')!
    const serviceKey = Deno.env.get('SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, serviceKey)

    // push_subscriptions 테이블에서 모든 구독 조회
    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('*')

    if (subError) {
      console.error('push_subscriptions query error', subError)
      throw subError
    }

    console.log('found subscriptions:', subscriptions?.length ?? 0)

    if (!subscriptions || subscriptions.length === 0) {
      console.log('no subscriptions to send')
      return new Response(
        JSON.stringify({ success: true, sent: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // 각 구독에 Web Push 발송
    const pushPromises = subscriptions.map(async (sub) => {
      try {
        const payload = JSON.stringify({
          title: title || '새로운 경조사',
          body: `새로운 경조사가 등록되었습니다. (ID: ${eventId})`,
          icon: '/images/home-logo.png',
        })

        console.log(`[PUSH] sending to ${sub.user_id}`, payload)

        // 간단한 HTTP POST로 Web Push 서버에 전송
        const response = await fetch(sub.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'TTL': '86400',
          },
          body: payload,
        })

        console.log(
          `[PUSH] response status for ${sub.user_id}: ${response.status}`,
        )

        if (response.ok || response.status === 201) {
          console.log(`[PUSH] sent to ${sub.user_id}`)
          return { success: true, user_id: sub.user_id }
        } else {
          const errText = await response.text().catch(() => '')
          console.error(
            `[PUSH] failed for ${sub.user_id}: ${response.status} - ${errText}`,
          )
          return {
            success: false,
            user_id: sub.user_id,
            error: `HTTP ${response.status}`,
          }
        }
      } catch (err) {
        console.error(`[PUSH] error for ${sub.user_id}:`, err.message)
        return {
          success: false,
          user_id: sub.user_id,
          error: err.message,
        }
      }
    })

    const results = await Promise.all(pushPromises)
    const successCount = results.filter((r) => r.success).length

    console.log(`[PUSH] summary: ${successCount}/${results.length} sent`)

    return new Response(
      JSON.stringify({
        success: true,
        sent: successCount,
        total: results.length,
        results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (err) {
    console.error('notify-event-created error', err)

    return new Response(
      JSON.stringify({
        success: false,
        error: String(err),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})
