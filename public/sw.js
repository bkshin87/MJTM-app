// public/sw.js

self.addEventListener('install', (event) => {
  console.log('[SW] installed')
  self.skipWaiting?.()
})

self.addEventListener('activate', (event) => {
  console.log('[SW] activated')
  self.clients?.claim?.()
})

// Web Push 메시지 수신 (백그라운드에서도 작동)
self.addEventListener('push', (event) => {
  console.log('[SW] push event received', event)

  if (!event.data) {
    console.log('[SW] no push data')
    return
  }

  let notificationData = {
    title: '새로운 소식',
    body: '새 경조사가 등록되었습니다.',
    icon: '/images/home-logo.png',
  }

  try {
    notificationData = event.data.json()
  } catch (e) {
    notificationData.body = event.data.text()
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: '/images/home-logo.png',
      tag: 'event-notification',
      requireInteraction: false,
    }),
  )
})

// 알림 클릭 시 이벤트 페이지로 이동
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] notification clicked', event)
  event.notification.close()

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus()
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/event')
      }
    }),
  )
})
