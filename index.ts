import type { BrowserWindowConstructorOptions } from 'electron'

import os from 'os'

const { config } = window

// Named exports, not `export default`: poi loads a transpiled plugin with
// `await import()`, which puts a CJS `module.exports` under `default` instead of
// spreading it. Only named exports reach poi on both the .ts and the .js path.

export const windowURL = `file://${__dirname}/index.html`

export const windowOptions: BrowserWindowConstructorOptions = {
  x: config.get('poi.window.x', 0),
  y: config.get('poi.window.y', 0),
  width: 1100,
  height: 700,
  enableLargerThanScreen: true,
  // FIXME: titlebarStyle: https://github.com/electron/electron/issues/14129
  titleBarStyle:
    process.platform === 'darwin' && Number(os.release().split('.')[0]) >= 17
      ? 'hidden'
      : undefined,
}

export const realClose = true

export const multiWindow = true
