import { mkdtemp, writeFile, readFile, rm, access } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'
import assert from 'node:assert/strict'
const directory = await mkdtemp(path.join(tmpdir(), 'aven-consumer-'))
const npm = process.env.npm_execpath
assert.ok(npm, 'Run through npm')
function run(args, cwd = process.cwd()) {
  const result = spawnSync(process.execPath, [npm, ...args], { cwd, encoding: 'utf8' })
  if (result.status !== 0) throw new Error(`${args.join(' ')}: ${result.stderr}\n${result.stdout}`)
  return result.stdout
}
try {
  const archives = JSON.parse(
    run(['pack', '--json', '--workspaces', '--pack-destination', directory]),
  )
  assert.equal(archives.length, 2)
  const archive = (name) =>
    path.join(directory, archives.find((item) => item.name === name).filename)
  for (const item of archives) {
    const paths = item.files.map((file) => file.path)
    assert(paths.includes('LICENSE'))
    assert(paths.includes('README.md'))
    assert(paths.includes('dist/index.js'))
    assert(paths.includes('dist/index.d.ts'))
    if (item.name === '@wellsaik/aven-vue') {
      assert(paths.includes('dist/AvenListbox.js'))
      assert(paths.includes('dist/AvenSlider.js'))
      assert(paths.includes('dist/AvenRangeSlider.js'))
      assert(paths.includes('dist/AvenCombobox.js'))
      assert(paths.includes('dist/AvenMultiSelect.js'))
      assert(paths.includes('dist/AvenContextMenu.js'))
      assert(paths.includes('dist/AvenMenubar.js'))
      assert(paths.includes('dist/AvenAlertDialog.js'))
      assert(paths.includes('dist/AvenCommandPalette.js'))
      assert(paths.includes('dist/AvenDrawer.js'))
      assert(paths.includes('dist/AvenSheet.js'))
      assert(paths.includes('dist/AvenBanner.js'))
      assert(paths.includes('dist/AvenResultState.js'))
      assert(paths.includes('dist/AvenToolbar.js'))
      assert(paths.includes('dist/AvenActionBar.js'))
      assert(paths.includes('dist/AvenToast.js'))
      assert(paths.includes('dist/AvenToaster.js'))
      assert(paths.includes('dist/AvenScrollArea.js'))
      assert(paths.includes('dist/AvenAppShell.js'))
      assert(paths.includes('dist/AvenStepper.js'))
      assert(paths.includes('dist/AvenSplitPane.js'))
      assert(paths.includes('dist/AvenList.js'))
      assert(paths.includes('dist/AvenListItem.js'))
      assert(paths.includes('dist/AvenVirtualList.js'))
      assert(paths.includes('dist/AvenTable.js'))
      assert(paths.includes('dist/AvenDataTable.js'))
      assert(paths.includes('dist/AvenTimeline.js'))
      assert(paths.includes('dist/AvenActivityList.js'))
      assert(paths.includes('dist/AvenSwitcher.js'))
      assert(paths.includes('dist/AvenViewSwitcher.js'))
      assert(paths.includes('dist/AvenFileInput.js'))
      assert(paths.includes('dist/AvenDropzone.js'))
      assert(paths.includes('dist/AvenColorPicker.js'))
      assert(paths.includes('dist/AvenDatePicker.js'))
      assert(paths.includes('dist/AvenDateRangePicker.js'))
      assert(paths.includes('dist/AvenTimePicker.js'))
      assert(paths.includes('dist/AvenMenu.js'))
      assert(paths.includes('dist/AvenMenuItem.js'))
      assert(paths.includes('dist/AvenMenuGroup.js'))
      assert(paths.includes('dist/AvenCodeBlock.js'))
      assert(paths.includes('dist/AvenTree.js'))
      assert(paths.includes('dist/AvenTreeItem.js'))
      assert(paths.includes('dist/AvenFilterChip.js'))
      assert(paths.includes('dist/AvenFilterBar.js'))
      assert(paths.includes('dist/AvenSearchBar.js'))
      assert(paths.includes('dist/AvenFilterBuilder.js'))
      assert(paths.includes('dist/AvenSortControl.js'))
      assert(paths.includes('dist/AvenCard.js'))
      assert(paths.includes('dist/AvenPanel.js'))
      assert(paths.includes('dist/AvenPropertyRow.js'))
    }
  }
  await writeFile(
    path.join(directory, 'package.json'),
    JSON.stringify({
      name: 'aven-consumer-check',
      version: '1.0.0',
      private: true,
      type: 'module',
    }),
  )
  run(['install', '--offline', '--ignore-scripts', archive('@wellsaik/aven-shared')], directory)
  const require = createRequire(path.join(directory, 'package.json'))
  assert.throws(() => require.resolve('vue'))
  const sharedImport = spawnSync(
    process.execPath,
    ['--input-type=module', '-e', "await import('@wellsaik/aven-shared')"],
    { cwd: directory, encoding: 'utf8' },
  )
  assert.equal(sharedImport.status, 0, sharedImport.stderr)
  const seen = new Set()
  async function walk(file) {
    if (seen.has(file)) return
    seen.add(file)
    for (const match of (await readFile(file, 'utf8')).matchAll(/@import\s+["']([^"']+)["']/g))
      await walk(path.resolve(path.dirname(file), match[1]))
  }
  for (const name of ['tokens', 'base', 'colors', 'finance', 'charts', 'diagrams', 'gradients'])
    await walk(require.resolve(`@wellsaik/aven-shared/${name}.css`))
  assert(seen.size >= 15)
  run(
    [
      'install',
      '--ignore-scripts',
      archive('@wellsaik/aven-shared'),
      archive('@wellsaik/aven-vue'),
      'vue@^3.5.0',
      'vite@^6.0.0',
      'typescript@^5.7.0',
    ],
    directory,
  )
  await access(require.resolve('@wellsaik/aven-vue/style.css'))
  await writeFile(
    path.join(directory, 'index.html'),
    '<div id="app"></div><script type="module" src="/main.ts"></script>',
  )
  await writeFile(
    path.join(directory, 'main.ts'),
    `import { createApp, h } from 'vue'\nimport { AvenAccordion, AvenBadge, AvenButton, AvenButtonGroup, AvenCollapsible, AvenContainer, AvenFormattedValue, AvenGrid, AvenIcon, AvenIconButton, AvenInline, AvenLink, AvenListbox, AvenPanel, AvenPasswordField, AvenRadio, AvenRadioGroup, AvenSearchField, AvenSplitButton, AvenStack, AvenStat, AvenStatusDot, AvenText, AvenToggleButton, AvenToggleGroup, type AvenBadgeProps, type AvenButtonGroupProps, type AvenButtonProps, type AvenIconButtonProps, type AvenIconProps, type AvenLinkProps, type AvenListboxProps, type AvenRadioGroupProps, type AvenSplitButtonProps, type AvenStatusDotProps, type AvenToggleGroupProps } from '@wellsaik/aven-vue'\nimport { AvenText as Direct } from '@wellsaik/aven-vue/AvenText'\nimport '@wellsaik/aven-shared/tokens.css'\nimport '@wellsaik/aven-shared/base.css'\nimport '@wellsaik/aven-vue/style.css'\nconst radioItems: AvenRadioGroupProps<'a'|'b'>['items']=[{value:'a',label:'A'},{value:'b',label:'B'}]\nconst toggleItems: AvenToggleGroupProps<'x'|'y'>['items']=[{value:'x',label:'X'},{value:'y',label:'Y'}]\nconst splitItems: AvenSplitButtonProps<'copy'|'archive'>['items']=[{key:'copy',label:'Copy'},{key:'archive',label:'Archive'}]\nconst listItems: AvenListboxProps<'a'|'b'>['options']=[{value:'a',label:'A'},{value:'b',label:'B'}]\nconst groupProps: AvenButtonGroupProps={label:'Actions',attached:true}\nconst buttonProps: AvenButtonProps={variant:'soft',tone:'success',type:'button'}\nconst iconButtonProps: AvenIconButtonProps={label:'Close',shape:'circle'}\nconst iconProps: AvenIconProps={decorative:false,label:'Alert',size:24}\nconst linkProps: AvenLinkProps={href:'/docs',variant:'subtle'}\nconst badgeProps: AvenBadgeProps={count:147,label:'notifications'}\nconst statusProps: AvenStatusDotProps={tone:'success',label:'Online'}\ncreateApp({render:()=>h('main',[h(AvenText,{},()=>h(Direct,{},()=> 'Hello')),h(AvenButton,buttonProps,()=> 'Button'),h(AvenIconButton,iconButtonProps,()=> '×'),h(AvenIcon,iconProps,()=> 'i'),h(AvenLink,linkProps,()=> 'Docs'),h(AvenBadge,badgeProps),h(AvenStatusDot,statusProps),h(AvenPanel,{},()=> 'Body'),h(AvenAccordion,{items:[{key:'x',label:'X'}]}),h(AvenCollapsible,{},()=> 'Trigger'),h(AvenContainer,{},()=> 'Container'),h(AvenGrid,{columns:{base:1,md:2}},()=> 'Grid'),h(AvenInline,{},()=> 'Inline'),h(AvenStack,{},()=> 'Stack'),h(AvenFormattedValue,{value:123,kind:'currency'}),h(AvenStat,{label:'Revenue',value:123}),h(AvenSearchField,{defaultValue:'',label:'Search'}),h(AvenPasswordField,{defaultValue:'',label:'Password'}),h(AvenRadio,{value:'x',label:'X'}),h(AvenRadioGroup,{items:radioItems,label:'Choice'}),h(AvenListbox,{options:listItems,label:'List'}),h(AvenToggleButton,{},()=> 'Toggle'),h(AvenToggleGroup,{items:toggleItems,label:'Toggle choices'}),h(AvenButtonGroup,groupProps,()=> h('button','Action')),h(AvenSplitButton,{items:splitItems},()=> 'Primary')])}).mount('#app')\n`,
  )
  await writeFile(
    path.join(directory, 'slider-consumer.ts'),
    `import { h } from 'vue'\nimport { AvenSlider, AvenRangeSlider, type AvenSliderProps, type AvenRangeSliderProps } from '@wellsaik/aven-vue'\nconst slider: AvenSliderProps = { label: 'Volume', min: 0, max: 100 }\nconst range: AvenRangeSliderProps = { startLabel: 'Minimum', endLabel: 'Maximum', minGap: 5 }\nh(AvenSlider, slider)\nh(AvenRangeSlider, range)\n`,
  )
  await writeFile(
    path.join(directory, 'selection-consumer.ts'),
    `import { h } from 'vue'\nimport { AvenCombobox, AvenMultiSelect, type AvenComboboxProps, type AvenMultiSelectProps } from '@wellsaik/aven-vue'\nconst singleOptions: AvenComboboxProps<'a'|'b'>['options'] = [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }]\nconst multiOptions: AvenMultiSelectProps<'x'|'y'>['options'] = [{ value: 'x', label: 'X' }, { value: 'y', label: 'Y' }]\nh(AvenCombobox, { options: singleOptions, modelValue: 'a' })\nh(AvenMultiSelect, { options: multiOptions, modelValue: ['x'] })\n`,
  )
  await writeFile(
    path.join(directory, 'overlay-consumer.ts'),
    `import { h } from 'vue'\nimport { AvenAlert, AvenAlertDialog, AvenBanner, AvenCommandPalette, AvenContextMenu, AvenDrawer, AvenMenubar, AvenSheet, type AvenAlertEvents, type AvenAlertProps, type AvenAlertDialogProps, type AvenCommandPaletteEvents, type AvenCommandPaletteProps, type AvenContextMenuProps, type AvenDrawerProps, type AvenMenubarProps, type AvenSheetProps } from '@wellsaik/aven-vue'\nconst commands = [{ key: 'copy', label: 'Copy' }] as const\nconst context: AvenContextMenuProps<'copy'> = { items: [...commands], activation: 'both' }\nconst menubar: AvenMenubarProps<'file'|'edit'|'new'> = { items: [{ key: 'file', label: 'File', children: [{ key: 'new', label: 'New' }] }, { key: 'edit', label: 'Edit' }], label: 'Document menu' }\nconst confirmation: AvenAlertDialogProps = { title: 'Delete?', closeOnConfirm: true, loading: false }\nconst palette: AvenCommandPaletteProps = { items: [{ key: 'open', label: 'Open', group: 'File' }, { key: 'save', label: 'Save' }], activeKey: 'open' }\nconst selected: AvenCommandPaletteEvents<'open'|'save'>['select'][0] = { key: 'open', item: { key: 'open', label: 'Open' }, originalEvent: new Event('select') }\nconst drawer: AvenDrawerProps = { title: 'Inspector', modal: false, side: 'start', resizable: true, minSize: '14rem' }\nconst sheet: AvenSheetProps = { title: 'Details', side: 'bottom' }\nconst alert: AvenAlertProps = { tone: 'warning', live: 'off', dismissible: true }\nconst dismiss: AvenAlertEvents['dismiss'][0] = { originalEvent: new MouseEvent('click') }\nvoid selected\nvoid dismiss\nh(AvenAlert, alert)\nh(AvenBanner, alert)\nh(AvenContextMenu, context)\nh(AvenMenubar, menubar)\nh(AvenAlertDialog, confirmation)\nh(AvenCommandPalette, palette)\nh(AvenDrawer, drawer)\nh(AvenSheet, sheet)\n`,
  )
  await writeFile(
    path.join(directory, 'primitive-consumer.ts'),
    `import { h } from 'vue'\nimport { AvenAvatar, AvenAvatarGroup, AvenChip, AvenKbd, AvenSeparator, AvenTag, AvenEmptyState, AvenResultState, AvenToolbar, AvenActionBar, AvenTextarea, AvenScrollArea, AvenAppShell, AvenStepper, AvenSplitPane, AvenList, AvenListItem, AvenVirtualList, AvenTable, AvenDataTable, AvenTimeline, AvenActivityList, AvenSwitcher, AvenViewSwitcher, AvenFileInput, AvenDropzone, AvenColorPicker, AvenToast, AvenToaster, type AvenTimelineProps, type AvenSwitcherProps, type AvenViewSwitcherProps, type AvenFileInputProps, type AvenColorPickerProps, type AvenScrollAreaProps, type AvenScrollAreaEvents, type AvenTextareaProps, type AvenTextareaEvents, type AvenToastItem, type AvenToasterProps, type AvenToolbarProps, type AvenActionBarProps, type AvenEmptyStateProps, type AvenResultStateProps, type AvenAvatarGroupProps, type AvenChipProps, type AvenTagProps, type AvenStepperProps, type AvenStepperEvents, type AvenSplitPaneProps, type AvenListProps, type AvenListItemProps, type AvenVirtualListProps, type AvenTableProps, type AvenDataTableProps } from '@wellsaik/aven-vue'\ntype Person = { id: string; name: string }\nconst group: AvenAvatarGroupProps<Person> = { items: [{ id: 'ava', name: 'Ava' }], getKey: person => person.id, max: 2 }\nconst chip: AvenChipProps<'vue'|'ts'> = { value: 'vue', interactive: true, removable: true }\nconst tag: AvenTagProps = { tone: 'success', variant: 'outline' }\nconst empty: AvenEmptyStateProps = { title: 'No results', kind: 'no-results' }\nconst result: AvenResultStateProps = { title: 'Failed', kind: 'error', layout: 'inline', size: 'compact' }\nconst toolbar: AvenToolbarProps = { label: 'Document actions', keyboardNavigation: true }\nconst actionBar: AvenActionBarProps = { selectionCount: 2, clearable: true }\nconst textarea: AvenTextareaProps = { defaultValue: 'Notes', autosize: true, minRows: 2, maxRows: 6 }\nconst resetValue: AvenTextareaEvents['update:modelValue'][0] = 'Notes'\nconst scrollArea: AvenScrollAreaProps = { label: 'Activity', orientation: 'vertical', notifyEnd: true }\nconst reachedEnd: AvenScrollAreaEvents['endReached'][0] = { axis: 'vertical' }\nconst timeline: AvenTimelineProps<'created'> = { items: [{ key: 'created', timestamp: new Date(), label: 'Created' }], hasMore: true }\nconst switcher: AvenSwitcherProps<'design'> = { options: [{ value: 'design', label: 'Design' }], label: 'Workspace', searchable: true }\nconst viewSwitcher: AvenViewSwitcherProps<'list'> = { items: [{ value: 'list', label: 'List' }], label: 'View', mode: 'segments' }\nvoid timeline\nvoid switcher\nvoid viewSwitcher\nconst fileInput: AvenFileInputProps = { label: 'Files', accept: 'image/*' }\nconst colorPicker: AvenColorPickerProps = { label: 'Accent', format: 'hexa', alpha: true, swatches: [{ key: 'blue', label: 'Blue', value: '#2457d6' }] }\nvoid colorPicker\nvoid fileInput\nvoid reachedEnd\nvoid resetValue\nconst toastItems: AvenToastItem<'saved'>[] = [{ id: 'saved', title: 'Saved', duration: 0 }]\nconst toaster: AvenToasterProps<'saved'> = { items: toastItems, maxVisible: 3 }\nh(AvenAvatarGroup<Person>, group)\nh(AvenAvatar, { name: 'Ava Chen', alt: '' })\nh(AvenChip, chip)\nh(AvenTag, tag)\nh(AvenKbd, { keys: ['Control', 'K'] })\nh(AvenSeparator, { decorative: false })\nh(AvenEmptyState, empty)\nh(AvenResultState, result)\nh(AvenToolbar, toolbar)\nh(AvenActionBar, actionBar)\nh(AvenTextarea, textarea)\nh(AvenScrollArea, scrollArea)\nh(AvenAppShell, { label: 'Workspace' })\nh(AvenSplitPane, { label: 'Workspace panes', modelValue: [50, 50] } satisfies AvenSplitPaneProps)\nh(AvenList<{id:string}, string>, { items: [{id:'one'}], itemKey: item => item.id, selectable: true } satisfies AvenListProps<{id:string}, string>)\nh(AvenListItem, { dense: true } satisfies AvenListItemProps)\nh(AvenVirtualList<{id:string}, string>, { items: [{id:'one'}], itemKey: item => item.id, estimateSize: 40 } satisfies AvenVirtualListProps<{id:string}, string>)\nh(AvenTable, { caption: 'Records', density: 'compact' } satisfies AvenTableProps)\nh(AvenDataTable<{id:string,name:string}, string, 'name'>, { rows: [{id:'one',name:'One'}], rowKey: row => row.id, columns: [{key:'name',header:'Name',accessor: row => row.name}] } satisfies AvenDataTableProps<{id:string,name:string}, string, 'name'>)\nh(AvenTimeline<'created'>, timeline)\nh(AvenActivityList, timeline)\nh(AvenSwitcher<'design'>, switcher)\nh(AvenViewSwitcher<'list'>, viewSwitcher)
h(AvenFileInput, fileInput)
h(AvenDropzone, fileInput)
h(AvenColorPicker, colorPicker)\nh(AvenStepper, { items: [{ key: 'one', label: 'One' }], modelValue: 'one', clickable: true } satisfies AvenStepperProps<'one'>)\nconst stepRequest: AvenStepperEvents<'one'>['requestStep'][0] = { key: 'one', from: undefined, originalEvent: new MouseEvent('click') }\nvoid stepRequest\nh(AvenToast<'saved'>, toastItems[0])\nh(AvenToaster<'saved'>, toaster)\n`,
  )
  await writeFile(
    path.join(directory, 'date-consumer.ts'),
    `import { h } from 'vue'\nimport { AvenDatePicker, AvenDateRangePicker, AvenTimePicker, type AvenDateOnly, type AvenDatePickerProps, type AvenDateRangePickerProps, type AvenTimePickerProps } from '@wellsaik/aven-vue'\nconst date: AvenDateOnly = '2024-02-29'\nconst dateProps: AvenDatePickerProps = { modelValue: date, locale: 'en-GB', weekStartsOn: 1 }\nconst rangeProps: AvenDateRangePickerProps = { defaultValue: { start: date, end: null }, months: 2 }\nconst timeProps: AvenTimePickerProps = { defaultValue: '09:30', timeStep: 15, hourCycle: 'h23' }\nh(AvenDatePicker, dateProps); h(AvenDateRangePicker, rangeProps); h(AvenTimePicker, timeProps)\n`,
  )
  await writeFile(
    path.join(directory, 'form-consumer.ts'),
    `import { h } from 'vue'\nimport { AvenForm, AvenFormActions, type AvenFormError, type AvenFormProps, type AvenFormEvents, type AvenFormActionsProps } from '@wellsaik/aven-vue'\nconst errors: AvenFormError[] = [{ controlId: 'email', message: 'Required' }]\nconst form: AvenFormProps = { action: '/save', method: 'post', novalidate: true, errors, columns: 2 }\nconst submit: AvenFormEvents['submit'][0] = new SubmitEvent('submit')\nconst actions: AvenFormActionsProps = { align: 'between', sticky: true }\nvoid submit; h(AvenForm, form); h(AvenFormActions, actions)\n`,
  )
  await writeFile(
    path.join(directory, 'menu-consumer.ts'),
    `import { h } from 'vue'\nimport { AvenMenu, AvenMenuItem, AvenMenuGroup, type AvenMenuProps, type AvenMenuEvents, type AvenMenuItemSlots } from '@wellsaik/aven-vue'\ntype Key = 'rename' | 'pin' | 'archive'\nconst props: AvenMenuProps<Key> = { items: [{ key: 'rename', label: 'Rename' }, { key: 'pin', label: 'Pin', kind: 'checkbox', checked: false, group: 'project' }, { key: 'archive', label: 'Archive', kind: 'submenu', children: [{ key: 'rename', label: 'Rename' }] }], groups: [{ key: 'project', label: 'Project' }] }\nconst selected: AvenMenuEvents<Key>['select'][0] = { key: 'rename', item: { key: 'rename', label: 'Rename' }, originalEvent: new Event('click') }\nconst slots: AvenMenuItemSlots<Key> = { default: ({ item, checked }) => checked ? item.label : item.label }\nvoid selected; void slots; h(AvenMenu, props); h(AvenMenuItem, { item: props.items[0]! }); h(AvenMenuGroup, { label: 'Actions' })\n`,
  )
  await writeFile(
    path.join(directory, 'surface-consumer.ts'),
    `import { h } from 'vue'\nimport { AvenCard, AvenPanel, AvenPropertyRow, type AvenCardProps, type AvenPanelProps, type AvenPropertyRowProps, type AvenPropertyRowEvents } from '@wellsaik/aven-vue'\nconst card: AvenCardProps = { title: 'Card', headingLevel: 3, variant: 'outlined' }\nconst panel: AvenPanelProps = { title: 'Panel', headingLevel: 4, headerDivider: false }\nconst row: AvenPropertyRowProps = { label: 'Owner', labelWidth: '10ch', editable: true, truncate: true }\nconst edit: AvenPropertyRowEvents['edit'][0] = { originalEvent: new MouseEvent('click') }\nvoid edit; h(AvenCard, card); h(AvenPanel, panel); h(AvenPropertyRow, row)\n`,
  )
  await writeFile(
    path.join(directory, 'code-consumer.ts'),
    `import { h } from 'vue'\nimport { AvenCodeBlock, type AvenCodeBlockProps, type AvenCodeBlockEvents, type AvenCodeBlockSlots } from '@wellsaik/aven-vue'\nconst props: AvenCodeBlockProps = { code: 'const answer = 42', language: 'typescript', showLineNumbers: true, copyable: true }\nconst copied: AvenCodeBlockEvents['copy'][0] = { success: false, error: new Error('blocked') }\nconst slots: AvenCodeBlockSlots = { line: ({ line, index }) => index ? line : line }\nvoid copied; void slots; h(AvenCodeBlock, props)\n`,
  )
  await writeFile(
    path.join(directory, 'tree-consumer.ts'),
    `import { h } from 'vue'\nimport { AvenTree, AvenTreeItem, type AvenTreeNode, type AvenTreeProps, type AvenTreeEvents, type AvenTreeSlots } from '@wellsaik/aven-vue'\ntype Key = 'src' | 'app'\nconst nodes: AvenTreeNode<Key>[] = [{ key: 'src', label: 'src', children: [{ key: 'app', label: 'App.vue' }] }]\nconst props: AvenTreeProps<Key> = { nodes, defaultExpandedKeys: ['src'], multiple: true, checkable: true }\nconst activate: AvenTreeEvents<Key>['activate'][0] = { key: 'app', node: nodes[0]!.children![0]!, originalEvent: new Event('keydown') }\nconst slots: AvenTreeSlots<Key> = { item: ({ key, level }) => String(key) + level }\nvoid activate; void slots; h(AvenTree, props); h(AvenTreeItem, { treeId: 'files', node: nodes[0]!, level: 1, position: 1, setSize: 1, index: 0, indexByKey: new Map([['src', 0]]), selectedKeys: [], expandedKeys: [], checkedKeys: [], loadingKeys: [], activeIndex: 0 })\n`,
  )
  await writeFile(
    path.join(directory, 'search-consumer.ts'),
    `import { h } from 'vue'\nimport { AvenSearchBar, AvenFilterBar, AvenFilterChip, type AvenFilterValue, type AvenFilterDefinition, type AvenSearchBarProps, type AvenSearchBarEvents, type AvenFilterBarEvents } from '@wellsaik/aven-vue'\nconst definitions: AvenFilterDefinition[] = [{ key: 'status', label: 'Status', valueType: 'select', operators: ['is'], options: [{ value: 'open', label: 'Open' }] }]\nconst filters: AvenFilterValue[] = [{ id: 'status-open', field: 'status', operator: 'is', value: 'open' }]\nconst props: AvenSearchBarProps = { defaultQuery: '', defaultFilters: filters, definitions, mode: 'apply' }\nconst apply: AvenSearchBarEvents['apply'][0] = { query: 'open', filters }\nconst clear: AvenFilterBarEvents['clear'][0] = { previousFilters: filters }\nvoid apply; void clear; h(AvenSearchBar, props); h(AvenFilterBar, { filters, definitions }); h(AvenFilterChip, { filter: filters[0]!, definition: definitions[0] })\n`,
  )
  await writeFile(
    path.join(directory, 'filter-builder-consumer.ts'),
    `import { h } from 'vue'\nimport { AvenFilterBuilder, AvenSortControl, type AvenFilterDefinition, type AvenFilterCondition, type AvenFilterGroup, type AvenFilterBuilderProps, type AvenFilterBuilderEvents, type AvenSortField, type AvenSortItem } from '@wellsaik/aven-vue'\ntype Field = 'status' | 'created'\nconst definitions: AvenFilterDefinition[] = [{ key: 'status', label: 'Status', valueType: 'select', operators: ['is'], options: [{ value: 'open', label: 'Open' }] }, { key: 'created', label: 'Created', valueType: 'date', operators: ['after', 'before'] }]\nconst condition: AvenFilterCondition<Field> = { id: 'open', field: 'status', operator: 'is', value: 'open' }\nconst group: AvenFilterGroup<Field> = { id: 'root', operator: 'and', children: [condition] }\nconst props: AvenFilterBuilderProps<Field> = { modelValue: group, definitions, maxDepth: 3, allowGroups: true }\nconst change: AvenFilterBuilderEvents<Field>['change'][0] = group\nconst fields: AvenSortField<Field>[] = [{ key: 'created', label: 'Created' }, { key: 'status', label: 'Status' }]\nconst sort: AvenSortItem<Field>[] = [{ key: 'created', direction: 'desc' }]\nvoid change; h(AvenFilterBuilder<Field>, props); h(AvenSortControl<Field>, { fields, modelValue: sort, multiple: true })\n`,
  )
  await writeFile(
    path.join(directory, 'tsconfig.json'),
    JSON.stringify({
      compilerOptions: {
        target: 'ES2022',
        module: 'ESNext',
        moduleResolution: 'Bundler',
        strict: true,
        skipLibCheck: false,
        noEmit: true,
      },
      include: [
        'main.ts',
        'slider-consumer.ts',
        'selection-consumer.ts',
        'overlay-consumer.ts',
        'primitive-consumer.ts',
        'date-consumer.ts',
        'form-consumer.ts',
        'menu-consumer.ts',
        'surface-consumer.ts',
        'code-consumer.ts',
        'tree-consumer.ts',
        'search-consumer.ts',
        'filter-builder-consumer.ts',
      ],
    }),
  )
  run(['exec', '--', 'tsc', '-p', 'tsconfig.json'], directory)
  await writeFile(
    path.join(directory, 'tsconfig.json'),
    JSON.stringify({
      compilerOptions: {
        target: 'ES2022',
        module: 'NodeNext',
        moduleResolution: 'NodeNext',
        strict: true,
        skipLibCheck: false,
        noEmit: true,
      },
      include: [
        'main.ts',
        'slider-consumer.ts',
        'selection-consumer.ts',
        'overlay-consumer.ts',
        'primitive-consumer.ts',
        'date-consumer.ts',
        'form-consumer.ts',
        'menu-consumer.ts',
        'surface-consumer.ts',
        'code-consumer.ts',
        'tree-consumer.ts',
        'search-consumer.ts',
        'filter-builder-consumer.ts',
      ],
    }),
  )
  run(['exec', '--', 'tsc', '-p', 'tsconfig.json'], directory)
  run(['exec', '--', 'vite', 'build'], directory)
  const bundle = await readFile(
    path.join(directory, 'node_modules/@wellsaik/aven-vue/dist/AvenText.js'),
    'utf8',
  )
  assert.match(bundle, /from\s*["']vue["']/)
  assert(!bundle.includes('packages/shared/src'))
  console.log(
    `Packed packages installed outside the workspace; ${seen.size} shared stylesheets resolved, Vue-free shared import, root component declarations and imports, and Vite consumer passed.`,
  )
} finally {
  await rm(directory, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 })
}
