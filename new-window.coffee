path = require 'path-extra'

# Shortcuts and Components
window._ = require 'underscore'
window.$ = (param) -> document.querySelector(param)
window.$$ = (param) -> document.querySelectorAll(param)
window.React = require 'react'
window.ReactBootstrap = require 'react-bootstrap'
window.FontAwesome = require 'react-fontawesome'

# Node modules
window.config = remote.require './lib/config'

# language setting
window.language = config.get 'poi.language', navigator.language

# Custom theme
window.theme = config.get 'poi.theme', '__default__'
if theme == '__default__'
  $('#bootstrap-css')?.setAttribute 'href', "file://#{ROOT}/components/bootstrap/dist/css/bootstrap.css"
else
  $('#bootstrap-css')?.setAttribute 'href', "file://#{ROOT}/assets/themes/#{theme}/css/#{theme}.css"
window.addEventListener 'theme.change', (e) ->
  window.theme = e.detail.theme
  if theme == '__default__'
    $('#bootstrap-css')?.setAttribute 'href', "file://#{ROOT}/components/bootstrap/dist/css/bootstrap.css"
  else
    $('#bootstrap-css')?.setAttribute 'href', "file://#{ROOT}/assets/themes/#{theme}/css/#{theme}.css"


require 'coffee-react/register'
require './views'
