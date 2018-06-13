import React from 'react'
import { Grid, Row, Col } from 'react-bootstrap'

import NavigatorBar from './navigator-bar'
import ControlBar from './control'

const BottomBar =  () => (
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

export default BottomBar
