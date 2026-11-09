const DEFAULT_ROOT_FONT_SIZE = 16

/** Convert a numeric CSS pixel length to rems while preserving its rendered size. */
export function cssPixelsToRem(value: number): string {
  const rootFontSize =
    typeof document !== 'undefined' &&
    document.documentElement &&
    typeof getComputedStyle !== 'undefined'
      ? Number.parseFloat(getComputedStyle(document.documentElement).fontSize)
      : DEFAULT_ROOT_FONT_SIZE
  const divisor =
    Number.isFinite(rootFontSize) && rootFontSize > 0 ? rootFontSize : DEFAULT_ROOT_FONT_SIZE

  return value === 0 ? '0' : `${value / divisor}rem`
}
