import React, { useState, useContext } from 'react'
import { Tooltip, Button, Position } from '@blueprintjs/core'
import FontAwesome from 'react-fontawesome'
import { translate } from 'react-i18next'
import styled from 'styled-components'

import WebviewContext from '../webview-context'

const Icon = styled.div`
  width: 1.5em;
`

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
        <Icon>
          <FontAwesome name={isMuted ? 'volume-off' : 'volume-up'} />
        </Icon>
      </Button>
    </Tooltip>
  )
})

export default MuteButton
