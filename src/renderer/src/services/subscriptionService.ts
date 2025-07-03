/**
 * 订阅服务模块
 * 封装与各种网站订阅相关的API调用
 * @author Cail Gainey <cailgainey@foxmail.com>
 */

import { IkuuuAccount } from './ikuuuService';

/**
 * 订阅获取结果接口
 * @author Cail Gainey <cailgainey@foxmail.com>
 */
export interface SubscriptionResult {
  success: boolean;
  subscriptionUrl?: string;
  message?: string;
}

/**
 * 获取订阅链接
 * @param account 账号信息
 * @returns 订阅获取结果
 * @author Cail Gainey <cailgainey@foxmail.com>
 */
export async function getSubscription(account: IkuuuAccount): Promise<SubscriptionResult> {
  if (!account.enabled) {
    return { success: false, message: '账号未启用' };
  }

  try {
    const result = await window.electron.ipcRenderer.invoke('ikuuu-get-subscription', {
      email: account.email,
      password: account.password,
      url: account.url,
      siteType: account.siteType
    });
    
    return result;
  } catch (error) {
    console.error('获取订阅失败:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : '获取订阅失败'
    };
  }
}

/**
 * 获取网站类型显示名称
 * @param siteType 网站类型
 * @returns 显示名称
 * @author Cail Gainey <cailgainey@foxmail.com>
 */
export function getSiteTypeDisplay(siteType?: string): string {
  if (!siteType) return 'ikuuu';
  
  switch (siteType) {
    case 'ikuuu':
      return 'ikuuu';
    case 'fbval2':
      return 'FlyingBird';
    default:
      return siteType;
  }
} 