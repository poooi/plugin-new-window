import React from 'react'
import FontAwesome from 'react-fontawesome'
import { Button, ButtonGroup, FormControl, InputGroup, FormGroup, OverlayTrigger, Tooltip } from 'react-bootstrap'

const __ = i18n.__.bind(i18n)
const __n = i18n.__n.bind(i18n)
const webview = $('webview')
const wvStatus = {
  Loading: 0,
  Loaded: 1,
  Failed: 2,
}

class NavigatorBar extends React.Component {
  constructor() {
    super()
    this.state = {
      status: 1,
      url: "http://www.dmm.com/netgame"
    }
  }
  componentDidMount() {
    webview.addEventListener('did-start-loading', this.onStartLoading)
    webview.addEventListener('did-stop-loading', this.onStopLoading)
    webview.addEventListener('did-fail-load', this.onFailLoad)
    webview.addEventListener('will-navigate', this.onWillNavigate)
  }
  componentWillUnmount() {
    webview.removeEventListener('did-start-loading', this.onStartLoading)
    webview.removeEventListener('did-stop-loading', this.onStopLoading)
    webview.removeEventListener('did-fail-load', this.onFailLoad)
    webview.removeEventListener('will-navigate', this.onWillNavigate)
  }
  // Webview Event
  onStartLoading = (e) => {
    this.setState({
      status: wvStatus.Loading,
    })
  }
  onStopLoading = (e) => {
    this.setState({
      status: wvStatus.Loaded,
      url: webview.getURL(),
    })
  }
  onFailLoad = (e) => {
    this.setState({
      status: wvStatus.Failed,
    })
  }
  onWillNavigate = (e) => {
    this.setState({
      url: e.url,
    })
  }
  // UI Interaction
  navigate(url) {
    if (!(url.startsWith('http://') || url.startsWith('https://'))) {
      url = `http://${this.state.url}`
    }
    webview.loadURL(url)
    this.setState({
      url: url
    })
  }
  onChangeUrl = (e) => {
    this.setState({
      url: e.target.value
    })
  }
  onKeydown = (e) => {
    if (e.keyCode === 13) {
      this.navigate(this.state.url)
    }
  }
  onClickNavigate = (e) => {
    this.navigate(this.state.url)
  }
  onClickStop = (e) => {
    webview.stop()
  }
  onClickRefresh = (e) => {
    webview.reload()
  }
  onClickHomepage = (e) => {
    config.set('poi.homepage', this.state.url)
  }
  onRightClickHomepage = (e) => {
    this.navigate(config.get('poi.homepage'))
  }
  onClickGoBack = (e) => {
    webview.goBack()
  }
  onClickGoForward = (e) => {
    webview.goForward()
  }

  render() {
    let {url, status} = this.state

    let statusIcon
    if (status === wvStatus.Loading) {
      statusIcon = <FontAwesome name='spinner' spin />
    }
    if (status === wvStatus.Failed) {
      statusIcon = <FontAwesome name='times' />
    }

    let navigateAction, navigateIcon
    if (status === wvStatus.Loading) {
      navigateAction = this.onClickStop
      navigateIcon   = <FontAwesome name='times' />
    } else {
      navigateAction = this.onClickNavigate
      navigateIcon   = <FontAwesome name='arrow-right' />
    }

    let canGoBack, canGoForward
    try {
        canGoBack = !webview.canGoBack()
        canGoForward = !webview.canGoForward()
    } catch (error) {
    }

    return (
      <div className='navigator'>
        <div className='navigator-url'>
          <FormGroup>
            <InputGroup bsSize='small' style={{width: '100%'}}>
              <FormControl type='text'
                 placeholder={__('Input address')}
                 className={statusIcon? 'navigator-status' : 'navigator-no-status'}
                 value={this.state.url}
                 onChange={this.onChangeUrl}
                 onKeyDown={this.onKeydown} />
              {statusIcon ? <FormControl.Feedback>
                              {statusIcon}
                            </FormControl.Feedback> : null}
            </InputGroup>
          </FormGroup>
        </div>
        <div className='navigator-btn'>
          <ButtonGroup>
            <Button bsSize='small' bsStyle='info' disabled={canGoBack} onClick={this.onClickGoBack}><FontAwesome name='chevron-left' /></Button>
            <Button bsSize='small' bsStyle='info' disabled={canGoForward} onClick={this.onClickGoForward}><FontAwesome name='chevron-right' /></Button>
            <Button bsSize='small' bsStyle='primary' onClick={navigateAction}>{navigateIcon}</Button>
            <Button bsSize='small' bsStyle='warning' onClick={this.onClickRefresh}><FontAwesome name='refresh' /></Button>
          </ButtonGroup>
        </div>
      </div>
    )
  }
}
module.exports = NavigatorBar
