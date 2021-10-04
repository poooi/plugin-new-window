const { webFrame } = require('electron')
const remote = require('electron').remote || require('@electron/remote')

window.onclick = () => {
  remote.getCurrentWindow().webContents.executeJavaScript(`
    $('webview').blur()
    $('webview').focus()
  `)
}
window.setZoom = zoom => {
  webFrame.setZoomFactor(zoom)
  const zl = webFrame.getZoomLevel()
  webFrame.setLayoutZoomLevelLimits(zl, zl)
}
window.setZoom(1)
