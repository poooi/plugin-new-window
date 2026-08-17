import {
  Button,
  Card,
  ControlGroup,
  FormGroup,
  HTMLSelect,
  Intent,
  NumericInput,
  Popover,
  Position,
  Tooltip,
} from '@blueprintjs/core'
import { map } from 'lodash'
import React, { useCallback, useState } from 'react'
import FontAwesome from 'react-fontawesome'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { remote } from '../../lib/remote'
import ErrorBoundary from '../error-boundary'
import { useWebviewRef } from '../webview-context'

const RESOLUTIONS: Record<string, [number, number]> = {
  w800h480: [800, 480],
  w960h580: [960, 580],
  w960h640: [960, 640],
  w1280h720: [1280, 720],
}

const UNSELECTED = 'unselected'

/** height of the control bar, which the window has to make room for */
const CONTROL_HEIGHT = 50

const setBounds = (width: number, height: number) => {
  const currentWindow = remote.getCurrentWindow()
  const { x, y, width: outerWidth, height: outerHeight } = currentWindow.getBounds()
  const borderX = outerWidth - window.innerWidth
  const borderY = outerHeight - window.innerHeight
  currentWindow.setBounds({
    x,
    y,
    width: Math.round(width + borderX),
    height: Math.round(height + borderY + CONTROL_HEIGHT),
  })
}

const Control = styled(ControlGroup)`
  align-items: center;
`

const Icon = styled.span`
  width: 2em;
  text-align: center;
`

const ResolutionCard: React.FC = () => {
  const { t } = useTranslation('poi-plugin-new-window')
  const webview = useWebviewRef()

  const [width, setWidth] = useState(window.innerWidth)
  const [height, setHeight] = useState(window.innerHeight - CONTROL_HEIGHT)
  const [zoom, setZoom] = useState(1)

  const handleApply = useCallback(() => {
    setBounds(width, height)
  }, [width, height])

  const handleShortcut = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const [w, h] = RESOLUTIONS[e.target.value] || []
    if (w && h) {
      setWidth(w)
      setHeight(h)
      setBounds(w, h)
    }
  }, [])

  const handleZoom = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = Number(e.target.value)
      setZoom(value)
      webview.current?.executeJavaScript(`window.setZoom(${value})`)
    },
    [webview],
  )

  return (
    <ErrorBoundary>
      <Card>
        <FormGroup label={t('Size')}>
          <Control>
            <HTMLSelect value={UNSELECTED} onChange={handleShortcut}>
              <option value={UNSELECTED}>{t('Presets')}</option>
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
            <NumericInput value={width} onValueChange={setWidth} />
            <Icon>
              <FontAwesome name="arrows-alt-v" />
            </Icon>
            <NumericInput value={height} onValueChange={setHeight} />
            <Button intent={Intent.PRIMARY} onClick={handleApply}>
              {t('Apply')}
            </Button>
          </Control>
        </FormGroup>
        <FormGroup label={t('Zoom')}>
          <HTMLSelect onChange={handleZoom} value={zoom}>
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <option key={i} value={i * 0.25 + 0.25}>
                {i * 25 + 25}%
              </option>
            ))}
          </HTMLSelect>
        </FormGroup>
      </Card>
    </ErrorBoundary>
  )
}

const ResolutionButton: React.FC = () => {
  const { t } = useTranslation('poi-plugin-new-window')

  return (
    <Popover hasBackdrop position={Position.TOP} content={<ResolutionCard />}>
      <Tooltip position={Position.TOP} content={t('Change resolution')}>
        <Button>
          <FontAwesome name="arrows" />
        </Button>
      </Tooltip>
    </Popover>
  )
}

export default ResolutionButton
