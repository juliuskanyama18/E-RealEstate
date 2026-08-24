import { forwardRef, useRef } from 'react';

// Strips everything but digits and a single decimal point, and drops
// leading zeros (keeping a lone "0" so the user can still type "0.5").
const cleanNumeric = (str) => {
  let s = String(str ?? '').replace(/[^\d.]/g, '');
  const firstDot = s.indexOf('.');
  if (firstDot !== -1) {
    s = s.slice(0, firstDot + 1) + s.slice(firstDot + 1).replace(/\./g, '');
  }
  s = s.replace(/^0+(?=\d)/, '');
  return s;
};

const formatWithCommas = (raw) => {
  if (raw === '' || raw === undefined || raw === null) return '';
  const [intPart, decPart] = String(raw).split('.');
  const withCommas = (intPart || '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return decPart !== undefined ? `${withCommas}.${decPart}` : withCommas;
};

/**
 * Drop-in replacement for <input type="number"> on money fields: displays
 * the value with thousand-separator commas (e.g. "1,250,000") as the user
 * types, while onChange reports the raw unformatted digit string — the
 * same string shape callers already got from a number input's
 * e.target.value, so existing setState(value) handlers work unchanged.
 */
const MoneyInput = forwardRef(({ value, onChange, ...rest }, forwardedRef) => {
  const innerRef = useRef(null);
  const setRef = (node) => {
    innerRef.current = node;
    if (typeof forwardedRef === 'function') forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
  };

  const handleChange = (e) => {
    const input = e.target;
    const selectionStart = input.selectionStart ?? input.value.length;
    const digitsBeforeCursor = input.value.slice(0, selectionStart).replace(/[^\d.]/g, '').length;

    const cleanValue = cleanNumeric(input.value);
    onChange(cleanValue);

    const newFormatted = formatWithCommas(cleanValue);
    requestAnimationFrame(() => {
      if (!innerRef.current) return;
      let pos = 0, digitCount = 0;
      while (pos < newFormatted.length && digitCount < digitsBeforeCursor) {
        if (/[\d.]/.test(newFormatted[pos])) digitCount++;
        pos++;
      }
      innerRef.current.setSelectionRange(pos, pos);
    });
  };

  return (
    <input
      ref={setRef}
      type="text"
      inputMode="decimal"
      autoComplete="off"
      value={formatWithCommas(value)}
      onChange={handleChange}
      {...rest}
    />
  );
});

MoneyInput.displayName = 'MoneyInput';

export default MoneyInput;
