import type { InputMask, MaskReplacers } from '../types'
import { arrayMaskDynamicTransformToString, stringMaskToRegExpMask } from './maskToRegExpMask'
import { isFunction, isString } from './index'

export const parseMask = (
  inputMask: InputMask,
  maskReplacers: MaskReplacers,
  inputValue: string
): RegExp[] | unknown => {
  if (Array.isArray(inputMask) && inputMask.length) {
    return arrayMaskDynamicTransformToString(inputMask, maskReplacers, inputValue)
  }

  if (isFunction(inputMask)) {
    return inputMask
  }

  if (inputMask && isString(inputMask) && inputMask.length > 0) {
    return stringMaskToRegExpMask(inputMask as string, maskReplacers)
  }
  return inputMask
}
