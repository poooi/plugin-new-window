// Globals injected by poi (lib/config, views/env-parts/*) and by new-window.ts.
// Kept in a .d.ts so poi-util-transpile skips it (defaultExclude is **/*.d.ts).

interface IConfig {
  get: <T>(path: string, defaultValue?: T) => T
  set: (path: string, value?: unknown) => void
}

interface PoiWindowOptions {
  realClose?: boolean
  navigatable?: boolean
  webPreferences?: Record<string, unknown>
  [key: string]: unknown
}

interface PoiWindowManager {
  createWindow: (options: PoiWindowOptions) => import('electron').BrowserWindow
  closeWindow: (win: import('electron').BrowserWindow) => void
}

/** poi tags the window it wants reloaded when the user hits the reload shortcut. */
type PoiBrowserWindow = import('electron').BrowserWindow & { reloadArea?: string }

interface Window {
  ROOT: string
  APPDATA_PATH: string
  config: IConfig
  language: string
  i18n: import('i18next').i18n
  i18next: import('i18next').i18n
  WindowManager: PoiWindowManager
  $: <E extends Element = HTMLElement>(selector: string) => E | null
  $$: <E extends Element = HTMLElement>(selector: string) => NodeListOf<E>
  /** defined by webview-preload.js, inside the webview only */
  setZoom: (zoom: number) => void
}

declare const config: IConfig
declare function $<E extends Element = HTMLElement>(selector: string): E | null
declare function $$<E extends Element = HTMLElement>(selector: string): NodeListOf<E>

type WebviewHTMLProps = Omit<
  React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>,
  'ref'
> & {
  ref?: React.Ref<import('electron').WebviewTag>
  src?: string
  preload?: string
  useragent?: string
  partition?: string
  plugins?: boolean
  allowpopups?: boolean
  disablewebsecurity?: boolean
  nodeintegration?: boolean
}

declare namespace JSX {
  interface IntrinsicElements {
    webview: WebviewHTMLProps
  }
}
