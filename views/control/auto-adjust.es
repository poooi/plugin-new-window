import React, { useCallback, useContext } from 'react'
import { Tooltip, Button, Position } from '@blueprintjs/core'
import FontAwesome from 'react-fontawesome'
import { translate } from 'react-i18next'

import WebviewContext from '../webview-context'

const AutoAdjustButton = translate('poi-plugin-new-window')(({ t }) => {
  const webview = useContext(WebviewContext)
  const handleJustify = useCallback(() => {
    webview.current?.executeJavaScript(`
    var iframe = document.querySelector('#game_frame').contentWindow.document;
    window.scrollTo(0, 0);
    document.documentElement.style.overflow = 'hidden';
    var x1 = 0;
    var y1 = 0;
    if (iframe.querySelector('embed')) {
      document.querySelector('#game_frame').style.marginLeft = '0';
      x1 = iframe.querySelector('embed').getBoundingClientRect().left;
      y1 = iframe.querySelector('embed').getBoundingClientRect().top;
    } else if (iframe.querySelector('iframe')) {
      var iframe1 = iframe.querySelector('iframe').contentWindow.document;
      iframe.querySelector('iframe').style.marginLeft = '0';
      iframe1.querySelector('canvas').style.marginLeft = '0';
      x1 = iframe1.querySelector('canvas').getBoundingClientRect().left;
      y1 = iframe1.querySelector('canvas').getBoundingClientRect().top;
    } else if (iframe.querySelector('canvas')) {
      x1 = iframe.querySelector('canvas').getBoundingClientRect().left;
      y1 = iframe.querySelector('canvas').getBoundingClientRect().top;
    }
    var x = document.querySelector('#game_frame').getBoundingClientRect().left + x1;
    var y = document.querySelector('#game_frame').getBoundingClientRect().top + y1;
    window.scrollTo(x, y);
  `)
  }, [webview])
  const handleUnlockWebview = useCallback(() => {
    webview.current.executeJavaScript("document.documentElement.style.overflow = 'auto'")
  }, [webview])

  return (
    <Tooltip position={Position.TOP} content={t('Auto adjust')}>
      <Button onClick={handleJustify} onContextMenu={handleUnlockWebview}>
        <FontAwesome name="arrows-alt" />
      </Button>
    </Tooltip>
  )
})

export default AutoAdjustButton
