{$, $$, _, React, ReactDOM, ReactBootstrap, FontAwesome, ROOT, APPDATA_PATH} = window
{Grid, Col, Button, ButtonGroup, Input, Modal, Alert, OverlayTrigger, DropdownButton, MenuItem, Popover, Row, Tooltip, Overlay} = ReactBootstrap
__ = i18n.__.bind(i18n)
remote = require('electron').remote
webview = $('inner-page webview')
innerpage = $('inner-page')

NavigatorBar = require './navigator-bar'
ControlBar = require './control'

BottomBar = React.createClass
  render: ->
    <Grid>
      <Row>
        <Col xs=8>
          <NavigatorBar />
        </Col>
        <Col xs=4>
          <ControlBar />
        </Col>
      </Row>
    </Grid>
module.exports = BottomBar
