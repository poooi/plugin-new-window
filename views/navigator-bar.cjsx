{$, $$, _, React, ReactBootstrap, FontAwesome, ROOT} = window
{Grid, Col, Button, ButtonGroup, Input, Modal, Alert} = ReactBootstrap
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
confirmExit = false
exitPlugin = ->
  confirmExit = true
  window.close()
window.onbeforeunload = (e) ->
  if confirmExit
    return true
  else
    if window.confirm('确认关闭插件？')
      return true
    else
      return false
NavigatorBar = React.createClass
  getInitialState: ->
    # Status
    # -1: Waiting
    # 0: Finish
    # 1: Loading
    navigateStatus: 1
    muted: false
    navigateUrl: 'http://www.dmm.com/netgame'
  handleTitleSet: (e) ->
    webview.insertCSS """
      * {
        font-family: "Ubuntu", "Helvetica Neue", "Helvetica", "Arial", "Heiti SC", "WenQuanYi Micro Hei", "Microsoft YaHei", sans-serif !important;
      }
    """
  handleDomReady: (e) ->
    remote.getCurrentWindow().setTitle webview.getTitle()
  handleResize: (e) ->
    $('inner-page')?.style?.height = "#{window.innerHeight - 50}px"
    $('inner-page webview')?.style?.height = $('inner-page webview /deep/ object[is=browserplugin]')?.style?.height = "#{window.innerHeight - 50}px"
  handleSetUrl: (e) ->
    @setState
      navigateUrl: e.target.value
      navigateStatus: -1
  handleStartLoading: (e) ->
    @setState
      navigateStatus: 1
  handleStopLoading: ->
    @setState
      navigateStatus: 0
      navigateUrl: webview.getUrl()
  handleFailLoad: ->
    @setState
      navigateStatus: -2
  handleNavigate: ->
    if @state.navigateUrl.substr(0,7).toLowerCase()!='http://'
      if @state.navigateUrl.substr(0,8).toLowerCase()!='https://'
        @state.navigateUrl = "http://" + @state.navigateUrl
    webview.src = @state.navigateUrl
  handleSetMuted: ->
    muted = !@state.muted
    if webview.setAudioMuted?
      webview.setAudioMuted muted
    @setState {muted}
  handleDebug: ->
    if webview.isDevToolsOpened?
      webview.closeDevTools()
    else
      webview.openDevTools()
  enterPress: (e) ->
    if e.keyCode == 13
      e.preventDefault()
  handleRefresh: ->
    webview.reload()
  componentDidMount: ->
    window.addEventListener 'resize', @handleResize
    webview.addEventListener 'page-title-set', @handleTitleSet
    webview.addEventListener 'dom-ready', @handleDomReady
    webview.addEventListener 'did-start-loading', @handleStartLoading
    webview.addEventListener 'did-stop-loading', @handleStopLoading
    webview.addEventListener 'did-fail-load', @handleFailLoad
  componentWillUmount: ->
    window.removeEventListener 'resize', @handleResize
    webview.removeEventListener 'page-title-set', @handleTitleSet
    webview.removeEventListener 'dom-ready', @handleDomReady
    webview.removeEventListener 'did-start-loading', @handleStartLoading
    webview.removeEventListener 'did-stop-loading', @handleStopLoading
    webview.removeEventListener 'did-fail-load', @handleFailLoad
  render: ->
    <Grid>
      <Col xs={8}>
        <Input type='text' bsSize='small' id='geturl' placeholder='输入网页地址' value={@state.navigateUrl} onChange={@handleSetUrl} onKeyDown = {@enterPress} />
      </Col>
      <Col xs={4}>
        <ButtonGroup>
          <Button bsSize='small' bsStyle='primary' onClick={@handleNavigate}>{getIcon(@state.navigateStatus)}</Button>
          <Button bsSize='small' bsStyle='warning' onClick={@handleRefresh}><FontAwesome name='refresh' /></Button>
        </ButtonGroup>
        <span>　</span>
        <ButtonGroup>
          <Button bsSize='small' onClick={@handleSetMuted}><FontAwesome name={if @state.muted then 'volume-off' else 'volume-up'} /></Button>
        </ButtonGroup>
        <span>　</span>
        <ButtonGroup>
          <Button bsSize='small' onClick={@handleDebug}><FontAwesome name='gears' /></Button>
        </ButtonGroup>
      </Col>
    </Grid>
module.exports = NavigatorBar
