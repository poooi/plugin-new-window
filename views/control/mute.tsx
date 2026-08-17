import { Button, Position, Tooltip } from '@blueprintjs/core'
import React, { useCallback, useState } from 'react'
import FontAwesome from 'react-fontawesome'
import { useTranslation } from 'react-i18next'

import { useWebviewRef } from '../webview-context'

const MuteButton: React.FC = () => {
  const { t } = useTranslation('poi-plugin-new-window')
  const webview = useWebviewRef()
  const [isMuted, setMuted] = useState(false)

  const handleToggle = useCallback(() => {
    setMuted((muted) => {
      webview.current?.setAudioMuted(!muted)
      return !muted
    })
  }, [webview])

  return (
    <Tooltip position={Position.TOP} content={isMuted ? t('Volume on') : t('Volume off')}>
      <Button onClick={handleToggle}>
        <FontAwesome name={isMuted ? 'volume-off' : 'volume-up'} />
      </Button>
    </Tooltip>
  )
}

export default MuteButton
