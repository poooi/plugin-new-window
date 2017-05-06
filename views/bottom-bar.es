import React from 'react'
import { Grid, Row, Col } from 'react-bootstrap'
import FontAwesome from 'react-fontawesome'
import { remote } from 'electron'

import NavigatorBar from './navigator-bar'
import ControlBar from './control'

export default () => (
  <Grid>
    <Row>
      <Col xs={7}>
        <NavigatorBar />
      </Col>
      <Col xs={5}>
        <ControlBar />
      </Col>
    </Row>
  </Grid>
)
