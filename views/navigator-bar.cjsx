{$, $$, _, React, ReactBootstrap, FontAwesome, ROOT} = window
{Grid, Col, Button, ButtonGroup, Input, Modal, Alert, OverlayTrigger, DropdownButton, MenuItem, Popover, Row} = ReactBootstrap
remote = require 'remote'
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
    width: window.innerWidth
    height: window.innerHeight - 50
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
  handleSetRes: (e) ->
    nowWindow = remote.getCurrentWindow()
    bound = nowWindow.getBounds()
    {x, y} = bound
    borderX = bound.width - window.innerWidth
    borderY = bound.height - window.innerHeight
    newWidth = parseInt(@state.width)
    newHeight = parseInt(@state.height)
    nowWindow.setBounds
      x: x
      y: y
      width: parseInt(newWidth + borderX)
      height: parseInt(newHeight + borderY + 50)
    #$('inner-page')?.style?.height = "#{window.innerHeight - 50}px"
    #$('inner-page webview')?.style?.height = $('inner-page webview /deep/ object[is=browserplugin]')?.style?.height = "#{window.innerHeight - 50}px"
  handleSetUrl: (e) ->
    @setState
      navigateUrl: e.target.value
      navigateStatus: -1
  handleSetWidth: (e) ->
    @setState
      width: e.target.value
  handleSetHeight: (e) ->
    @setState
      height: e.target.value
  handleStartLoading: (e) ->
    @setState
      navigateStatus: 1
      navigateUrl: webview.getUrl()
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
  handleJustify: ->
    webview.executeJavaScript """
      var iframe = document.querySelector('#game_frame').contentWindow.document;
      window.scrollTo(0, 0);
      var x = document.querySelector('#game_frame').getBoundingClientRect().left + iframe.querySelector('embed').getBoundingClientRect().left;
      var y = document.querySelector('#game_frame').getBoundingClientRect().top + iframe.querySelector('embed').getBoundingClientRect().top;
      window.scrollTo(x, y);
      document.documentElement.style.overflow = 'hidden';
    """
  handleDebug: ->
    webview.openDevTools()
  enterPress: (e) ->
    if e.keyCode == 13
      e.preventDefault()
  handleRefresh: ->
    webview.reload()
  onSelectLinkDMM: ->
    webview.src = 'http://www.dmm.com/netgame/'
    #@handleNavigate
  onSelectLinkDMMR18: ->
    webview.src = 'http://www.dmm.com/service/-/exchange/=/url=Sg9VTQFXDFcXAlBVVhlLGBMEWF1ZVwMW'
    #@handleNavigate
  onSelectLinkWiki: ->
    webview.src = 'http://wikiwiki.jp/kancolle/'
    #@handleNavigate
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
      <Col xs={7}>
        <Input type='text' bsSize='small' id='geturl' placeholder='输入网页地址' value={@state.navigateUrl} onChange={@handleSetUrl} onKeyDown = {@enterPress} />
      </Col>
      <Col xs={5}>
        <ButtonGroup>
          <Button bsSize='small' bsStyle='primary' onClick={@handleNavigate}>{getIcon(@state.navigateStatus)}</Button>
          <Button bsSize='small' bsStyle='warning' onClick={@handleRefresh}><FontAwesome name='refresh' /></Button>
        </ButtonGroup>
        <span>　</span>
        <ButtonGroup>
          <Button bsSize='small' onClick={@handleSetMuted}><FontAwesome name={if @state.muted then 'volume-off' else 'volume-up'} /></Button>
          <Button bsSize='small' onClick={@handleJustify}><FontAwesome name='arrows-alt' /></Button>
          <OverlayTrigger trigger='click' rootClose={true} placement='top' overlay={
            <Popover title='分辨率设置'>
              <Input  wrapperClassName='wrapper'>
                <Row>
                  <Col xs={4}>
                    <Input type='text' bsSize='small' value={@state.width} onChange={@handleSetWidth}/>
                  </Col>
                  <Col xs={4}>
                    <Input type='text' bsSize='small' value={@state.height} onChange={@handleSetHeight}/>
                  </Col>
                  <Col xs={1}>
                    <Button bsSize='small' onClick={@handleSetRes}>
                      <FontAwesome name='check' />
                    </Button>
                  </Col>
                </Row>
              </Input>
            </Popover>
            }>
            <Button id='res-btn' bsStyle='default' bsSize='small' html='true' onClick={@props.switchShow}>
              <FontAwesome name='arrows'/>
            </Button>
          </OverlayTrigger>
        </ButtonGroup>
        <span>　</span>
        <ButtonGroup>
          <Button bsSize='small' onClick={@handleDebug}><FontAwesome name='gears' /></Button>
        </ButtonGroup>
        <span>　</span>
        <ButtonGroup>
          <DropdownButton bsSize='small' title = {<FontAwesome name='bookmark-o' />} dropup pullRight noCaret>
            <MenuItem onClick={@onSelectLinkDMM}>DMM netgame</MenuItem>
            <MenuItem onClick={@onSelectLinkDMMR18}>DMM netgame (R18)</MenuItem>
            <MenuItem onClick={@onSelectLinkWiki}>Kancolle Wiki</MenuItem>
          </DropdownButton>
        </ButtonGroup>
      </Col>
    </Grid>
module.exports = NavigatorBar
