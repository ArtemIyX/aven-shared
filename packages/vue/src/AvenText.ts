import { defineComponent, h, type PropType, type CSSProperties } from 'vue'
import type { AvenTone, AvenUi } from './types.js'
export type AvenTextType =
  'title' | 'header1' | 'header2' | 'header3' | 'text' | 'quote' | 'caption'
export type AvenTextElement = keyof HTMLElementTagNameMap
export type AvenTextProps = {
  type?: AvenTextType
  as?: AvenTextElement
  align?: 'start' | 'center' | 'end'
  tone?: AvenTone
  truncate?: boolean
  lineClamp?: number
  ui?: AvenUi<'root'>
}
const tags: Record<AvenTextType, AvenTextElement> = {
  title: 'h1',
  header1: 'h1',
  header2: 'h2',
  header3: 'h3',
  text: 'p',
  quote: 'blockquote',
  caption: 'span',
}
export const AvenText = defineComponent({
  name: 'AvenText',
  inheritAttrs: false,
  props: {
    type: { type: String as PropType<AvenTextType>, default: 'text' },
    as: { type: String as PropType<AvenTextElement> },
    align: { type: String as PropType<AvenTextProps['align']> },
    tone: { type: String as PropType<AvenTone> },
    truncate: Boolean,
    lineClamp: { type: Number, validator: (n: number) => n > 0 },
    ui: Object as PropType<AvenUi<'root'>>,
  },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        props.as ?? tags[props.type],
        {
          ...attrs,
          ...props.ui?.root?.attrs,
          class: [
            'aven-text',
            `aven-text--${props.type}`,
            props.align && `aven-text--${props.align}`,
            props.tone && `aven-text--${props.tone}`,
            { 'aven-text--truncate': props.truncate, 'aven-text--clamp': !!props.lineClamp },
            attrs.class,
            props.ui?.root?.class,
          ],
          style: [
            attrs.style,
            props.lineClamp
              ? ({ '--aven-text-line-clamp': props.lineClamp } as CSSProperties)
              : undefined,
            props.ui?.root?.style,
          ],
        },
        slots.default?.(),
      )
  },
})
