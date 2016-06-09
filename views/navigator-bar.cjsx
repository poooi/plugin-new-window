path = require 'path-extra'
fs = require 'fs-extra'
{$, $$, _, React, ReactDOM, ReactBootstrap, FontAwesome, ROOT, APPDATA_PATH} = window
{Grid, Col, Button, ButtonGroup, Input, Modal, Alert, OverlayTrigger, DropdownButton, MenuItem, Popover, Row, Tooltip, Overlay} = ReactBootstrap
__ = i18n.__.bind(i18n)
remote = require('electron').remote
webview = $('inner-page webview')
innerpage = $('inner-page')

getIcon = (status) ->
  switch status
    when -2
      <FontAwesome name='times' />
    when -1
      <FontAwesome name='arrow-right' />
    when 0
      <FontAwesome name='check' />
    when 1
      <FontAwesome name='spinner' spin />
NavigatorBar = React.createClass
  getInitialState: ->
    # Status
    # -1: Waiting
    # 0: Finish
    # 1: Loading
    navigateStatus: 1
    navigateUrl: 'http://www.dmm.com/netgame'
  handleTitleSet: (e) ->
    webview.insertCSS """
      * {
        font-family: "Ubuntu", "Helvetica Neue", "Helvetica", "Arial", "Heiti SC", "WenQuanYi Micro Hei", "Microsoft YaHei", sans-serif !important;
      }
    """
  handleDomReady: (e) ->
    remote.getCurrentWindow().setTitle webview.getTitle()
  handleSetUrl: (e) ->
    @setState
      navigateUrl: e.target.value
      navigateStatus: -1
  handleStartLoading: (e) ->
    @setState
      navigateStatus: 1
      navigateUrl: webview.getURL()
  handleStopLoading: ->
    @setState
      navigateStatus: 0
      navigateUrl: webview.getURL()
  handleFailLoad: ->
    @setState
      navigateStatus: -2
  handleNavigate: ->
    if @state.navigateUrl.substr(0,7).toLowerCase()!='http://'
      if @state.navigateUrl.substr(0,8).toLowerCase()!='https://'
        @state.navigateUrl = "http://#{@state.navigateUrl}"
    webview.loadURL @state.navigateUrl
  handleBack: ->
    if webview.canGoBack?
      if webview.canGoBack()
        webview.goBack()
  handleForward: ->
    if webview.canGoForward?
      if webview.canGoForward()
        webview.goForward()
  enterPress: (e) ->
    if e.keyCode == 13
      e.preventDefault()
  handleRefresh: ->
    if webview.reload?
      webview.reload()
  handleGoBackStatus: ->
    try
      return !webview.canGoBack()
    catch error
      return true
  handleGoForwardStatus: ->
    try
      return !webview.canGoForward()
    catch error
      return true
  componentDidMount: ->
    webview.addEventListener 'page-title-set', @handleTitleSet
    webview.addEventListener 'dom-ready', @handleDomReady
    webview.addEventListener 'did-start-loading', @handleStartLoading
    webview.addEventListener 'did-stop-loading', @handleStopLoading
    webview.addEventListener 'did-fail-load', @handleFailLoad
  componentWillUmount: ->
    webview.removeEventListener 'page-title-set', @handleTitleSet
    webview.removeEventListener 'dom-ready', @handleDomReady
    webview.removeEventListener 'did-start-loading', @handleStartLoading
    webview.removeEventListener 'did-stop-loading', @handleStopLoading
    webview.removeEventListener 'did-fail-load', @handleFailLoad
  render: ->
    <Row>
      <Col xs={8}>
        <Input type='text' bsSize='small' id='geturl' placeholder='输入网页地址' value={@state.navigateUrl} onChange={@handleSetUrl} onKeyDown = {@enterPress} />
      </Col>
      <Col xs={4}>
        <ButtonGroup className="btn-grp">
          <Button bsSize='small' bsStyle='info' disabled={@handleGoBackStatus()} onClick={@handleBack}><FontAwesome name='chevron-left' /></Button>
          <Button bsSize='small' bsStyle='info' disabled={@handleGoForwardStatus()} onClick={@handleForward}><FontAwesome name='chevron-right' /></Button>
          <Button bsSize='small' bsStyle='primary' onClick={@handleNavigate}>{getIcon(@state.navigateStatus)}</Button>
          <Button bsSize='small' bsStyle='warning' onClick={@handleRefresh}><FontAwesome name='refresh' /></Button>
        </ButtonGroup>
      </Col>
    </Row>
module.exports = NavigatorBar
