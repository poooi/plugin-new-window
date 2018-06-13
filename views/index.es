import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { Button, Modal } from 'react-bootstrap'
import { remote } from 'electron'
import BottomBar from './bottom-bar'

const __ = window.i18n.__.bind(window.i18n)
const { $ } = window
document.title = __('Built-in browser')


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

class WebArea extends Component {
  state = { showModal: false }
  closeModal = () => this.setState({ showModal: false })
  openModal = () => this.setState({ showModal: true })
  componentDidMount = () => {
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
    return (
      <form id="nav-area">
        <div className="form-group" id='navigator-bar'>
          <h5>   </h5>
          <BottomBar />
        </div>
        <div>
          <Modal show={this.state.showModal} onHide={this.closeModal}>
            <Modal.Header closeButton>
              <Modal.Title>{__("Exit")}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {__("Confirm?")}
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={this.closeModal}>{__("Cancel")}</Button>
              <Button onClick={exitPlugin} bsStyle="warning">{__("Exit")}</Button>
            </Modal.Footer>
          </Modal>
        </div>
      </form>
    )
  }
}

ReactDOM.render(<WebArea />, $('web-area'))
