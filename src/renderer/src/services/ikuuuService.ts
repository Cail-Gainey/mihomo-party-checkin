/**
 * ikuuu前端服务模块
 * 封装与ikuuu相关的API调用
 * @author Cail Gainey <cailgainey@foxmail.com>
 */

/**
 * ikuuu账号配置接口
 * @author Cail Gainey <cailgainey@foxmail.com>
 */
export interface IkuuuAccount {
  email: string
  password: string
  url: string
  enabled: boolean
  lastCheckin?: string
  lastStatus?: string
}

/**
 * 签到结果接口
 * @author Cail Gainey <cailgainey@foxmail.com>
 */
export interface CheckinResult {
  success: boolean
  message: string
}

/**
 * 订阅获取结果接口
 * @author Cail Gainey <cailgainey@foxmail.com>
 */
export interface SubscriptionResult {
  success: boolean
  subscriptionUrl?: string
  message?: string
}

/**
 * 执行ikuuu签到
 * @param account 账号信息
 * @returns 签到结果
 * @author Cail Gainey <cailgainey@foxmail.com>
 */
export async function performCheckin(account: IkuuuAccount): Promise<CheckinResult> {
  if (!account.enabled) {
    return { success: false, message: '账号未启用' }
  }

  try {
    const result = await window.electron.ipcRenderer.invoke('ikuuu-checkin', {
      email: account.email,
      password: account.password,
      url: account.url
    });
    
    return result;
  } catch (error) {
    console.error('签到失败:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : '签到失败'
    }
  }
}

/**
 * 判断账号是否已签到成功
 * @param status 签到状态信息
 * @returns 是否已签到成功
 * @author Cail Gainey <cailgainey@foxmail.com>
 */
export function isCheckedInSuccessfully(status?: string): boolean {
  if (!status) return false
  return status.includes('成功') || 
         status.includes('流量') || 
         status.includes('已经签到') || 
         status.includes('已签到')
}

/**
 * 判断账号是否需要签到
 * @param account 账号信息
 * @returns 是否需要签到
 * @author Cail Gainey <cailgainey@foxmail.com>
 */
export function needsCheckin(account: IkuuuAccount): boolean {
  // 如果账号未启用，不需要签到
  if (!account.enabled) return false
  
  // 如果已经签到成功，检查是否是今天
  if (isCheckedInSuccessfully(account.lastStatus)) {
    if (!account.lastCheckin) return true
    
    // 检查上次签到是否是今天
    const lastCheckinDate = new Date(account.lastCheckin)
    const today = new Date()
    
    return (
      lastCheckinDate.getFullYear() !== today.getFullYear() ||
      lastCheckinDate.getMonth() !== today.getMonth() ||
      lastCheckinDate.getDate() !== today.getDate()
    )
  }
  
  // 如果没有签到成功或没有签到记录，需要签到
  return true
}

/**
 * 获取ikuuu订阅链接
 * @param account 账号信息
 * @returns 订阅获取结果
 * @author Cail Gainey <cailgainey@foxmail.com>
 */
export async function getSubscription(account: IkuuuAccount): Promise<SubscriptionResult> {
  if (!account.enabled) {
    return { success: false, message: '账号未启用' }
  }

  try {
    const result = await window.electron.ipcRenderer.invoke('ikuuu-get-subscription', {
      email: account.email,
      password: account.password,
      url: account.url
    });
    
    return result;
  } catch (error) {
    console.error('获取订阅失败:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : '获取订阅失败'
    }
  }
} 