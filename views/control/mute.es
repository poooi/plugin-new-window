import React, { useState, useContext } from 'react'
import { Tooltip, Button, Position } from '@blueprintjs/core'
import FontAwesome from 'react-fontawesome'
import { translate } from 'react-i18next'

import WebviewContext from '../webview-context'

const MuteButton = translate('poi-plugin-new-window')(({ t }) => {
  const [isMuted, setMuted] = useState(false)

  const webview = useContext(WebviewContext)

  return (
    <Tooltip position={Position.TOP} content={isMuted ? t('Volume on') : t('Volume off')}>
      <Button
        onClick={() => {
          webview.current?.setAudioMuted?.(!isMuted)
          setMuted(!isMuted)
        }}
      >
        <FontAwesome name={isMuted ? 'volume-off' : 'volume-up'} />
      </Button>
    </Tooltip>
  )
})

export default MuteButton
