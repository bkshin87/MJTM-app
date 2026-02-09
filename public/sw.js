// public/sw.js

// 로그 저장 함수
function logToStorage(message) {
  const timestamp = new Date().toLocaleTimeString()
  const log = `${timestamp}: ${message}`
  console.log('[SW]', message)

  // localStorage에 로그 저장
  try {
    const logs = localStorage.getItem('sw_logs') || ''
    localStorage.setItem('sw_logs', logs + log + '\n')
  } catch (e) {
    console.error('[SW] localStorage error:', e)
  }
}

self.addEventListener('install', (event) => {
  logToStorage('installed')
  self.skipWaiting?.()
})

self.addEventListener('activate', (event) => {
  logToStorage('activated')
  self.clients?.claim?.()
})

// ✅ 더 강력한 push 이벤트 핸들러
self.addEventListener('push', (event) => {
  logToStorage('push event received')
  logToStorage(`event.data: ${event.data ? 'exists' : 'null'}`)

  if (!event.data) {
    logToStorage('no push data, showing default notification')
    // 데이터가 없으면 기본 알림 띄우기
    event.waitUntil(
      self.registration
        .showNotification('새로운 소식', {
          body: '새 경조사가 등록되었습니다.',
          icon: '/images/home-logo.png',
        })
        .then(() => {
          logToStorage('default notification shown successfully')
        })
        .catch((err) => {
          logToStorage(`default notification failed: ${err.message}`)
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
    logToStorage(`parsed json: ${JSON.stringify(jsonData)}`)
    notificationData = { ...notificationData, ...jsonData }
  } catch (e) {
    logToStorage(`json parse failed: ${e.message}`)
    try {
      notificationData.body = event.data.text()
    } catch (textErr) {
      logToStorage(`text parse also failed: ${textErr.message}`)
    }
  }

  logToStorage(`showing notification: ${notificationData.title}`)

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
        logToStorage('notification shown successfully')
      })
      .catch((err) => {
        logToStorage(`notification failed: ${err.message}`)
      }),
  )
})

// 알림 클릭 시 이벤트 페이지로 이동
self.addEventListener('notificationclick', (event) => {
  logToStorage('notification clicked')
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
        logToStorage(`notificationclick error: ${err.message}`)
      }),
  )
})
