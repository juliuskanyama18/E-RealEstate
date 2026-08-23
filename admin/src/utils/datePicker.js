// Opens a native <input type="date"> picker via a ref. Robust to mobile
// Safari, where showPicker() throws (NotAllowedError / not supported)
// instead of just being missing — `el.showPicker?.() || el.click()` never
// reaches the click() fallback in that case, since a thrown exception
// isn't a falsy return value, it aborts the whole expression. This works
// on desktop (where showPicker succeeds) and on mobile (where it falls
// through to a plain click, which still opens the native picker).
export const openDatePicker = (ref) => {
  const el = ref?.current;
  if (!el) return;
  if (typeof el.showPicker === 'function') {
    try {
      el.showPicker();
      return;
    } catch {
      // fall through to click()
    }
  }
  el.click();
};
