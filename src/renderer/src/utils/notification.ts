/**
 * 系统通知工具函数
 * 用于显示系统通知
 * @author Cail Gainey <cailgainey@foxmail.com>
 */

interface NotificationOptions {
  title: string
  body: string
  silent?: boolean
}

/**
 * 显示系统通知
 * @param options 通知选项
 */
export const notification = (options: NotificationOptions): void => {
  try {
    // 检查通知API是否可用
    if (!('Notification' in window)) {
      console.warn('系统不支持通知功能')
      return
    }

    // 检查通知权限
    if (Notification.permission === 'granted') {
      // 创建并显示通知
      new Notification(options.title, {
        body: options.body,
        silent: options.silent
      })
    } else if (Notification.permission !== 'denied') {
      // 请求通知权限
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(options.title, {
            body: options.body,
            silent: options.silent
          })
        }
      })
    }
  } catch (error) {
    console.error('显示通知失败:', error)
  }
} 