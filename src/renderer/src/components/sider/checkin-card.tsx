import { Button, Card, CardBody, CardFooter, Tooltip } from '@heroui/react'
import { useAppConfig } from '@renderer/hooks/use-app-config'
import { useLocation, useNavigate } from 'react-router-dom'
import { MdOutlineTask } from 'react-icons/md'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useTranslation } from 'react-i18next'
import { useState, useEffect } from 'react'
import BorderSwitch from '@renderer/components/base/border-swtich'
import { resetAutoCheckinState } from '@renderer/services/checkinState'

/**
 * 签到卡片组件属性
 * @author Cail Gainey <cailgainey@foxmail.com>
 */
interface Props {
  iconOnly?: boolean
}

/**
 * 签到卡片组件
 * 用于在侧边栏显示并导航到签到页面
 * @author Cail Gainey <cailgainey@foxmail.com>
 */
const CheckinCard: React.FC<Props> = (props) => {
  const { t } = useTranslation()
  const { appConfig, patchAppConfig } = useAppConfig()
  const { iconOnly } = props
  const { checkinCardStatus = 'col-span-2' } = appConfig || {}
  const location = useLocation()
  const navigate = useNavigate()
  const match = location.pathname.includes('/checkin')
  const [autoCheckinEnabled, setAutoCheckinEnabled] = useState(false)
  
  // 初始化自动签到设置
  useEffect(() => {
    if (appConfig?.autoCheckinEnabled !== undefined) {
      setAutoCheckinEnabled(appConfig.autoCheckinEnabled)
    }
  }, [appConfig?.autoCheckinEnabled])
  
  // 保存自动签到设置
  const saveAutoCheckinSettings = async (enabled: boolean) => {
    await patchAppConfig({
      autoCheckinEnabled: enabled
    })
    setAutoCheckinEnabled(enabled)
    // 重置自动签到执行状态，确保在每次开关切换后可以重新执行
    resetAutoCheckinState()
  }
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform: tf,
    transition,
    isDragging
  } = useSortable({
    id: 'checkin'
  })
  
  const transform = tf ? { x: tf.x, y: tf.y, scaleX: 1, scaleY: 1 } : null

  // 处理卡片点击
  const handleCardClick = () => {
    navigate('/checkin')
  }

  // 处理开关点击
  const handleSwitchChange = (enabled: boolean) => {
    saveAutoCheckinSettings(enabled)
  }

  if (iconOnly) {
    return (
      <div className={`${checkinCardStatus} flex justify-center`}>
        <Tooltip content={t('sider.cards.checkin')} placement="right">
          <Button
            size="sm"
            isIconOnly
            color={match ? 'primary' : 'default'}
            variant={match ? 'solid' : 'light'}
            onPress={() => {
              navigate('/checkin')
            }}
          >
            <MdOutlineTask className="text-[20px]" />
          </Button>
        </Tooltip>
      </div>
    )
  }

  return (
    <div
      style={{
        position: 'relative',
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 'calc(infinity)' : undefined
      }}
      className={`${checkinCardStatus} checkin-card`}
    >
      <Card
        fullWidth
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        className={`${match ? 'bg-primary' : 'hover:bg-primary/30'} ${isDragging ? 'scale-[0.97] tap-highlight-transparent' : ''}`}
      >
        <div 
          className="cursor-pointer" 
          onClick={handleCardClick}
          style={{ width: '100%', height: '100%' }}
        >
          <CardBody className="pb-1 pt-0 px-0">
            <div className="flex justify-between">
              <div className="bg-transparent p-2">
                <MdOutlineTask
                  className={`${match ? 'text-primary-foreground' : 'text-foreground'} text-[24px] font-bold`}
                />
              </div>
              <div 
                onClick={(e) => e.stopPropagation()} 
                className="z-10"
              >
                <BorderSwitch
                  isShowBorder={match && autoCheckinEnabled}
                  isSelected={autoCheckinEnabled}
                  onValueChange={handleSwitchChange}
                />
              </div>
            </div>
          </CardBody>
          <CardFooter className="pt-1 flex justify-between items-center">
            <h3
              className={`text-md font-bold ${match ? 'text-primary-foreground' : 'text-foreground'}`}
            >
              {t('sider.cards.checkin')}
            </h3>
          </CardFooter>
        </div>
      </Card>
    </div>
  )
}

export default CheckinCard 