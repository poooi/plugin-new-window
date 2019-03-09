import React from 'react'
import { translate } from 'react-i18next'
import PropTypes from 'prop-types'
import { ButtonGroup } from '@blueprintjs/core'

import MuteButton from './mute'
import AutoAdjustButton from './auto-adjust'
import ResolutionBuuton from './resolution'
import DevToolsButton from './devtools'
import BookmarkButton from './bookmark'

@translate('poi-plugin-new-window')
class ControlBar extends React.Component {
  static propTypes = {
    t: PropTypes.func.isRequired,
  }
  render() {
    return (
      <div>
        <ButtonGroup>
          <MuteButton />
          <AutoAdjustButton />
          <ResolutionBuuton />
        </ButtonGroup>
        <ButtonGroup>
          <BookmarkButton />
        </ButtonGroup>
        <ButtonGroup>
          <DevToolsButton />
        </ButtonGroup>
      </div>
    )
  }
}

export default ControlBar
