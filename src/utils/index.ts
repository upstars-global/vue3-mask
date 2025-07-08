import type { MaskElement } from '../types'

/**
 * Notifies Vue about internal value change
 * @see https://github.com/vuejs/Discussion/issues/157#issuecomment-273301588
 */
export const trigger = (el: MaskElement, type: string) => {
  const event = new CustomEvent(type, { bubbles: true, cancelable: true })
  el.dispatchEvent(event)
}

/**
 * Extracts first input element inside given html element (if any)
 */
export const queryInputElementInside = (el: MaskElement): MaskElement =>
  el instanceof HTMLInputElement ? el : el.querySelector('input') || el

/**
 * Determines whether the passed value is a function
 */
export const isFunction = (val: unknown) => typeof val === 'function'

/**
 * Determines whether the passed value is a string
 */
export const isString = (val: unknown) => typeof val === 'string'

/**
 * Determines whether the passed value is a string
 */
export const isRegexp = (val: unknown) => val instanceof RegExp
