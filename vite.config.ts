import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: fileURLToPath(new URL('./packages/vue/dist', import.meta.url)),
    lib: {
      entry: {
        index: fileURLToPath(new URL('./packages/vue/src/index.ts', import.meta.url)),
        AvenText: fileURLToPath(new URL('./packages/vue/src/AvenText.ts', import.meta.url)),
        AvenButton: fileURLToPath(new URL('./packages/vue/src/AvenButton.vue', import.meta.url)),
        AvenField: fileURLToPath(new URL('./packages/vue/src/AvenField.vue', import.meta.url)),
        AvenInput: fileURLToPath(new URL('./packages/vue/src/AvenInput.vue', import.meta.url)),
        AvenSearchField: fileURLToPath(
          new URL('./packages/vue/src/AvenSearchField.vue', import.meta.url),
        ),
        AvenPasswordField: fileURLToPath(
          new URL('./packages/vue/src/AvenPasswordField.vue', import.meta.url),
        ),
        AvenBadge: fileURLToPath(new URL('./packages/vue/src/AvenBadge.vue', import.meta.url)),
        AvenLink: fileURLToPath(new URL('./packages/vue/src/AvenLink.vue', import.meta.url)),
        AvenSeparator: fileURLToPath(
          new URL('./packages/vue/src/AvenSeparator.vue', import.meta.url),
        ),
        AvenTextarea: fileURLToPath(
          new URL('./packages/vue/src/AvenTextarea.vue', import.meta.url),
        ),
        AvenCheckbox: fileURLToPath(
          new URL('./packages/vue/src/AvenCheckbox.vue', import.meta.url),
        ),
        AvenSwitch: fileURLToPath(new URL('./packages/vue/src/AvenSwitch.vue', import.meta.url)),
        AvenStatusDot: fileURLToPath(
          new URL('./packages/vue/src/AvenStatusDot.vue', import.meta.url),
        ),
        AvenKbd: fileURLToPath(new URL('./packages/vue/src/AvenKbd.vue', import.meta.url)),
        AvenAlert: fileURLToPath(new URL('./packages/vue/src/AvenAlert.vue', import.meta.url)),
        AvenBanner: fileURLToPath(new URL('./packages/vue/src/AvenBanner.vue', import.meta.url)),
        AvenSpinner: fileURLToPath(new URL('./packages/vue/src/AvenSpinner.vue', import.meta.url)),
        AvenProgress: fileURLToPath(
          new URL('./packages/vue/src/AvenProgress.vue', import.meta.url),
        ),
        AvenFieldset: fileURLToPath(
          new URL('./packages/vue/src/AvenFieldset.vue', import.meta.url),
        ),
        AvenSkeleton: fileURLToPath(
          new URL('./packages/vue/src/AvenSkeleton.vue', import.meta.url),
        ),
        AvenEmptyState: fileURLToPath(
          new URL('./packages/vue/src/AvenEmptyState.vue', import.meta.url),
        ),
        AvenResultState: fileURLToPath(
          new URL('./packages/vue/src/AvenResultState.vue', import.meta.url),
        ),
        AvenToolbar: fileURLToPath(new URL('./packages/vue/src/AvenToolbar.vue', import.meta.url)),
        AvenActionBar: fileURLToPath(
          new URL('./packages/vue/src/AvenActionBar.vue', import.meta.url),
        ),
        AvenToast: fileURLToPath(new URL('./packages/vue/src/AvenToast.vue', import.meta.url)),
        AvenToaster: fileURLToPath(new URL('./packages/vue/src/AvenToaster.vue', import.meta.url)),
        AvenScrollArea: fileURLToPath(
          new URL('./packages/vue/src/AvenScrollArea.vue', import.meta.url),
        ),
        AvenAppShell: fileURLToPath(
          new URL('./packages/vue/src/AvenAppShell.vue', import.meta.url),
        ),
        AvenStepper: fileURLToPath(new URL('./packages/vue/src/AvenStepper.vue', import.meta.url)),
        AvenSplitPane: fileURLToPath(
          new URL('./packages/vue/src/AvenSplitPane.vue', import.meta.url),
        ),
        AvenList: fileURLToPath(new URL('./packages/vue/src/AvenList.vue', import.meta.url)),
        AvenListItem: fileURLToPath(
          new URL('./packages/vue/src/AvenListItem.vue', import.meta.url),
        ),
        AvenVirtualList: fileURLToPath(
          new URL('./packages/vue/src/AvenVirtualList.vue', import.meta.url),
        ),
        AvenTable: fileURLToPath(new URL('./packages/vue/src/AvenTable.vue', import.meta.url)),
        AvenDataTable: fileURLToPath(
          new URL('./packages/vue/src/AvenDataTable.vue', import.meta.url),
        ),
        AvenTimeline: fileURLToPath(
          new URL('./packages/vue/src/AvenTimeline.vue', import.meta.url),
        ),
        AvenActivityList: fileURLToPath(
          new URL('./packages/vue/src/AvenTimeline.vue', import.meta.url),
        ),
        AvenSwitcher: fileURLToPath(
          new URL('./packages/vue/src/AvenSwitcher.vue', import.meta.url),
        ),
        AvenViewSwitcher: fileURLToPath(
          new URL('./packages/vue/src/AvenViewSwitcher.vue', import.meta.url),
        ),
        AvenFileInput: fileURLToPath(
          new URL('./packages/vue/src/AvenFileInput.vue', import.meta.url),
        ),
        AvenDropzone: fileURLToPath(
          new URL('./packages/vue/src/AvenDropzone.vue', import.meta.url),
        ),
        AvenColorPicker: fileURLToPath(
          new URL('./packages/vue/src/AvenColorPicker.vue', import.meta.url),
        ),
        AvenDatePicker: fileURLToPath(
          new URL('./packages/vue/src/AvenDatePicker.vue', import.meta.url),
        ),
        AvenDateRangePicker: fileURLToPath(
          new URL('./packages/vue/src/AvenDateRangePicker.vue', import.meta.url),
        ),
        AvenTimePicker: fileURLToPath(
          new URL('./packages/vue/src/AvenTimePicker.vue', import.meta.url),
        ),
        AvenCodeBlock: fileURLToPath(
          new URL('./packages/vue/src/AvenCodeBlock.vue', import.meta.url),
        ),
        AvenTree: fileURLToPath(new URL('./packages/vue/src/AvenTree.vue', import.meta.url)),
        AvenTreeItem: fileURLToPath(
          new URL('./packages/vue/src/AvenTreeItem.vue', import.meta.url),
        ),
        AvenFilterChip: fileURLToPath(
          new URL('./packages/vue/src/AvenFilterChip.vue', import.meta.url),
        ),
        AvenFilterBar: fileURLToPath(
          new URL('./packages/vue/src/AvenFilterBar.vue', import.meta.url),
        ),
        AvenSearchBar: fileURLToPath(
          new URL('./packages/vue/src/AvenSearchBar.vue', import.meta.url),
        ),
        AvenCard: fileURLToPath(new URL('./packages/vue/src/AvenCard.vue', import.meta.url)),
        AvenPropertyRow: fileURLToPath(
          new URL('./packages/vue/src/AvenPropertyRow.vue', import.meta.url),
        ),
        AvenDialog: fileURLToPath(new URL('./packages/vue/src/AvenDialog.vue', import.meta.url)),
        AvenTooltip: fileURLToPath(new URL('./packages/vue/src/AvenTooltip.vue', import.meta.url)),
        AvenPopover: fileURLToPath(new URL('./packages/vue/src/AvenPopover.vue', import.meta.url)),
        AvenSelect: fileURLToPath(new URL('./packages/vue/src/AvenSelect.vue', import.meta.url)),
        AvenListbox: fileURLToPath(new URL('./packages/vue/src/AvenListbox.vue', import.meta.url)),
        AvenSlider: fileURLToPath(new URL('./packages/vue/src/AvenSlider.vue', import.meta.url)),
        AvenRangeSlider: fileURLToPath(
          new URL('./packages/vue/src/AvenRangeSlider.vue', import.meta.url),
        ),
        AvenCombobox: fileURLToPath(
          new URL('./packages/vue/src/AvenCombobox.vue', import.meta.url),
        ),
        AvenMultiSelect: fileURLToPath(
          new URL('./packages/vue/src/AvenMultiSelect.vue', import.meta.url),
        ),
        AvenContextMenu: fileURLToPath(
          new URL('./packages/vue/src/AvenContextMenu.vue', import.meta.url),
        ),
        AvenMenubar: fileURLToPath(new URL('./packages/vue/src/AvenMenubar.vue', import.meta.url)),
        AvenAlertDialog: fileURLToPath(
          new URL('./packages/vue/src/AvenAlertDialog.vue', import.meta.url),
        ),
        AvenCommandPalette: fileURLToPath(
          new URL('./packages/vue/src/AvenCommandPalette.vue', import.meta.url),
        ),
        AvenDrawer: fileURLToPath(new URL('./packages/vue/src/AvenDrawer.vue', import.meta.url)),
        AvenSheet: fileURLToPath(new URL('./packages/vue/src/AvenSheet.vue', import.meta.url)),
        AvenMenu: fileURLToPath(new URL('./packages/vue/src/AvenMenu.vue', import.meta.url)),
        AvenMenuItem: fileURLToPath(
          new URL('./packages/vue/src/AvenMenuItem.vue', import.meta.url),
        ),
        AvenMenuGroup: fileURLToPath(
          new URL('./packages/vue/src/AvenMenuGroup.vue', import.meta.url),
        ),
        AvenDropdownMenu: fileURLToPath(
          new URL('./packages/vue/src/AvenDropdownMenu.vue', import.meta.url),
        ),
        AvenIcon: fileURLToPath(new URL('./packages/vue/src/AvenIcon.vue', import.meta.url)),
        AvenIconButton: fileURLToPath(
          new URL('./packages/vue/src/AvenIconButton.vue', import.meta.url),
        ),
        AvenTabs: fileURLToPath(new URL('./packages/vue/src/AvenTabs.vue', import.meta.url)),
        AvenSegmentedControl: fileURLToPath(
          new URL('./packages/vue/src/AvenSegmentedControl.vue', import.meta.url),
        ),
        AvenBreadcrumb: fileURLToPath(
          new URL('./packages/vue/src/AvenBreadcrumb.vue', import.meta.url),
        ),
        AvenPagination: fileURLToPath(
          new URL('./packages/vue/src/AvenPagination.vue', import.meta.url),
        ),
        AvenNavList: fileURLToPath(new URL('./packages/vue/src/AvenNavList.vue', import.meta.url)),
        AvenNumberInput: fileURLToPath(
          new URL('./packages/vue/src/AvenNumberInput.vue', import.meta.url),
        ),
        AvenForm: fileURLToPath(new URL('./packages/vue/src/AvenForm.vue', import.meta.url)),
        AvenFormActions: fileURLToPath(
          new URL('./packages/vue/src/AvenFormActions.vue', import.meta.url),
        ),
        AvenChip: fileURLToPath(new URL('./packages/vue/src/AvenChip.vue', import.meta.url)),
        AvenTag: fileURLToPath(new URL('./packages/vue/src/AvenTag.vue', import.meta.url)),
        AvenAvatar: fileURLToPath(new URL('./packages/vue/src/AvenAvatar.vue', import.meta.url)),
        AvenAvatarGroup: fileURLToPath(
          new URL('./packages/vue/src/AvenAvatarGroup.vue', import.meta.url),
        ),
        AvenSidebar: fileURLToPath(new URL('./packages/vue/src/AvenSidebar.vue', import.meta.url)),
        AvenButtonGroup: fileURLToPath(
          new URL('./packages/vue/src/AvenButtonGroup.vue', import.meta.url),
        ),
        AvenSplitButton: fileURLToPath(
          new URL('./packages/vue/src/AvenSplitButton.vue', import.meta.url),
        ),
        AvenRadioGroup: fileURLToPath(
          new URL('./packages/vue/src/AvenRadioGroup.vue', import.meta.url),
        ),
        AvenRadio: fileURLToPath(new URL('./packages/vue/src/AvenRadio.vue', import.meta.url)),
        AvenToggleButton: fileURLToPath(
          new URL('./packages/vue/src/AvenToggleButton.vue', import.meta.url),
        ),
        AvenToggleGroup: fileURLToPath(
          new URL('./packages/vue/src/AvenToggleGroup.vue', import.meta.url),
        ),
        AvenCheckboxGroup: fileURLToPath(
          new URL('./packages/vue/src/AvenCheckboxGroup.vue', import.meta.url),
        ),
        AvenPanel: fileURLToPath(new URL('./packages/vue/src/AvenPanel.vue', import.meta.url)),
        AvenAccordion: fileURLToPath(
          new URL('./packages/vue/src/AvenAccordion.vue', import.meta.url),
        ),
        AvenCollapsible: fileURLToPath(
          new URL('./packages/vue/src/AvenCollapsible.vue', import.meta.url),
        ),
        AvenStack: fileURLToPath(new URL('./packages/vue/src/AvenStack.vue', import.meta.url)),
        AvenInline: fileURLToPath(new URL('./packages/vue/src/AvenInline.vue', import.meta.url)),
        AvenGrid: fileURLToPath(new URL('./packages/vue/src/AvenGrid.vue', import.meta.url)),
        AvenContainer: fileURLToPath(
          new URL('./packages/vue/src/AvenContainer.vue', import.meta.url),
        ),
        AvenFormattedValue: fileURLToPath(
          new URL('./packages/vue/src/AvenFormattedValue.vue', import.meta.url),
        ),
        AvenStat: fileURLToPath(new URL('./packages/vue/src/AvenStat.vue', import.meta.url)),
      },
      formats: ['es'],
      fileName: (_format, entryName) => `${entryName}.js`,
    },
    rollupOptions: {
      external: ['vue'],
    },
  },
})
