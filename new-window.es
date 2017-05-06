const { remote } = require('electron')
const path = require('path')

window.$ = (param) => document.querySelector(param)
window.$$ = (param) => document.querySelectorAll(param)

window.config = remote.require('./lib/config')

window.language = config.get('poi.language', navigator.language)
window.i18n = new (require('i18n-2'))({
  locales: ['en-US', 'ja-JP', 'zh-CN', 'zh-TW'],
  directory: path.join(__dirname, '..', 'i18n'),
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
})
