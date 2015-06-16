{$, $$, _, React, ReactBootstrap, FontAwesome, ROOT} = window
{Panel, Button, Input, Col, Grid, Row, Table} = ReactBootstrap
Divider = require './divider'
path = require 'path-extra'
fs = require "fs-extra"
NavigatorBar = require './navigator-bar'
WebArea = React.createClass
  render: ->
    $('inner-page')?.style?.height = "#{window.innerHeight - 70}px"
    $('inner-page webview')?.style?.height = $('inner-page webview /deep/ object[is=browserplugin]')?.style?.height = "#{window.innerHeight - 70}px"
    <form id="nav-area">
      <div className="form-group" id='navigator-bar'>
        <h5>   </h5>
        <NavigatorBar />
      </div>
    </form>
React.render <WebArea />, $('web-area')
