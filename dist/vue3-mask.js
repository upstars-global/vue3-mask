(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Vue3Mask = {}));
})(this, (function (exports) { 'use strict';

  const placeholderChar = '_';
  const strFunction = 'function';

  const emptyArray$1 = [];
  function convertMaskToPlaceholder(mask = emptyArray$1, placeholderChar$1 = placeholderChar) {
    if (!isArray(mask)) {
      throw new Error('Text-mask:convertMaskToPlaceholder; The mask property must be an array.');
    }
    if (mask.indexOf(placeholderChar$1) !== -1) {
      throw new Error('Placeholder character must not be used as part of the mask. Please specify a character ' + 'that is not present in your mask as your placeholder character.\n\n' + `The placeholder character that was received is: ${JSON.stringify(placeholderChar$1)}\n\n` + `The mask that was received is: ${JSON.stringify(mask)}`);
    }
    return mask.map(char => {
      return char instanceof RegExp ? placeholderChar$1 : char;
    }).join('');
  }
  function isArray(value) {
    return Array.isArray && Array.isArray(value) || value instanceof Array;
  }
  const strCaretTrap = '[]';
  function processCaretTraps(mask) {
    const indexes = [];
    let indexOfCaretTrap;
    while (indexOfCaretTrap = mask.indexOf(strCaretTrap), indexOfCaretTrap !== -1) {
      indexes.push(indexOfCaretTrap);
      mask.splice(indexOfCaretTrap, 1);
    }
    return {
      maskWithoutCaretTraps: mask,
      indexes
    };
  }

  const emptyArray = [];
  const emptyString = '';
  function conformToMask(rawValue = emptyString, mask = emptyArray, config = {}) {
    if (!isArray(mask)) {
      if (typeof mask === strFunction) {
        mask = mask(rawValue, config);
        mask = processCaretTraps(mask).maskWithoutCaretTraps;
      } else {
        throw new Error('Text-mask:conformToMask; The mask property must be an array.');
      }
    }
    const {
      guide = true,
      previousConformedValue = emptyString,
      placeholderChar: placeholderChar$1 = placeholderChar,
      placeholder = convertMaskToPlaceholder(mask, placeholderChar$1),
      currentCaretPosition,
      keepCharPositions
    } = config;
    const suppressGuide = guide === false && previousConformedValue !== undefined;
    const rawValueLength = rawValue.length;
    const previousConformedValueLength = previousConformedValue.length;
    const placeholderLength = placeholder.length;
    const maskLength = mask.length;
    const editDistance = rawValueLength - previousConformedValueLength;
    const isAddition = editDistance > 0;
    const indexOfFirstChange = currentCaretPosition + (isAddition ? -editDistance : 0);
    const indexOfLastChange = indexOfFirstChange + Math.abs(editDistance);
    if (keepCharPositions === true && !isAddition) {
      let compensatingPlaceholderChars = emptyString;
      for (let i = indexOfFirstChange; i < indexOfLastChange; i++) {
        if (placeholder[i] === placeholderChar$1) {
          compensatingPlaceholderChars += placeholderChar$1;
        }
      }
      rawValue = rawValue.slice(0, indexOfFirstChange) + compensatingPlaceholderChars + rawValue.slice(indexOfFirstChange, rawValueLength);
    }
    const rawValueArr = rawValue.split(emptyString).map((char, i) => ({
      char,
      isNew: i >= indexOfFirstChange && i < indexOfLastChange
    }));
    for (let i = rawValueLength - 1; i >= 0; i--) {
      const {
        char
      } = rawValueArr[i];
      if (char !== placeholderChar$1) {
        const shouldOffset = i >= indexOfFirstChange && previousConformedValueLength === maskLength;
        if (char === placeholder[shouldOffset ? i - editDistance : i]) {
          rawValueArr.splice(i, 1);
        }
      }
    }
    let conformedValue = emptyString;
    let someCharsRejected = false;
    placeholderLoop: for (let i = 0; i < placeholderLength; i++) {
      const charInPlaceholder = placeholder[i];
      if (charInPlaceholder === placeholderChar$1) {
        if (rawValueArr.length > 0) {
          while (rawValueArr.length > 0) {
            const {
              char: rawValueChar,
              isNew
            } = rawValueArr.shift();
            if (rawValueChar === placeholderChar$1 && suppressGuide !== true) {
              conformedValue += placeholderChar$1;
              continue placeholderLoop;
            } else if (mask[i].test(rawValueChar)) {
              if (keepCharPositions !== true || isNew === false || previousConformedValue === emptyString || guide === false || !isAddition) {
                conformedValue += rawValueChar;
              } else {
                const rawValueArrLength = rawValueArr.length;
                let indexOfNextAvailablePlaceholderChar = null;
                for (let i = 0; i < rawValueArrLength; i++) {
                  const charData = rawValueArr[i];
                  if (charData.char !== placeholderChar$1 && charData.isNew === false) {
                    break;
                  }
                  if (charData.char === placeholderChar$1) {
                    indexOfNextAvailablePlaceholderChar = i;
                    break;
                  }
                }
                if (indexOfNextAvailablePlaceholderChar !== null) {
                  conformedValue += rawValueChar;
                  rawValueArr.splice(indexOfNextAvailablePlaceholderChar, 1);
                } else {
                  i--;
                }
              }
              continue placeholderLoop;
            } else {
              someCharsRejected = true;
            }
          }
        }
        if (suppressGuide === false) {
          conformedValue += placeholder.substr(i, placeholderLength);
        }
        break;
      } else {
        conformedValue += charInPlaceholder;
      }
    }
    if (suppressGuide && isAddition === false) {
      let indexOfLastFilledPlaceholderChar = null;
      for (let i = 0; i < conformedValue.length; i++) {
        if (placeholder[i] === placeholderChar$1) {
          indexOfLastFilledPlaceholderChar = i;
        }
      }
      if (indexOfLastFilledPlaceholderChar !== null) {
        conformedValue = conformedValue.substr(0, indexOfLastFilledPlaceholderChar + 1);
      } else {
        conformedValue = emptyString;
      }
    }
    return {
      conformedValue,
      meta: {
        someCharsRejected
      }
    };
  }

  /**
   * Notifies Vue about internal value change
   * @see https://github.com/vuejs/Discussion/issues/157#issuecomment-273301588
   */
  var trigger = function (el, type) {
      var event = new CustomEvent(type, { bubbles: true, cancelable: true });
      el.dispatchEvent(event);
  };
  /**
   * Extracts first input element inside given html element (if any)
   */
  var queryInputElementInside = function (el) {
      return el instanceof HTMLInputElement ? el : el.querySelector('input') || el;
  };
  /**
   * Determines whether the passed value is a function
   */
  var isFunction = function (val) { return typeof val === 'function'; };
  /**
   * Determines whether the passed value is a string
   */
  var isString = function (val) { return typeof val === 'string'; };

  /**
   * A special object to identify next character as optional
   * For example `?`
   */
  var NEXT_CHAR_OPTIONAL = {
      __nextCharOptional__: true
  };
  var defaultMaskReplacers = {
      '#': /\d/,
      A: /[a-z]/i,
      N: /[a-z0-9]/i,
      s: /\s+/,
      '?': NEXT_CHAR_OPTIONAL,
      X: /./
  };
  var defaultMaskReplacersGlobal = {
      '#': /\d/g,
      A: /[a-z]/gi,
      s: /\s+/g};

  /**
   * @example
   * '/abc/g' -> /abc/g
   */
  var stringToRegexp = function (str) {
      var lastSlash = str.lastIndexOf('/');
      return new RegExp(str.slice(1, lastSlash), str.slice(lastSlash + 1));
  };
  /**
   * Makes single-char regular express optional
   * @example
   * /\d/ -> /\d?/
   */
  var makeRegexpOptional = function (charRegexp) {
      return stringToRegexp(charRegexp.toString().replace(/.(\/)[gmiyus]{0,6}$/, function (match) { return match.replace('/', '?/'); }));
  };
  var escapeIfNeeded = function (char) { return ('[\\^$.|?*+()'.indexOf(char) > -1 ? "\\".concat(char) : char); };
  /**
   * Wraps static character to RegExp
   */
  var charRegexp = function (char) { return new RegExp("/[".concat(escapeIfNeeded(char), "]/")); };
  var castToRegexp = function (char) { return (char instanceof RegExp ? char : charRegexp(char)); };

  var maskToRegExpMask = function (mask, maskReplacers) {
      if (maskReplacers === void 0) { maskReplacers = defaultMaskReplacers; }
      if (!mask) {
          return [];
      }
      return mask
          .map(function (char, index, array) {
          // @ts-expect-error Type `RegExp` cannot be used as an index type.
          var maskChar = maskReplacers[char] || char;
          var previousChar = array[index - 1];
          // @ts-expect-error Type `RegExp` cannot be used as an index type.
          var previousMaskChar = maskReplacers[previousChar] || previousChar;
          if (maskChar === NEXT_CHAR_OPTIONAL) {
              return null;
          }
          if (maskChar && previousMaskChar === NEXT_CHAR_OPTIONAL) {
              return makeRegexpOptional(castToRegexp(maskChar));
          }
          return maskChar;
      })
          .filter(Boolean);
  };
  /**
   * Converts mask from `v-mask` string format to `text-mask-core` format
   */
  var stringMaskToRegExpMask = function (stringMask, maskReplacers) {
      if (maskReplacers === void 0) { maskReplacers = defaultMaskReplacers; }
      return maskToRegExpMask(stringMask.split(''), maskReplacers);
  };
  /**
   * Converts mask from `v-mask` array format to string format
   */
  var dynamicMask = '';
  var arrayMaskDynamicTransformToString = function (arrayMask, maskReplacers, inputValue) {
      if (maskReplacers === void 0) { maskReplacers = defaultMaskReplacers; }
      var modifyValueToMask = inputValue
          .replace(defaultMaskReplacersGlobal['#'], '#')
          .replace(defaultMaskReplacersGlobal['A'], 'A')
          .replace(defaultMaskReplacersGlobal['s'], '')
          .split('');
      if (modifyValueToMask.length) {
          arrayMask.some(function (currentMask) {
              var modifyCurrentMask = String(currentMask).replace(defaultMaskReplacersGlobal['s'], '');
              var matchMaskFound = modifyValueToMask.every(function (val, index) {
                  if (modifyCurrentMask[index] === val) {
                      return true;
                  }
                  else if ((val === '#' || val === 'A') && modifyCurrentMask[index] === 'N') {
                      return true;
                  }
                  return false;
              });
              if (matchMaskFound) {
                  dynamicMask = currentMask;
                  return true;
              }
              return false;
          });
      }
      else {
          dynamicMask = arrayMask[0];
      }
      return stringMaskToRegExpMask(dynamicMask, maskReplacers);
  };

  var parseMask = function (inputMask, maskReplacers, inputValue) {
      if (Array.isArray(inputMask) && inputMask.length) {
          return arrayMaskDynamicTransformToString(inputMask, maskReplacers, inputValue);
      }
      if (isFunction(inputMask)) {
          return inputMask;
      }
      if (inputMask && isString(inputMask) && inputMask.length > 0) {
          return stringMaskToRegExpMask(inputMask, maskReplacers);
      }
      return inputMask;
  };

  var __assign = function () {
    __assign = Object.assign || function __assign(t) {
      for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
      }
      return t;
    };
    return __assign.apply(this, arguments);
  };

  var extendMaskReplacers = function (maskReplacers, baseMaskReplacers) {
      if (baseMaskReplacers === void 0) { baseMaskReplacers = defaultMaskReplacers; }
      if (maskReplacers === null || Array.isArray(maskReplacers) || typeof maskReplacers !== 'object') {
          return baseMaskReplacers;
      }
      return Object.keys(maskReplacers).reduce(function (extendedMaskReplacers, key) {
          var _a;
          var value = maskReplacers[key];
          if (value !== null && !(value instanceof RegExp)) {
              return extendedMaskReplacers;
          }
          return __assign(__assign({}, extendedMaskReplacers), (_a = {}, _a[key] = value, _a));
      }, baseMaskReplacers);
  };

  function createOptions() {
      var elementOptions = new Map();
      var defaultOptions = { previousValue: '', mask: [] };
      var get = function (el) {
          return elementOptions.get(el) || __assign({}, defaultOptions);
      };
      var partiallyUpdate = function (el, newOptions) {
          elementOptions.set(el, __assign(__assign({}, get(el)), newOptions));
      };
      var remove = function (el) {
          elementOptions.delete(el);
      };
      return { get: get, remove: remove, partiallyUpdate: partiallyUpdate };
  }

  // @ts-expect-error Could not find a declaration file for module
  var options = createOptions();
  var triggerInputUpdate = function (el) {
      trigger(el, 'input');
  };
  var updateValue = function (el) {
      // @ts-expect-error Property `value` does not exist on type `HTMLElement`
      var value = el.value;
      var _a = options.get(el), previousValue = _a.previousValue, mask = _a.mask;
      var isValueChanged = value !== previousValue;
      var isLengthIncreased = value.length > Number(previousValue === null || previousValue === void 0 ? void 0 : previousValue.length);
      var isUpdateNeeded = value && isValueChanged && isLengthIncreased;
      if (isUpdateNeeded && mask) {
          var conformedValue = conformToMask(value, mask, { guide: false }).conformedValue;
          // @ts-expect-error Property `value` does not exist on type `HTMLElement`
          el.value = conformedValue;
          triggerInputUpdate(el);
      }
      options.partiallyUpdate(el, { previousValue: value });
  };
  var updateMask = function (el, inputMask, maskReplacers) {
      var mask = parseMask(inputMask, maskReplacers, el.value);
      // @ts-expect-error Type `unknown` is not assignable to type `(string | RegExp)[] | undefined`
      options.partiallyUpdate(el, { mask: mask });
  };
  var createDirective = function (directiveOptions) {
      if (directiveOptions === void 0) { directiveOptions = {}; }
      var instanceMaskReplacers = extendMaskReplacers(directiveOptions.placeholders);
      return {
          beforeMount: function (el, binding) {
              el = queryInputElementInside(el);
              updateMask(el, binding.value, instanceMaskReplacers);
              updateValue(el);
          },
          updated: function (el, binding) {
              el = queryInputElementInside(el);
              updateMask(el, binding.value, instanceMaskReplacers);
              updateValue(el);
          },
          unmounted: function (el) {
              el = queryInputElementInside(el);
              options.remove(el);
          }
      };
  };
  var directive = createDirective();

  var plugin = {
      install: function (app, options) {
          app.directive('mask', createDirective(options));
      }
  };

  exports.Vue3MaskDirective = directive;
  exports.Vue3MaskPlugin = plugin;
  exports.default = plugin;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
