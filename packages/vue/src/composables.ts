import { computed, getCurrentInstance, inject, ref, watch, type Ref } from 'vue'
import { avenIdFactoryKey, useAvenConfig } from './provider.js'
const appSequences = new WeakMap<object, number>()
let detachedSequence = 0
const overlayLayers: object[] = []
/** Register an open overlay so only the topmost one handles Escape/outside events. */
export function registerAvenOverlayLayer(layer: object): () => void {
  overlayLayers.push(layer)
  let active = true
  return () => {
    if (!active) return
    active = false
    const index = overlayLayers.lastIndexOf(layer)
    if (index >= 0) overlayLayers.splice(index, 1)
  }
}
export function isTopAvenOverlayLayer(layer: object): boolean {
  return overlayLayers[overlayLayers.length - 1] === layer
}
/** Creates a per-instance id; an explicit consumer id always takes precedence. */
export function useAvenId(explicit: string | undefined, part: string): string {
  if (explicit) return explicit
  const factory = inject(avenIdFactoryKey, undefined)
  const config = useAvenConfig()
  if (factory) return factory(part)
  const instance = getCurrentInstance()
  const appKey = instance?.root ?? instance?.appContext.app ?? instance?.appContext
  const sequence = appKey ? (appSequences.get(appKey) ?? 0) + 1 : ++detachedSequence
  if (appKey) appSequences.set(appKey, sequence)
  return `${config.idPrefix ?? 'aven'}-${part}-${sequence}`
}
export type AvenOpenReason = 'trigger' | 'select' | 'escape' | 'outside' | 'programmatic'
export type AvenOpenChange = { open: boolean; reason: AvenOpenReason }
export function useOpenState(options: {
  open?: Readonly<Ref<boolean | undefined>>
  defaultOpen?: boolean
  onUpdate?: (open: boolean) => void
  onChange?: (change: AvenOpenChange) => void
}) {
  const local = ref(options.defaultOpen ?? false)
  watch(options.open ?? ref(undefined), (value) => {
    if (value !== undefined) local.value = value
  })
  const isOpen = computed(() =>
    options.open?.value !== undefined ? options.open.value : local.value,
  )
  function setOpen(next: boolean, reason: AvenOpenReason = 'programmatic') {
    if (isOpen.value === next) return
    if (options.open?.value === undefined) local.value = next
    options.onUpdate?.(next)
    options.onChange?.({ open: next, reason })
  }
  return { open: isOpen, setOpen }
}
