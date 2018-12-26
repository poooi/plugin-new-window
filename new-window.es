const { remote } = require('electron')

window.$ = param => document.querySelector(param)
window.$$ = param => document.querySelectorAll(param)
window.ROOT = remote.getGlobal('ROOT')
window.APPDATA_PATH = remote.getGlobal('APPDATA_PATH')
require('module').globalPaths.push(window.ROOT)

const config = (window.config = remote.require('./lib/config'))

require(`${window.ROOT}/views/env-parts/theme`)

require('./views')

const WindowManager = remote.require('./lib/window')
window.WindowManager = WindowManager

remote.getCurrentWebContents().on('dom-ready', () => {
  if (process.platform === 'darwin') {
    const div = document.createElement('div')
    div.style.position = 'absolute'
    div.style.top = 0
    div.style.height = '23px'
    div.style.width = '100%'
    div.style['-webkit-app-region'] = 'drag'
    div.style['pointer-events'] = 'none'
    document.body.appendChild(div)
  }
  $('webview').addEventListener('dom-ready', () => {
    if (config.get('poi.enableDMMcookie', false)) {
      $('webview').executeJavaScript(`
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
      `)
      const ua = $('webview')
        .getWebContents()
        .session.getUserAgent()
      $('webview')
        .getWebContents()
        .session.setUserAgent(ua, 'ja-JP')
    }
  })
  $('webview').addEventListener('new-window', e => {
    const exWindow = WindowManager.createWindow({
      realClose: true,
      navigatable: true,
      nodeIntegration: false,
    })
    exWindow.loadURL(e.url)
    exWindow.show()
    e.preventDefault()
  })
})
