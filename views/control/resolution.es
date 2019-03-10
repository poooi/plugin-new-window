import React, { useCallback, useContext, useState } from 'react'
import {
  Tooltip,
  Button,
  Position,
  Popover,
  Card,
  FormGroup,
  NumericInput,
  ControlGroup,
  HTMLSelect,
  Intent,
} from '@blueprintjs/core'
import FontAwesome from 'react-fontawesome'
import { translate } from 'react-i18next'
import { remote } from 'electron'
import styled from 'styled-components'
import { map } from 'lodash'

import WebviewContext from '../webview-context'

const RESOLUTIONS = {
  w800h480: [800, 480],
  w960h580: [960, 580],
  w960h640: [960, 640],
  w1280h720: [1280, 720],
}

const setBounds = (width, height) => {
  let nowWindow = remote.getCurrentWindow()
  let bound = nowWindow.getBounds()
  let { x, y } = bound
  let borderX = bound.width - window.innerWidth
  let borderY = bound.height - window.innerHeight
  let newWidth = width
  let newHeight = height
  nowWindow.setBounds({
    x: x,
    y: y,
    width: parseInt(newWidth + borderX),
    height: parseInt(newHeight + borderY + 50),
  })
}

const Control = styled(ControlGroup)`
  align-items: center;
`

const Icon = styled.span`
  width: 2em;
  text-align: center;
`

const ResolutionCard = translate('poi-plugin-new-window')(({ t }) => {
  const webview = useContext(WebviewContext)

  const [width, setWidth] = useState(window.innerWidth)
  const [height, setHeight] = useState(window.innerHeight - 50)
  const [zoom, setZoom] = useState(1)

  const handleApply = useCallback(() => {
    setBounds(width, height)
  }, [width, height])

  const handleShortcut = useCallback(e => {
    const name = e.target.value
    const [w, h] = RESOLUTIONS[name] || []
    setWidth(w)
    setHeight(h)
    if (w && h) {
      setBounds(w, h)
    }
  })

  const handleZoom = useCallback(
    e => {
      setZoom(e.target.value)
      webview.current.executeJavaScript(`window.setZoom(${e.target.value})`)
    },
    [webview],
  )

  return (
    <Card>
      <FormGroup label={t('Size')}>
        <Control>
          <HTMLSelect value="unselected" onChange={handleShortcut}>
            <option value="unselectd">{t('Presets')}</option>
            {map(RESOLUTIONS, ([w, h], name) => (
              <option value={name} key={name}>
                {w} × {h}
              </option>
            ))}
          </HTMLSelect>
          <Icon />
          <Icon>
            <FontAwesome name="arrows-alt-h" />
          </Icon>
          <NumericInput value={width} onChange={value => setWidth(value)} />
          <Icon>
            <FontAwesome name="arrows-alt-v" />
          </Icon>
          <NumericInput value={height} onChange={value => setHeight(value)} />
          <Button intent={Intent.PRIMARY} onClick={handleApply}>
            {t('Apply')}
          </Button>
        </Control>
      </FormGroup>
      <FormGroup label={t('Zoom')}>
        <HTMLSelect onChange={handleZoom} value={zoom}>
          {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
            <option key={i} value={i * 0.25 + 0.25}>
              {i * 25 + 25}%
            </option>
          ))}
        </HTMLSelect>
      </FormGroup>
    </Card>
  )
})

const ResolutionButton = translate('poi-plugin-new-window')(({ t }) => (
  <Popover hasBackdrop position={Position.TOP}>
    <Tooltip position={Position.TOP} content={t('Change resolution')}>
      <Button>
        <FontAwesome name="arrows" />
      </Button>
    </Tooltip>
    <ResolutionCard />
  </Popover>
))

export default ResolutionButton
