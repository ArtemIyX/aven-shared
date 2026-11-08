import {
  defineComponent,
  h,
  inject,
  provide,
  reactive,
  readonly,
  watch,
  type InjectionKey,
  type PropType,
} from 'vue'
export type AvenProviderConfig = {
  locale?: string
  dir?: 'ltr' | 'rtl'
  density?: 'compact' | 'comfortable' | 'spacious'
  defaultSize?: 'xs' | 'sm' | 'md' | 'lg'
  idPrefix?: string
  messages?: Partial<Record<'clear' | 'close' | 'loading' | 'noResults', string>>
  resolveIcon?: (name: string) => unknown
}
export const avenProviderKey: InjectionKey<Readonly<AvenProviderConfig>> = Symbol('aven-provider')
export type AvenIdFactory = (part: string) => string
export const avenIdFactoryKey: InjectionKey<AvenIdFactory> = Symbol('aven-id-factory')
export function useAvenConfig(): Readonly<AvenProviderConfig> {
  return inject(avenProviderKey, {})
}
export const AvenProvider = defineComponent({
  name: 'AvenProvider',
  inheritAttrs: false,
  props: { config: { type: Object as PropType<AvenProviderConfig>, default: () => ({}) } },
  setup(props, { slots, attrs }) {
    let sequence = 0
    const config = reactive<AvenProviderConfig>({ ...props.config })
    watch(
      () => props.config,
      (next) => {
        for (const key of Object.keys(config) as (keyof AvenProviderConfig)[]) {
          if (!(key in next)) delete config[key]
        }
        Object.assign(config, next)
      },
      { deep: true },
    )
    provide(avenProviderKey, readonly(config))
    provide(avenIdFactoryKey, (part) => `${props.config.idPrefix ?? 'aven'}-${part}-${++sequence}`)
    return () =>
      h(
        'div',
        {
          ...attrs,
          class: ['aven-provider', attrs.class],
          dir: attrs.dir ?? props.config.dir,
          lang: attrs.lang ?? props.config.locale,
        },
        slots.default?.(),
      )
  },
})
