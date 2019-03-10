import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import glob from 'glob'
import path from 'path'
import fs from 'fs-extra'
import { each, set } from 'lodash'
import { Button, Dialog, Classes, Intent } from '@blueprintjs/core'
import { remote } from 'electron'
import I18next from 'i18next'
import { I18nextProvider, translate, reactI18nextModule } from 'react-i18next'
import WebView from 'react-electron-web-view'
import styled, { createGlobalStyle } from 'styled-components'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'
import '@skagami/react-fontawesome/inject' // eslint-disable-line import/no-unresolved

import WebviewContext from './webview-context'
import BottomBar from './bottom-bar'

library.add(fas, far, fab)

const { $ } = window
window.language = config.get('poi.misc.language', navigator.language)

const i18n = I18next.createInstance()

const i18nFiles = glob.sync(path.resolve(__dirname, '../i18n/*.json'))

const pluginResources = {}
each(i18nFiles, f => {
  try {
    const data = fs.readJSONSync(f)
    const lng = path.basename(f, path.extname(f))
    set(pluginResources, [lng, 'poi-plugin-new-window'], data)
  } catch (e) {
    console.error(e)
  }
})

window.i18next = i18n

i18n.use(reactI18nextModule).init({
  lng: window.language,
  fallbackLng: false,
  resources: pluginResources,
  ns: ['poi-plugin-new-window'],
  defaultNS: 'poi-plugin-new-window',
  interpolation: {
    escapeValue: false,
  },
  returnObjects: true, // allow returning objects
  react: {
    wait: false,
    nsMode: 'fallback',
  },
})

window.i18n = i18n

let confirmExit = false
let exitPlugin = () => {
  confirmExit = true
  window.onbeforeunload = null
  window.close()
}
window.onbeforeunload = () => {
  if (confirmExit) {
    exitPlugin()
  } else {
    window.dispatchEvent(new Event('close-plugin'))
    return false
  }
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

@translate('poi-plugin-new-window')
class WebArea extends Component {
  static propTypes = {
    t: PropTypes.func.isRequired,
  }

  webview = React.createRef()

  useragent = remote
    .getCurrentWebContents()
    .getUserAgent()
    .replace(/Electron[^ ]* /, '')
    .replace(/poi[^ ]* /, '')

  state = { showModal: false }

  closeModal = () => this.setState({ showModal: false })

  openModal = () => this.setState({ showModal: true })

  componentDidMount = () => {
    document.title = this.props.t('Built-in browser')
    remote.getCurrentWindow().webContents.on('dom-ready', () => {
      window.dispatchEvent(new Event('resize'))
      remote.getCurrentWindow().reloadArea = 'webview'
    })
    window.addEventListener('close-plugin', this.openModal)
  }

  componentWillUnmount = () => {
    window.removeEventListener('close-plugin', this.openModal)
  }

  render() {
    const { t } = this.props
    return (
      <>
        <GlobalStyle />
        <PageArea>
          <WebView
            src="http://www.dmm.com/netgame"
            ref={this.webview}
            plugins
            disablewebsecurity
            preload="./webview-preload.js"
            useragent={this.useragent}
          />
        </PageArea>
        <WebviewContext.Provider value={this.webview}>
          <ControlArea>
            <BottomBar />
            <Dialog isOpen={this.state.showModal} onClose={this.closeModal}>
              <div className={Classes.DIALOG_HEADER}>{t('Exit')}</div>
              <div className={Classes.DIALOG_BODY}>{t('Confirm?')}</div>
              <div className={Classes.DIALOG_FOOTER}>
                <div className={Classes.DIALOG_FOOTER_ACTIONS}>
                  <Button onClick={this.closeModal}>{t('Cancel')}</Button>
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
}

ReactDOM.render(
  <I18nextProvider i18n={i18n}>
    <WebArea />
  </I18nextProvider>,
  $('#app'),
)
