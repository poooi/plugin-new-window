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
import BottomBar from './bottom-bar'

const { $ } = window
window.language = config.get('poi.language', navigator.language)

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

i18n.use(reactI18nextModule)
  .init({
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

  state = { showModal: false }

  closeModal = () => this.setState({ showModal: false })
  openModal = () => this.setState({ showModal: true })
  componentDidMount = () => {
    document.title = this.props.t('Built-in browser')
    remote.getCurrentWindow().webContents.on('dom-ready', () => {
      window.dispatchEvent(new Event('resize'))
      remote.getCurrentWindow().reloadArea = 'inner-page webview'
      const useragent = process.platform == 'darwin' ? 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36'
        : 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36'
      $('webview').setUserAgent(useragent)
    })
    window.addEventListener('close-plugin', this.openModal)
  }
  componentWillUnmount = () => {
    window.removeEventListener('close-plugin', this.openModal)
  }
  render() {
    const { t } = this.props
    return (
      <form id="nav-area">
        <div className="form-group" id='navigator-bar'>
          <h5>   </h5>
          <BottomBar />
        </div>
        <div>
          <Modal show={this.state.showModal} onHide={this.closeModal}>
            <Modal.Header closeButton>
              <Modal.Title>{t("Exit")}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {t("Confirm?")}
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={this.closeModal}>{t("Cancel")}</Button>
              <Button onClick={exitPlugin} bsStyle="warning">{t("Exit")}</Button>
            </Modal.Footer>
          </Modal>
        </div>
      </form>
    )
  }
}

ReactDOM.render(<I18nextProvider i18n={i18n}><WebArea /></I18nextProvider>, $('web-area'))
