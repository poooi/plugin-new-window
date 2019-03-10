import React from 'react'
import PropTypes from 'prop-types'
import FontAwesome from 'react-fontawesome'
import { Button, ControlGroup, InputGroup, ButtonGroup, Intent } from '@blueprintjs/core'
import { translate } from 'react-i18next'
import styled from 'styled-components'

const wvStatus = {
  Loading: 0,
  Loaded: 1,
  Failed: 2,
}

const Navigator = styled.div`
  display: flex;
  flex-grow: 1;
  align-items: center;
`

const AddressBar = styled.div`
  flex: 1;
  margin-left: 15px;
  margin-right: 15px;
  display: flex;

  svg {
    z-index: 16;
    top: 30%;
    left: 10px;
    position: absolute;
  }
`

const Address = styled(ControlGroup)`
  flex: 1;
`

@translate('poi-plugin-new-window')
class NavigatorBar extends React.Component {
  static propTypes = {
    t: PropTypes.func.isRequired,
  }

  state = {
    status: 1,
    url: 'http://www.dmm.com/netgame',
  }

  componentDidMount() {
    const webview = $('webview')
    this.webview = webview
    webview.addEventListener('did-start-loading', this.onStartLoading)
    webview.addEventListener('did-stop-loading', this.onStopLoading)
    webview.addEventListener('did-fail-load', this.onFailLoad)
    webview.addEventListener('will-navigate', this.onWillNavigate)
  }

  componentWillUnmount() {
    const webview = $('webview')
    webview.removeEventListener('did-start-loading', this.onStartLoading)
    webview.removeEventListener('did-stop-loading', this.onStopLoading)
    webview.removeEventListener('did-fail-load', this.onFailLoad)
    webview.removeEventListener('will-navigate', this.onWillNavigate)
  }

  // Webview Event
  onStartLoading = () => {
    this.setState({
      status: wvStatus.Loading,
    })
  }

  onStopLoading = () => {
    this.setState({
      status: wvStatus.Loaded,
      url: this.webview.getURL(),
    })
  }

  onFailLoad = () => {
    this.setState({
      status: wvStatus.Failed,
    })
  }

  onWillNavigate = e => {
    this.setState({
      url: e.url,
    })
  }

  // UI Interaction
  navigate(url) {
    if (!(url.startsWith('http://') || url.startsWith('https://'))) {
      url = `http://${this.state.url}`
    }
    this.webview.loadURL(url)
    this.setState({
      url: url,
    })
  }

  onChangeUrl = e => {
    this.setState({
      url: e.target.value,
    })
  }

  onKeydown = e => {
    if (e.keyCode === 13) {
      this.navigate(this.state.url)
    }
  }

  onClickNavigate = () => {
    this.navigate(this.state.url)
  }

  onClickStop = () => {
    this.webview.stop()
  }

  onClickRefresh = () => {
    this.webview.reload()
  }

  onClickHomepage = () => {
    config.set('poi.homepage', this.state.url)
  }

  onRightClickHomepage = () => {
    this.navigate(config.get('poi.homepage'))
  }

  onClickGoBack = () => {
    this.webview.goBack()
  }

  onClickGoForward = () => {
    this.webview.goForward()
  }

  render() {
    const { t } = this.props
    const { status } = this.state

    let statusIcon
    if (status === wvStatus.Loading) {
      statusIcon = (
        <div>
          <FontAwesome name="spinner" spin />
        </div>
      )
    }
    if (status === wvStatus.Failed) {
      statusIcon = (
        <div>
          <FontAwesome name="times" />
        </div>
      )
    }

    let navigateAction, navigateIcon
    if (status === wvStatus.Loading) {
      navigateAction = this.onClickStop
      navigateIcon = <FontAwesome name="times" />
    } else {
      navigateAction = this.onClickNavigate
      navigateIcon = <FontAwesome name="arrow-right" />
    }

    let canGoBack, canGoForward
    try {
      canGoBack = !this.webview.canGoBack()
      canGoForward = !this.webview.canGoForward()
    } catch (error) {
      // do nothing
    }

    return (
      <Navigator>
        <AddressBar>
          <Address fill>
            <InputGroup
              type="text"
              placeholder={t('Input address')}
              className={statusIcon ? 'navigator-status' : 'navigator-no-status'}
              value={this.state.url}
              onChange={this.onChangeUrl}
              onKeyDown={this.onKeydown}
              leftIcon={statusIcon}
            />
          </Address>
        </AddressBar>
        <div>
          <ButtonGroup minimal>
            <Button disabled={canGoBack} onClick={this.onClickGoBack}>
              <FontAwesome name="chevron-left" />
            </Button>
            <Button disabled={canGoForward} onClick={this.onClickGoForward}>
              <FontAwesome name="chevron-right" />
            </Button>
            <Button intent={Intent.PRIMARY} onClick={navigateAction}>
              {navigateIcon}
            </Button>
            <Button intent={Intent.WARNING} onClick={this.onClickRefresh}>
              <FontAwesome name="refresh" />
            </Button>
          </ButtonGroup>
        </div>
      </Navigator>
    )
  }
}
module.exports = NavigatorBar
