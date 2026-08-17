import type { ReactNode } from 'react'

import React, { Component } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

// React has no hook equivalent of componentDidCatch, so this one stays a class.
class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
  }

  componentDidCatch(error: Error) {
    console.error(error)
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
