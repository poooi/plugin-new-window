import { Classes } from '@blueprintjs/core'
import React from 'react'
import styled from 'styled-components'

import ControlBar from './control'
import ErrorBoundary from './error-boundary'
import NavigatorBar from './navigator-bar'

const Wrapper = styled.div`
  display: flex;
  height: 50px;
  align-items: center;
  margin-right: 1ex;

  .${Classes.BUTTON} {
    width: 1em;
  }
`

const BottomBar: React.FC = () => (
  <Wrapper>
    <ErrorBoundary>
      <NavigatorBar />
      <ControlBar />
    </ErrorBoundary>
  </Wrapper>
)

export default BottomBar
