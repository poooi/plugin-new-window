console.log('This is a workaround for https://bugs.chromium.org/p/chromium/issues/detail?id=600395')
var electron = require('electron')
var remote = electron.remote
document.onclick = (e) =>
  remote.getCurrentWebContents().executeJavaScript("$('webview').focus()")
