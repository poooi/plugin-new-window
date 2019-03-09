import path from 'path-extra'
import fs from 'fs-extra'
import FontAwesome from 'react-fontawesome'
import React from 'react'
import ReactDOM from 'react-dom'
import {
  Col,
  Button,
  ButtonGroup,
  InputGroup,
  FormControl,
  ControlLabel,
  OverlayTrigger,
  DropdownButton,
  MenuItem,
  Popover,
  Row,
  Tooltip,
  Overlay,
} from 'react-bootstrap'
import { remote } from 'electron'
import { translate } from 'react-i18next'
import PropTypes from 'prop-types'
import { isArray } from 'lodash'

import MuteButton from './mute'
import AutoAdjustButton from './auto-adjust'
import ResolutionBuuton from './resolution'

const { $, APPDATA_PATH } = window

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
    defaultBookmarks: [],
  }

  resPop = React.createRef()
  addPop = React.createRef()

  async componentDidMount() {
    this.webview = $('webview')
    let defaultBookmarks = []
    let customBookmarks = []

    try {
      defaultBookmarks = await fs.readJson(DEFAULT_BOOKMARK_PATH)
      if (!isArray(customBookmarks)) {
        throw new Error('bookmark data invalid')
      }
    } catch (e) {
      console.error(e)
    }

    try {
      await fs.ensureDir(path.dirname(CUSTOM_BOOKMARK_PATH))
      await fs.ensureFile(CUSTOM_BOOKMARK_PATH)

      customBookmarks = await fs.readJson(CUSTOM_BOOKMARK_PATH)
      if (!isArray(customBookmarks)) {
        throw new Error('bookmark data invalid')
      }
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
    let { x, y } = bound
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
      resShow: !this.state.resShow,
    })
  }
  handleSetWidth = e => {
    this.setState({
      width: e.target.value,
    })
  }
  handleSetHeight = e => {
    this.setState({
      height: e.target.value,
    })
  }
  handleSetBMName = e => {
    this.setState({
      bmname: e.target.value,
    })
  }
  handleSetBMAdd = e => {
    this.setState({
      bmadd: e.target.value,
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
    if (this.webview.setAudioMuted) {
      this.webview.setAudioMuted(!this.state.muted)
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
      bmadd: this.webview?.getURL() || '',
    })
  }
  handleDelPopShow = () => {
    this.setState({
      delShow: !this.state.delShow,
    })
  }
  onSelectLink = lnk => {
    this.webview.loadURL(lnk)
  }
  handleUnlockWebview = () => {
    this.webview.executeJavaScript("document.documentElement.style.overflow = 'auto'")
  }

  handleDebug = () => {
    this.webview.openDevTools({
      detach: true,
    })
  }
  handleDevTools = () => {
    remote.getCurrentWindow().openDevTools({
      detach: true,
    })
  }
  handleSetWebviewRatio = e => {
    this.webview.executeJavaScript(`window.setZoom(${e.target.value})`)
  }
  render() {
    const { t } = this.props
    return (
      <div className="control-bar">
        <ButtonGroup className="btn-grp">
          <MuteButton />
          <AutoAdjustButton />
          <ResolutionBuuton />
        </ButtonGroup>
        <OverlayTrigger
          placement="top"
          overlay={<Tooltip id="btn-dtl">{t('Developer Tools')}</Tooltip>}
        >
          <Button
            bsSize="small"
            className="btn-grp"
            onContextMenu={this.handleDebug}
            onClick={this.handleDevTools}
          >
            <FontAwesome name="gears" />
          </Button>
        </OverlayTrigger>
        <OverlayTrigger placement="top" overlay={<Tooltip id="btn-lnk">{t('Links')}</Tooltip>}>
          <DropdownButton
            id="btn-bkm"
            bsSize="small"
            className="btn-grp"
            ref={this.addPop}
            title={<FontAwesome name="bookmark-o" />}
            dropup
            pullRight
            noCaret
          >
            {this.state.defaultBookmarks.map((bookmark, j) => (
              <MenuItem
                key={1000 + j}
                eventKey={1000 + j}
                onSelect={this.onSelectLink.bind(this, bookmark.link)}
              >
                {bookmark.name}
              </MenuItem>
            ))}
            {this.state.bookmarks.map((bookmark, j) => (
              <MenuItem key={j} eventKey={j} onSelect={this.onSelectLink.bind(this, bookmark.link)}>
                {bookmark.name}
                <Button
                  className="del-btn"
                  bsStyle="danger"
                  bsSize="xsmall"
                  onClick={this.handleSelectDel.bind(this, j)}
                >
                  <FontAwesome name="times" />
                </Button>
              </MenuItem>
            ))}
            <MenuItem divider />
            <MenuItem key={2000} eventKey={2000} onSelect={this.handleAddPopShow}>
              {t('Add bookmark')}
            </MenuItem>
          </DropdownButton>
        </OverlayTrigger>
        <Overlay
          show={this.state.addShow}
          onHide={this.handleAddPopShow}
          rootClose={true}
          target={() => ReactDOM.findDOMNode(this.addPop.current)}
          placement="top"
        >
          <Popover style={{ width: 400 }} id="pop-add" title={t('Add bookmark')}>
            <Row>
              <InputGroup bsSize="small">
                <ControlLabel>{t('Name')}</ControlLabel>
                <FormControl
                  type="text"
                  value={this.state.bmname}
                  onChange={this.handleSetBMName}
                />
              </InputGroup>
            </Row>
            <Row>
              <InputGroup bsSize="small">
                <ControlLabel>{t('Address')}</ControlLabel>
                <FormControl type="text" value={this.state.bmadd} onChange={this.handleSetBMAdd} />
              </InputGroup>
            </Row>
            <Row>
              <Button className="add-btn" onClick={this.addBookmark}>
                {t('Confirm')}
              </Button>
            </Row>
          </Popover>
        </Overlay>
        <Overlay
          show={this.state.delShow}
          onHide={this.handleDelPopShow}
          rootClose={true}
          target={() => ReactDOM.findDOMNode(this.addPop.current)}
          placement="top"
        >
          <Popover id="pop-del" title={t('Del bookmark')}>
            <Col xs={6}>
              <Button className="add-btn" onClick={this.handleDelPopShow}>
                {t('Cancel')}
              </Button>
            </Col>
            <Col xs={6}>
              <Button className="add-btn" bsStyle="danger" onClick={this.delBookmark}>
                {t('Confirm')}
              </Button>
            </Col>
          </Popover>
        </Overlay>
      </div>
    )
  }
}

export default ControlBar
