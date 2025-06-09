import { readFile, writeFile } from 'fs/promises'
import { appConfigPath } from '../utils/dirs'
import yaml from 'yaml'
import { deepMerge } from '../utils/merge'
import { defaultConfig } from '../utils/template'

let appConfig: IAppConfig // config.yaml

export async function getAppConfig(force = false): Promise<IAppConfig> {
  if (force || !appConfig) {
    try {
      const data = await readFile(appConfigPath(), 'utf-8')
      appConfig = yaml.parse(data, { merge: true }) || defaultConfig
      
      // 确保必要的配置项存在
      if (!appConfig.siderOrder) {
        appConfig.siderOrder = defaultConfig.siderOrder
      } else if (!appConfig.siderOrder.includes('checkin')) {
        // 如果siderOrder存在但不包含checkin，则添加它
        appConfig.siderOrder.push('checkin')
      }
    } catch (error) {
      console.error('读取配置文件失败，使用默认配置', error)
      appConfig = defaultConfig
    }
  }
  if (typeof appConfig !== 'object') appConfig = defaultConfig
  return appConfig
}

export async function patchAppConfig(patch: Partial<IAppConfig>): Promise<void> {
  if (patch.nameserverPolicy) {
    appConfig.nameserverPolicy = patch.nameserverPolicy
  }
  appConfig = deepMerge(appConfig, patch)
  await writeFile(appConfigPath(), yaml.stringify(appConfig))
}
