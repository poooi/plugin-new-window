path = require 'path-extra'
fs = require 'fs-extra'
{$, $$, _, React, ReactDOM, ReactBootstrap, FontAwesome, ROOT, APPDATA_PATH} = window
{Grid, Col, Button, ButtonGroup, Input, Modal, Alert, OverlayTrigger, DropdownButton, MenuItem, Popover, Row, Tooltip, Overlay} = ReactBootstrap
__ = i18n.__.bind(i18n)
remote = require('electron').remote
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

ControlBar = React.createClass
  getInitialState: ->
    muted: false
    width: window.innerWidth
    height: window.innerHeight - 50
    bmname: ''
    bmadd: ''
    todel: 0
    resShow: false
    addShow: false
    delShow: false
    bookmarks: customBookmarks
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
  handleSetMuted: ->
    muted = !@state.muted
    if webview.setAudioMuted?
      webview.setAudioMuted muted
    @setState {muted}
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
  handleResPopShow: ->
    @setState
      resShow: !@state.resShow
  handleAddPopShow: ->
    @setState
      addShow: !@state.addShow
  handleDelPopShow: ->
    @setState
      delShow: !@state.delShow
  onSelectLink: (lnk) ->
    webview.loadURL lnk
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
        document.querySelector('#game_frame').style.marginLeft = '0';
        x1 = iframe.querySelector('embed').getBoundingClientRect().left;
        y1 = iframe.querySelector('embed').getBoundingClientRect().top;
      } else if (iframe.querySelector('iframe')!=null) {
        var iframe1 = iframe.querySelector('iframe').contentWindow.document;
        iframe.querySelector('iframe').style.marginLeft = '0';
        iframe1.querySelector('canvas').style.marginLeft = '0';
        x1 = iframe1.querySelector('canvas').getBoundingClientRect().left;
        y1 = iframe1.querySelector('canvas').getBoundingClientRect().top;
      } else if (iframe.querySelector('canvas')!=null) {
        x1 = iframe.querySelector('canvas').getBoundingClientRect().left;
        y1 = iframe.querySelector('canvas').getBoundingClientRect().top;
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
  handleSetWebviewRatio: (e) ->
    webview.executeJavaScript """
      if (document.querySelector('#game_frame') != null) {
        var iframe = document.querySelector('#game_frame').contentWindow.document;
        document.querySelector('html').style.zoom = #{e.target.value};
        iframe.querySelector('html').style.zoom = #{e.target.value};
        if (iframe.querySelector('iframe') != null) {
          var iframe1 = iframe.querySelector('iframe').contentWindow.document;
          iframe1.querySelector('html').style.zoom = #{e.target.value};
        }
      } else if (document.querySelector('embed') != null) {
        var iframe = document.querySelector('embed');
        document.querySelector('html').style.zoom = #{e.target.value};
      }
    """
  componentDidMount: ->
    window.addEventListener 'resize', @handleResize
  componentWillUmount: ->
    window.removeEventListener 'resize', @handleResize
  render: ->
    <div>
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
                <Col xs={4}>
                  <Button bsSize='small' style={width: '100%'} onClick={@handleSetRes.bind @, parseInt(@state.width), parseInt(@state.height)}>
                    <FontAwesome name='check' />
                  </Button>
                </Col>
              </Row>
              <Row style={width: '100%'}>
                <Col xs={3}>
                  <Button bsSize='small' className="res-btn" onClick={@handleSetRes.bind @, 800, 480}>800*480</Button>
                </Col>
                <Col xs={3}>
                  <Button bsSize='small' className="res-btn" onClick={@handleSetRes.bind @, 960, 580}>960*580</Button>
                </Col>
                <Col xs={3}>
                  <Button bsSize='small' className="res-btn" onClick={@handleSetRes.bind @, 960, 640}>960*640</Button>
                </Col>
                <Col xs={3}>
                  <Button bsSize='small' className="res-btn" onClick={@handleSetRes.bind @, 1280, 720}>1280*720</Button>
                </Col>
              </Row>
              <Row>
                <Col xs={12} style={paddingTop: 5; marginBottom: -15}>
                  <Input type="select" onChange={@handleSetWebviewRatio} defaultValue={1}>
                    {
                      i = 0
                      while i < 7
                        i++
                        <option key={i} value={i * 0.25 + 0.25}>
                          {i * 25 + 25}%
                        </option>
                    }
                  </Input>
                </Col>
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
    </div>
module.exports = ControlBar
