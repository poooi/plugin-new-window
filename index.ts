import type { BrowserWindowConstructorOptions } from 'electron'

import os from 'os'

const { config } = window

// FIXME: titlebarStyle: https://github.com/electron/electron/issues/14129
const titleBarStyle: BrowserWindowConstructorOptions['titleBarStyle'] =
  process.platform === 'darwin' && Number(os.release().split('.')[0]) >= 17 ? 'hidden' : undefined

export default {
  windowURL: `file://${__dirname}/index.html`,
  windowOptions: {
    x: config.get('poi.window.x', 0),
    y: config.get('poi.window.y', 0),
    width: 1100,
    height: 700,
    enableLargerThanScreen: true,
    titleBarStyle,
  },
  realClose: true,
  multiWindow: true,
}
