import type { MaskReplacers } from '../types'
import { defaultMaskReplacers, defaultMaskReplacersGlobal, NEXT_CHAR_OPTIONAL } from '../constants'
import { castToRegexp, makeRegexpOptional } from './regexp'

const maskToRegExpMask = (mask: Array<string | RegExp> | null, maskReplacers: MaskReplacers = defaultMaskReplacers) => {
  if (!mask) {
    return []
  }
  return mask
    .map((char, index, array) => {
      // @ts-expect-error Type `RegExp` cannot be used as an index type.
      const maskChar = maskReplacers[char] || char
      const previousChar = array[index - 1]
      // @ts-expect-error Type `RegExp` cannot be used as an index type.
      const previousMaskChar = maskReplacers[previousChar] || previousChar
      if (maskChar === NEXT_CHAR_OPTIONAL) {
        return null
      }
      if (maskChar && previousMaskChar === NEXT_CHAR_OPTIONAL) {
        return makeRegexpOptional(castToRegexp(maskChar as string | RegExp))
      }
      return maskChar
    })
    .filter(Boolean)
}

/**
 * Converts mask from `v-mask` string format to `text-mask-core` format
 */
export const stringMaskToRegExpMask = (stringMask: string, maskReplacers: MaskReplacers = defaultMaskReplacers) => {
  return maskToRegExpMask(stringMask.split(''), maskReplacers)
}

/**
 * Converts mask from `v-mask` array format to string format
 */
let dynamicMask = ''

export const arrayMaskDynamicTransformToString = (
  arrayMask: Array<string | RegExp>,
  maskReplacers: MaskReplacers = defaultMaskReplacers,
  inputValue: string
) => {
  const modifyValueToMask = inputValue
    .replace(defaultMaskReplacersGlobal['#'] as RegExp, '#')
    .replace(defaultMaskReplacersGlobal['A'] as RegExp, 'A')
    .replace(defaultMaskReplacersGlobal['s'] as RegExp, '')
    .split('')

  if (modifyValueToMask.length) {
    arrayMask.some(function (currentMask) {
      const modifyCurrentMask = String(currentMask).replace(defaultMaskReplacersGlobal['s'] as RegExp, '')

      const matchMaskFound = modifyValueToMask.every(function (val, index) {
        if (modifyCurrentMask[index] === val) {
          return true
        } else if ((val === '#' || val === 'A') && modifyCurrentMask[index] === 'N') {
          return true
        }
        return false
      })

      if (matchMaskFound) {
        dynamicMask = currentMask as string
        return true
      }

      return false
    })
  } else {
    dynamicMask = arrayMask[0] as string
  }

  return stringMaskToRegExpMask(dynamicMask, maskReplacers)
}
