import { ButtonGroup } from '@blueprintjs/core'
import React from 'react'

import AutoAdjustButton from './auto-adjust'
import BookmarkButton from './bookmark'
import DevToolsButton from './devtools'
import MuteButton from './mute'
import ResolutionButton from './resolution'

const ControlBar: React.FC = () => (
  <div>
    <ButtonGroup minimal>
      <MuteButton />
      <AutoAdjustButton />
      <ResolutionButton />
    </ButtonGroup>
    <ButtonGroup minimal>
      <BookmarkButton />
    </ButtonGroup>
    <ButtonGroup minimal>
      <DevToolsButton />
    </ButtonGroup>
  </div>
)

export default ControlBar
