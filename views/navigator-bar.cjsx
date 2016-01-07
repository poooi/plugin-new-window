path = require 'path-extra'
fs = require 'fs-extra'
{$, $$, _, React, ReactDOM, ReactBootstrap, FontAwesome, ROOT, APPDATA_PATH} = window
{Grid, Col, Button, ButtonGroup, Input, Modal, Alert, OverlayTrigger, DropdownButton, MenuItem, Popover, Row, Tooltip, Overlay} = ReactBootstrap
__ = i18n.__.bind(i18n)
remote = require 'remote'
webview = $('inner-page webview')
innerpage = $('inner-page')

defaultBookmark = path.join(__dirname, "..", "bookmark.json")
fs.ensureFileSync defaultBookmark
defaultBookmarks = fs.readJsonSync defaultBookmark

customBookmarks = []
try
  fs.ensureDirSync path.join(APPDATA_PATH, 'new-window')
  customBookmark = path.join(APPDATA_PATH, 'new-window', 'bookmark.json')
  fs.ensureFileSync customBookmark
  customBookmarks = fs.readJsonSync customBookmark
catch e
  console.log "Read bookmark error!#{e}"

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
    bmname: ''
    bmadd: ''
    todel: 0
    resShow: false
    addShow: false
    delShow: false
    bookmarks: customBookmarks
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
      resShow: !@state.resShow
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
  handleSetBMName: (e) ->
    @setState
      bmname: e.target.value
  handleSetBMAdd: (e) ->
    @setState
      bmadd: e.target.value
  handleSelectDel: (del, e) ->
    e.stopPropagation()
    @setState
      todel: del
      delShow: true
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
    webview.src = @state.navigateUrl
  handleBack: ->
    if webview.canGoBack?
      if webview.canGoBack()
        webview.goBack()
  handleForward: ->
    if webview.canGoForward?
      if webview.canGoForward()
        webview.goForward()
  handleSetMuted: ->
    muted = !@state.muted
    if webview.setAudioMuted?
      webview.setAudioMuted muted
    @setState {muted}
  handleResPopShow: ->
    @setState
      resShow: !@state.resShow
  handleAddPopShow: ->
    @setState
      addShow: !@state.addShow
  handleDelPopShow: ->
    @setState
      delShow: !@state.delShow
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
    if webview.reload?
      webview.reload()
  onSelectLink: (lnk) ->
    webview.src = lnk
  addBookmark: (e) ->
    add = @state.bmadd
    if add.substr(0,7).toLowerCase()!='http://'
      if add.substr(0,8).toLowerCase()!='https://'
        add = "http://#{add}"
    bookmark =
      name: @state.bmname
      link: add
    bookmarks = @state.bookmarks
    bookmarks.push bookmark
    fs.writeJsonSync customBookmark, bookmarks
    @setState
      bookmarks: bookmarks
      addShow: false
  delBookmark: (e) ->
    bookmarks = @state.bookmarks
    bookmarks.splice @state.todel, 1
    fs.writeJsonSync customBookmark, bookmarks
    @setState
      bookmarks: bookmarks
      delShow: false
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
          <Overlay show={@state.resShow} onHide={@handleResPopShow} rootClose={true} target={() => ReactDOM.findDOMNode(@refs.resPop)} placement='top'>
            <Popover id='pop-res' title={__("Change resolution")}>
              <Input wrapperClassName='wrapper'>
                <Row>
                  <Col xs={4}>
                    <Input type='text' bsSize='small' value={@state.width} onChange={@handleSetWidth} />
                  </Col>
                  <Col xs={4}>
                    <Input type='text' bsSize='small' value={@state.height} onChange={@handleSetHeight} />
                  </Col>
                  <Col xs={1}>
                    <Button bsSize='small' onClick={@handleSetRes.bind @, parseInt(@state.width), parseInt(@state.height)}>
                      <FontAwesome name='check' />
                    </Button>
                  </Col>
                </Row>
                <Row>
                  <div id="resSetting">
                    <Button bsSize='small' className="res-btn" onClick={@handleSetRes.bind @, 800, 480}>800*480</Button>
                    <Button bsSize='small' className="res-btn" onClick={@handleSetRes.bind @, 960, 580}>960*580</Button>
                    <Button bsSize='small' className="res-btn" onClick={@handleSetRes.bind @, 960, 640}>960*640</Button>
                  </div>
                </Row>
              </Input>
            </Popover>
          </Overlay>
          <OverlayTrigger placement='top' overlay={<Tooltip id='btn-res'>{__("Change resolution")}</Tooltip>}>
            <Button id='res-btn' bsStyle='default' bsSize='small' ref='resPop' style={marginLeft: 0} onClick={@handleResPopShow}>
              <FontAwesome name='arrows'/>
            </Button>
          </OverlayTrigger>
        </ButtonGroup>
        <OverlayTrigger placement='top' overlay={<Tooltip id='btn-dtl'>{__("Developer Tools")}</Tooltip>}>
          <Button bsSize='small' className="btn-grp" onContextMenu={@handleDebug} onClick={@handleDevTools}><FontAwesome name='gears' /></Button>
        </OverlayTrigger>
        <OverlayTrigger placement='top' overlay={<Tooltip id='btn-lnk'>{__("Links")}</Tooltip>}>
          <DropdownButton id='btn-bkm' bsSize='small' className="btn-grp" ref='addPop' title = {<FontAwesome name='bookmark-o' />} dropup pullRight noCaret>
          {
            for bookmark, j in defaultBookmarks
              [
                <MenuItem key={1000 + j} eventKey={1000 + j} onSelect={@onSelectLink.bind @, bookmark.link}>{bookmark.name}</MenuItem>
              ]
          }
          {
            for bookmark, j in @state.bookmarks
              [
                <MenuItem key={j} eventKey={j} onSelect={@onSelectLink.bind @, bookmark.link}>
                  {bookmark.name}
                  <Button className='del-btn' bsStyle='danger' bsSize='xsmall' onClick={@handleSelectDel.bind @, j}>
                    <FontAwesome name='times'/>
                  </Button>
                </MenuItem>
              ]
          }
            <MenuItem divider />
            <MenuItem key={2000} eventKey={2000} onSelect={@handleAddPopShow}>{__ 'Add bookmark'}</MenuItem>
          </DropdownButton>
        </OverlayTrigger>
        <Overlay show={@state.addShow} onHide={@handleAddPopShow} rootClose={true} target={() => ReactDOM.findDOMNode(@refs.addPop)} placement='top'>
          <Popover style={width: 400} id='pop-add' title={__("Add bookmark")}>
            <Col xs={6}>
              <Input label={__ 'Name'} type='text' bsSize='small' value={@state.bmname} onChange={@handleSetBMName} />
            </Col>
            <Col xs={6}>
              <Input label={__ 'Address'} type='text' bsSize='small' value={@state.bmadd} onChange={@handleSetBMAdd} />
            </Col>
            <Col xs={12}>
              <Button className='add-btn' onClick={@addBookmark}>{__ 'Confirm'}</Button>
            </Col>
          </Popover>
        </Overlay>
        <Overlay show={@state.delShow} onHide={@handleDelPopShow} rootClose={true} target={() => ReactDOM.findDOMNode(@refs.addPop)} placement='top'>
          <Popover id='pop-del' title={__("Del bookmark")}>
            <Col xs={6}>
              <Button className='add-btn' onClick={@handleDelPopShow}>{__ 'Cancel'}</Button>
            </Col>
            <Col xs={6}>
              <Button className='add-btn' bsStyle='danger' onClick={@delBookmark}>{__ 'Confirm'}</Button>
            </Col>
          </Popover>
        </Overlay>
      </Col>
    </Grid>
module.exports = NavigatorBar
