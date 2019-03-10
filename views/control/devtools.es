import React, { useCallback, useContext } from 'react'
import { Tooltip, Button, Position } from '@blueprintjs/core'
import FontAwesome from 'react-fontawesome'
import { translate } from 'react-i18next'
import { remote } from 'electron'

import WebviewContext from '../webview-context'

const DevToolsButton = translate('poi-plugin-new-window')(({ t }) => {
  const webview = useContext(WebviewContext)

  const handleDevTool = useCallback(() => {
    remote.getCurrentWindow().openDevTools({
      detach: true,
    })
  })

  const handleDebug = useCallback(() => {
    webview.current?.openDevTools({
      detach: true,
    })
  }, [webview])

  return (
    <Tooltip position={Position.TOP} content={t('Developer Tools')}>
      <Button onClick={handleDevTool} onContextMenu={handleDebug}>
        <FontAwesome name="gears" />
      </Button>
    </Tooltip>
  )
})

export default DevToolsButton
