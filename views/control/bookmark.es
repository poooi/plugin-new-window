import React, { useCallback, useContext, useState, useEffect } from 'react'
import {
  Tooltip,
  Button,
  Position,
  Popover,
  Card,
  FormGroup,
  ControlGroup,
  Intent,
  ButtonGroup,
  InputGroup,
  Classes,
} from '@blueprintjs/core'
import FontAwesome from 'react-fontawesome'
import { translate } from 'react-i18next'
import styled from 'styled-components'
import { map, find } from 'lodash'
import fs from 'fs-extra'
import path from 'path'

import WebviewContext from '../webview-context'
import ErrorBoundary from '../error-boundary'

const DEFAULT_BOOKMARK_PATH = path.resolve(__dirname, '../../bookmark.json')
const CUSTOM_BOOKMARK_PATH = path.join(window.APPDATA_PATH, 'new-window', 'bookmark.json')

let defaultBookmarks = []
try {
  defaultBookmarks = fs.readJSONSync(DEFAULT_BOOKMARK_PATH)
} catch (e) {
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

const BookmarkItem = ({ name, link, onSelect, onRemove, disabled }) => { // eslint-disable-line
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

const BookmarkCard = translate('poi-plugin-new-window')(({ t }) => {
  const webview = useContext(WebviewContext)

  const [bookmarks, setBookmarks] = useState([])

  const [bookmarkLink, setBookmarkLink] = useState(webview?.current?.getURL() || '')
  const [bookmarkName, setBookmarkName] = useState(webview?.current?.getTitle() || '')

  const isExist = find(bookmarks, ({ name }) => name === bookmarkName)

  useEffect(() => {
    let customBookmarks = []
    try {
      customBookmarks = fs.readJsonSync(CUSTOM_BOOKMARK_PATH)
    } catch (e) {
      /** do nothing */
    }
    setBookmarks(customBookmarks)
  }, [])

  useEffect(() => {
    console.log('Writing bookmarks') // eslint-disable-line no-console
    try {
      fs.writeJsonSync(CUSTOM_BOOKMARK_PATH, bookmarks)
    } catch (e) {
      /** do nothing */
    }
  }, [bookmarks])

  const handleRemove = i => {
    const copy = bookmarks.slice()
    copy.splice(i, 1)
    setBookmarks(copy)
  }

  const getLink = useCallback(() => {
    setBookmarkLink(webview.current?.getURL())
  }, [webview])

  const getTitle = useCallback(() => {
    setBookmarkName(webview.current?.getTitle())
  }, [webview])

  return (
    <ErrorBoundary>
      <Container>
        <div>
          {map(defaultBookmarks, ({ name, link }) => (
            <BookmarkItem
              onSelect={() => webview.current.loadURL?.(link)}
              name={name}
              link={link}
              key={name}
              disabled
            />
          ))}
          <hr />
          {!!bookmarks.length &&
            map(bookmarks, ({ name, link }, i) => (
              <BookmarkItem
                onSelect={() => webview.current.loadURL?.(link)}
                name={name}
                link={link}
                key={name}
                onRemove={() => handleRemove(i)}
              />
            ))}
        </div>
        <Creator>
          <FormGroup label={t('Name')} helperText={isExist && t('name_exists')}>
            <ControlGroup fill>
              <InputGroup value={bookmarkName} onChange={e => setBookmarkName(e.target.value)} />
              <Button onClick={getTitle} className={Classes.FIXED}>
                <FontAwesome name="refresh" />
              </Button>
            </ControlGroup>
          </FormGroup>
          <FormGroup label={t('URL')}>
            <ControlGroup fill>
              <InputGroup value={bookmarkLink} onChange={e => setBookmarkLink(e.target.value)} />
              <Button onClick={getLink} className={Classes.FIXED}>
                <FontAwesome name="refresh" />
              </Button>
            </ControlGroup>
          </FormGroup>
          <Button
            disabled={!bookmarkName || !bookmarkLink || isExist}
            intent={Intent.PRIMARY}
            onClick={() => {
              setBookmarks([...bookmarks, { name: bookmarkName, link: bookmarkLink }])
            }}
          >
            {t('Confirm')}
          </Button>
        </Creator>
      </Container>
    </ErrorBoundary>
  )
})

const BookmarkButton = translate('poi-plugin-new-window')(({ t }) => (
  <Popover hasBackdrop position={Position.TOP}>
    <Tooltip position={Position.TOP} content={t('Bookmarks')}>
      <Button>
        <FontAwesome name="bookmark-o" />
      </Button>
    </Tooltip>
    <BookmarkCard />
  </Popover>
))

export default BookmarkButton
