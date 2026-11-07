<script setup lang="ts">
import { computed, ref } from 'vue'
import ColorGallery from './ColorGallery.vue'
import {
  AvenAccordion,
  AvenActionBar,
  AvenAppShell,
  AvenStepper,
  AvenSplitPane,
  AvenList,
  AvenListItem,
  AvenVirtualList,
  AvenTable,
  AvenDataTable,
  AvenTimeline,
  AvenActivityList,
  AvenSwitcher,
  AvenViewSwitcher,
  AvenFileInput,
  AvenDropzone,
  AvenColorPicker,
  AvenDatePicker,
  AvenDateRangePicker,
  AvenTimePicker,
  AvenBadge,
  AvenButton,
  AvenButtonGroup,
  AvenAvatar,
  AvenAvatarGroup,
  AvenChip,
  AvenIconButton,
  AvenIcon,
  AvenLink,
  AvenKbd,
  AvenSeparator,
  AvenTag,
  AvenListbox,
  AvenSlider,
  AvenRangeSlider,
  AvenCombobox,
  AvenMultiSelect,
  AvenContextMenu,
  AvenMenu,
  AvenMenubar,
  AvenAlertDialog,
  AvenAlert,
  AvenBanner,
  AvenCommandPalette,
  AvenDrawer,
  AvenSheet,
  AvenCollapsible,
  AvenContainer,
  AvenFormattedValue,
  AvenField,
  AvenFieldset,
  AvenForm,
  AvenFormActions,
  AvenEmptyState,
  AvenGrid,
  AvenInline,
  AvenPanel,
  AvenCard,
  AvenPropertyRow,
  AvenCodeBlock,
  AvenPasswordField,
  AvenRadio,
  AvenRadioGroup,
  AvenResultState,
  AvenScrollArea,
  AvenSearchField,
  AvenStatusDot,
  AvenStack,
  AvenStat,
  AvenSplitButton,
  AvenText,
  AvenToast,
  AvenToaster,
  AvenTextarea,
  AvenToggleButton,
  AvenToggleGroup,
  AvenToolbar,
  type AvenToastItem,
  type AvenTableColumn,
  type AvenDateOnly,
} from '@wellsaik/aven-vue'

const userName = ref('Avery')
const sampleCode = 'const answer = 42\nconsole.log(answer)'
const searchQuery = ref('')
const contactEmail = ref('')
const lastSearch = ref('')
const billingPeriod = ref('monthly')
const emailUpdates = ref(true)
const quietMode = ref(false)
const textFormat = ref<string[]>(['bold'])
const listboxValue = ref<string | null>('design')
const highlightedTeam = ref('')
const volume = ref(42)
const priceRange = ref<[number, number]>([20, 80])
const selectedTeam = ref<string | null>('design')
const selectedTopics = ref<string[]>(['vue'])
const teamQuery = ref('')
const remoteLoading = ref(false)
const menuAction = ref('')
const menuPinned = ref(false)
const menuSort = ref<string | number>('name')
const menuCommands = computed(() => [
  { key: 'rename', label: 'Rename project', shortcut: 'F2' },
  {
    key: 'pin',
    label: 'Pin project',
    kind: 'checkbox' as const,
    checked: menuPinned.value,
    group: 'project',
  },
  {
    key: 'sort-name',
    label: 'Sort by name',
    kind: 'radio' as const,
    value: 'name',
    checked: menuSort.value === 'name',
    group: 'sort',
  },
  {
    key: 'sort-date',
    label: 'Sort by date',
    kind: 'radio' as const,
    value: 'date',
    checked: menuSort.value === 'date',
    group: 'sort',
  },
  {
    key: 'more',
    label: 'More actions',
    kind: 'submenu' as const,
    children: [{ key: 'archive', label: 'Archive project' }],
  },
])
const confirmOpen = ref(false)
const paletteOpen = ref(false)
const drawerOpen = ref(false)
const sheetOpen = ref(false)
const bannerVisible = ref(true)
const chipRemovals = ref(0)
const retries = ref(0)
const selectedRows = ref(3)
const toastItems = ref<AvenToastItem<string>[]>([
  {
    id: 'saved',
    title: 'Changes saved',
    description: 'Your profile is up to date.',
    tone: 'success',
    action: { label: 'View profile', key: 'profile' },
  },
])
let nextToastId = 1
const toastActivity = ref('')
const projectNote = ref('')
const scrollPosition = ref('Scroll the release notes.')
const shellState = ref('Navigation expanded; inspector closed.')
const currentStep = ref('profile')
const splitSizes = ref([35, 65])
const selectedPeople = ref<string[]>(['ava'])
const teamMembers = [
  { id: 'ava', label: 'Ava Chen', role: 'Design', disabled: false },
  { id: 'mika', label: 'Mika Ortiz', role: 'Engineering', disabled: false },
  { id: 'noah', label: 'Noah Patel', role: 'Research', disabled: true },
]
const virtualItems = Array.from({ length: 250 }, (_, index) => ({
  id: `task-${index + 1}`,
  label: `Task ${index + 1}`,
  detail: `Virtual row ${index + 1} retains its measured height.`,
}))
const virtualRange = ref('Scroll to inspect rendered ranges.')
const tableSort = ref([])
const tableSelected = ref<string[]>(['tx-2'])
const tableExpanded = ref<string[]>([])
const tableActivity = ref('Use the table controls to sort, select, resize, reorder or expand rows.')
const activityMessage = ref('Expand an event or request older activity.')
const workspaceChoice = ref<string | null>('design')
const viewChoice = ref<string | null>('list')
const pickedFiles = ref<File[]>([])
const accentColor = ref<string | null>('#2457d6ff')
const colorPickerOpen = ref(false)
const colorActivity = ref('Choose a named swatch or edit the hex draft.')
const pickedDate = ref<AvenDateOnly | null>('2026-11-07')
const pickedRange = ref<{ start: AvenDateOnly | null; end: AvenDateOnly | null }>({
  start: '2026-11-03',
  end: '2026-11-07',
})
const pickedTime = ref<string | null>('09:30')
const dateActivity = ref('Keyboard arrows move by day or week; Page Up and Page Down change month.')
const formActivity = ref(
  'The form remains native and leaves validation/persistence to the application.',
)
const workspaceOptions = [
  { value: 'design', label: 'Design workspace', description: 'Product and design work' },
  { value: 'engineering', label: 'Engineering workspace', description: 'Build and release work' },
  {
    value: 'research',
    label: 'Research workspace',
    description: 'Notes and studies',
    disabled: true,
  },
]
const viewOptions = [
  { value: 'list', label: 'List', icon: '☷' },
  { value: 'grid', label: 'Grid', icon: '▦' },
  { value: 'calendar', label: 'Calendar', icon: '▣' },
]
const uploadQueue = [
  {
    key: 'upload-1',
    name: 'quarterly-report.pdf',
    size: 248000,
    progress: 64,
    status: 'uploading' as const,
  },
  {
    key: 'upload-2',
    name: 'archive.zip',
    size: 1024000,
    status: 'error' as const,
    error: 'Upload was interrupted.',
  },
]
const colorSwatches = [
  { key: 'ocean', label: 'Ocean', value: '#2457d6' },
  { key: 'leaf', label: 'Leaf', value: '#16845b' },
  { key: 'sunset', label: 'Sunset', value: '#cf4c34' },
  { key: 'glass', label: 'Glass', value: '#ffffff80' },
]
const activityItems = [
  {
    key: 'created',
    timestamp: '2026-11-05T10:30:00Z',
    label: 'Workspace created',
    description: 'Avery created the design workspace.',
    status: 'info' as const,
    details: 'Created from the standard project template.',
  },
  {
    key: 'reviewed',
    timestamp: '2026-11-06T14:15:00Z',
    label: 'Review completed',
    description: 'The first review was approved.',
    status: 'success' as const,
  },
]
const transactions = [
  { id: 'tx-1', name: 'Workshop invoice', owner: 'Mika', amount: 480 },
  { id: 'tx-2', name: 'Design subscription', owner: 'Ava', amount: 29 },
  { id: 'tx-3', name: 'Research materials', owner: 'Noah', amount: 115 },
]
type Transaction = (typeof transactions)[number]
const transactionColumns: AvenTableColumn<Transaction, 'name' | 'owner' | 'amount'>[] = [
  { key: 'name', header: 'Transaction', accessor: (row) => row.name, sortable: true },
  { key: 'owner', header: 'Owner', accessor: (row) => row.owner, sortable: true },
  {
    key: 'amount',
    header: 'Amount',
    accessor: (row) => row.amount,
    align: 'end' as const,
    sortable: true,
    format: (value) => `€${Number(value).toFixed(2)}`,
  },
]
const stepperItems = [
  { key: 'profile', label: 'Profile', description: 'Contact details', status: 'complete' as const },
  { key: 'preferences', label: 'Preferences', description: 'Choose updates' },
  { key: 'review', label: 'Review', description: 'Confirm settings' },
]
function dismissToast(id: string) {
  toastItems.value = toastItems.value.filter((item) => item.id !== id)
}
function addToast() {
  const id = `notice-${nextToastId++}`
  toastItems.value = [
    ...toastItems.value,
    { id, title: 'Background sync complete', description: 'Your changes are available offline.' },
  ]
}
const people = [
  { id: 'ava', name: 'Ava Chen', initials: 'AC', tone: 'accent' },
  { id: 'noah', name: 'Noah Reed', initials: 'NR', tone: 'success' },
  { id: 'sam', name: 'Sam Taylor', initials: 'ST', tone: 'warning' },
  { id: 'lee', name: 'Lee Morgan', initials: 'LM', tone: 'secondary' },
]
const lastSplitAction = ref('')
const buttonClicks = ref(0)
const openSection = ref<string | null>('account')
const accordionItems = [
  { key: 'account', label: 'Account settings' },
  { key: 'privacy', label: 'Privacy and access' },
  { key: 'billing', label: 'Billing', disabled: true },
]
const billingPeriods = [
  { value: 'monthly', label: 'Monthly', description: 'Billed every month' },
  { value: 'annual', label: 'Annual', description: 'Save 15% with annual billing' },
  { value: 'custom', label: 'Enterprise', disabled: true },
]
const textFormats = [
  { value: 'bold', label: 'Bold' },
  { value: 'italic', label: 'Italic' },
  { value: 'underline', label: 'Underline' },
  { value: 'code', label: 'Code', disabled: true },
]
const projectCommands = [
  { key: 'copy-link', label: 'Copy link' },
  { key: 'archive', label: 'Archive project' },
  { key: 'delete', label: 'Delete project', disabled: true },
]
const listboxOptions = [
  { value: 'design', label: 'Design', description: 'Visual system', group: 'Teams' },
  { value: 'engineering', label: 'Engineering', description: 'Product delivery', group: 'Teams' },
  { value: 'finance', label: 'Finance', group: 'Operations' },
  { value: 'legal', label: 'Legal', disabled: true, group: 'Operations' },
]
const topicOptions = [
  { value: 'vue', label: 'Vue', keywords: ['framework', 'ui'], group: 'Frontend' },
  { value: 'typescript', label: 'TypeScript', description: 'Typed JavaScript', group: 'Frontend' },
  { value: 'accessibility', label: 'Accessibility', group: 'Quality' },
]
const menubarItems = [
  {
    key: 'file',
    label: 'File',
    children: [
      { key: 'new', label: 'New document' },
      { key: 'open', label: 'Open…' },
    ],
  },
  {
    key: 'edit',
    label: 'Edit',
    children: [
      { key: 'undo', label: 'Undo' },
      { key: 'redo', label: 'Redo' },
    ],
  },
  { key: 'view', label: 'View', children: [{ key: 'zoom-in', label: 'Zoom in' }] },
]
const paletteCommands = [
  { key: 'new-file', label: 'New file', group: 'File', shortcut: 'Ctrl+N' },
  { key: 'open-file', label: 'Open file', group: 'File', shortcut: 'Ctrl+O' },
  { key: 'toggle-sidebar', label: 'Toggle sidebar', group: 'View', keywords: ['panel'] },
]
const buttonTones = [
  'neutral',
  'accent',
  'secondary',
  'info',
  'success',
  'warning',
  'danger',
  'critical',
] as const
</script>

<template>
  <main class="aven-app playground-shell">
    <section class="playground-intro">
      <AvenText type="title">Aven shared design system</AvenText>
      <AvenText class="intro-copy">
        A small text component with semantic markup, themeable tokens, and ordinary Vue slots.
      </AvenText>
    </section>

    <section class="playground-card" aria-labelledby="icon-examples">
      <AvenText id="icon-examples" type="header1">Icons and accessible names</AvenText>
      <AvenInline>
        <AvenIcon size="sm"
          ><svg viewBox="0 0 24 24"><path d="M4 12h16M12 4v16" /></svg
        ></AvenIcon>
        <AvenIcon name="warning" :decorative="false" label="Warning" tone="warning" spin>
          <svg viewBox="0 0 24 24"><path d="M12 3 2.5 20h19L12 3Zm0 6v5m0 3v.01" /></svg>
        </AvenIcon>
        <AvenIcon
          :size="24"
          :ui="{ root: { style: { '--aven-icon-color': 'var(--aven-color-success-text)' } } }"
        >
          <svg viewBox="0 0 24 24"><path d="m5 12 4 4L19 6" /></svg>
        </AvenIcon>
      </AvenInline>
    </section>

    <section class="playground-card" aria-labelledby="link-examples">
      <AvenText id="link-examples" type="header1">Links and native navigation</AvenText>
      <AvenInline>
        <AvenLink href="#type-examples" underline="always">Section link</AvenLink>
        <AvenLink href="https://vuejs.org" target="_blank" external variant="standalone">
          Vue documentation
        </AvenLink>
        <AvenLink href="#button-examples" variant="subtle" tone="secondary">
          <template #leading><span aria-hidden="true">←</span></template>
          Previous section
        </AvenLink>
      </AvenInline>
    </section>

    <section class="playground-card" aria-labelledby="status-examples">
      <AvenText id="status-examples" type="header1">Badges and status labels</AvenText>
      <AvenInline>
        <AvenBadge>New</AvenBadge>
        <AvenBadge tone="success" variant="solid">Saved</AvenBadge>
        <AvenBadge tone="warning" variant="outline" :count="147" label="notifications" />
        <AvenBadge tone="danger" variant="dot" label="3 alerts" :count="3" />
        <AvenBadge variant="soft" :count="0" show-zero label="unread messages" />
      </AvenInline>
      <AvenInline>
        <AvenStatusDot tone="success" label="Connected" />
        <AvenStatusDot tone="warning" size="lg" label="Sync delayed" />
        <AvenStatusDot tone="critical">Service unavailable</AvenStatusDot>
      </AvenInline>
    </section>

    <section class="playground-card" aria-labelledby="field-examples">
      <AvenText id="field-examples" type="header1">Fields and grouped controls</AvenText>
      <AvenField
        id="contact-email"
        label="Contact email"
        orientation="horizontal"
        label-width="9rem"
        required
        description="We use this address for account notices."
        :error="contactEmail && !contactEmail.includes('@') ? 'Enter a valid email address.' : ''"
      >
        <template #default="{ controlAttrs }">
          <AvenInput v-bind="controlAttrs" v-model="contactEmail" type="email" />
        </template>
      </AvenField>
      <AvenFieldset legend="Notification preferences" description="Choose any that apply.">
        <AvenCheckbox name="notifications" value="product" label="Product updates" />
        <AvenCheckbox name="notifications" value="security" label="Security notices" />
      </AvenFieldset>
    </section>
    <section class="playground-card" aria-labelledby="form-examples">
      <AvenText id="form-examples" type="header1">Native form layout and actions</AvenText>
      <AvenForm
        action="/profile"
        method="post"
        :errors="[{ controlId: 'profile-email', message: 'Use an organization email address.' }]"
        :columns="2"
        @submit.prevent="
          formActivity = 'Submit event received once; the application owns save behavior.'
        "
        @reset="formActivity = 'Native reset requested.'"
      >
        <template #header><h3>Profile details</h3></template>
        <template #default="{ disabled, loading }">
          <AvenInput
            id="profile-email"
            name="email"
            label="Work email"
            type="email"
            required
            :disabled="disabled || loading"
          />
          <AvenInput
            id="profile-team"
            name="team"
            label="Team name"
            :disabled="disabled || loading"
          />
        </template>
        <template #error-summary="{ errors }">
          <ul>
            <li v-for="error in errors" :key="error.controlId">
              <a :href="`#${error.controlId}`">{{ error.message }}</a>
            </li>
          </ul>
        </template>
        <template #footer>
          <AvenFormActions align="between" sticky>
            <template #secondary
              ><AvenButton type="reset" variant="outline">Reset</AvenButton></template
            >
            <AvenButton type="submit">Save profile</AvenButton>
          </AvenFormActions>
        </template>
      </AvenForm>
      <p aria-live="polite">{{ formActivity }}</p>
    </section>

    <section class="playground-card" aria-labelledby="type-examples">
      <AvenText id="type-examples" type="header1">Text types</AvenText>
      <div class="example-list">
        <div class="example-row">
          <AvenText type="caption" class="example-label">title · h1</AvenText>
          <AvenText type="title">My application</AvenText>
        </div>
        <div class="example-row">
          <AvenText type="caption" class="example-label">header1 · h1</AvenText>
          <AvenText type="header1">Page heading</AvenText>
        </div>
        <div class="example-row">
          <AvenText type="caption" class="example-label">header2 · h2</AvenText>
          <AvenText type="header2">A section title</AvenText>
        </div>
        <div class="example-row">
          <AvenText type="caption" class="example-label">header3 · h3</AvenText>
          <AvenText type="header3">A subsection title</AvenText>
        </div>
        <div class="example-row">
          <AvenText type="caption" class="example-label">text · p (default)</AvenText>
          <AvenText>Hello {{ userName }}. This is the default text style.</AvenText>
        </div>
        <div class="example-row">
          <AvenText type="caption" class="example-label">quote · blockquote</AvenText>
          <AvenText type="quote">
            A quotation with <em>custom emphasis</em> inside the slot.
          </AvenText>
        </div>
        <div class="example-row">
          <AvenText type="caption" class="example-label">caption · span</AvenText>
          <AvenText type="caption">A quiet supporting note</AvenText>
        </div>
      </div>
    </section>

    <section class="playground-card" aria-labelledby="customization-examples">
      <AvenText id="customization-examples" type="header1">Composition and customization</AvenText>
      <div class="example-list">
        <div class="example-row">
          <AvenText type="caption" class="example-label">visual type + semantic override</AvenText>
          <AvenText type="header2" as="h3">Section title rendered as h3</AvenText>
        </div>
        <div class="example-row">
          <AvenText type="caption" class="example-label">default slot markup</AvenText>
          <AvenText>
            Hello <strong>{{ userName }}</strong
            >. <a href="#profile">Open your profile</a>.
          </AvenText>
        </div>
        <div class="example-row">
          <AvenText type="caption" class="example-label">custom class</AvenText>
          <AvenText class="custom-class-example">Styled with an application class.</AvenText>
        </div>
        <div class="example-row">
          <AvenText type="caption" class="example-label">inline style</AvenText>
          <AvenText :style="{ color: 'var(--aven-color-accent)', fontWeight: 600 }">
            Styled with normal Vue style attributes.
          </AvenText>
        </div>
      </div>
    </section>

    <section class="playground-card" aria-labelledby="button-examples">
      <AvenText id="button-examples" type="header1">Button variants, tones, and states</AvenText>
      <AvenInline>
        <AvenButton>Solid</AvenButton>
        <AvenButton variant="soft">Soft</AvenButton>
        <AvenButton variant="outline">Outline</AvenButton>
        <AvenButton variant="ghost">Ghost</AvenButton>
        <AvenButton variant="link">Link</AvenButton>
      </AvenInline>
      <AvenInline>
        <AvenButton v-for="tone in buttonTones" :key="tone" :tone="tone" variant="soft">
          {{ tone }}
        </AvenButton>
      </AvenInline>
      <AvenInline aria-label="Icon button examples">
        <AvenIconButton label="Close" tooltip="Close panel">×</AvenIconButton>
        <AvenIconButton label="Favorite" shape="circle" variant="soft" tone="danger">
          ♥
        </AvenIconButton>
        <AvenIconButton
          label="Refresh"
          loading
          :ui="{ root: { style: { '--aven-icon-button-size': '1.25rem' } } }"
        >
          ↻
        </AvenIconButton>
      </AvenInline>
      <AvenInline>
        <AvenButton size="xs" shape="pill" variant="outline">Extra small</AvenButton>
        <AvenButton size="sm" shape="square" variant="outline">Small</AvenButton>
        <AvenButton
          size="lg"
          block
          :ui="{ root: { style: { '--aven-button-bg': 'var(--aven-color-secondary-solid)' } } }"
        >
          Large, full-width in its row
        </AvenButton>
      </AvenInline>
      <AvenInline>
        <AvenButton disabled>Disabled</AvenButton>
        <AvenButton loading>
          Saving report
          <template #loading="{ loading }">{{ loading ? '◌' : '' }}</template>
        </AvenButton>
        <AvenButton loading loading-behavior="allow" @click="buttonClicks++">
          Retry while busy
        </AvenButton>
        <AvenButton @click="buttonClicks++">
          <template #leading>＋</template>
          Add item
          <template #trailing>⌘K</template>
        </AvenButton>
      </AvenInline>
      <p aria-live="polite">Accepted button actions: {{ buttonClicks }}</p>
    </section>

    <section class="playground-card playground-theme" aria-labelledby="theme-example">
      <AvenText id="theme-example" type="header1">Scoped theme override</AvenText>
      <AvenText>
        These colors and type defaults come from <code>.playground-theme</code>, so the rest of the
        page keeps the shared defaults.
      </AvenText>
      <AvenText type="header2">A local application theme</AvenText>
    </section>
    <ColorGallery />
    <section class="playground-card" aria-labelledby="code-example">
      <AvenText id="code-example" type="header1">Adapter-ready code block</AvenText>
      <AvenCodeBlock
        :code="sampleCode"
        language="typescript"
        label="A short TypeScript example"
        show-line-numbers
        copyable
        wrap
      >
        <template #header>Example source</template>
        <template #line="{ line, index }">
          <span :data-line="index + 1">{{ line }}</span>
        </template>
      </AvenCodeBlock>
    </section>
    <section class="playground-card" aria-labelledby="surface-examples">
      <AvenText id="surface-examples" type="header1">Panels and disclosure</AvenText>
      <AvenPanel title="Profile summary" description="A passive content surface" variant="outline">
        <p>Panel content uses the shared semantic surface tokens.</p>
      </AvenPanel>
      <AvenCard
        title="Project card"
        description="Card with named content"
        :heading-level="3"
        variant="outlined"
      >
        <template #actions><AvenButton variant="ghost">More</AvenButton></template>
        <p>Card actions stay separate from the passive surface.</p>
        <template #footer>Updated just now</template>
      </AvenCard>
      <dl class="property-list">
        <AvenPropertyRow label="Owner" value="Avery" />
        <AvenPropertyRow label="Contact" value="avery@example.test" orientation="vertical" editable>
          <template #editor="{ finish, cancel }">
            <AvenInline>
              <input aria-label="Contact email" value="avery@example.test" />
              <AvenButton @click="finish">Save</AvenButton>
              <AvenButton variant="ghost" @click="cancel">Cancel</AvenButton>
            </AvenInline>
          </template>
        </AvenPropertyRow>
      </dl>
      <AvenAccordion
        :items="accordionItems"
        :model-value="openSection"
        @update:model-value="(value) => (openSection = value as string | null)"
      >
        <template #content="{ item, open }">
          <p>
            {{ item.label }} is {{ open ? 'open' : 'closed' }}. The active panel preserves its
            content on close.
          </p>
        </template>
      </AvenAccordion>
      <AvenCollapsible default-open
        >Keyboard accessible disclosure
        <template #panel><p>Use Enter or Space to open and close this panel.</p></template>
      </AvenCollapsible>
    </section>
    <AvenContainer max-width="64rem">
      <AvenStack gap="space-4">
        <AvenText type="header1">Responsive layout primitives</AvenText>
        <AvenInline gap="space-2"><AvenBadge>Inline</AvenBadge></AvenInline>
        <AvenGrid :columns="{ base: 1, sm: 2, lg: 3 }">
          <AvenPanel v-for="number in 3" :key="number" :title="`Grid card ${number}`"
            >Columns adapt to viewport width.</AvenPanel
          >
        </AvenGrid>
      </AvenStack>
    </AvenContainer>
    <section class="playground-card" aria-labelledby="data-display-examples">
      <AvenText id="data-display-examples" type="header1">Formatted data</AvenText>
      <AvenGrid :columns="{ base: 1, md: 2 }">
        <AvenStat
          label="Revenue"
          :value="12450.5"
          format="currency"
          currency="EUR"
          trend="up"
          trend-label="12% from last month"
          description="Current reporting period"
        />
        <AvenStat
          label="Tasks completed"
          :value="0.82"
          format="percent"
          tone="success"
          trend="flat"
          trend-label="On track"
        />
      </AvenGrid>
      <p>Last updated <AvenFormattedValue :value="-3600" kind="relative" />.</p>
    </section>
    <section class="playground-card" aria-labelledby="specialized-input-examples">
      <AvenText id="specialized-input-examples" type="header1">Specialized text inputs</AvenText>
      <AvenSearchField
        v-model="searchQuery"
        label="Search records"
        description="Enter a name or reference."
        :debounce="250"
        @search="lastSearch = $event.query"
      >
        <template #leading>⌕</template>
      </AvenSearchField>
      <p v-if="lastSearch">Last query: {{ lastSearch }}</p>
      <AvenPasswordField label="Password" autocomplete="current-password" />
      <AvenField label="Project note" description="A short note shared with the team.">
        <template #default="{ controlAttrs }">
          <AvenTextarea
            v-bind="controlAttrs"
            v-model="projectNote"
            :min-rows="2"
            :max-rows="6"
            :maxlength="240"
            autosize
            show-count
          >
            <template #leading>✎</template>
            <template #trailing><span aria-hidden="true">⌘↵ saves</span></template>
          </AvenTextarea>
        </template>
      </AvenField>
    </section>
    <section class="playground-card" aria-labelledby="radio-examples">
      <AvenText id="radio-examples" type="header1">Radio choices</AvenText>
      <AvenRadioGroup
        v-model="billingPeriod"
        name="billing-period"
        label="Billing period"
        description="Choose how often your plan renews. Use arrow keys to move between options."
        :items="billingPeriods"
        orientation="horizontal"
      >
        <template #item="{ item, selected, active }">
          <span>
            <strong>{{ item.label }}</strong>
            <small>{{ item.description }}</small>
            <small v-if="active">Keyboard focus</small>
            <small v-if="selected">Selected</small>
          </span>
        </template>
      </AvenRadioGroup>
      <p>Selected plan: {{ billingPeriod }}</p>
      <AvenRadio
        name="contact-method"
        value="email"
        label="Email updates"
        description="Standalone radio control; bind checked for reactive state."
        :checked="emailUpdates"
        @update:checked="emailUpdates = $event"
      />
    </section>
    <section class="playground-card" aria-labelledby="listbox-examples">
      <AvenText id="listbox-examples" type="header1">Listbox selection</AvenText>
      <AvenListbox
        v-model="listboxValue"
        name="team"
        label="Team"
        :options="listboxOptions"
        @highlight="highlightedTeam = String($event.value)"
      >
        <template #item="{ item, selected, active }">
          <span
            ><strong>{{ item.label }}</strong
            ><small v-if="item.description">{{ item.description }}</small></span
          >
          <small v-if="active">Focused</small><small v-else-if="selected">Selected</small>
        </template>
      </AvenListbox>
      <p>Selected team: {{ listboxValue }}</p>
      <p>Active option: {{ highlightedTeam || 'focus the list to begin' }}</p>
      <AvenListbox
        :options="listboxOptions"
        multiple
        :default-value="['design']"
        label="Multiple teams"
      />
    </section>
    <section class="playground-card" aria-labelledby="slider-examples">
      <AvenText id="slider-examples" type="header1">Slider controls</AvenText>
      <label for="volume-control">Volume: {{ volume }}%</label>
      <AvenSlider
        id="volume-control"
        v-model="volume"
        label="Volume"
        :marks="[
          { value: 0, label: 'Mute' },
          { value: 50, label: 'Half' },
          { value: 100, label: 'Full' },
        ]"
        @change="volume = $event"
      >
        <template #value="{ value }"
          ><output>{{ value }}%</output></template
        >
      </AvenSlider>
      <AvenRangeSlider
        v-model="priceRange"
        :min-gap="5"
        start-label="Minimum price"
        end-label="Maximum price"
        :marks="[
          { value: 0, label: '$0' },
          { value: 100, label: '$100' },
        ]"
      >
        <template #value="{ value, index }"
          ><output>{{ index === 0 ? 'From' : 'To' }} ${{ value }}</output></template
        >
      </AvenRangeSlider>
      <p>Price range: ${{ priceRange[0] }}–${{ priceRange[1] }}</p>
    </section>
    <section class="playground-card" aria-labelledby="combobox-examples">
      <AvenText id="combobox-examples" type="header1">Searchable selections</AvenText>
      <AvenCombobox
        v-model="selectedTeam"
        label="Team"
        description="Type to filter, or use the arrow keys and Enter."
        :options="listboxOptions"
        clearable
        :query="teamQuery"
        @update:query="teamQuery = $event"
      >
        <template #option="{ item, active, selected }"
          ><strong>{{ item.label }}</strong
          ><small>{{ item.description }}</small
          ><small v-if="active">Focused</small><small v-if="selected">Selected</small></template
        >
        <template #popup-footer><small>Team options can be filtered as you type.</small></template>
      </AvenCombobox>
      <p>Team: {{ selectedTeam }}</p>
      <AvenMultiSelect
        v-model="selectedTopics"
        label="Topics"
        :options="topicOptions"
        :max-selected="2"
        clearable
      >
        <template #chip="{ item, remove, disabled }"
          ><span>{{ item.label }}</span
          ><button
            type="button"
            :disabled="disabled"
            :aria-label="`Remove ${item.label}`"
            @click="remove($event)"
          >
            ×
          </button></template
        >
        <template #loading><span role="status">Loading topics…</span></template>
      </AvenMultiSelect>
      <AvenButton variant="outline" size="sm" @click="remoteLoading = !remoteLoading"
        >Toggle remote loading example</AvenButton
      >
      <AvenCombobox
        label="Remote options"
        :options="topicOptions"
        remote
        :loading="remoteLoading"
        :error="remoteLoading ? '' : 'The remote source is unavailable.'"
        placeholder="Remote search"
      />
    </section>
    <section class="playground-card" aria-labelledby="menu-navigation-examples">
      <AvenText id="menu-navigation-examples" type="header1"
        >Context actions and menubar navigation</AvenText
      >
      <AvenContextMenu
        :items="projectCommands"
        label="Project actions"
        @select="menuAction = $event.item.label"
      >
        <template #default
          ><p>
            Right-click or focus this project area and press Shift+F10 to open actions.
          </p></template
        >
      </AvenContextMenu>
      <AvenMenu
        :items="menuCommands"
        :groups="[
          { key: 'project', label: 'Project settings' },
          { key: 'sort', label: 'Sort order' },
        ]"
        loop
        @select="menuAction = $event.item.label"
        @update:checked="menuPinned = $event.checked"
        @update:value="menuSort = $event.value"
      >
        <template #item="{ item, checked }"
          ><strong>{{ item.label }}</strong
          >{{ checked ? ' · selected' : '' }}</template
        >
        <template #leading="{ item }"
          ><span aria-hidden="true">{{
            item.kind === 'checkbox' ? '☑' : item.kind === 'radio' ? '◉' : '›'
          }}</span></template
        >
      </AvenMenu>
      <p>Pin: {{ menuPinned ? 'on' : 'off' }}; sort: {{ menuSort }}.</p>
      <AvenMenubar
        :items="menubarItems"
        label="Document menu"
        @select="menuAction = $event.item.label"
      />
      <p aria-live="polite">Last menu action: {{ menuAction || 'none' }}</p>
      <AvenButton variant="outline" @click="confirmOpen = true"
        >Open destructive confirmation</AvenButton
      >
      <AvenAlertDialog
        v-model:open="confirmOpen"
        title="Delete this project?"
        description="This action permanently removes the project and its shared workspace."
        confirm-label="Delete project"
        @confirm="confirmOpen = false"
      >
        This change cannot be undone. Confirm only after checking that the project is no longer
        needed.
      </AvenAlertDialog>
      <AvenButton variant="outline" @click="paletteOpen = true">Open command palette</AvenButton>
      <AvenCommandPalette
        v-model:open="paletteOpen"
        :items="paletteCommands"
        label="Project commands"
        placeholder="Search project commands"
        @select="menuAction = $event.item.label"
      >
        <template #input-leading>⌕</template>
        <template #footer><span>Use arrow keys to navigate and Enter to run.</span></template>
      </AvenCommandPalette>
      <AvenButton variant="outline" @click="drawerOpen = true">Open nonmodal inspector</AvenButton>
      <AvenDrawer
        v-model:open="drawerOpen"
        title="Project inspector"
        description="Review the selected project's details."
        :modal="false"
        side="end"
        size="25rem"
        resizable
      >
        <p>The surrounding page remains available while this inspector is open.</p>
      </AvenDrawer>
      <AvenButton variant="outline" @click="sheetOpen = true">Open bottom sheet</AvenButton>
      <AvenSheet
        v-model:open="sheetOpen"
        title="Quick details"
        description="A mobile-friendly sheet."
      >
        <p>Resize this sheet with the handle or arrow keys.</p>
      </AvenSheet>
    </section>
    <section class="playground-card" aria-labelledby="alert-examples">
      <AvenText id="alert-examples" type="header1">Alerts and banners</AvenText>
      <AvenAlert
        tone="warning"
        title="Review the renewal date"
        description="Your plan renews next month."
      />
      <AvenBanner
        v-if="bannerVisible"
        tone="success"
        title="Settings saved"
        description="Your workspace preferences have been updated."
        live="polite"
        dismissible
        @dismiss="bannerVisible = false"
      />
    </section>
    <section class="playground-card" aria-labelledby="identity-examples">
      <AvenText id="identity-examples" type="header1">Identity and keyboard hints</AvenText>
      <div class="playground-row">
        <AvenChip value="vue" interactive selected removable @remove="chipRemovals++">
          Vue 3
        </AvenChip>
        <AvenChip tone="warning" variant="outline">Needs review</AvenChip>
        <AvenTag tone="success"><template #leading>✓</template>Verified</AvenTag>
        <AvenTag variant="solid" tone="accent">Design system</AvenTag>
        <span>Keyboard shortcut <AvenKbd :keys="['Control', 'K']" platform="windows" /></span>
      </div>
      <AvenSeparator><template #label>Team members</template></AvenSeparator>
      <AvenAvatarGroup
        :items="people"
        :max="3"
        label="Project team"
        :get-key="(person) => person.id"
      >
        <template #avatar="{ item }">
          <AvenAvatar :name="item.name" :initials="item.initials" :aria-label="item.name" />
        </template>
        <template #overflow="{ count }">+{{ count }} more</template>
      </AvenAvatarGroup>
      <p>{{ chipRemovals }} removal request{{ chipRemovals === 1 ? '' : 's' }} made.</p>
    </section>
    <section class="playground-card" aria-labelledby="result-examples">
      <AvenText id="result-examples" type="header1">Empty and result states</AvenText>
      <AvenEmptyState
        kind="no-results"
        title="No projects match"
        description="Adjust the search or filters."
      >
        <template #actions><AvenButton variant="outline">Clear filters</AvenButton></template>
      </AvenEmptyState>
      <AvenResultState
        kind="error"
        layout="inline"
        size="compact"
        title="Activity could not load"
        description="Try again when the connection is available."
        @retry="retries++"
      />
      <p>{{ retries }} retry request{{ retries === 1 ? '' : 's' }}.</p>
    </section>
    <section class="playground-card" aria-labelledby="toolbar-examples">
      <AvenText id="toolbar-examples" type="header1">Toolbars and selection actions</AvenText>
      <AvenToolbar label="Document actions" keyboard-navigation>
        <template #start><AvenButton variant="outline">New</AvenButton></template>
        <template #center><AvenButton variant="ghost">Preview</AvenButton></template>
        <template #end><AvenButton>Publish</AvenButton></template>
      </AvenToolbar>
      <AvenActionBar :selection-count="selectedRows" clearable @clear-selection="selectedRows = 0">
        <template #actions>
          <AvenButton variant="outline">Archive selected</AvenButton>
          <AvenButton tone="danger">Delete selected</AvenButton>
        </template>
      </AvenActionBar>
      <AvenButton variant="outline" @click="selectedRows = selectedRows ? 0 : 3">
        {{ selectedRows ? 'Hide' : 'Show' }} action bar
      </AvenButton>
    </section>
    <section class="playground-card" aria-labelledby="toast-examples">
      <AvenText id="toast-examples" type="header1">Toast feedback</AvenText>
      <AvenButton variant="outline" @click="addToast">Add notification</AvenButton>
      <AvenToaster
        :items="toastItems"
        position="bottom-end"
        :max-visible="3"
        @dismiss="dismissToast(String($event.id))"
        @action="toastActivity = `Action ${$event.key} requested`"
        @after-close="toastActivity = 'Notification closed'"
      >
        <template #toast="{ item, dismiss }">
          <small>{{ item.id }}</small>
          <AvenButton size="sm" variant="ghost" @click="dismiss">Dismiss from content</AvenButton>
        </template>
      </AvenToaster>
      <p aria-live="polite">{{ toastActivity }}</p>
    </section>
    <section class="playground-card" aria-labelledby="scroll-area-examples">
      <AvenText id="scroll-area-examples" type="header1">Scrollable content</AvenText>
      <AvenScrollArea
        label="Release notes"
        orientation="vertical"
        type="always"
        notify-end
        style="
          max-block-size: 9rem;
          border: 1px solid var(--aven-color-border-subtle);
          border-radius: var(--aven-radius-md);
        "
        @scroll="scrollPosition = 'Release notes are scrollable.'"
        @end-reached="scrollPosition = 'Reached the end of release notes.'"
      >
        <ol>
          <li v-for="version in 12" :key="version">
            Version {{ version }} · accessibility improvements and bug fixes.
          </li>
        </ol>
      </AvenScrollArea>
      <p>{{ scrollPosition }}</p>
    </section>
    <section class="playground-card" aria-labelledby="app-shell-examples">
      <AvenText id="app-shell-examples" type="header1">Application shell</AvenText>
      <AvenAppShell
        label="Project workspace preview"
        style="
          block-size: 24rem;
          border: 1px solid var(--aven-color-border-subtle);
          border-radius: var(--aven-radius-lg);
        "
        @update:sidebar-collapsed="
          shellState = $event ? 'Navigation collapsed' : 'Navigation expanded'
        "
        @update:inspector-open="shellState += $event ? '; inspector opened' : '; inspector closed'"
      >
        <template #sidebar-toggle="{ collapsed, toggle }">
          <AvenButton size="sm" variant="outline" @click="toggle">
            {{ collapsed ? 'Show navigation' : 'Hide navigation' }}
          </AvenButton>
        </template>
        <template #header><strong>Project workspace</strong></template>
        <template #sidebar>
          <nav aria-label="Project sections">
            <ul>
              <li>Overview</li>
              <li>Activity</li>
              <li>Settings</li>
            </ul>
          </nav>
        </template>
        <template #inspector-toggle="{ open, toggle }">
          <AvenButton size="sm" variant="outline" @click="toggle">
            {{ open ? 'Close inspector' : 'Open inspector' }}
          </AvenButton>
        </template>
        <template #default>Main workspace content</template>
        <template #inspector>Selection details</template>
        <template #footer>Project footer</template>
        <template #statusbar>Connected · All changes saved</template>
      </AvenAppShell>
      <p>{{ shellState }}</p>
    </section>
    <section class="playground-card" aria-labelledby="stepper-examples">
      <AvenText id="stepper-examples" type="header1">Progress steps</AvenText>
      <AvenStepper v-model="currentStep" :items="stepperItems" clickable label="Account setup">
        <template #label="{ item, current }">
          <span :aria-current="current ? 'step' : undefined">{{ item.label }}</span>
        </template>
      </AvenStepper>
      <p>Current step: {{ currentStep }}</p>
      <AvenStepper
        :items="stepperItems"
        orientation="vertical"
        :model-value="currentStep"
        label="Setup progress preview"
      />
      <AvenStepper
        :items="stepperItems"
        default-value="preferences"
        clickable
        :linear="false"
        orientation="vertical"
        label="Uncontrolled setup example"
      />
    </section>
    <section class="playground-card" aria-labelledby="split-pane-examples">
      <AvenText id="split-pane-examples" type="header1">Resizable panes</AvenText>
      <AvenSplitPane
        v-model="splitSizes"
        label="Editor and preview"
        :min-sizes="[20, 20]"
        :max-sizes="[80, 80]"
        style="block-size: 13rem; border: 1px solid var(--aven-color-border-subtle)"
        @resize-end="({ sizes }) => (splitSizes = sizes)"
      >
        <template #pane="{ index, sizes }">
          <div style="padding: 1rem">
            <strong>{{ index === 0 ? 'Editor' : 'Preview' }}</strong>
            <p>{{ Math.round(sizes[index] ?? 0) }}% of the available width</p>
          </div>
        </template>
      </AvenSplitPane>
      <AvenSplitPane
        :panes="2"
        :default-value="[50, 50]"
        orientation="vertical"
        label="Vertical workspace preview"
        style="block-size: 12rem; border: 1px solid var(--aven-color-border-subtle)"
      >
        <template #pane="{ index }">
          <div style="padding: 1rem">Vertical section {{ index + 1 }}</div>
        </template>
      </AvenSplitPane>
    </section>
    <section class="playground-card" aria-labelledby="list-examples">
      <AvenText id="list-examples" type="header1">Semantic lists</AvenText>
      <AvenList
        v-model:selected-keys="selectedPeople"
        :items="teamMembers"
        :item-key="(person) => person.id"
        :item-disabled="(person) => person.disabled"
        :get-label="(person) => person.label"
        selectable
        divided
        label="Project team"
        style="max-block-size: 14rem; border: 1px solid var(--aven-color-border-subtle)"
      >
        <template #leading="{ item }">{{ item.label.slice(0, 1) }}</template>
        <template #item="{ item, selected }">
          <span>{{ item.label }}</span>
          <small>{{ item.role }}{{ selected ? ' · selected' : '' }}</small>
        </template>
        <template #empty>No team members.</template>
      </AvenList>
      <p>Selected keys: {{ selectedPeople.join(', ') || 'none' }}</p>
      <ul>
        <AvenListItem divided>
          <template #leading>•</template>
          <strong>Standalone list row</strong>
          <template #trailing><span>Metadata</span></template>
        </AvenListItem>
      </ul>
    </section>
    <section class="playground-card" aria-labelledby="virtual-list-examples">
      <AvenText id="virtual-list-examples" type="header1">Measured virtual list</AvenText>
      <AvenVirtualList
        :items="virtualItems"
        :item-key="(item) => item.id"
        :estimate-size="48"
        :overscan="4"
        label="Project tasks"
        style="block-size: 16rem; border: 1px solid var(--aven-color-border-subtle)"
        @range-change="({ start, end }) => (virtualRange = `Showing ${start + 1}–${end + 1}`)"
      >
        <template #item="{ item, index }">
          <div
            style="
              padding: 0.75rem 1rem;
              border-block-end: 1px solid var(--aven-color-border-subtle);
            "
          >
            <strong>{{ index + 1 }}. {{ item.label }}</strong>
            <p>{{ item.detail }}</p>
          </div>
        </template>
      </AvenVirtualList>
      <p aria-live="polite">{{ virtualRange }}</p>
    </section>
    <section class="playground-card" aria-labelledby="table-examples">
      <AvenText id="table-examples" type="header1">Data tables</AvenText>
      <AvenDataTable
        v-model:sort="tableSort"
        v-model:selected-keys="tableSelected"
        v-model:expanded-keys="tableExpanded"
        :rows="transactions"
        :columns="transactionColumns"
        :row-key="(row) => row.id"
        selectable
        expandable
        row-clickable
        resizable
        reorderable
        sticky-header
        striped
        bordered
        label="Recent transactions"
        :row-count="18"
        @row-click="({ row }) => (tableActivity = `Opened ${row.name}`)"
        @row-action="({ row, action }) => (tableActivity = `${action}: ${row.name}`)"
        @column-resize="
          ({ key, width }) =>
            (tableActivity = `${key} column resized to ${Math.round(width)} pixels`)
        "
        @column-reorder="({ keys }) => (tableActivity = `Columns: ${keys.join(', ')}`)"
      >
        <template #caption>Recent transactions, sorted and selectable</template>
        <template #toolbar="{ selectedKeys }">
          <p>
            {{ selectedKeys.length }} selected transaction{{ selectedKeys.length === 1 ? '' : 's' }}
          </p>
        </template>
        <template #header="{ column, sort }">
          {{ column.header }} <small>{{ sort?.direction ?? 'unsorted' }}</small>
        </template>
        <template #cell="{ row, column }">
          {{
            column.key === 'amount'
              ? `€${row.amount.toFixed(2)}`
              : column.key === 'name'
                ? row.name
                : row.owner
          }}
        </template>
        <template #rowTrailing="{ row, emitAction }">
          <AvenButton size="sm" variant="ghost" @click="emitAction('inspect', $event)"
            >Inspect {{ row.id }}</AvenButton
          >
        </template>
        <template #expanded="{ row }">
          <p>
            {{ row.name }} belongs to {{ row.owner }}. Application-specific details stay in this
            slot.
          </p>
        </template>
        <template #pagination="{ rowCount }">Showing 1–3 of {{ rowCount }} transactions</template>
      </AvenDataTable>
      <p aria-live="polite">{{ tableActivity }}</p>
      <AvenTable caption="Compact summary" density="compact" striped>
        <thead>
          <tr>
            <th scope="col">Queue</th>
            <th scope="col">Pending</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">Approvals</th>
            <td>4</td>
          </tr>
        </tbody>
      </AvenTable>
    </section>
    <section class="playground-card" aria-labelledby="timeline-examples">
      <AvenText id="timeline-examples" type="header1">Timeline and activity</AvenText>
      <AvenTimeline
        :items="activityItems"
        locale="en-GB"
        time-zone="Europe/Riga"
        has-more
        @load-more="({ lastKey }) => (activityMessage = `Load older entries after ${lastKey}`)"
        @expand="
          ({ key, expanded }) =>
            (activityMessage = `${key} details ${expanded ? 'opened' : 'closed'}`)
        "
      >
        <template #indicator="{ item }">{{ item.status === 'success' ? '✓' : '•' }}</template>
        <template #timestamp="{ formatted }"
          ><span>{{ formatted }}</span></template
        >
        <template #footer>
          <AvenButton variant="outline" @click="activityMessage = 'Custom footer action requested'"
            >Show older activity</AvenButton
          >
        </template>
      </AvenTimeline>
      <p aria-live="polite">{{ activityMessage }}</p>
      <AvenActivityList :items="activityItems.slice(0, 1)" order="asc" density="compact">
        <template #title="{ item }"
          ><strong>{{ item.label }} (compact activity view)</strong></template
        >
      </AvenActivityList>
    </section>
    <section class="playground-card" aria-labelledby="color-picker-examples">
      <AvenText id="color-picker-examples" type="header1">Color picker</AvenText>
      <AvenColorPicker
        v-model="accentColor"
        v-model:open="colorPickerOpen"
        label="Accent color"
        name="accent-color"
        format="hexa"
        alpha
        clearable
        :swatches="colorSwatches"
        @change="(value) => (colorActivity = `Committed ${value ?? 'no color'}`)"
        @invalid-input="({ text }) => (colorActivity = `Invalid color: ${text}`)"
      >
        <template #swatch="{ item, selected }"
          ><span class="swatch-color" aria-hidden="true" />{{ item.label
          }}{{ selected ? ' · selected' : '' }}</template
        >
        <template #footer
          ><p>Changes stay local until the surrounding form is submitted.</p></template
        >
      </AvenColorPicker>
      <p aria-live="polite">
        {{ colorActivity }} Current value: {{ accentColor ?? 'none' }}; popup
        {{ colorPickerOpen ? 'open' : 'closed' }}.
      </p>
      <AvenColorPicker
        default-value="#16845b"
        label="Uncontrolled brand color"
        :swatches="colorSwatches.slice(0, 3)"
      />
    </section>
    <section class="playground-card" aria-labelledby="date-picker-examples">
      <AvenText id="date-picker-examples" type="header1">Date and time pickers</AvenText>
      <form
        @submit.prevent="
          dateActivity = `Submitted ${pickedDate ?? 'no date'}, ${pickedRange.start ?? 'no start'}–${pickedRange.end ?? 'no end'}, ${pickedTime ?? 'no time'}`
        "
      >
        <AvenDatePicker
          v-model="pickedDate"
          label="Release date"
          name="release-date"
          locale="en-GB"
          :week-starts-on="1"
          :months="2"
          clearable
          :presets="[{ key: 'today', label: 'Today', value: '2026-11-07' }]"
          description="Use YYYY-MM-DD; dates are calendar values without time-zone conversion."
        >
          <template #day="{ date, selected, today }"
            ><span :aria-label="`${date}${today ? ', today' : ''}`"
              >{{ Number(date.slice(-2)) }}{{ selected ? ' ✓' : '' }}</span
            ></template
          >
        </AvenDatePicker>
        <AvenDateRangePicker
          v-model="pickedRange"
          label="Planning window"
          name="planning"
          :months="2"
          :week-starts-on="1"
          clearable
        />
        <AvenTimePicker
          v-model="pickedTime"
          label="Start time"
          name="start-time"
          locale="en-GB"
          :time-step="15"
          hour-cycle="h23"
          description="Native time control; step is 15 minutes."
        />
        <AvenButton type="submit">Submit schedule</AvenButton>
        <AvenButton type="reset" variant="outline">Reset schedule</AvenButton>
      </form>
      <p aria-live="polite">{{ dateActivity }}</p>
      <AvenDatePicker default-value="2026-02-28" label="Uncontrolled date" />
      <AvenTimePicker default-value="14:00" label="Uncontrolled time" />
    </section>
    <section class="playground-card" aria-labelledby="file-input-examples">
      <AvenText id="file-input-examples" type="header1">Files and dropzone</AvenText>
      <form @submit.prevent="pickedFiles = [...pickedFiles]">
        <AvenFileInput
          v-model="pickedFiles"
          label="Attachments"
          name="attachments"
          accept="image/*,.pdf"
          multiple
          :max-files="4"
          :max-size="5242880"
        >
          <template #default="{ open, disabled }">
            <div class="inline-content">
              <strong>Select up to four files</strong
              ><AvenButton type="button" :disabled="disabled" @click="open"
                >Choose attachments</AvenButton
              >
            </div>
          </template>
          <template #file="{ file, remove, disabled }"
            ><span>{{ file.name }}</span
            ><AvenButton type="button" variant="ghost" :disabled="disabled" @click="remove"
              >Remove</AvenButton
            ></template
          >
          <template #error="{ reasons }"
            ><p role="alert">{{ reasons.length }} file(s) could not be added.</p></template
          >
        </AvenFileInput>
        <AvenButton type="submit">Submit files</AvenButton>
        <AvenButton type="reset" variant="outline">Reset selection</AvenButton>
      </form>
      <AvenDropzone label="Upload queue" :files="uploadQueue" disabled>
        <template #file="{ file, retry, cancel, disabled }">
          <strong>{{ file.name }}</strong>
          <AvenButton
            v-if="'status' in file && file.status === 'error'"
            type="button"
            size="sm"
            :disabled="disabled"
            @click="retry"
            >Retry</AvenButton
          >
          <AvenButton
            v-if="'status' in file && file.status === 'uploading'"
            type="button"
            size="sm"
            :disabled="disabled"
            @click="cancel"
            >Cancel</AvenButton
          >
        </template>
      </AvenDropzone>
    </section>
    <section class="playground-card" aria-labelledby="switcher-examples">
      <AvenText id="switcher-examples" type="header1">Workspace and view switchers</AvenText>
      <AvenSwitcher
        v-model="workspaceChoice"
        label="Workspace"
        :options="workspaceOptions"
        searchable
        name="workspace"
      >
        <template #option="{ item, selected }"
          ><strong>{{ item.label }}</strong
          ><small v-if="item.description">
            — {{ item.description }}{{ selected ? ' · selected' : '' }}</small
          ></template
        >
        <template #footer
          ><p class="switcher-hint">Disabled entries remain visible to explain access.</p></template
        >
      </AvenSwitcher>
      <AvenViewSwitcher
        v-model="viewChoice"
        label="Display view"
        :items="viewOptions"
        mode="auto"
        name="display-view"
      >
        <template #view="{ item }"
          ><span aria-hidden="true">{{ item.icon }}</span> {{ item.label }}</template
        >
      </AvenViewSwitcher>
      <p aria-live="polite">Workspace: {{ workspaceChoice }}; view: {{ viewChoice }}.</p>
    </section>
    <section class="playground-card" aria-labelledby="toggle-examples">
      <AvenText id="toggle-examples" type="header1">Toggle controls</AvenText>
      <AvenToggleButton v-model="quietMode" label="Quiet mode">
        <template #leading>{{ quietMode ? '◉' : '○' }}</template>
        Quiet mode
      </AvenToggleButton>
      <p aria-live="polite">Quiet mode is {{ quietMode ? 'on' : 'off' }}.</p>
      <AvenToggleGroup
        v-model="textFormat"
        name="text-format"
        label="Text formatting"
        :items="textFormats"
        multiple
        orientation="horizontal"
      >
        <template #item="{ item, selected, active }">
          <span :class="{ 'is-active-choice': active, 'is-selected-choice': selected }">
            {{ item.label }}
          </span>
        </template>
      </AvenToggleGroup>
      <p>Formatting: {{ textFormat.join(', ') || 'none' }}</p>
    </section>
    <section class="playground-card" aria-labelledby="split-button-examples">
      <AvenText id="split-button-examples" type="header1">Split action and menu</AvenText>
      <AvenButtonGroup label="View actions" attached size="sm">
        <AvenButton variant="outline">List</AvenButton>
        <AvenButton variant="outline">Board</AvenButton>
        <AvenButton variant="outline">Timeline</AvenButton>
      </AvenButtonGroup>
      <AvenSplitButton
        :items="projectCommands"
        label="Project actions"
        menu-label="More project actions"
        @click="lastSplitAction = 'Saved project'"
        @select="lastSplitAction = $event.item.label"
      >
        <template #leading>✓</template>
        Save project
        <template #item="{ item, active, disabled }">
          <span :aria-disabled="disabled"
            >{{ item.label }}<small v-if="active"> · focused</small></span
          >
        </template>
        <template #menu-footer><small>Keyboard: open the menu, then use arrows.</small></template>
      </AvenSplitButton>
      <p v-if="lastSplitAction" aria-live="polite">Last action: {{ lastSplitAction }}</p>
    </section>
  </main>
</template>
