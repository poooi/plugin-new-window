import type { WebviewTag } from 'electron'

import Module from 'module'

import { remote } from './lib/remote'

const DMM_COOKIE_SCRIPT = `
  document.cookie = "cklg=welcome;expires=Sun, 09 Feb 2019 09:00:09 GMT;domain=.dmm.com;path=/";
  document.cookie = "cklg=welcome;expires=Sun, 09 Feb 2019 09:00:09 GMT;domain=.dmm.com;path=/netgame/";
  document.cookie = "cklg=welcome;expires=Sun, 09 Feb 2019 09:00:09 GMT;domain=.dmm.com;path=/netgame_s/";
  document.cookie = "ckcy=1;expires=Sun, 09 Feb 2019 09:00:09 GMT;domain=osapi.dmm.com;path=/";
  document.cookie = "ckcy=1;expires=Sun, 09 Feb 2019 09:00:09 GMT;domain=203.104.209.7;path=/";
  document.cookie = "ckcy=1;expires=Sun, 09 Feb 2019 09:00:09 GMT;domain=www.dmm.com;path=/netgame/";
  document.cookie = "ckcy=1;expires=Sun, 09 Feb 2019 09:00:09 GMT;domain=log-netgame.dmm.com;path=/";
  document.cookie = "ckcy=1;expires=Sun, 09 Feb 2019 09:00:09 GMT;domain=.dmm.com;path=/";
  document.cookie = "ckcy=1;expires=Sun, 09 Feb 2019 09:00:09 GMT;domain=.dmm.com;path=/netgame/";
  document.cookie = "ckcy=1;expires=Sun, 09 Feb 2019 09:00:09 GMT;domain=.dmm.com;path=/netgame_s/";
`

window.$ = (selector) => document.querySelector(selector)
window.$$ = (selector) => document.querySelectorAll(selector)
window.ROOT = remote.getGlobal('ROOT')
window.APPDATA_PATH = remote.getGlobal('APPDATA_PATH')
;(Module as unknown as { globalPaths: string[] }).globalPaths.push(window.ROOT)

const config = (window.config = remote.require('./lib/config'))

const WindowManager: PoiWindowManager = remote.require('./lib/window')
window.WindowManager = WindowManager

/* eslint-disable @typescript-eslint/no-var-requires */
require(`${window.ROOT}/views/env-parts/theme`)

// the views are loaded lazily: they resolve poi's modules through the paths
// registered above, so they must not be hoisted into an `import`
require('./views')
/* eslint-enable @typescript-eslint/no-var-requires */

const openInNewWindow = (url: string) => {
  const exWindow = WindowManager.createWindow({
    realClose: true,
    navigatable: true,
    webPreferences: {
      nodeIntegration: false,
    },
  })
  exWindow.loadURL(url)
  exWindow.show()
}

let windowOpenAttached = false

const attachWindowOpenHandler = (webview: WebviewTag) => {
  if (windowOpenAttached) {
    return
  }
  windowOpenAttached = true

  const contents = remote.webContents.fromId(webview.getWebContentsId())

  // `new-window` was removed from <webview> in Electron 22, and
  // setWindowOpenHandler only landed in Electron 12: support both.
  if (contents?.setWindowOpenHandler) {
    contents.setWindowOpenHandler(({ url }) => {
      openInNewWindow(url)
      return { action: 'deny' }
    })
  } else {
    const legacy = webview as unknown as {
      addEventListener: (type: string, listener: (e: { url: string }) => void) => void
    }
    legacy.addEventListener('new-window', ({ url }) => openInNewWindow(url))
  }
}

const applyDMMCookie = (webview: WebviewTag) => {
  if (!config.get('poi.enableDMMcookie', false)) {
    return
  }
  webview.executeJavaScript(DMM_COOKIE_SCRIPT)
  const session = remote.webContents.fromId(webview.getWebContentsId())?.session
  session?.setUserAgent(session.getUserAgent(), 'ja-JP')
}

const addTitleBarDragArea = () => {
  const div = document.createElement('div')
  div.style.position = 'absolute'
  div.style.top = '0'
  div.style.height = '23px'
  div.style.width = '100%'
  div.style.setProperty('-webkit-app-region', 'drag')
  div.style.pointerEvents = 'none'
  document.body.appendChild(div)
}

remote.getCurrentWebContents().on('dom-ready', () => {
  if (process.platform === 'darwin') {
    addTitleBarDragArea()
  }

  const webview = window.$<WebviewTag>('webview')
  if (!webview) {
    return
  }

  webview.addEventListener('dom-ready', () => {
    applyDMMCookie(webview)
    attachWindowOpenHandler(webview)
  })
})
