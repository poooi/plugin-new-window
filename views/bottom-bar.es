import React from 'react'
import styled from 'styled-components'

import NavigatorBar from './navigator-bar'
import ControlBar from './control'
import ErrorBoundary from './error-boundary'

const Wrapper = styled.div`
  display: flex;
  height: 50px;
  align-items: center;
  margin-right: 1ex;

  .bp3-button {
    width: 1em;
  }
`

const BottomBar = () => (
  <Wrapper>
    <ErrorBoundary>
      <NavigatorBar />
      <ControlBar />
    </ErrorBoundary>
  </Wrapper>
)

export default BottomBar
