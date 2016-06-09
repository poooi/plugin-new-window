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

# Environment
require 'coffee-react/register'
require './views'

remote.getCurrentWebContents().on 'dom-ready', ->
  if process.platform == 'darwin'
    remote.getCurrentWebContents().executeJavaScript """
      var div = document.createElement("div");
      div.style.position = "absolute";
      div.style.top = 0;
      div.style.height = "23px";
      div.style.width = "100%";
      div.style["-webkit-app-region"] = "drag";
      div.style["pointer-events"] = "none";
      document.body.appendChild(div);
    """
