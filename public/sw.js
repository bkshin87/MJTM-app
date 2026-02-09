// public/sw.js

// 로그 저장 함수 (서비스워커는 localStorage 사용 불가)
function logToClients(message) {
  const timestamp = new Date().toLocaleTimeString()
  const log = `${timestamp}: ${message}`

  console.log('[SW]', log)

  // 클라이언트 페이지로 로그 전달 (원하면 거기서 localStorage에 저장)
  self.clients
    ?.matchAll({ type: 'window', includeUncontrolled: true })
    .then((clientList) => {
      clientList.forEach((client) => {
        client.postMessage({
          type: 'SW_LOG',
          message: log,
        })
      })
    })
    .catch((err) => {
      console.error('[SW] postMessage error:', err)
    })
}

self.addEventListener('install', (event) => {
  logToClients('installed')
  self.skipWaiting?.()
})

self.addEventListener('activate', (event) => {
  logToClients('activated')
  self.clients?.claim?.()
})

// push 이벤트
self.addEventListener('push', (event) => {
  logToClients('push event received')
  logToClients(`event.data: ${event.data ? 'exists' : 'null'}`)

  if (!event.data) {
    logToClients('no push data, showing default notification')
    event.waitUntil(
      self.registration
        .showNotification('새로운 소식', {
          body: '새 경조사가 등록되었습니다.',
          icon: '/images/home-logo.png',
        })
        .then(() => {
          logToClients('default notification shown successfully')
        })
        .catch((err) => {
          logToClients(`default notification failed: ${err.message}`)
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
    logToClients(`parsed json: ${JSON.stringify(jsonData)}`)
    notificationData = { ...notificationData, ...jsonData }
  } catch (e) {
    logToClients(`json parse failed: ${e.message}`)
    try {
      notificationData.body = event.data.text()
    } catch (textErr) {
      logToClients(`text parse also failed: ${textErr.message}`)
    }
  }

  logToClients(`showing notification: ${notificationData.title}`)

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
        logToClients('notification shown successfully')
      })
      .catch((err) => {
        logToClients(`notification failed: ${err.message}`)
      }),
  )
})

// 알림 클릭 시 이벤트 페이지로 이동
self.addEventListener('notificationclick', (event) => {
  logToClients('notification clicked')
  event.notification.close()

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
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
        logToClients(`notificationclick error: ${err.message}`)
      }),
  )
})
