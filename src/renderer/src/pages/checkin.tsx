import { Button, Card, CardBody, CardHeader, Divider, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Switch, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Tooltip, useDisclosure } from '@heroui/react'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MdAdd, MdDelete, MdEdit, MdOutlineOpenInNew } from 'react-icons/md'
import { useAppConfig } from '@renderer/hooks/use-app-config'
import { notification } from '@renderer/utils/notification'
import BasePage from '@renderer/components/base/base-page'
import BorderSwitch from '@renderer/components/base/border-swtich'
import { IkuuuAccount, isCheckedInSuccessfully, needsCheckin, performCheckin } from '../services/ikuuuService'
import { resetAutoCheckinState } from '../services/checkinState'
import { getSiteTypeDisplay } from '../services/checkinService'
import { openExternal } from '../utils/ipc'

/**
 * 签到页面组件
 * 用于管理和执行 ikuuu 网站的签到任务
 * @author Cail Gainey <cailgainey@foxmail.com>
 */
const Checkin: React.FC = () => {
  const { t } = useTranslation()
  const { appConfig, patchAppConfig } = useAppConfig()
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure()
  const [checkinConfigs, setCheckinConfigs] = useState<IkuuuAccount[]>([])
  const [editingConfig, setEditingConfig] = useState<IkuuuAccount | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [autoCheckinEnabled, setAutoCheckinEnabled] = useState(false)

  // 初始化签到配置
  useEffect(() => {
    if (appConfig?.checkinConfigs) {
      setCheckinConfigs(appConfig.checkinConfigs)
    } else {
      setCheckinConfigs([])
    }

    // 初始化自动签到设置
    if (appConfig?.autoCheckinEnabled !== undefined) {
      setAutoCheckinEnabled(appConfig.autoCheckinEnabled)
    }
  }, [appConfig?.checkinConfigs, appConfig?.autoCheckinEnabled])

  // 保存签到配置
  const saveCheckinConfigs = async (configs: IkuuuAccount[]) => {
    await patchAppConfig({ checkinConfigs: configs })
    setCheckinConfigs(configs)
  }

  // 保存自动签到设置
  const saveAutoCheckinSettings = async (enabled: boolean) => {
    await patchAppConfig({
      autoCheckinEnabled: enabled
    })
    setAutoCheckinEnabled(enabled)
    // 重置自动签到执行状态
    resetAutoCheckinState()
  }

  /**
   * 执行签到
   * @param account 账号信息
   * @param silent 是否静默签到（不显示加载指示器）
   * @param suppressNotification 是否禁止通知
   * @returns 签到结果消息
   * @author Cail Gainey <cailgainey@foxmail.com>
   */
  const executeCheckin = async (account: IkuuuAccount, silent: boolean = false, suppressNotification: boolean = false) => {
    // 如果账号未启用，跳过签到
    if (!account.enabled) {
      return '账号未启用'
    }
    
    // 如果账号已经签到成功且是今天，跳过签到
    if (isCheckedInSuccessfully(account.lastStatus) && account.lastCheckin) {
      const lastCheckinDate = new Date(account.lastCheckin)
      const today = new Date()
      
      if (
        lastCheckinDate.getFullYear() === today.getFullYear() &&
        lastCheckinDate.getMonth() === today.getMonth() &&
        lastCheckinDate.getDate() === today.getDate()
      ) {
        return account.lastStatus || '已签到'
      }
    }
    
    try {
      if (!silent) setIsLoading(true)
      
      // 使用服务模块执行签到
      const result = await performCheckin(account)
      
      // 更新签到状态
      const updatedConfigs = checkinConfigs.map(c => {
        if (c.email === account.email && c.url === account.url) {
          return {
            ...c,
            lastCheckin: new Date().toLocaleString(),
            lastStatus: result.message
          }
        }
        return c
      })
      
      // 更新本地状态和配置
      await saveCheckinConfigs(updatedConfigs)
      
      // 强制更新本地状态，确保UI立即更新
      setCheckinConfigs([...updatedConfigs])
      
      // 显示系统通知（除非明确禁止）
      if (!suppressNotification) {
        notification({
          title: `${getSiteTypeDisplay(account.siteType)} 签到结果`,
          body: `${account.email}: ${result.message}`
        })
      }
      
      return result.message
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '签到失败'
      
      // 更新签到状态为失败
      const updatedConfigs = checkinConfigs.map(c => {
        if (c.email === account.email && c.url === account.url) {
          return {
            ...c,
            lastCheckin: new Date().toLocaleString(),
            lastStatus: errorMessage
          }
        }
        return c
      })
      
      // 更新本地状态和配置
      await saveCheckinConfigs(updatedConfigs)
      
      // 强制更新本地状态，确保UI立即更新
      setCheckinConfigs([...updatedConfigs])
      
      // 显示系统通知（除非明确禁止）
      if (!suppressNotification) {
        notification({
          title: `${getSiteTypeDisplay(account.siteType)} 签到失败`,
          body: `${account.email}: ${errorMessage}`
        })
      }
      
      return errorMessage
    } finally {
      if (!silent) setIsLoading(false)
    }
  }

  /**
   * 执行所有启用的签到
   * @param silent 是否静默签到（不显示加载指示器）
   * @param suppressIndividualNotifications 是否禁止单个账号的通知
   * @author Cail Gainey <cailgainey@foxmail.com>
   */
  const performAllCheckins = async (silent: boolean = false, suppressIndividualNotifications: boolean = false) => {
    if (!silent) setIsLoading(true)
    
    const enabledConfigs = checkinConfigs.filter(config => 
      config.enabled && needsCheckin(config)
    )
    
    if (enabledConfigs.length === 0) {
      notification({
        title: '自动签到',
        body: '所有账号已签到或未启用'
      })
      
      if (!silent) setIsLoading(false)
      return
    }
    
    const results: { email: string; status: string; success: boolean }[] = []
    let updatedConfigs = [...checkinConfigs]
    
    for (const config of enabledConfigs) {
      try {
        const result = await executeCheckin(config, silent, suppressIndividualNotifications)
        results.push({
          email: config.email,
          status: result,
          success: isCheckedInSuccessfully(result)
        })
        
        // 获取最新的配置状态，确保每次签到后的状态都是最新的
        updatedConfigs = [...checkinConfigs]
        
        // 添加延迟，避免请求过于频繁
        await new Promise(resolve => setTimeout(resolve, 2000))
      } catch (error) {
        results.push({
          email: config.email,
          status: error instanceof Error ? error.message : '签到失败',
          success: false
        })
      }
    }
    
    // 显示总结通知
    const successCount = results.filter(r => r.success).length
    const failureCount = results.length - successCount
    
    notification({
      title: '批量签到完成',
      body: `共 ${results.length} 个账号，成功 ${successCount} 个，失败 ${failureCount} 个`
    })
    
    // 强制更新本地状态，确保UI立即更新
    setCheckinConfigs([...updatedConfigs])
    
    if (!silent) setIsLoading(false)
  }

  // 添加或编辑签到配置
  const handleSaveConfig = () => {
    if (!editingConfig || !editingConfig.email || !editingConfig.password) {
      return
    }
    
    // 确保有默认URL和网站类型
    if (!editingConfig.siteType) {
      editingConfig.siteType = 'ikuuu'
    }
    
    // 根据网站类型设置URL
    if (!editingConfig.url || editingConfig.url === '') {
      if (editingConfig.siteType === 'ikuuu') {
        editingConfig.url = 'https://ikuuu.one'
      } else if (editingConfig.siteType === 'fbval2') {
        editingConfig.url = 'https://fbval2-vas08.cc'
      }
    }
    
    let newConfigs: IkuuuAccount[]
    
    if (isEditing) {
      // 编辑现有配置
      newConfigs = checkinConfigs.map(config => 
        config.email === editingConfig.email && config.url === editingConfig.url 
          ? editingConfig 
          : config
      )
    } else {
      // 添加新配置
      newConfigs = [...checkinConfigs, editingConfig]
    }
    
    saveCheckinConfigs(newConfigs)
    onClose()
  }

  // 删除签到配置
  const handleDeleteConfig = (config: IkuuuAccount) => {
    const newConfigs = checkinConfigs.filter(c => 
      !(c.email === config.email && c.url === config.url)
    )
    saveCheckinConfigs(newConfigs)
  }

  // 切换签到配置启用状态
  const toggleConfigEnabled = (config: IkuuuAccount) => {
    const newConfigs = checkinConfigs.map(c => {
      if (c.email === config.email && c.url === config.url) {
        return { ...c, enabled: !c.enabled }
      }
      return c
    })
    saveCheckinConfigs(newConfigs)
  }

  // 获取签到状态显示文本
  const getStatusText = (status?: string) => {
    if (!status) return '-'
    return isCheckedInSuccessfully(status) ? t('checkin.status.checked') : t('checkin.status.unchecked')
  }

  // 截断长邮箱地址
  const truncateEmail = (email: string) => {
    if (email.length > 16) {
      return (
        <Tooltip content={email}>
          <span>{email.substring(0, 13)}...</span>
        </Tooltip>
      )
    }
    return email
  }

  // 打开网站
  const openWebsite = (url: string) => {
    openExternal(url).catch(error => {
      notification({
        title: '打开网站失败',
        body: `无法打开 ${url}: ${error.message || error}`
      });
    });
  }
  
  // 根据网站类型获取注册地址
  const getRegisterUrl = (siteType?: string) => {
    if (!siteType || siteType === 'ikuuu') return 'https://ikuuu.one/auth/register'
    if (siteType === 'fbval2') return 'https://fbval2-vas08.cc/auth/register'
    return 'https://ikuuu.one/auth/register'
  }

  return (
    <BasePage title={t('checkin.title')}>
      <div className="flex flex-col h-full">
        {/* 签到配置卡片 */}
        <Card className="flex-1 m-4">
          <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <h2 className="text-xl font-bold">{t('checkin.title')}</h2>
            <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto">
              <div className="flex items-center gap-2 mr-2">
                <span className="whitespace-nowrap">{t('checkin.autoEnabled')}</span>
                <BorderSwitch 
                  isShowBorder={autoCheckinEnabled}
                  isSelected={autoCheckinEnabled}
                  onValueChange={(enabled) => saveAutoCheckinSettings(enabled)}
                />
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button 
                  color="primary" 
                  isLoading={isLoading}
                  onPress={() => performAllCheckins(false, false)}
                  size="sm"
                >
                  {t('checkin.runAll')}
                </Button>
                <Button 
                  color="primary" 
                  onPress={() => {
                    setEditingConfig({ 
                      email: '', 
                      password: '', 
                      url: 'https://ikuuu.one', 
                      enabled: true,
                      siteType: 'ikuuu'
                    })
                    setIsEditing(false)
                    onOpen()
                  }}
                  startContent={<MdAdd />}
                  size="sm"
                >
                  {t('checkin.add')}
                </Button>
              </div>
            </div>
          </CardHeader>
          <Divider />
          <CardBody className="flex-1 overflow-hidden">
            <div className="h-full overflow-auto">
              <Table 
                aria-label="签到配置表格" 
                className="min-w-full" 
                removeWrapper
              >
                <TableHeader>
                  <TableColumn width={160}>{t('checkin.email')}</TableColumn>
                  <TableColumn width={100}>{t('checkin.siteType') || '网站类型'}</TableColumn>
                  <TableColumn width={140}>{t('checkin.lastCheckin')}</TableColumn>
                  <TableColumn width={70}>{t('checkin.status')}</TableColumn>
                  <TableColumn width={70}>{t('checkin.enabled')}</TableColumn>
                  <TableColumn width={80}>{t('checkin.actions')}</TableColumn>
                </TableHeader>
                <TableBody emptyContent={t('checkin.noConfigs')}>
                  {checkinConfigs.map((config, index) => (
                    <TableRow key={index} className={!config.enabled ? "opacity-60" : ""}>
                      <TableCell>
                        <Tooltip content={config.email}>
                          <span>{truncateEmail(config.email)}</span>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Tooltip content={config.url}>
                          <span>{getSiteTypeDisplay(config.siteType)}</span>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        {config.lastCheckin || '-'}
                      </TableCell>
                      <TableCell>
                        <span className={isCheckedInSuccessfully(config.lastStatus) ? "text-success" : "text-danger"}>
                          {getStatusText(config.lastStatus)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Switch
                          size="sm"
                          isSelected={config.enabled}
                          onValueChange={() => toggleConfigEnabled(config)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 justify-center">
                          <Button 
                            isIconOnly 
                            size="sm" 
                            variant="light"
                            onPress={() => {
                              setEditingConfig(config)
                              setIsEditing(true)
                              onOpen()
                            }}
                          >
                            <MdEdit />
                          </Button>
                          <Button 
                            isIconOnly 
                            size="sm" 
                            color="danger" 
                            variant="light"
                            onPress={() => handleDeleteConfig(config)}
                          >
                            <MdDelete />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardBody>
        </Card>

        {/* 添加/编辑签到配置的模态框 */}
        <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
          <ModalContent>
            <ModalHeader>
              {isEditing ? t('checkin.edit') : t('checkin.add')}
            </ModalHeader>
            <ModalBody>
              <Input
                label={t('checkin.email')}
                placeholder="example@example.com"
                value={editingConfig?.email || ''}
                onChange={(e) => setEditingConfig({ ...editingConfig!, email: e.target.value })}
              />
              <Input
                label={t('checkin.password')}
                placeholder="********"
                type="password"
                value={editingConfig?.password || ''}
                onChange={(e) => setEditingConfig({ ...editingConfig!, password: e.target.value })}
              />
              
              {/* 网站类型选择 */}
              <div className="mt-2 mb-2">
                <p className="text-sm mb-1">{t('checkin.siteType') || '网站类型'}</p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={!editingConfig?.siteType || editingConfig?.siteType === 'ikuuu' ? 'solid' : 'bordered'}
                    color={!editingConfig?.siteType || editingConfig?.siteType === 'ikuuu' ? 'primary' : 'default'}
                    className="flex-1"
                    onPress={() => {
                      const newConfig = { 
                        ...editingConfig!, 
                        siteType: 'ikuuu' as 'ikuuu', 
                        url: 'https://ikuuu.one' 
                      }
                      setEditingConfig(newConfig)
                    }}
                  >
                    ikuuu
                  </Button>
                  <Button
                    size="sm"
                    variant={editingConfig?.siteType === 'fbval2' ? 'solid' : 'bordered'}
                    color={editingConfig?.siteType === 'fbval2' ? 'primary' : 'default'}
                    className="flex-1"
                    onPress={() => {
                      const newConfig = { 
                        ...editingConfig!, 
                        siteType: 'fbval2' as 'fbval2', 
                        url: 'https://fbval2-vas08.cc' 
                      }
                      setEditingConfig(newConfig)
                    }}
                  >
                    FlyingBird
                  </Button>
                </div>
              </div>
              
              <Switch
                isSelected={editingConfig?.enabled}
                onValueChange={(value) => setEditingConfig({ ...editingConfig!, enabled: value })}
              >
                {t('checkin.enabled')}
              </Switch>
              
              <div className="mt-4 text-center">
                <Button
                  size="sm"
                  variant="flat"
                  color="primary"
                  startContent={<MdOutlineOpenInNew />}
                  onPress={() => openWebsite(getRegisterUrl(editingConfig?.siteType))}
                >
                  {t('checkin.register')}
                </Button>
                <p className="text-xs text-gray-500 mt-1">
                  {t('checkin.registerTip')}
                </p>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                {t('common.cancel')}
              </Button>
              <Button color="primary" onPress={handleSaveConfig}>
                {t('common.save')}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </BasePage>
  )
}

export default Checkin 