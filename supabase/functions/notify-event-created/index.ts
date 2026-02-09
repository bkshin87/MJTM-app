// supabase/functions/notify-event-created/index.ts
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

// ❗ web-push는 Node 용이라 Edge(Deno)에서 완전히 호환 안 될 수 있음
// 필요하면 이 부분을 FCM / OneSignal 등 다른 서비스 호출로 교체하는 것을 권장
// https://stackoverflow.com/questions/77738808/is-it-possible-to-use-the-web-push-library-for-node-js-in-a-deno-supabase-edge-f [web:12]
import webpush from 'npm:web-push@3.6.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { title, eventId } = await req.json() as {
      title?: string
      eventId?: number
    }

    console.log('notify-event-created called', { title, eventId })

    const publicVAPID = Deno.env.get('VAPID_PUBLIC_KEY')!
    const privateVAPID = Deno.env.get('VAPID_PRIVATE_KEY')!

    if (!publicVAPID || !privateVAPID) {
      console.error('VAPID keys are not set')
      throw new Error('VAPID keys are not configured')
    }

    webpush.setVapidDetails(
      'mailto:admin@mjcivil.com',
      publicVAPID,
      privateVAPID,
    )

    const supabaseUrl = Deno.env.get('PUBLIC_URL')!
    const serviceKey = Deno.env.get('SERVICE_ROLE_KEY')!

    if (!supabaseUrl || !serviceKey) {
      console.error('Supabase env vars missing', { supabaseUrl, hasServiceKey: !!serviceKey })
      throw new Error('Supabase env vars are not configured')
    }

    const supabase = createClient(supabaseUrl, serviceKey)

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
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        },
      )
    }

    const payload = JSON.stringify({
      title: title || '새로운 경조사',
      body: '경조사가 등록되었습니다.',
      eventId: eventId ?? null,
    })

    const pushPromises = subscriptions.map(async (sub: any) => {
      try {
        const subscription = {
          endpoint: sub.endpoint as string,
          keys: {
            p256dh: sub.p256dh as string,
            auth: sub.auth as string,
          },
        }

        console.log(`[PUSH] attempting ${sub.user_id}`)
        console.log(`[PUSH] endpoint: ${subscription.endpoint}`)

        try {
          // 1차: web-push 사용
          await webpush.sendNotification(subscription, payload)
          console.log(`[PUSH] ✓ sent via webpush to ${sub.user_id}`)
          return { success: true, user_id: sub.user_id }
        } catch (webpushErr: any) {
          console.error(
            `[PUSH] webpush failed for ${sub.user_id}: ${webpushErr?.message ?? webpushErr}`,
          )

          // 2차: 단순 HTTP POST 재시도 (일부 서비스용)
          console.log(`[PUSH] retrying with simple POST for ${sub.user_id}`)
          const response = await fetch(subscription.endpoint, {
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
      } catch (err: any) {
        console.error(
          `[PUSH] ✗ failed for ${sub.user_id}: ${err?.message ?? err}`,
        )
        return {
          success: false,
          user_id: sub.user_id,
          error: err?.message ?? String(err),
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
        results,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    )
  } catch (err: any) {
    console.error('notify-event-created error', err?.message ?? err)

    return new Response(
      JSON.stringify({
        success: false,
        error: err?.message ?? String(err),
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    )
  }
})
