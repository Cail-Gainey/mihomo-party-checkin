import React, { createContext, useContext, ReactNode, useEffect } from 'react'
import useSWR from 'swr'
import { getAppConfig, patchAppConfig as patch } from '@renderer/utils/ipc'

interface AppConfigContextType {
  appConfig: IAppConfig | undefined
  mutateAppConfig: () => void
  patchAppConfig: (value: Partial<IAppConfig>) => Promise<void>
}

// 默认的侧边栏卡片顺序
const defaultSiderOrder = [
  'sysproxy',
  'tun',
  'profile',
  'proxy',
  'rule',
  'resource',
  'override',
  'connection',
  'mihomo',
  'dns',
  'sniff',
  'log',
  'substore',
  'checkin'
]

const AppConfigContext = createContext<AppConfigContextType | undefined>(undefined)

export const AppConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { data: appConfig, mutate: mutateAppConfig } = useSWR('getConfig', () => getAppConfig())

  const patchAppConfig = async (value: Partial<IAppConfig>): Promise<void> => {
    try {
      await patch(value)
    } catch (e) {
      alert(e)
    } finally {
      mutateAppConfig()
    }
  }

  // 确保在首次加载时侧边栏卡片顺序被正确初始化
  useEffect(() => {
    if (appConfig && !appConfig.siderOrder) {
      patchAppConfig({ siderOrder: defaultSiderOrder })
    }
  }, [appConfig])

  useEffect(() => {
    window.electron.ipcRenderer.on('appConfigUpdated', () => {
      mutateAppConfig()
    })
    return (): void => {
      window.electron.ipcRenderer.removeAllListeners('appConfigUpdated')
    }
  }, [])

  return (
    <AppConfigContext.Provider value={{ appConfig, mutateAppConfig, patchAppConfig }}>
      {children}
    </AppConfigContext.Provider>
  )
}

export const useAppConfig = (): AppConfigContextType => {
  const context = useContext(AppConfigContext)
  if (context === undefined) {
    throw new Error('useAppConfig must be used within an AppConfigProvider')
  }
  return context
}
