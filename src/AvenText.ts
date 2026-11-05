import { defineComponent, h, type PropType } from 'vue'

export type AvenTextType = 'title' | 'header1' | 'header2' | 'header3' | 'text' | 'quote' | 'caption'
export type AvenTextElement = keyof HTMLElementTagNameMap

const defaultElements: Record<AvenTextType, AvenTextElement> = {
  title: 'h1',
  header1: 'h1',
  header2: 'h2',
  header3: 'h3',
  text: 'p',
  quote: 'blockquote',
  caption: 'span',
}

/** A styled text role that renders as a semantic HTML element and accepts normal Vue slot content. */
export const AvenText = defineComponent({
  name: 'AvenText',
  props: {
    type: {
      type: String as PropType<AvenTextType>,
      default: 'text',
    },
    as: {
      type: String as PropType<AvenTextElement>,
      default: undefined,
    },
  },
  setup(props, { slots }) {
    return () => h(
      props.as ?? defaultElements[props.type],
      { class: ['aven-text', `aven-text--${props.type}`] },
      slots.default?.(),
    )
  },
})
