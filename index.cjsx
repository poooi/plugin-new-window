module.exports =
  windowURL: "file://#{__dirname}/index.html"
  windowOptions:
    x: config.get 'poi.window.x', 0
    y: config.get 'poi.window.y', 0
    width: 1100
    height: 700
    'title-bar-style': 'hidden'
  realClose: true
  multiWindow: true
