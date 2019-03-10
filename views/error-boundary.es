import React, { Component } from 'react'
import PropTypes from 'prop-types'

class ErrorBoundary extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
  }

  state = {
    hasError: false,
  }

  componentDidCatch() {
    this.setState({
      hasError: true,
    })
  }

  render() {
    const { children } = this.props
    const { hasError } = this.state

    if (hasError) {
      return <div>Something went wrong</div>
    }

    return <>{children}</>
  }
}

export default ErrorBoundary
