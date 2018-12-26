import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import glob from 'glob'
import path from 'path'
import fs from 'fs-extra'
import { each, set } from 'lodash'
import { Button, Modal } from 'react-bootstrap'
import { remote } from 'electron'
import I18next from 'i18next'
import { I18nextProvider, translate, reactI18nextModule } from 'react-i18next'
import WebView from 'react-electron-web-view'

import BottomBar from './bottom-bar'

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

$('#font-awesome').setAttribute('href', require.resolve('font-awesome/css/font-awesome.css'))

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

@translate('poi-plugin-new-window')
class WebArea extends Component {
  static propTypes = {
    t: PropTypes.func.isRequired,
  }

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
      remote.getCurrentWindow().reloadArea = 'inner-page webview'
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
        <inner-page>
          <WebView
            src="http://www.dmm.com/netgame"
            plugins
            disablewebsecurity
            preload="./webview-preload.js"
            useragent={this.useragent}
          />
        </inner-page>
        <control-area>
          <form id="nav-area">
            <div className="form-group" id="navigator-bar">
              <BottomBar />
            </div>
          </form>
        </control-area>
        <Modal show={this.state.showModal} onHide={this.closeModal}>
          <Modal.Header closeButton>
            <Modal.Title>{t('Exit')}</Modal.Title>
          </Modal.Header>
          <Modal.Body>{t('Confirm?')}</Modal.Body>
          <Modal.Footer>
            <Button onClick={this.closeModal}>{t('Cancel')}</Button>
            <Button onClick={exitPlugin} bsStyle="warning">
              {t('Exit')}
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    )
  }
}

ReactDOM.render(
  <I18nextProvider i18n={i18n}>
    <WebArea />
  </I18nextProvider>,
  $('app'),
)
