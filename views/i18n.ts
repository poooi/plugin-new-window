import type { Resource } from 'i18next'

import fs from 'fs-extra'
import * as globModule from 'glob'
import { createInstance } from 'i18next'
import formatJson from 'json-format'
import { each, set } from 'lodash'
import path from 'path'
import { initReactI18next } from 'react-i18next'

export const NAMESPACE = 'poi-plugin-new-window'

const I18N_DIR = path.join(__dirname, '..', 'i18n')

// glob@7/8 export a callable with `.sync`, glob@9+ export a named `globSync`.
// Resolve at runtime so the plugin works whichever version poi provides.
/* eslint-disable @typescript-eslint/no-explicit-any */
const globAny = globModule as any
const globSync: (pattern: string) => string[] =
  globAny.globSync || globAny.sync || globAny.default?.globSync || globAny.default?.sync
/* eslint-enable @typescript-eslint/no-explicit-any */

// glob@9+ treats `\` as an escape character, so patterns must use `/` on every
// platform. glob@7 accepts `/` on Windows too.
const globPath = (...segments: string[]) => path.join(...segments).replace(/\\/g, '/')

const language = config.get('poi.misc.language', navigator.language)
window.language = language

const resources: Resource = {}

each(globSync(globPath(I18N_DIR, '*.json')), (file) => {
  try {
    set(resources, [path.basename(file, path.extname(file)), NAMESPACE], fs.readJSONSync(file))
  } catch (e) {
    console.error(e)
  }
})

const i18n = createInstance()

i18n.use(initReactI18next).init({
  lng: language,
  fallbackLng: false,
  resources,
  ns: [NAMESPACE],
  defaultNS: NAMESPACE,
  interpolation: {
    escapeValue: false,
  },
  returnObjects: true, // allow returning objects
  react: {
    useSuspense: false,
    nsMode: 'fallback',
  },
  saveMissing: false,
  missingKeyHandler: (lngs, ns, key, fallbackValue) => {
    if (ns !== NAMESPACE) {
      return
    }
    try {
      const target = path.join(I18N_DIR, `${lngs[0]}.json`)
      const contents = fs.readJSONSync(target)
      contents[key] = fallbackValue.startsWith(ns) ? fallbackValue.split(/:(.+)/)[1] : fallbackValue
      fs.writeFileSync(target, `${formatJson(contents, { type: 'space', size: 2 })}\n`)
    } catch (e) {
      console.error(e)
    }
  },
})

window.i18n = i18n
window.i18next = i18n

export default i18n
