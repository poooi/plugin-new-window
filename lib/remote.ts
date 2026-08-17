import * as electron from 'electron'

type Remote = typeof import('@electron/remote')

// `electron.remote` was dropped in Electron 14 and poi now ships @electron/remote,
// but older poi builds still expose the built-in one. Prefer whichever exists so
// the plugin keeps working on both.
const builtinRemote = (electron as unknown as { remote?: Remote }).remote

// eslint-disable-next-line @typescript-eslint/no-var-requires
const remote: Remote = builtinRemote ?? require('@electron/remote')

export default remote
