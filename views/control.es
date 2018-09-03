import path from 'path-extra'
import fs from 'fs-extra'
import FontAwesome from 'react-fontawesome'
import React from 'react'
import ReactDOM from 'react-dom'
import { Col, Button, ButtonGroup, InputGroup, FormGroup, FormControl, ControlLabel, OverlayTrigger, DropdownButton, MenuItem, Popover, Row, Tooltip, Overlay } from 'react-bootstrap'
import { remote } from 'electron'
import { translate } from 'react-i18next'
import PropTypes from 'prop-types'

const {$, APPDATA_PATH} = window
const webview = $('inner-page webview')

const DEFAULT_BOOKMARK_PATH = path.resolve(__dirname, '../bookmark.json')
const CUSTOM_BOOKMARK_PATH = path.join(APPDATA_PATH, 'new-window', 'bookmark.json')

@translate('poi-plugin-new-window')
class ControlBar extends React.Component {
  static propTypes = {
    t: PropTypes.func.isRequired,
  }

  state = {
    muted: false,
    width: window.innerWidth,
    height: window.innerHeight - 50,
    bmname: '',
    bmadd: '',
    todel: 0,
    resShow: false,
    addShow: false,
    delShow: false,
    bookmarks: [],
    defaultBookmarks: []
  }

  resPop = React.createRef()
  addPop = React.createRef()

  async componentDidMount() {
    let defaultBookmarks = []
    let customBookmarks = []

    try {
      defaultBookmarks = await fs.readJson(DEFAULT_BOOKMARK_PATH)
    } catch (e) {
      console.error(e)
    }

    try {
      await fs.ensureDir(path.dirname(CUSTOM_BOOKMARK_PATH))
      await fs.ensureFile(CUSTOM_BOOKMARK_PATH)

      customBookmarks = await fs.readJson(CUSTOM_BOOKMARK_PATH)
    } catch (e) {
      console.error(e)
    }

    this.setState({
      defaultBookmarks,
      bookmarks: customBookmarks,
    })
  }
  handleSetRes = (width, height) => {
    let nowWindow = remote.getCurrentWindow()
    let bound = nowWindow.getBounds()
    let {x, y} = bound
    let borderX = bound.width - window.innerWidth
    let borderY = bound.height - window.innerHeight
    let newWidth = width
    let newHeight = height
    nowWindow.setBounds({
      x: x,
      y: y,
      width: parseInt(newWidth + borderX),
      height: parseInt(newHeight + borderY + 50),
    })
    this.setState({
      resShow: !this.state.resShow
    })
  }
  handleSetWidth = (e) => {
    this.setState({
      width: e.target.value
    })
  }
  handleSetHeight = (e) =>{
    this.setState({
      height: e.target.value
    })
  }
  handleSetBMName = (e) =>{
    this.setState({
      bmname: e.target.value
    })
  }
  handleSetBMAdd = (e) => {
    this.setState({
      bmadd: e.target.value
    })
  }
  handleSelectDel = (del, e) => {
    e.stopPropagation()
    this.setState({
      todel: del,
      delShow: true,
    })
  }
  handleSetMuted = () => {
    if (webview.setAudioMuted){
      webview.setAudioMuted(!this.state.muted)
    }
    this.setState({
      muted: !this.state.muted,
    })
  }
  addBookmark = async () => {
    let add = this.state.bmadd
    if (!add.startsWith('http://') && !add.startsWith('https://')) {
      add = `http://${add}`
    }
    let bookmark = {
      name: this.state.bmname,
      link: add,
    }
    let bookmarks = this.state.bookmarks.slice()
    bookmarks.push(bookmark)
    await fs.writeJson(CUSTOM_BOOKMARK_PATH, bookmarks)
    this.setState({
      bookmarks,
      addShow: false,
    })
  }
  delBookmark = async () => {
    let bookmarks = this.state.bookmarks.slice()
    bookmarks.splice(this.state.todel, 1)
    await fs.writeJson(CUSTOM_BOOKMARK_PATH, bookmarks)
    this.setState({
      bookmarks: bookmarks,
      delShow: false,
    })
  }
  handleResPopShow = () => {
    this.setState({
      resShow: !this.state.resShow,
    })
  }
  handleAddPopShow = () => {
    this.setState({
      addShow: !this.state.addShow,
      bmadd: webview?.getURL() || '',
    })
  }
  handleDelPopShow = () => {
    this.setState({
      delShow: !this.state.delShow,
    })
  }
  onSelectLink = (lnk) => {
    webview.loadURL(lnk)
  }
  handleUnlockWebview = () => {
    webview.executeJavaScript("document.documentElement.style.overflow = 'auto'")
  }
  handleJustify = () => {
    webview.executeJavaScript(`
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
    `)
  }
  handleDebug = () => {
    webview.openDevTools({
      detach: true,
    })
  }
  handleDevTools = () => {
    remote.getCurrentWindow().openDevTools({
      detach: true,
    })
  }
  handleSetWebviewRatio = (e) => {
    webview.executeJavaScript(`window.setZoom(${e.target.value})`)
  }
  render() {
    const { t } = this.props
    return (
      <div className="control-bar">
        <ButtonGroup className="btn-grp">
          <OverlayTrigger placement='top' overlay={<Tooltip id='btn-mut'>{this.state.muted ?  t('Volume off') : t('Volume on')}</Tooltip>}>
            <Button bsSize='small' onClick={this.handleSetMuted}><FontAwesome name={this.state.muted ? 'volume-off' : 'volume-up'} /></Button>
          </OverlayTrigger>
          <OverlayTrigger placement='top' overlay={<Tooltip id='btn-adj'>{t("Auto adjust")}</Tooltip>}>
            <Button bsSize='small' onClick={this.handleJustify} onContextMenu={this.handleUnlockWebview}><FontAwesome name='arrows-alt' /></Button>
          </OverlayTrigger>
          <Overlay show={this.state.resShow} onHide={this.handleResPopShow} rootClose={true} target={() => ReactDOM.findDOMNode(this.resPop.current)} placement='top'>
            <Popover id='pop-res' title={t("Change resolution")}>
              <FormGroup>
                <Row>
                  <Col xs={4}>
                    <InputGroup bsSize='small'>
                      <FormControl type='text' value={this.state.width} onChange={this.handleSetWidth} />
                    </InputGroup>
                  </Col>
                  <Col xs={4}>
                    <InputGroup bsSize='small'>
                      <FormControl type='text' value={this.state.height} onChange={this.handleSetHeight} />
                    </InputGroup>
                  </Col>
                  <Col xs={4}>
                    <Button bsSize='small' style={{width: '100%'}} onClick={this.handleSetRes.bind(this, parseInt(this.state.width), parseInt(this.state.height))}>
                      <FontAwesome name='check' />
                    </Button>
                  </Col>
                </Row>
                <Row style={{width: '100%'}}>
                  <Col xs={3}>
                    <Button bsSize='small' className="res-btn" onClick={this.handleSetRes.bind(this, 800, 480)}>800*480</Button>
                  </Col>
                  <Col xs={3}>
                    <Button bsSize='small' className="res-btn" onClick={this.handleSetRes.bind(this, 960, 580)}>960*580</Button>
                  </Col>
                  <Col xs={3}>
                    <Button bsSize='small' className="res-btn" onClick={this.handleSetRes.bind(this, 960, 640)}>960*640</Button>
                  </Col>
                  <Col xs={3}>
                    <Button bsSize='small' className="res-btn" onClick={this.handleSetRes.bind(this, 1280, 720)}>1280*720</Button>
                  </Col>
                </Row>
                <Row>
                  <Col xs={12} style={{paddingTop: 5, marginBottom: -15}}>
                    <FormControl componentClass="select" onChange={this.handleSetWebviewRatio} defaultValue={1}>
                      {
                        [0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                          <option key={i} value={i * 0.25 + 0.25}>
                            {i * 25 + 25}%
                          </option>
                        ))
                      }
                    </FormControl>
                  </Col>
                </Row>
              </FormGroup>
            </Popover>
          </Overlay>
          <OverlayTrigger placement='top' overlay={<Tooltip id='btn-res'>{t("Change resolution")}</Tooltip>}>
            <Button id='res-btn' bsStyle='default' bsSize='small' ref={this.resPop} style={{marginLeft: 0}} onClick={this.handleResPopShow}>
              <FontAwesome name='arrows'/>
            </Button>
          </OverlayTrigger>
        </ButtonGroup>
        <OverlayTrigger placement='top' overlay={<Tooltip id='btn-dtl'>{t("Developer Tools")}</Tooltip>}>
          <Button bsSize='small' className="btn-grp" onContextMenu={this.handleDebug} onClick={this.handleDevTools}><FontAwesome name='gears' /></Button>
        </OverlayTrigger>
        <OverlayTrigger placement='top' overlay={<Tooltip id='btn-lnk'>{t("Links")}</Tooltip>}>
          <DropdownButton id='btn-bkm' bsSize='small' className="btn-grp" ref={this.addPop} title = {<FontAwesome name='bookmark-o' />} dropup pullRight noCaret>
          {
            this.state.defaultBookmarks.map((bookmark, j) => (
              <MenuItem key={1000 + j} eventKey={1000 + j} onSelect={this.onSelectLink.bind(this, bookmark.link)}>{bookmark.name}</MenuItem>
            ))
          }
          {
            this.state.bookmarks.map((bookmark, j) => (
              <MenuItem key={j} eventKey={j} onSelect={this.onSelectLink.bind(this, bookmark.link)}>
                {bookmark.name}
                <Button className='del-btn' bsStyle='danger' bsSize='xsmall' onClick={this.handleSelectDel.bind(this, j)}>
                  <FontAwesome name='times'/>
                </Button>
              </MenuItem>
            ))
          }
            <MenuItem divider />
            <MenuItem key={2000} eventKey={2000} onSelect={this.handleAddPopShow}>{t('Add bookmark')}</MenuItem>
          </DropdownButton>
        </OverlayTrigger>
        <Overlay show={this.state.addShow} onHide={this.handleAddPopShow} rootClose={true} target={() => ReactDOM.findDOMNode(this.addPop.current)} placement='top'>
          <Popover style={{width: 400}} id='pop-add' title={t("Add bookmark")}>
            <Row>
              <InputGroup bsSize='small'>
                <ControlLabel>{t('Name')}</ControlLabel>
                <FormControl type='text' value={this.state.bmname} onChange={this.handleSetBMName} />
              </InputGroup>
            </Row>
            <Row>
              <InputGroup bsSize='small'>
                <ControlLabel>{t('Address')}</ControlLabel>
                <FormControl type='text' value={this.state.bmadd} onChange={this.handleSetBMAdd} />
              </InputGroup>
            </Row>
            <Row>
              <Button className='add-btn' onClick={this.addBookmark}>{t('Confirm')}</Button>
            </Row>
          </Popover>
        </Overlay>
        <Overlay show={this.state.delShow} onHide={this.handleDelPopShow} rootClose={true} target={() => ReactDOM.findDOMNode(this.addPop.current)} placement='top'>
          <Popover id='pop-del' title={t("Del bookmark")}>
            <Col xs={6}>
              <Button className='add-btn' onClick={this.handleDelPopShow}>{t('Cancel')}</Button>
            </Col>
            <Col xs={6}>
              <Button className='add-btn' bsStyle='danger' onClick={this.delBookmark}>{t('Confirm')}</Button>
            </Col>
          </Popover>
        </Overlay>
      </div>
    )
  }
}

export default ControlBar
