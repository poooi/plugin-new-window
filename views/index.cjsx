{$, $$, _, React, ReactDOM, ReactBootstrap, FontAwesome, ROOT} = window
{Button, Modal} = ReactBootstrap
Divider = require './divider'
path = require 'path-extra'
fs = require "fs-extra"

window.i18n = new (require 'i18n-2')
  locales:['en-US', 'ja-JP', 'zh-CN', 'zh-TW'],
  defaultLocale: 'zh-CN',
  directory: path.join(__dirname, '..', 'i18n'),
  updateFiles: false,
  indent: "\t",
  extension: '.json'
  devMode: false
i18n.setLocale(window.language)
__ = i18n.__.bind(i18n)

NavigatorBar = require './navigator-bar'

$('#font-awesome')?.setAttribute 'href', require.resolve('font-awesome/css/font-awesome.css')

confirmExit = false
exitPlugin = ->
  confirmExit = true
  window.close()
window.onbeforeunload = (e) ->
  if confirmExit
    return true
  else
    window.dispatchEvent new Event('close-plugin')
    return false

WebArea = React.createClass
  getInitialState: ->
    showModal: false
  closeModal: ->
    @setState
      showModal: false
  openModal: ->
    @setState
      showModal: true
  componentDidMount: ->
    window.addEventListener 'close-plugin', @openModal
  componentWillUnmount: ->
    window.removeEventListener 'close-plugin', @openModal
  render: ->
    $('inner-page')?.style?.height = "#{window.innerHeight - 50}px"
    $('inner-page webview')?.style?.height = $('inner-page webview')?.shadowRoot?.querySelector('object[is=browserplugin]')?.style?.height = "#{window.innerHeight - 50}px"
    <form id="nav-area">
      <div className="form-group" id='navigator-bar'>
        <h5>   </h5>
        <NavigatorBar />
      </div>
      <div>
        <Modal show={@state.showModal} onHide={@closeModal}>
          <Modal.Header closeButton>
            <Modal.Title>{__ "Exit"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {__ "Confirm?"}
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={@closeModal}>{__ "Cancel"}</Button>
            <Button onClick={exitPlugin} bsStyle="warning">{__ "Exit"}</Button>
          </Modal.Footer>
        </Modal>
      </div>
    </form>
ReactDOM.render <WebArea />, $('web-area')
