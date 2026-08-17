import type { WebviewTag } from 'electron'

import { Button, Classes, Dialog, Intent } from '@blueprintjs/core'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { fas } from '@fortawesome/free-solid-svg-icons'
import '@skagami/react-fontawesome/inject' // eslint-disable-line import/no-unresolved
import path from 'path'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { I18nextProvider, useTranslation } from 'react-i18next'
import styled, { createGlobalStyle } from 'styled-components'
import { pathToFileURL } from 'url'

import remote from '../lib/remote'
import BottomBar from './bottom-bar'
import i18n from './i18n'
import WebviewContext from './webview-context'

library.add(fas, far, fab)

const HOMEPAGE = 'http://www.dmm.com/netgame'

// webview preloads are only accepted as absolute file URLs
const PRELOAD_URL = pathToFileURL(path.join(__dirname, '..', 'webview-preload.js')).href

let confirmExit = false

const exitPlugin = () => {
  confirmExit = true
  window.onbeforeunload = null
  window.close()
}

window.onbeforeunload = () => {
  if (confirmExit) {
    exitPlugin()
    return undefined
  }
  window.dispatchEvent(new Event('close-plugin'))
  return false
}

const GlobalStyle = createGlobalStyle`
  body {
    overflow: hidden;
    zoom: 1 !important;
    margin: 0;
    padding: 0;
  }

  #app {
    display: flex;
    flex-direction: column;
    height: 100vh;
  }
`

const PageArea = styled.div`
  flex: 1;

  > div {
    height: 100%;
  }

  webview {
    height: 100%;
  }
`

const ControlArea = styled.div`
  height: 50px;
`

const WebArea: React.FC = () => {
  const { t } = useTranslation('poi-plugin-new-window')

  const webview = useRef<WebviewTag | null>(null)
  const [showModal, setShowModal] = useState(false)

  const closeModal = useCallback(() => setShowModal(false), [])
  const openModal = useCallback(() => setShowModal(true), [])

  const useragent = useMemo(
    () =>
      remote
        .getCurrentWebContents()
        .getUserAgent()
        .replace(/Electron[^ ]* /, '')
        .replace(/poi[^ ]* /, ''),
    [],
  )

  useEffect(() => {
    document.title = t('Built-in browser')
  }, [t])

  useEffect(() => {
    const currentWindow = remote.getCurrentWindow() as PoiBrowserWindow
    const handleDomReady = () => {
      window.dispatchEvent(new Event('resize'))
      currentWindow.reloadArea = 'webview'
    }

    currentWindow.webContents.on('dom-ready', handleDomReady)
    window.addEventListener('close-plugin', openModal)

    return () => {
      currentWindow.webContents.removeListener('dom-ready', handleDomReady)
      window.removeEventListener('close-plugin', openModal)
    }
  }, [openModal])

  return (
    <>
      <GlobalStyle />
      <PageArea>
        <webview
          src={HOMEPAGE}
          ref={webview}
          plugins
          disablewebsecurity
          preload={PRELOAD_URL}
          useragent={useragent}
        />
      </PageArea>
      <WebviewContext.Provider value={webview}>
        <ControlArea>
          <BottomBar />
          <Dialog isOpen={showModal} onClose={closeModal}>
            <div className={Classes.DIALOG_HEADER}>{t('Exit')}</div>
            <div className={Classes.DIALOG_BODY}>{t('Confirm?')}</div>
            <div className={Classes.DIALOG_FOOTER}>
              <div className={Classes.DIALOG_FOOTER_ACTIONS}>
                <Button onClick={closeModal}>{t('Cancel')}</Button>
                <Button onClick={exitPlugin} intent={Intent.WARNING}>
                  {t('Exit')}
                </Button>
              </div>
            </div>
          </Dialog>
        </ControlArea>
      </WebviewContext.Provider>
    </>
  )
}

const container = document.querySelector('#app')

if (container) {
  createRoot(container).render(
    <I18nextProvider i18n={i18n}>
      <WebArea />
    </I18nextProvider>,
  )
}
