import { Button } from '@heroui/react'
import { ReactNode } from 'react'
import { ErrorBoundary, FallbackProps } from 'react-error-boundary'
import { useTranslation } from 'react-i18next'

const ErrorFallback = ({ error }: FallbackProps) => {
  const { t } = useTranslation()
  
  return (
    <div className="p-4">
      <h2 className="my-2 text-lg font-bold">
        {t('common.error.appCrash')}
      </h2>

      <Button
        size="sm"
        color="primary"
        variant="flat"
        onPress={() => open('https://github.com/Cail-Gainey/mihomo-party-checkin/issues/new/choose')}
      >
        GitHub
      </Button>

      <Button
        size="sm"
        variant="flat"
        className="ml-2"
        onPress={() =>
          navigator.clipboard.writeText('```\n' + error.message + '\n' + error.stack + '\n```')
        }
      >
        {t('common.error.copyErrorMessage')}
      </Button>

      <p className="my-2">{error.message}</p>

      <details title="Error Stack">
        <summary>Error Stack</summary>
        <pre>{error.stack}</pre>
      </details>
    </div>
  )
}

interface Props {
  children?: ReactNode
}

const BaseErrorBoundary = (props: Props) => {
  return <ErrorBoundary FallbackComponent={ErrorFallback}>{props.children}</ErrorBoundary>
}

export default BaseErrorBoundary
