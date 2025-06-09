/**
 * IPC处理程序模块
 * 注册与ikuuu相关的IPC通信
 * @author Cail Gainey <cailgainey@foxmail.com>
 */
import { ipcMain } from 'electron'
import * as ikuuuService from './ikuuuService'

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
  ipcMain.handle('ikuuu-checkin', async (_event, data: { email: string; password: string; url: string }) => {
    return await ikuuuService.checkin(data.email, data.password, data.url)
  })

  /**
   * 获取 ikuuu 订阅链接
   * 调用 ikuuuService 处理具体逻辑
   * @author Cail Gainey <cailgainey@foxmail.com>
   */
  ipcMain.handle('ikuuu-get-subscription', async (_event, data: { email: string; password: string; url: string }) => {
    return await ikuuuService.getSubscription(data.email, data.password, data.url)
  })
} 