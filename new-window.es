const { remote } = require('electron')
const path = require('path')

window.$ = (param) => document.querySelector(param)
window.$$ = (param) => document.querySelectorAll(param)
window.ROOT = remote.getGlobal('ROOT')

const config = window.config = remote.require('./lib/config')

window.language = config.get('poi.language', navigator.language)
window.i18n = new (require('i18n-2'))({
  locales: ['en-US', 'ja-JP', 'zh-CN', 'zh-TW'],
  directory: path.join(__dirname, 'i18n'),
  updateFiles: false,
  indent: "\t",
  extension: '.json',
  devMode: false,
})
window.i18n.setLocale(window.language)

require(`${ROOT}/views/env-parts/theme`)

require('./views')

remote.getCurrentWebContents().on('dom-ready', e => {
  if (process.platform === 'darwin') {
    remote.getCurrentWebContents().executeJavaScript(`
      var div = document.createElement("div");
      div.style.position = "absolute";
      div.style.top = 0;
      div.style.height = "23px";
      div.style.width = "100%";
      div.style["-webkit-app-region"] = "drag";
      div.style["pointer-events"] = "none";
      document.body.appendChild(div);
    `)
  }
  $('webview').addEventListener('dom-ready', (e) => {
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
      const ua = $('webview').getWebContents().session.getUserAgent()
      $('webview').getWebContents().session.setUserAgent(ua, 'ja-JP')
    }
  })
  $('webview').addEventListener('new-window', (e) => {
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
