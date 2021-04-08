/* global HTMLInputElement */

function event (name, inputType = null) {
  const event = document.createEvent('Event')
  event.initEvent(name, true, true)
  if (inputType) {
    event.inputType = inputType
  }

  return event
}

function findInputElement (el) {
  return (el instanceof HTMLInputElement) ? el : el.querySelector('input') || el
}

function fixInputSelection (el, position, digit) {
  const value = el.value || el.innerText || ''

  while (position && position < value.length && value.charAt(position - 1) !== digit) {
    position++
  }

  const selectionRange = el.type ? el.type.match(/^(text|search|password|tel|url)$/i) : !!el.type

  if (selectionRange && el === document.activeElement) {
    el.setSelectionRange(position, position)
    setTimeout(function () {
      el.setSelectionRange(position, position)
    }, 0)
  } else if (!el.value && el.innerText) {
    el.focus()  
    let sel;
    if (document.selection) {
      sel = document.selection.createRange();
      sel.moveStart('character', position);
      sel.select();
    }
    else {
      sel = window.getSelection();
      sel.collapse(el.lastChild, position);
    }
  }
}

function isString (val) {
  return Object.prototype.toString.call(val) === '[object String]'
}

export {
  event,
  findInputElement,
  fixInputSelection,
  isString
}
