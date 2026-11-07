<script setup lang="ts">
import { ref } from 'vue'
import ColorGallery from './ColorGallery.vue'
import {
  AvenAccordion,
  AvenActionBar,
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
  AvenEmptyState,
  AvenGrid,
  AvenInline,
  AvenPanel,
  AvenPasswordField,
  AvenRadio,
  AvenRadioGroup,
  AvenResultState,
  AvenSearchField,
  AvenStatusDot,
  AvenStack,
  AvenStat,
  AvenSplitButton,
  AvenText,
  AvenToggleButton,
  AvenToggleGroup,
  AvenToolbar,
} from '@wellsaik/aven-vue'

const userName = ref('Avery')
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
const confirmOpen = ref(false)
const paletteOpen = ref(false)
const drawerOpen = ref(false)
const sheetOpen = ref(false)
const bannerVisible = ref(true)
const chipRemovals = ref(0)
const retries = ref(0)
const selectedRows = ref(3)
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
    <section class="playground-card" aria-labelledby="surface-examples">
      <AvenText id="surface-examples" type="header1">Panels and disclosure</AvenText>
      <AvenPanel title="Profile summary" description="A passive content surface" variant="outline">
        <p>Panel content uses the shared semantic surface tokens.</p>
      </AvenPanel>
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
