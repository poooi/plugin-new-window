import { Button, Position, Tooltip } from '@blueprintjs/core'
import React, { useCallback } from 'react'
import FontAwesome from 'react-fontawesome'
import { useTranslation } from 'react-i18next'

import { remote } from '../../lib/remote'
import { useWebviewRef } from '../webview-context'

const DevToolsButton: React.FC = () => {
  const { t } = useTranslation('poi-plugin-new-window')
  const webview = useWebviewRef()

  const handleDevTool = useCallback(() => {
    remote.getCurrentWindow().webContents.openDevTools({ mode: 'detach' })
  }, [])

  const handleDebug = useCallback(() => {
    webview.current?.openDevTools()
  }, [webview])

  return (
    <Tooltip position={Position.TOP} content={t('Developer Tools')}>
      <Button onClick={handleDevTool} onContextMenu={handleDebug}>
        <FontAwesome name="gears" />
      </Button>
    </Tooltip>
  )
}

export default DevToolsButton
