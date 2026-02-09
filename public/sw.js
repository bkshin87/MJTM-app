// public/sw.js

self.addEventListener('install', (event) => {
  console.log('[SW] installed')
  self.skipWaiting?.()
})

self.addEventListener('activate', (event) => {
  console.log('[SW] activated')
  self.clients?.claim?.()
})

// ✅ 더 강력한 push 이벤트 핸들러
self.addEventListener('push', (event) => {
  console.log('[SW] push event received')
  console.log('[SW] event.data:', event.data)

  if (!event.data) {
    console.log('[SW] no push data, showing default notification')
    // 데이터가 없으면 기본 알림 띄우기
    event.waitUntil(
      self.registration.showNotification('새로운 소식', {
        body: '새 경조사가 등록되었습니다.',
        icon: '/images/home-logo.png',
      }),
    )
    return
  }

  let notificationData = {
    title: '새로운 소식',
    body: '새 경조사가 등록되었습니다.',
    icon: '/images/home-logo.png',
  }

  try {
    const jsonData = event.data.json()
    console.log('[SW] parsed json:', jsonData)
    notificationData = { ...notificationData, ...jsonData }
  } catch (e) {
    console.log('[SW] json parse failed, using text:', event.data.text())
    notificationData.body = event.data.text()
  }

  console.log('[SW] showing notification with data:', notificationData)

  event.waitUntil(
    self.registration
      .showNotification(notificationData.title, {
        body: notificationData.body,
        icon: notificationData.icon || '/images/home-logo.png',
        badge: '/images/home-logo.png',
        tag: 'event-notification',
        requireInteraction: false,
      })
      .then(() => {
        console.log('[SW] notification shown successfully')
      })
      .catch((err) => {
        console.error('[SW] notification failed:', err)
      }),
  )
})

// 알림 클릭 시 이벤트 페이지로 이동
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] notification clicked')
  event.notification.close()

  event.waitUntil(
    clients
      .matchAll({ type: 'window' })
      .then((clientList) => {
        for (const client of clientList) {
          if ('focus' in client) {
            client.focus()
            return client
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/event')
        }
      })
      .catch((err) => {
        console.error('[SW] notificationclick error:', err)
      }),
  )
})
