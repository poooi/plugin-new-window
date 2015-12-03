i18n = require 'i18n'
path = require 'path-extra'
{__} = i18n
{React, ReactBootstrap, FontAwesome} = window
remote = require 'remote'
windowManager = remote.require './lib/window'

i18n.configure
  locales:['en-US', 'ja-JP', 'zh-CN']
  defaultLocale: 'zh-CN'
  directory: path.join(__dirname, "i18n")
  updateFiles: false
  indent: "\t"
  extension: '.json'
i18n.setLocale(window.language)

module.exports =
  name: 'New-Window'
  priority: 100
  displayName: <span><FontAwesome name='sitemap' key={0} /> {__ 'Built-in browser'}</span>
  author: 'KochiyaOcean'
  link: 'https://github.com/kochiyaocean'
  version: '1.6.1'
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
    if process.env.DEBUG?
      newWindow.openDevTools
        detach: true
    newWindow.reloadArea = 'inner-page webview'
    newWindow.loadUrl "file://#{__dirname}/index.html"
    newWindow.show()
