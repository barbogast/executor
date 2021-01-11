function is_touch_device4() {
  if ('ontouchstart' in window || window.TouchEvent) return true

  // @ts-ignore
  if (window.DocumentTouch && document instanceof DocumentTouch) return true

  const prefixes = ['', '-webkit-', '-moz-', '-o-', '-ms-']
  const queries = prefixes.map((prefix) => `(${prefix}touch-enabled)`)

  return window.matchMedia(queries.join(',')).matches
}

console.log('a', is_touch_device4())
