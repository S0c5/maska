import mask from './mask'
import tokens from './tokens'
import { event, findInputElement, fixInputSelection, isString } from './utils'

export default class Maska {
  constructor (el, opts = {}) {
    if (!el) throw new Error('Maska: no element for mask')

    if (opts.tokens) {
      for (const i in opts.tokens) {
        opts.tokens[i] = { ...opts.tokens[i] }
        if (opts.tokens[i].pattern && isString(opts.tokens[i].pattern)) {
          opts.tokens[i].pattern = new RegExp(opts.tokens[i].pattern)
        }
      }
    }

    this._opts = {
      mask: opts.mask,
      tokens: { ...tokens, ...opts.tokens }
    }
    this._el = isString(el) ? document.querySelectorAll(el) : !el.length ? [el] : el

    this.init()
  }

  init () {
    for (let i = 0; i < this._el.length; i++) {
      const el = findInputElement(this._el[i])
      if (this._opts.mask && (!el.dataset.mask || el.dataset.mask !== this._opts.mask)) {
        el.dataset.mask = this._opts.mask
      }
      this.updateValue(el)
      if (!el.dataset.maskInited) {
        el.dataset.maskInited = true
        el.addEventListener('input', evt => this.updateValue(evt.target, evt))
        el.addEventListener('beforeinput', evt => this.beforeInput(evt))
      }
    }
  }

  destroy () {
    for (let i = 0; i < this._el.length; i++) {
      const el = findInputElement(this._el[i])
      el.removeEventListener('input', evt => this.updateValue(evt.target, evt))
      el.removeEventListener('beforeinput', evt => this.beforeInput(evt))
      delete el.dataset.mask
      delete el.dataset.maskInited
    }
  }

  updateValue (el, evt) {
    const wrongNum = el.type && el.type.match(/^number$/i) && el.validity.badInput
    const value = el.value || el.innerText || '' // in case of contenteditable

    if ((!value && !wrongNum) || !el.dataset.mask) {
      el.dataset.maskRawValue = ''
      this.dispatch('maska', el, evt)
      return
    }

    let position = el.selectionEnd;
    const oldValue = value
    const digit = oldValue[position - 1]

    el.dataset.maskRawValue = mask(value, el.dataset.mask, this._opts.tokens, false)
    const maskedValue = mask(value, el.dataset.mask, this._opts.tokens)
    if (el.value) el.value = maskedValue;
    if (el.innerText) el.innerText = maskedValue

    if (evt && evt.inputType === 'insertText' && position === oldValue.length || !position) {
      position = maskedValue.length
    }

    fixInputSelection(el, position, digit)

    this.dispatch('maska', el, evt)
    if (maskedValue !== oldValue) {
      this.dispatch('input', el, evt)
    }
  }

  beforeInput (e) {
    if (e.target.type && e.target.type.match(/^number$/i) && e.data && isNaN(e.target.value + e.data)) {
      e.preventDefault()
    }
  }

  dispatch (name, el, evt) {
    el.dispatchEvent(event(name, (evt && evt.inputType) || null))
  }
}
