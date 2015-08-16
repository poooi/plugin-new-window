i18n = require '../node-modules/i18n'
path = require 'path-extra'
fs = require 'fs-extra'
{$, $$, _, React, ReactBootstrap, FontAwesome, ROOT} = window
{Grid, Col, Button, ButtonGroup, Input, Modal, Alert, OverlayTrigger, DropdownButton, MenuItem, Popover, Row, Tooltip} = ReactBootstrap
{__} = i18n
remote = require 'remote'
webview = $('inner-page webview')
innerpage = $('inner-page')

i18n.configure({
    locales:['en-US', 'ja-JP', 'zh-CN'],
    defaultLocale: 'zh-CN',
    directory: path.join(__dirname, '..', "i18n"),
    updateFiles: false,
    indent: "\t",
    extension: '.json'
})
i18n.setLocale(window.language)

pp = path.join(__dirname, "..", "bookmark.json")
bookmarks = fs.readJsonSync pp

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
    if window.confirm(__ "Confirm?")
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

  handleSetRes: (width, height) ->
    nowWindow = remote.getCurrentWindow()
    bound = nowWindow.getBounds()
    {x, y} = bound
    borderX = bound.width - window.innerWidth
    borderY = bound.height - window.innerHeight
    newWidth = width
    newHeight = height
    nowWindow.setBounds
      x: x
      y: y
      width: parseInt(newWidth + borderX)
      height: parseInt(newHeight + borderY + 50)
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
  handleBack: ->
    if webview.canGoBack()
      webview.goBack()
  handleForward: ->
    if webview.canGoForward()
      webview.goForward()
  handleSetMuted: ->
    muted = !@state.muted
    if webview.setAudioMuted?
      webview.setAudioMuted muted
    @setState {muted}
  handleJustify: ->
    webview.executeJavaScript """
      var iframe = document.querySelector('#game_frame').contentWindow.document;
      window.scrollTo(0, 0);
      document.documentElement.style.overflow = 'hidden';
      var x1 = 0;
      var y1 = 0;
      if (iframe.querySelector('embed')!=null) {
        x1 = iframe.querySelector('embed').getBoundingClientRect().left;
        y1 = iframe.querySelector('embed').getBoundingClientRect().top;
      } else if (iframe.querySelector('#aigis')!=null) {
        var iframe1 = iframe.querySelector('#aigis').contentWindow.document;
        x1 = iframe1.querySelector('canvas').getBoundingClientRect().left;
        y1 = iframe1.querySelector('canvas').getBoundingClientRect().top;
      }
      var x = document.querySelector('#game_frame').getBoundingClientRect().left + x1;
      var y = document.querySelector('#game_frame').getBoundingClientRect().top + y1;
      window.scrollTo(x, y);
    """
  handleDebug: ->
    webview.openDevTools()
  enterPress: (e) ->
    if e.keyCode == 13
      e.preventDefault()
  handleRefresh: ->
    webview.reload()
  onSelectLink: (lnk) ->
    webview.src = lnk
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
      <Col xs={5}>
        <Input type='text' bsSize='small' id='geturl' placeholder='输入网页地址' value={@state.navigateUrl} onChange={@handleSetUrl} onKeyDown = {@enterPress} />
      </Col>
      <Col xs={7}>
        <ButtonGroup>
          <Button bsSize='small' bsStyle='info' disabled=!webview.canGoBack() onClick={@handleBack}><FontAwesome name='chevron-left' /></Button>
          <Button bsSize='small' bsStyle='info' disabled=!webview.canGoForward() onClick={@handleForward}><FontAwesome name='chevron-right' /></Button>
          <Button bsSize='small' bsStyle='primary' onClick={@handleNavigate}>{getIcon(@state.navigateStatus)}</Button>
          <Button bsSize='small' bsStyle='warning' onClick={@handleRefresh}><FontAwesome name='refresh' /></Button>
        </ButtonGroup>
        <span>　</span>
        <ButtonGroup>
          <OverlayTrigger placement='top' overlay={<Tooltip>{if @state.muted then __('Volume off') else __('Volume on')}</Tooltip>}>
            <Button bsSize='small' onClick={@handleSetMuted}><FontAwesome name={if @state.muted then 'volume-off' else 'volume-up'} /></Button>
          </OverlayTrigger>
          <OverlayTrigger placement='top' overlay={<Tooltip>{__("Auto adjust")}</Tooltip>}>
            <Button bsSize='small' onClick={@handleJustify}><FontAwesome name='arrows-alt' /></Button>
          </OverlayTrigger>
          <OverlayTrigger trigger='click' rootClose={true} placement='top' overlay={
            <Popover title={__("Change resolution")}>
              <Input  wrapperClassName='wrapper'>
                <Row>
                  <Col xs={4}>
                    <Input type='text' bsSize='small' value={@state.width} onChange={@handleSetWidth}/>
                  </Col>
                  <Col xs={4}>
                    <Input type='text' bsSize='small' value={@state.height} onChange={@handleSetHeight}/>
                  </Col>
                  <Col xs={1}>
                    <Button bsSize='small' onClick={@handleSetRes.bind this, @state.width, @state.height}>
                      <FontAwesome name='check' />
                    </Button>
                  </Col>
                </Row>
                <Row>
                  <div style={display: "flex", flexDirection: "row", marginTop: '10px'}>
                    <Button bsSize='small' style={flex: 1,marginLeft: '5px',marginRight: '5px'} onClick={@handleSetRes.bind this, 800, 480}>800*480</Button>
                    <Button bsSize='small' style={flex: 1,marginLeft: '5px',marginRight: '5px'} onClick={@handleSetRes.bind this, 960, 580}>960*580</Button>
                    <Button bsSize='small' style={flex: 1,marginLeft: '5px',marginRight: '5px'} onClick={@handleSetRes.bind this, 960, 640}>960*640</Button>
                  </div>
                </Row>
              </Input>
            </Popover>
            }>
            <OverlayTrigger placement='top' overlay={<Tooltip>{__("Change resolution")}</Tooltip>}>
              <Button id='res-btn' bsStyle='default' bsSize='small' html='true' onClick={@props.switchShow}>
                <FontAwesome name='arrows'/>
              </Button>
            </OverlayTrigger>
          </OverlayTrigger>
        </ButtonGroup>
        <span>　</span>
        <OverlayTrigger placement='top' overlay={<Tooltip>{__("Developer Tools")}</Tooltip>}>
          <Button bsSize='small' onClick={@handleDebug}><FontAwesome name='gears' /></Button>
        </OverlayTrigger>
        <span>　</span>
        <OverlayTrigger placement='top' overlay={<Tooltip>{__("Links")}</Tooltip>}>
          <DropdownButton bsSize='small' title = {<FontAwesome name='bookmark-o' />} dropup pullRight noCaret>
          {
            for bookmark, j in bookmarks
              [
                <MenuItem onClick={@onSelectLink.bind this, bookmark.link}>{bookmark.name}</MenuItem>
              ]
          }
          </DropdownButton>
        </OverlayTrigger>
      </Col>
    </Grid>
module.exports = NavigatorBar
