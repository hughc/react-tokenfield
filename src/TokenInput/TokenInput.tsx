import classes from './../styles.module.css'
import React, { useImperativeHandle, useRef } from 'react'

import { FocusRef } from '../TokenField/TokenField'
import Utils from '../Utils/Utils'
import { FocusMovement, TokenProps } from '../TokensReducer/TokensReducer'

export interface TokenAdditionalProps {
  index: number
  text: string
  selected: boolean
}

interface DelimiterActions {
  containDelimiter: (key: string) => boolean
  parseToken: (token: string) => string[]
}

const TokenInput = React.forwardRef<
  FocusRef,
  TokenProps & TokenAdditionalProps & DelimiterActions
>(
  (
    { index, text, updateToken, deleteToken, parseToken, containDelimiter },
    ref
  ): React.ReactElement => {
    const inputRef = useRef<HTMLInputElement | null>(null)
    const spanRef = useRef<HTMLSpanElement | null>(null)
    useImperativeHandle(ref, () => ({
      focus: () => focus()
    }))

    function focus() {
      inputRef.current!.focus()
    }

    function updateSpanText() {
      spanRef.current!.innerText = inputRef.current!.value || '_'
    }

    function keyDown(event: React.KeyboardEvent) {
      if (
        event.key === 'Enter' ||
        event.key === 'Tab' ||
        containDelimiter(event.key)
      ) {
        view('self')
        event.preventDefault()
        event.stopPropagation()
      } else if (event.key === 'Backspace' && !inputRef.current!.value) {
        deleteToken([index])
        event.preventDefault()
      } else if (
        event.key === 'ArrowLeft' &&
        Utils.inputCaretStart(inputRef.current)
      ) {
        view('back')
        event.preventDefault()
      } else if (
        event.key === 'ArrowRight' &&
        Utils.inputCaretEnd(inputRef.current)
      ) {
        view('next')
        event.preventDefault()
      }
    }

    function view(focus: FocusMovement) {
      applyToken(inputRef.current!.value, focus)
    }

    function applyToken(text: string, focus: FocusMovement) {
      if (text) {
        updateToken(index, parseToken(text), focus)
      } else {
        deleteToken([index])
      }
    }

    function onPaste() {
      setTimeout(() => {
        view('self')
      }, 0)
    }

    function onBlur() {
      const text: string = inputRef.current!.value
      setTimeout(() => {
        applyToken(text, 'self')
      }, 0)
    }
    return (
      <span className={classes.token}>
        <input
          className={classes.input}
          ref={inputRef}
          onPaste={() => onPaste()}
          onInput={(_) => updateSpanText()}
          onKeyDown={(e) => keyDown(e)}
          defaultValue={text}
          onBlur={() => onBlur()}
          type='text'
        />
        <span style={{ visibility: 'hidden' }} className={classes.tag}>
          <span className={classes.value} ref={spanRef}>
            {text}
          </span>
          <span
            onClick={() => deleteToken([index])}
            className={classes.remove}
          />
        </span>
      </span>
    )
  }
)

export default TokenInput
