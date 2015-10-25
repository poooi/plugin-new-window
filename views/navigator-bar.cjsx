i18n = require 'i18n'
path = require 'path-extra'
fs = require 'fs-extra'
{$, $$, _, React, ReactBootstrap, FontAwesome, ROOT} = window
{Grid, Col, Button, ButtonGroup, Input, Modal, Alert, OverlayTrigger, DropdownButton, MenuItem, Popover, Row, Tooltip, Overlay} = ReactBootstrap
{__} = i18n
remote = require 'remote'
webview = $('inner-page webview')
innerpage = $('inner-page')

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
    show: false
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
    $('inner-page webview')?.style?.height = $('inner-page webview')?.shadowRoot?.querySelector('object[is=browserplugin]')?.style?.height = "#{window.innerHeight - 50}px"
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
    @setState
      show: !@state.show
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
        @state.navigateUrl = "http://#{@state.navigateUrl}"
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
  handlePopShow: ->
    @setState
      show: !@state.show
  handleUnlockWebview: ->
    webview.executeJavaScript "document.documentElement.style.overflow = 'auto'"
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
    webview.openDevTools
      detach: true
  handleDevTools: ->
    remote.getCurrentWindow().openDevTools
      detach: true
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
        <ButtonGroup className="btn-grp">
          <Button bsSize='small' bsStyle='info' disabled=!webview.canGoBack() onClick={@handleBack}><FontAwesome name='chevron-left' /></Button>
          <Button bsSize='small' bsStyle='info' disabled=!webview.canGoForward() onClick={@handleForward}><FontAwesome name='chevron-right' /></Button>
          <Button bsSize='small' bsStyle='primary' onClick={@handleNavigate}>{getIcon(@state.navigateStatus)}</Button>
          <Button bsSize='small' bsStyle='warning' onClick={@handleRefresh}><FontAwesome name='refresh' /></Button>
        </ButtonGroup>
        <ButtonGroup className="btn-grp">
          <OverlayTrigger placement='top' overlay={<Tooltip id='btn-mut'>{if @state.muted then __('Volume off') else __('Volume on')}</Tooltip>}>
            <Button bsSize='small' onClick={@handleSetMuted}><FontAwesome name={if @state.muted then 'volume-off' else 'volume-up'} /></Button>
          </OverlayTrigger>
          <OverlayTrigger placement='top' overlay={<Tooltip id='btn-adj'>{__("Auto adjust")}</Tooltip>}>
            <Button bsSize='small' onClick={@handleJustify} onContextMenu={@handleUnlockWebview}><FontAwesome name='arrows-alt' /></Button>
          </OverlayTrigger>
          <Overlay show={@state.show} onHide={@handlePopShow} rootClose={true} target={() => React.findDOMNode(@refs.target)} placement='top'>
            <Popover id='pop-res' title={__("Change resolution")}>
              <Input wrapperClassName='wrapper'>
                <Row>
                  <Col xs={4}>
                    <Input type='text' bsSize='small' value={@state.width} onChange={@handleSetWidth}/>
                  </Col>
                  <Col xs={4}>
                    <Input type='text' bsSize='small' value={@state.height} onChange={@handleSetHeight}/>
                  </Col>
                  <Col xs={1}>
                    <Button bsSize='small' onClick={@handleSetRes.bind this, parseInt(@state.width), parseInt(@state.height)}>
                      <FontAwesome name='check' />
                    </Button>
                  </Col>
                </Row>
                <Row>
                  <div id="resSetting">
                    <Button bsSize='small' className="res-btn" onClick={@handleSetRes.bind this, 800, 480}>800*480</Button>
                    <Button bsSize='small' className="res-btn" onClick={@handleSetRes.bind this, 960, 580}>960*580</Button>
                    <Button bsSize='small' className="res-btn" onClick={@handleSetRes.bind this, 960, 640}>960*640</Button>
                  </div>
                </Row>
              </Input>
            </Popover>
          </Overlay>
          <OverlayTrigger placement='top' overlay={<Tooltip id='btn-res'>{__("Change resolution")}</Tooltip>}>
            <Button id='res-btn' bsStyle='default' bsSize='small' ref='target' style={marginLeft: 0} onClick={@handlePopShow}>
              <FontAwesome name='arrows'/>
            </Button>
          </OverlayTrigger>
        </ButtonGroup>
        <OverlayTrigger placement='top' overlay={<Tooltip id='btn-dtl'>{__("Developer Tools")}</Tooltip>}>
          <Button bsSize='small' className="btn-grp" onContextMenu={@handleDebug} onClick={@handleDevTools}><FontAwesome name='gears' /></Button>
        </OverlayTrigger>
        <OverlayTrigger placement='top' overlay={<Tooltip id='btn-lnk'>{__("Links")}</Tooltip>}>
          <DropdownButton id='btn-bkm' bsSize='small' className="btn-grp" title = {<FontAwesome name='bookmark-o' />} dropup pullRight noCaret>
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
