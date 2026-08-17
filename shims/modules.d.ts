// Untyped runtime dependencies provided by poi.

declare module 'react-fontawesome' {
  import type { ComponentType, CSSProperties } from 'react'

  interface FontAwesomeProps {
    name: string
    className?: string
    style?: CSSProperties
    size?: 'lg' | '2x' | '3x' | '4x' | '5x'
    spin?: boolean
    pulse?: boolean
    fixedWidth?: boolean
    flip?: 'horizontal' | 'vertical'
    rotate?: 90 | 180 | 270
    border?: boolean
    inverse?: boolean
  }

  const FontAwesome: ComponentType<FontAwesomeProps>
  export default FontAwesome
}

declare module '@skagami/react-fontawesome/inject'

declare module 'json-format' {
  interface FormatOptions {
    type?: 'space' | 'tab'
    size?: number
  }

  const formatJson: (value: unknown, options?: FormatOptions) => string
  export default formatJson
}
