path = require 'path-extra'
{React, ReactDOM, ReactBootstrap, FontAwesome} = window
remote = require 'remote'
windowManager = remote.require './lib/window'

i18n = new (require 'i18n-2')
  locales:['en-US', 'ja-JP', 'zh-CN', 'zh-TW'],
  defaultLocale: 'zh-CN',
  directory: path.join(__dirname, 'i18n'),
  updateFiles: false,
  indent: "\t",
  extension: '.json'
  devMode: false
i18n.setLocale(window.language)
__ = i18n.__.bind(i18n)

count = 0

module.exports =
  name: 'New-Window'
  priority: 100
  displayName: <span><FontAwesome name='sitemap' key={0} /> {__ 'Built-in browser'}</span>
  author: 'KochiyaOcean'
  link: 'https://github.com/kochiyaocean'
  version: '1.7.0'
  description: __ 'Open a new browser window'
  handleClick: ->
    newWindow = windowManager.createWindow
      # Use config
      realClose: true
      x: config.get 'poi.window.x', 0
      y: config.get 'poi.window.y', 0
      width: 1100
      height: 700
      'title-bar-style': 'hidden'
      indexName: "newWindow#{count}"
    count++
    if process.env.DEBUG?
      newWindow.openDevTools
        detach: true
    newWindow.reloadArea = 'inner-page webview'
    newWindow.loadURL "file://#{__dirname}/index.html"
    newWindow.show()
