/**
 * 自动签到服务
 * 用于在应用启动时执行自动签到，不依赖于页面组件
 * @author Cail Gainey <cailgainey@foxmail.com>
 */

import { notification } from '@renderer/utils/notification'
import { isCheckedInSuccessfully, needsCheckin, performCheckin } from './ikuuuService'
import { getAutoCheckinExecuted, setAutoCheckinExecuted } from './checkinState'

/**
 * 执行自动签到
 * @param accounts 账号列表
 * @param onSuccess 签到成功回调，用于更新UI
 * @author Cail Gainey <cailgainey@foxmail.com>
 */
export async function executeAutoCheckin(
  accounts: CheckinConfig[],
  onSuccess?: (updatedAccounts: CheckinConfig[]) => void
): Promise<void> {
  // 如果已经执行过，则不重复执行
  if (getAutoCheckinExecuted()) {
    return
  }
  
  // 标记为已执行
  setAutoCheckinExecuted(true)
  
  // 筛选需要签到的账号
  const enabledAccounts = accounts.filter(account => 
    account.enabled && needsCheckin(account)
  )
  
  if (enabledAccounts.length === 0) {
    return
  }
  
  const results: { email: string; status: string; success: boolean }[] = []
  const updatedAccounts: CheckinConfig[] = [...accounts]
  
  for (const account of enabledAccounts) {
    try {
      // 执行签到
      const result = await performCheckin(account)
      
      // 更新账号状态
      const accountIndex = updatedAccounts.findIndex(
        a => a.email === account.email && a.url === account.url
      )
      
      if (accountIndex !== -1) {
        updatedAccounts[accountIndex] = {
          ...updatedAccounts[accountIndex],
          lastCheckin: new Date().toLocaleString(),
          lastStatus: result.message
        }
      }
      
      results.push({
        email: account.email,
        status: result.message,
        success: isCheckedInSuccessfully(result.message)
      })
      
      // 显示单个账号的通知
      notification({
        title: 'ikuuu 签到结果',
        body: `${account.email}: ${result.message}`
      })
      
      // 添加延迟，避免请求过于频繁
      await new Promise(resolve => setTimeout(resolve, 2000))
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '签到失败'
      
      // 更新账号状态
      const accountIndex = updatedAccounts.findIndex(
        a => a.email === account.email && a.url === account.url
      )
      
      if (accountIndex !== -1) {
        updatedAccounts[accountIndex] = {
          ...updatedAccounts[accountIndex],
          lastCheckin: new Date().toLocaleString(),
          lastStatus: errorMessage
        }
      }
      
      results.push({
        email: account.email,
        status: errorMessage,
        success: false
      })
      
      // 显示错误通知
      notification({
        title: 'ikuuu 签到失败',
        body: `${account.email}: ${errorMessage}`
      })
    }
  }
  
  // 显示总结通知
  const successCount = results.filter(r => r.success).length
  const failureCount = results.length - successCount
  
  notification({
    title: 'ikuuu 批量签到完成',
    body: `共 ${results.length} 个账号，成功 ${successCount} 个，失败 ${failureCount} 个`
  })
  
  // 调用回调函数更新UI
  if (onSuccess) {
    onSuccess(updatedAccounts)
  }
} 