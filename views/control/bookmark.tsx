import {
  Button,
  ButtonGroup,
  Card,
  Classes,
  ControlGroup,
  FormGroup,
  InputGroup,
  Intent,
  Popover,
  Position,
  Tooltip,
} from '@blueprintjs/core'
import fs from 'fs-extra'
import { find, map } from 'lodash'
import path from 'path'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import FontAwesome from 'react-fontawesome'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import ErrorBoundary from '../error-boundary'
import { useWebviewRef } from '../webview-context'

interface Bookmark {
  name: string
  link: string
}

const DEFAULT_BOOKMARK_PATH = path.join(__dirname, '..', '..', 'bookmark.json')
const CUSTOM_BOOKMARK_PATH = path.join(window.APPDATA_PATH, 'new-window', 'bookmark.json')

let defaultBookmarks: Bookmark[] = []
try {
  defaultBookmarks = fs.readJSONSync(DEFAULT_BOOKMARK_PATH)
} catch {
  /** do nothing */
}

const Content = styled(Button)`
  justify-content: left;
`

const Remove = styled(Button)`
  flex: 0 !important;
`

const Container = styled(Card)`
  display: flex;
`

const Creator = styled.div`
  margin-left: 2em;
  width: 25em;
`

interface BookmarkItemProps {
  name: string
  onSelect: () => void
  onRemove?: () => void
  disabled?: boolean
}

const BookmarkItem: React.FC<BookmarkItemProps> = ({ name, onSelect, onRemove, disabled }) => {
  const [pending, setPending] = useState(false)

  return (
    <div>
      <ButtonGroup minimal fill>
        {pending ? (
          <>
            <Button intent={Intent.DANGER} onClick={onRemove}>
              <FontAwesome name="ban" />
            </Button>
            <Button intent={Intent.PRIMARY} onClick={() => setPending(false)}>
              <FontAwesome name="undo" />
            </Button>
          </>
        ) : (
          <>
            <Content onClick={onSelect} intent={Intent.PRIMARY}>
              {name}
            </Content>
            <Remove onClick={() => setPending(true)} intent={Intent.DANGER} disabled={disabled}>
              <FontAwesome name="ban" />
            </Remove>
          </>
        )}
      </ButtonGroup>
    </div>
  )
}

const BookmarkCard: React.FC = () => {
  const { t } = useTranslation('poi-plugin-new-window')
  const webview = useWebviewRef()

  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [bookmarkLink, setBookmarkLink] = useState(() => webview.current?.getURL() || '')
  const [bookmarkName, setBookmarkName] = useState(() => webview.current?.getTitle() || '')

  const isExist = Boolean(find(bookmarks, ({ name }) => name === bookmarkName))

  // the read below is asynchronous with respect to the first render, so hold the
  // writes back until it lands, otherwise mounting truncates the saved file
  const isLoaded = useRef(false)

  useEffect(() => {
    let customBookmarks: Bookmark[] = []
    try {
      customBookmarks = fs.readJSONSync(CUSTOM_BOOKMARK_PATH)
    } catch {
      /** do nothing */
    }
    isLoaded.current = true
    setBookmarks(customBookmarks)
  }, [])

  useEffect(() => {
    if (!isLoaded.current) {
      return
    }
    try {
      // outputJSONSync, not writeJSONSync: the containing directory may not exist yet
      fs.outputJSONSync(CUSTOM_BOOKMARK_PATH, bookmarks)
    } catch (e) {
      console.error(e)
    }
  }, [bookmarks])

  const handleRemove = useCallback((i: number) => {
    setBookmarks((prev) => prev.filter((_, index) => index !== i))
  }, [])

  const handleSelect = useCallback(
    (link: string) => () => {
      webview.current?.loadURL(link)
    },
    [webview],
  )

  const getLink = useCallback(() => {
    setBookmarkLink(webview.current?.getURL() || '')
  }, [webview])

  const getTitle = useCallback(() => {
    setBookmarkName(webview.current?.getTitle() || '')
  }, [webview])

  return (
    <ErrorBoundary>
      <Container>
        <div>
          {map(defaultBookmarks, ({ name, link }) => (
            <BookmarkItem onSelect={handleSelect(link)} name={name} key={name} disabled />
          ))}
          <hr />
          {map(bookmarks, ({ name, link }, i) => (
            <BookmarkItem
              onSelect={handleSelect(link)}
              name={name}
              key={name}
              onRemove={() => handleRemove(i)}
            />
          ))}
        </div>
        <Creator>
          <FormGroup label={t('Name')} helperText={isExist && t('name_exists')}>
            <ControlGroup fill>
              <InputGroup value={bookmarkName} onChange={(e) => setBookmarkName(e.target.value)} />
              <Button onClick={getTitle} className={Classes.FIXED}>
                <FontAwesome name="refresh" />
              </Button>
            </ControlGroup>
          </FormGroup>
          <FormGroup label={t('URL')}>
            <ControlGroup fill>
              <InputGroup value={bookmarkLink} onChange={(e) => setBookmarkLink(e.target.value)} />
              <Button onClick={getLink} className={Classes.FIXED}>
                <FontAwesome name="refresh" />
              </Button>
            </ControlGroup>
          </FormGroup>
          <Button
            disabled={!bookmarkName || !bookmarkLink || isExist}
            intent={Intent.PRIMARY}
            onClick={() =>
              setBookmarks((prev) => [...prev, { name: bookmarkName, link: bookmarkLink }])
            }
          >
            {t('Confirm')}
          </Button>
        </Creator>
      </Container>
    </ErrorBoundary>
  )
}

const BookmarkButton: React.FC = () => {
  const { t } = useTranslation('poi-plugin-new-window')

  return (
    <Popover hasBackdrop position={Position.TOP} content={<BookmarkCard />}>
      <Tooltip position={Position.TOP} content={t('Bookmarks')}>
        <Button>
          <FontAwesome name="bookmark-o" />
        </Button>
      </Tooltip>
    </Popover>
  )
}

export default BookmarkButton
