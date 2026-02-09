// supabase/functions/notify-event-created/index.ts
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

import webpush from 'npm:web-push@3.6.7'

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

    // web-push VAPID 설정
    const publicVAPID = Deno.env.get('VAPID_PUBLIC_KEY')!
    const privateVAPID = Deno.env.get('VAPID_PRIVATE_KEY')!

    webpush.setVapidDetails(
      'mailto:admin@mjcivil.com',
      publicVAPID,
      privateVAPID,
    )

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
        const subscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        }

        const payload = JSON.stringify({
          title: '새로운 경조사',
          body: '경조사가 등록되었습니다.',
        })

        console.log(`[PUSH] attempting ${sub.user_id}`)
        console.log(`[PUSH] endpoint type: ${sub.endpoint}`)

        try {
          // web-push 라이브러리로 시도
          await webpush.sendNotification(subscription, payload)
          console.log(`[PUSH] ✓ sent to ${sub.user_id}`)
          return { success: true, user_id: sub.user_id }
        } catch (webpushErr) {
          console.error(
            `[PUSH] webpush failed for ${sub.user_id}: ${webpushErr.message}`,
          )

          // webpush 실패 시, 단순 HTTP POST로 재시도 (일부 서비스용)
          console.log(`[PUSH] retrying with simple POST for ${sub.user_id}`)
          const response = await fetch(sub.endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: payload,
          })

          if (response.ok) {
            console.log(`[PUSH] ✓ simple POST sent to ${sub.user_id}`)
            return { success: true, user_id: sub.user_id }
          } else {
            throw new Error(`HTTP ${response.status}`)
          }
        }
      } catch (err) {
        console.error(`[PUSH] ✗ failed for ${sub.user_id}: ${err.message}`)
        return {
          success: false,
          user_id: sub.user_id,
          error: err.message,
        }
      }
    })

    const results = await Promise.all(pushPromises)
    const successCount = results.filter((r) => r.success).length

    console.log(`[PUSH] final: ${successCount}/${results.length} sent`)

    return new Response(
      JSON.stringify({
        success: true,
        sent: successCount,
        total: results.length,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (err) {
    console.error('notify-event-created error', err.message || err)

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
