import * as electron from 'electron'

type Remote = typeof import('@electron/remote')

// A named export, not a default one: with a lone default export
// babel-plugin-add-module-exports rewrites this to `module.exports = remote`,
// and since @electron/remote is itself flagged `__esModule`, the importer's
// interop helper hands it back unwrapped and `.default` comes out undefined.
//
// `electron.remote` was dropped in Electron 14 and poi now ships @electron/remote,
// but older poi builds still expose the built-in one. Prefer whichever exists so
// the plugin keeps working on both.
const builtinRemote = (electron as unknown as { remote?: Remote }).remote

// eslint-disable-next-line @typescript-eslint/no-var-requires
export const remote: Remote = builtinRemote ?? require('@electron/remote')
