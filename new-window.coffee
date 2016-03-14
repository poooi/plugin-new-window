path = require 'path-extra'

# Shortcuts and Components
window._ = require "underscore"
window.$ = (param) -> document.querySelector(param)
window.$$ = (param) -> document.querySelectorAll(param)
window.React = require "react"
window.ReactDOM = require "react-dom"
window.ReactBootstrap = require "react-bootstrap"
window.FontAwesome = require "react-fontawesome"

# Node modules
window.config = remote.require './lib/config'

# language setting
window.language = config.get 'poi.language', navigator.language

# Custom theme
require "#{ROOT}/views/env-parts/theme"


require 'coffee-react/register'
require './views'
