import type { WebviewTag } from 'electron'
import type { RefObject } from 'react'

import { createContext, useContext } from 'react'

export type WebviewRef = RefObject<WebviewTag | null>

const WebviewContext = createContext<WebviewRef | null>(null)

/** The `<webview>` element hosting the game, shared by every control button. */
export const useWebviewRef = (): WebviewRef => {
  const ref = useContext(WebviewContext)
  if (!ref) {
    throw new Error('useWebviewRef must be used inside a WebviewContext.Provider')
  }
  return ref
}

export default WebviewContext
