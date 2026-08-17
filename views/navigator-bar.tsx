import { Button, ButtonGroup, ControlGroup, InputGroup, Intent } from '@blueprintjs/core'
import React, { useCallback, useEffect, useState } from 'react'
import FontAwesome from 'react-fontawesome'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useWebviewRef } from './webview-context'

const wvStatus = {
  Loading: 0,
  Loaded: 1,
  Failed: 2,
} as const

type WvStatus = (typeof wvStatus)[keyof typeof wvStatus]

const HOMEPAGE = 'http://www.dmm.com/netgame'

const Navigator = styled.div`
  display: flex;
  flex-grow: 1;
  align-items: center;
`

const AddressBar = styled.div`
  flex: 1;
  margin-left: 15px;
  margin-right: 15px;
  display: flex;

  svg {
    z-index: 16;
    top: 30%;
    left: 10px;
    position: absolute;
  }
`

const Address = styled(ControlGroup)`
  flex: 1;
`

const NavigatorBar: React.FC = () => {
  const { t } = useTranslation('poi-plugin-new-window')
  const webview = useWebviewRef()

  const [status, setStatus] = useState<WvStatus>(wvStatus.Loaded)
  const [url, setUrl] = useState(HOMEPAGE)
  const [canGoBack, setCanGoBack] = useState(false)
  const [canGoForward, setCanGoForward] = useState(false)

  const syncHistory = useCallback(() => {
    try {
      setCanGoBack(Boolean(webview.current?.canGoBack()))
      setCanGoForward(Boolean(webview.current?.canGoForward()))
    } catch {
      // the webview is not attached yet
    }
  }, [webview])

  useEffect(() => {
    const wv = webview.current
    if (!wv) {
      return
    }

    const onStartLoading = () => setStatus(wvStatus.Loading)
    const onStopLoading = () => {
      setStatus(wvStatus.Loaded)
      setUrl((prev) => wv.getURL() || prev)
      syncHistory()
    }
    const onFailLoad = () => setStatus(wvStatus.Failed)
    const onWillNavigate = (e: { url: string }) => setUrl(e.url)

    wv.addEventListener('did-start-loading', onStartLoading)
    wv.addEventListener('did-stop-loading', onStopLoading)
    wv.addEventListener('did-fail-load', onFailLoad)
    wv.addEventListener('will-navigate', onWillNavigate)

    return () => {
      wv.removeEventListener('did-start-loading', onStartLoading)
      wv.removeEventListener('did-stop-loading', onStopLoading)
      wv.removeEventListener('did-fail-load', onFailLoad)
      wv.removeEventListener('will-navigate', onWillNavigate)
    }
  }, [webview, syncHistory])

  const navigate = useCallback(
    (target: string) => {
      if (!target) {
        return
      }
      const resolved =
        target.startsWith('http://') || target.startsWith('https://') ? target : `http://${target}`
      webview.current?.loadURL(resolved)
      setUrl(resolved)
    },
    [webview],
  )

  const onChangeUrl = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value)
  }, [])

  const onKeydown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        navigate(url)
      }
    },
    [navigate, url],
  )

  const onClickNavigate = useCallback(() => navigate(url), [navigate, url])
  const onClickStop = useCallback(() => webview.current?.stop(), [webview])
  const onClickRefresh = useCallback(() => webview.current?.reload(), [webview])

  const onClickGoBack = useCallback(() => {
    webview.current?.goBack()
    syncHistory()
  }, [webview, syncHistory])

  const onClickGoForward = useCallback(() => {
    webview.current?.goForward()
    syncHistory()
  }, [webview, syncHistory])

  let statusIcon: React.ReactElement | undefined
  if (status === wvStatus.Loading) {
    statusIcon = (
      <div>
        <FontAwesome name="spinner" spin />
      </div>
    )
  } else if (status === wvStatus.Failed) {
    statusIcon = (
      <div>
        <FontAwesome name="times" />
      </div>
    )
  }

  const isLoading = status === wvStatus.Loading

  return (
    <Navigator>
      <AddressBar>
        <Address fill>
          <InputGroup
            type="text"
            placeholder={t('Input address')}
            className={statusIcon ? 'navigator-status' : 'navigator-no-status'}
            value={url}
            onChange={onChangeUrl}
            onKeyDown={onKeydown}
            leftIcon={statusIcon}
          />
        </Address>
      </AddressBar>
      <div>
        <ButtonGroup minimal>
          <Button disabled={!canGoBack} onClick={onClickGoBack}>
            <FontAwesome name="chevron-left" />
          </Button>
          <Button disabled={!canGoForward} onClick={onClickGoForward}>
            <FontAwesome name="chevron-right" />
          </Button>
          <Button intent={Intent.PRIMARY} onClick={isLoading ? onClickStop : onClickNavigate}>
            <FontAwesome name={isLoading ? 'times' : 'arrow-right'} />
          </Button>
          <Button intent={Intent.WARNING} onClick={onClickRefresh}>
            <FontAwesome name="refresh" />
          </Button>
        </ButtonGroup>
      </div>
    </Navigator>
  )
}

export default NavigatorBar
