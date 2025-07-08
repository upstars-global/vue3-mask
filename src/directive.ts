import type { Directive, InputMask, MaskElement, MaskReplacers, PluginOptions } from './types'
// @ts-expect-error Could not find a declaration file for module
import conformToMask from 'text-mask-core/src/conformToMask'
import { queryInputElementInside, trigger } from './utils'
import { parseMask } from './utils/parseMask'
import { extendMaskReplacers } from './utils/extendMaskReplacers'
import createOptions from './createOptions'

const options = createOptions()

const triggerInputUpdate = (el: MaskElement) => {
  trigger(el, 'input')
}

const updateValue = (el: MaskElement) => {
  // @ts-expect-error Property `value` does not exist on type `HTMLElement`
  const { value } = el
  const { previousValue, mask } = options.get(el)

  const isValueChanged = value !== previousValue
  const isLengthIncreased = value.length > Number(previousValue?.length)
  const isUpdateNeeded = value && isValueChanged && isLengthIncreased

  if (isUpdateNeeded && mask) {
    const { conformedValue } = conformToMask(value, mask, { guide: false })
    // @ts-expect-error Property `value` does not exist on type `HTMLElement`
    el.value = conformedValue
    triggerInputUpdate(el)
  }

  options.partiallyUpdate(el, { previousValue: value })
}

const updateMask = (el: MaskElement, inputMask: InputMask, maskReplacers: MaskReplacers) => {
  const mask = parseMask(inputMask, maskReplacers, (el as HTMLInputElement).value)
  // @ts-expect-error Type `unknown` is not assignable to type `(string | RegExp)[] | undefined`
  options.partiallyUpdate(el, { mask })
}

export const createDirective = (directiveOptions: PluginOptions = {}): Directive<MaskElement> => {
  const instanceMaskReplacers = extendMaskReplacers(directiveOptions.placeholders)

  return {
    beforeMount(el, binding) {
      el = queryInputElementInside(el)
      updateMask(el, binding.value, instanceMaskReplacers)
      updateValue(el)
    },
    updated(el, binding) {
      el = queryInputElementInside(el)
      updateMask(el, binding.value, instanceMaskReplacers)
      updateValue(el)
    },
    unmounted(el) {
      el = queryInputElementInside(el)
      options.remove(el)
    }
  }
}

export default createDirective()
