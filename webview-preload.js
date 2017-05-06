const { remote, webFrame } = require('electron')
window.onclick = (e) => {
  remote.getCurrentWindow().webContents.executeJavaScript(`
    $('webview').blur()
    $('webview').focus()
  `)
}
window.setZoom = (zoom) => {
  webFrame.setZoomFactor(zoom)
  const zl = webFrame.getZoomLevel()
  webFrame.setLayoutZoomLevelLimits(zl, zl)
}
window.setZoom(1)
