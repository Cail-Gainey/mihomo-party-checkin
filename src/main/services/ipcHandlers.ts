/**
 * IPC处理程序模块
 * 注册与ikuuu和FlyingBird相关的IPC通信
 * @author Cail Gainey <cailgainey@foxmail.com>
 */
import { ipcMain } from 'electron'
import * as ikuuuService from './ikuuuService'
import * as flyingBirdService from './flyingBirdService'

/**
 * 注册所有与ikuuu相关的IPC处理程序
 * @author Cail Gainey <cailgainey@foxmail.com>
 */
export function registerIkuuuHandlers(): void {
  /**
   * 执行 ikuuu 网站签到
   * 调用 ikuuuService 处理具体逻辑
   * @author Cail Gainey <cailgainey@foxmail.com>
   */
  ipcMain.handle('ikuuu-checkin', async (_event, data: { email: string; password: string; url: string; siteType?: string }) => {
    // 根据网站类型选择不同的服务
    if (data.siteType === 'fbval2') {
      return await flyingBirdService.checkin(data.email, data.password, data.url)
    } else {
      return await ikuuuService.checkin(data.email, data.password, data.url)
    }
  })

  /**
   * 获取订阅链接
   * 根据网站类型调用不同的服务处理具体逻辑
   * @author Cail Gainey <cailgainey@foxmail.com>
   */
  ipcMain.handle('ikuuu-get-subscription', async (_event, data: { email: string; password: string; url: string; siteType?: string }) => {
    // 根据网站类型选择不同的服务
    if (data.siteType === 'fbval2') {
      return await flyingBirdService.getSubscription(data.email, data.password, data.url)
    } else {
      return await ikuuuService.getSubscription(data.email, data.password, data.url)
    }
  })
} 