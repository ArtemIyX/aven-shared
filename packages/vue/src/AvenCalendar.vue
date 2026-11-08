<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import {
  dateOnlyWeekday,
  daysInMonth,
  parseDateOnly,
  shiftMonth,
  toDateOnly,
  type DateOnly,
} from './dateOnly.js'
import type { AvenUi } from './types.js'
const props = withDefaults(
  defineProps<{
    year: number
    month: number
    modelValue?: DateOnly | null
    rangeEnd?: DateOnly | null
    today?: DateOnly
    locale?: string
    weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
    min?: DateOnly
    max?: DateOnly
    disabledDate?: (date: DateOnly) => boolean
    range?: boolean
    unstyled?: boolean
    ui?: AvenUi<'root' | 'grid' | 'day' | 'selected' | 'range'>
  }>(),
  { locale: 'en', weekStartsOn: 0, range: false, unstyled: false },
)
const emit = defineEmits<{
  select: [value: DateOnly]
  moveMonth: [value: { year: number; month: number }]
  keyMove: [value: DateOnly]
}>()
const activeDate = ref<DateOnly | undefined>(props.modelValue ?? props.rangeEnd ?? props.today)
const dateButtons = new Map<DateOnly, HTMLButtonElement>()
const calendarRoot = ref<HTMLElement>()
watch(
  () => [props.modelValue, props.rangeEnd, props.today],
  ([selected, rangeEnd, today]) => {
    activeDate.value = selected ?? rangeEnd ?? today ?? undefined
  },
  { immediate: true },
)
const monthLabel = computed(() => {
  const date = new Date(0)
  date.setUTCFullYear(props.year, props.month - 1, 1)
  date.setUTCHours(12, 0, 0, 0)
  return new Intl.DateTimeFormat(props.locale, {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
})
const weekdays = computed(() => {
  const labels = Array.from({ length: 7 }, (_, i) =>
    new Intl.DateTimeFormat(props.locale, { weekday: 'short', timeZone: 'UTC' }).format(
      new Date(Date.UTC(2023, 0, 1 + i, 12)),
    ),
  )
  return labels.slice(props.weekStartsOn).concat(labels.slice(0, props.weekStartsOn))
})
const fullDateFormatter = computed(
  () => new Intl.DateTimeFormat(props.locale, { dateStyle: 'full', timeZone: 'UTC' }),
)
function dateLabel(value: DateOnly) {
  const parts = parseDateOnly(value)!
  const date = new Date(0)
  date.setUTCFullYear(parts.year, parts.month - 1, parts.day)
  date.setUTCHours(12, 0, 0, 0)
  return fullDateFormatter.value.format(date)
}
const days = computed(() => {
  const first = toDateOnly(props.year, props.month, 1),
    offset = (dateOnlyWeekday(first) - props.weekStartsOn + 7) % 7
  const count = daysInMonth(props.year, props.month),
    rows = Math.ceil((offset + count) / 7) * 7
  return Array.from({ length: rows }, (_, i) => {
    const d = i - offset + 1,
      month = shiftMonth(props.year, props.month, d < 1 ? -1 : d > count ? 1 : 0)
    return d < 1
      ? toDateOnly(month.year, month.month, daysInMonth(month.year, month.month) + d)
      : toDateOnly(month.year, month.month, d > count ? d - count : d)
  })
})
const weeks = computed(() =>
  Array.from({ length: days.value.length / 7 }, (_, index) =>
    days.value.slice(index * 7, index * 7 + 7),
  ),
)
const focusTarget = computed(() => {
  const candidates = [activeDate.value, props.modelValue ?? undefined, props.today, ...days.value]
  return candidates.find((date) => date && days.value.includes(date) && !disabled(date))
})
function disabled(date: DateOnly) {
  return (
    (!!props.min && date < props.min) ||
    (!!props.max && date > props.max) ||
    !!props.disabledDate?.(date)
  )
}
function changeMonth(delta: number) {
  emit('moveMonth', shiftMonth(props.year, props.month, delta))
}
function setButton(date: DateOnly, element: Element | null) {
  if (element && typeof (element as HTMLButtonElement).focus === 'function')
    dateButtons.set(date, element as HTMLButtonElement)
  else dateButtons.delete(date)
}
function focusDate(date: DateOnly) {
  if (disabled(date)) return
  activeDate.value = date
  const p = parseDateOnly(date)!
  if (p.year !== props.year || p.month !== props.month)
    emit('moveMonth', { year: p.year, month: p.month })
  emit('keyMove', date)
  nextTick(() => dateButtons.get(date)?.focus())
}
function onKey(event: KeyboardEvent, date: DateOnly) {
  const horizontalDirection =
    calendarRoot.value &&
    typeof getComputedStyle !== 'undefined' &&
    getComputedStyle(calendarRoot.value).direction === 'rtl'
      ? -1
      : 1
  const amount =
    event.key === 'ArrowRight'
      ? horizontalDirection
      : event.key === 'ArrowLeft'
        ? -horizontalDirection
        : event.key === 'ArrowDown'
          ? 7
          : event.key === 'ArrowUp'
            ? -7
            : 0
  if (amount) {
    event.preventDefault()
    const p = parseDateOnly(date)!
    const d = new Date(0)
    d.setFullYear(p.year, p.month - 1, p.day + amount)
    d.setHours(12)
    focusDate(toDateOnly(d.getFullYear(), d.getMonth() + 1, d.getDate()))
  } else if (event.key === 'Home' || event.key === 'End') {
    event.preventDefault()
    const weekday = (dateOnlyWeekday(date) - props.weekStartsOn + 7) % 7
    const p = parseDateOnly(date)!
    const d = new Date(0)
    d.setFullYear(p.year, p.month - 1, p.day + (event.key === 'Home' ? -weekday : 6 - weekday))
    d.setHours(12)
    focusDate(toDateOnly(d.getFullYear(), d.getMonth() + 1, d.getDate()))
  } else if (event.key === 'PageUp' || event.key === 'PageDown') {
    event.preventDefault()
    const delta = (event.key === 'PageUp' ? -1 : 1) * (event.shiftKey ? 12 : 1)
    const next = shiftMonth(props.year, props.month, delta)
    const day = Math.min(parseDateOnly(date)?.day ?? 1, daysInMonth(next.year, next.month))
    focusDate(toDateOnly(next.year, next.month, day))
  }
}
</script>
<template>
  <section
    ref="calendarRoot"
    v-bind="ui?.root?.attrs"
    :class="['aven-calendar', { 'is-unstyled': unstyled }, ui?.root?.class]"
    :style="ui?.root?.style"
    :aria-label="monthLabel"
  >
    <header class="calendar-header">
      <button type="button" aria-label="Previous month" @click="changeMonth(-1)">‹</button
      ><strong aria-live="polite">{{ monthLabel }}</strong
      ><button type="button" aria-label="Next month" @click="changeMonth(1)">›</button>
    </header>
    <div
      v-bind="ui?.grid?.attrs"
      role="grid"
      :class="ui?.grid?.class"
      :style="ui?.grid?.style"
      :aria-label="monthLabel"
    >
      <div role="row" class="calendar-row">
        <span v-for="(label, index) in weekdays" :key="index" role="columnheader" class="weekday"
          ><slot name="weekday" :label="label" :index="index">{{ label }}</slot></span
        >
      </div>
      <div v-for="(week, weekIndex) in weeks" :key="weekIndex" role="row" class="calendar-row">
        <button
          v-bind="ui?.day?.attrs"
          v-for="(date, index) in week"
          :key="date"
          :ref="(element) => setButton(date, element as Element | null)"
          type="button"
          role="gridcell"
          :aria-label="dateLabel(date)"
          :tabindex="date === focusTarget ? 0 : -1"
          :aria-selected="date === modelValue || date === rangeEnd || undefined"
          :aria-current="date === today ? 'date' : undefined"
          :aria-disabled="disabled(date) || undefined"
          :disabled="disabled(date)"
          :class="[
            'calendar-day',
            ui?.day?.class,
            {
              outside:
                date.slice(0, 7) !==
                `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}`,
              selected: date === modelValue || date === rangeEnd,
              inRange: rangeEnd && modelValue && date > modelValue && date < rangeEnd,
            },
          ]"
          :style="ui?.day?.style"
          @keydown="onKey($event, date)"
          @focus="activeDate = date"
          @click="emit('select', date)"
        >
          <slot
            name="day"
            :date="date"
            :selected="date === modelValue || date === rangeEnd"
            :today="date === today"
            :disabled="disabled(date)"
            :in-range="!!(rangeEnd && modelValue && date > modelValue && date < rangeEnd)"
            >{{ parseDateOnly(date)?.day }}</slot
          >
        </button>
      </div>
    </div>
  </section>
</template>
<style scoped>
.aven-calendar {
  inline-size: min(20rem, calc(100vw - 2rem));
  padding: var(--aven-space-3);
  border: 1px solid var(--aven-color-border-subtle);
  border-radius: var(--aven-radius-md);
  background: var(--aven-color-surface-raised);
  color: var(--aven-color-text-primary);
}
.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--aven-space-2);
  margin-block-end: var(--aven-space-2);
}
.calendar-header button,
.calendar-day {
  min-inline-size: 2.5rem;
  min-block-size: 2.5rem;
  border: 0;
  border-radius: var(--aven-radius-sm);
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;
}
.calendar-header button:hover,
.calendar-day:hover:not(:disabled) {
  background: var(--aven-color-surface-hover);
}
[role='grid'] {
  display: grid;
  gap: 2px;
}
.calendar-row {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 2px;
}
.weekday {
  text-align: center;
  padding-block: var(--aven-space-1);
  color: var(--aven-color-text-secondary);
  font-size: 0.8rem;
}
.calendar-day {
  inline-size: 100%;
  padding: 0;
}
.calendar-day.outside {
  color: var(--aven-color-text-tertiary);
}
.calendar-day.selected {
  background: var(--aven-color-action-primary);
  color: var(--aven-color-text-on-action);
  font-weight: 600;
}
.calendar-day.inRange {
  border-radius: 0;
  background: var(--aven-color-action-subtle);
  color: var(--aven-color-text-primary);
}
.calendar-day:disabled {
  color: var(--aven-color-text-disabled);
  cursor: not-allowed;
}
.calendar-day:focus-visible,
.calendar-header button:focus-visible {
  outline: 2px solid var(--aven-color-focus-ring);
  outline-offset: 1px;
}
.is-unstyled {
  border: 0;
  padding: 0;
}
@media (forced-colors: active) {
  .calendar-day.selected {
    outline: 2px solid Highlight;
  }
  .calendar-day.inRange {
    border-block: 1px solid CanvasText;
  }
}
@media print {
  .calendar-header button {
    display: none;
  }
}
</style>
