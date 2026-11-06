# Current component theme reference

Snapshot extracted from [the token manifest](../packages/shared/src/tokens/colors.json) on 2026-11-05. These values already exist; component hooks in [the plan](component-library-plan.md) are proposed. Generated styles are in [core.css](../packages/shared/src/styles/colors/core.css) and [contrast.css](../packages/shared/src/styles/colors/contrast.css). Edit the manifest and regenerate CSS when changing colors; components must use variables rather than duplicate hex values.

## Theme selection

Use `data-aven-theme="light"`, `"dark"`, or `"system"` on the root or a subtree. Default root is light; system follows OS preference. Ordinary descendants inherit. Enhanced mappings use `data-aven-contrast="more"`; print uses `data-aven-output="print"`. Forced colors takes precedence. See [README](../README.md) for CSS imports and alias inheritance.

Dark surfaces are neutral charcoal. Dark semantic fills use dark on-solid foregrounds. A themed popup must preserve the active subtree and any custom overrides; see the portal contract in the plan.

## Existing surface and interaction tokens

Aliases intentionally remain CSS variable references.

| Existing CSS variable | Light | Dark |
| --- | --- | --- |
| `--aven-color-surface-backdrop` | `#F1F5F9` | `#101010` |
| `--aven-color-surface-window` | `#F8FAFC` | `#181818` |
| `--aven-color-surface-base` | `#FFFFFF` | `#1F1F1F` |
| `--aven-color-surface-recessed` | `#F1F5F9` | `#141414` |
| `--aven-color-surface-raised` | `#FFFFFF` | `#272727` |
| `--aven-color-surface-floating` | `#FFFFFF` | `#303030` |
| `--aven-color-surface-hover` | `#F1F5F9` | `#333333` |
| `--aven-color-surface-pressed` | `#E2E8F0` | `#414141` |
| `--aven-color-surface-disabled` | `#F1F5F9` | `#242424` |
| `--aven-color-surface-selected` | `#E8F0FC` | `#383838` |
| `--aven-color-surface-selected-hover` | `#DCE9FA` | `#414141` |
| `--aven-color-surface-selected-pressed` | `#CDDEF5` | `#494949` |
| `--aven-color-surface-inactive-selection` | `#E2E8F0` | `#373737` |
| `--aven-color-surface-card` | `var(--aven-color-surface-raised)` | `var(--aven-color-surface-raised)` |
| `--aven-color-surface-sidebar` | `var(--aven-color-surface-window)` | `var(--aven-color-surface-window)` |
| `--aven-color-surface-dialog` | `var(--aven-color-surface-raised)` | `var(--aven-color-surface-raised)` |
| `--aven-color-surface-drawer` | `var(--aven-color-surface-raised)` | `var(--aven-color-surface-raised)` |
| `--aven-color-surface-popover` | `var(--aven-color-surface-floating)` | `var(--aven-color-surface-floating)` |
| `--aven-color-surface-dropdown` | `var(--aven-color-surface-floating)` | `var(--aven-color-surface-floating)` |
| `--aven-color-surface-context-menu` | `var(--aven-color-surface-floating)` | `var(--aven-color-surface-floating)` |
| `--aven-color-surface-table-body` | `var(--aven-color-surface-base)` | `var(--aven-color-surface-base)` |
| `--aven-color-text-primary` | `#182536` | `#EDEDED` |
| `--aven-color-text-secondary` | `#45556C` | `#C5C5C5` |
| `--aven-color-text-tertiary` | `#526278` | `#BFBFBF` |
| `--aven-color-text-disabled` | `#8492A5` | `#777777` |
| `--aven-color-text-placeholder` | `var(--aven-color-text-tertiary)` | `var(--aven-color-text-tertiary)` |
| `--aven-color-text-inverse` | `#F8FAFC` | `#191919` |
| `--aven-color-text-emphasis` | `#0F172A` | `#FFFFFF` |
| `--aven-color-border-subtle` | `#E2E8F0` | `#363636` |
| `--aven-color-border-default` | `#CBD5E1` | `#505050` |
| `--aven-color-border-strong` | `#64748B` | `#A3A3A3` |
| `--aven-color-border-interactive` | `var(--aven-color-border-strong)` | `var(--aven-color-border-strong)` |
| `--aven-color-border-selected` | `var(--aven-color-accent-border)` | `var(--aven-color-accent-border)` |
| `--aven-color-border-invalid` | `var(--aven-color-danger-border)` | `var(--aven-color-danger-border)` |
| `--aven-color-focus-ring` | `#1D4ED8` | `#93C5FD` |
| `--aven-color-focus-separator` | `#FFFFFF` | `#141414` |
| `--aven-color-selection-text` | `#172554` | `#DBEAFE` |
| `--aven-color-selection-fill` | `#BFDBFE` | `#1E3A8A` |
| `--aven-color-icon-primary` | `var(--aven-color-text-primary)` | `var(--aven-color-text-primary)` |
| `--aven-color-icon-secondary` | `var(--aven-color-text-tertiary)` | `var(--aven-color-text-tertiary)` |
| `--aven-color-icon-disabled` | `var(--aven-color-text-disabled)` | `var(--aven-color-text-disabled)` |
| `--aven-color-shadow-ambient` | `#0F172A1A` | `#00000066` |
| `--aven-color-shadow-contact` | `#0F172A29` | `#00000099` |
| `--aven-color-scrim` | `#0F172A66` | `#00000099` |
| `--aven-color-veil-loading` | `#FFFFFFCC` | `#141414CC` |

## Semantic tone families

Use text with subtle/soft surfaces, and on-solid with solid fills. Solid hover/pressed states use their paired action recipes; soft/outline recipes are defined in the plan.

### neutral

| Existing CSS variable | Light | Dark |
| --- | --- | --- |
| `--aven-color-neutral-text` | `#1E293B` | `#E5E5E5` |
| `--aven-color-neutral-subtle` | `#F8FAFC` | `#101010` |
| `--aven-color-neutral-soft` | `#F1F5F9` | `#1C1C1C` |
| `--aven-color-neutral-border` | `#475569` | `#A3A3A3` |
| `--aven-color-neutral-solid` | `#334155` | `#D4D4D4` |
| `--aven-color-neutral-hover` | `#1E293B` | `#E5E5E5` |
| `--aven-color-neutral-pressed` | `#0F172A` | `#F5F5F5` |
| `--aven-color-neutral-on-solid` | `#FFFFFF` | `#171717` |

### accent

| Existing CSS variable | Light | Dark |
| --- | --- | --- |
| `--aven-color-accent-text` | `#1E40AF` | `#BFDBFE` |
| `--aven-color-accent-subtle` | `#EFF6FF` | `#172554` |
| `--aven-color-accent-soft` | `#DBEAFE` | `#1E3A8A` |
| `--aven-color-accent-border` | `#2563EB` | `#60A5FA` |
| `--aven-color-accent-solid` | `#1D4ED8` | `#93C5FD` |
| `--aven-color-accent-hover` | `#1E40AF` | `#BFDBFE` |
| `--aven-color-accent-pressed` | `#1E3A8A` | `#DBEAFE` |
| `--aven-color-accent-on-solid` | `#FFFFFF` | `#020617` |

### secondary

| Existing CSS variable | Light | Dark |
| --- | --- | --- |
| `--aven-color-secondary-text` | `#5B21B6` | `#DDD6FE` |
| `--aven-color-secondary-subtle` | `#F5F3FF` | `#2E1065` |
| `--aven-color-secondary-soft` | `#EDE9FE` | `#4C1D95` |
| `--aven-color-secondary-border` | `#7C3AED` | `#A78BFA` |
| `--aven-color-secondary-solid` | `#6D28D9` | `#C4B5FD` |
| `--aven-color-secondary-hover` | `#5B21B6` | `#DDD6FE` |
| `--aven-color-secondary-pressed` | `#4C1D95` | `#EDE9FE` |
| `--aven-color-secondary-on-solid` | `#FFFFFF` | `#020617` |

### info

| Existing CSS variable | Light | Dark |
| --- | --- | --- |
| `--aven-color-info-text` | `#075985` | `#BAE6FD` |
| `--aven-color-info-subtle` | `#F0F9FF` | `#082F49` |
| `--aven-color-info-soft` | `#E0F2FE` | `#0C4A6E` |
| `--aven-color-info-border` | `#0284C7` | `#38BDF8` |
| `--aven-color-info-solid` | `#0369A1` | `#7DD3FC` |
| `--aven-color-info-hover` | `#075985` | `#BAE6FD` |
| `--aven-color-info-pressed` | `#0C4A6E` | `#E0F2FE` |
| `--aven-color-info-on-solid` | `#FFFFFF` | `#020617` |

### success

| Existing CSS variable | Light | Dark |
| --- | --- | --- |
| `--aven-color-success-text` | `#065F46` | `#A7F3D0` |
| `--aven-color-success-subtle` | `#ECFDF5` | `#022C22` |
| `--aven-color-success-soft` | `#D1FAE5` | `#064E3B` |
| `--aven-color-success-border` | `#059669` | `#34D399` |
| `--aven-color-success-solid` | `#047857` | `#6EE7B7` |
| `--aven-color-success-hover` | `#065F46` | `#A7F3D0` |
| `--aven-color-success-pressed` | `#064E3B` | `#D1FAE5` |
| `--aven-color-success-on-solid` | `#FFFFFF` | `#020617` |

### warning

| Existing CSS variable | Light | Dark |
| --- | --- | --- |
| `--aven-color-warning-text` | `#92400E` | `#FDE68A` |
| `--aven-color-warning-subtle` | `#FFFBEB` | `#451A03` |
| `--aven-color-warning-soft` | `#FEF3C7` | `#78350F` |
| `--aven-color-warning-border` | `#D97706` | `#FBBF24` |
| `--aven-color-warning-solid` | `#B45309` | `#FCD34D` |
| `--aven-color-warning-hover` | `#92400E` | `#FDE68A` |
| `--aven-color-warning-pressed` | `#78350F` | `#FEF3C7` |
| `--aven-color-warning-on-solid` | `#FFFFFF` | `#020617` |

### danger

| Existing CSS variable | Light | Dark |
| --- | --- | --- |
| `--aven-color-danger-text` | `#991B1B` | `#FECACA` |
| `--aven-color-danger-subtle` | `#FEF2F2` | `#450A0A` |
| `--aven-color-danger-soft` | `#FEE2E2` | `#7F1D1D` |
| `--aven-color-danger-border` | `#DC2626` | `#F87171` |
| `--aven-color-danger-solid` | `#B91C1C` | `#FCA5A5` |
| `--aven-color-danger-hover` | `#991B1B` | `#FECACA` |
| `--aven-color-danger-pressed` | `#7F1D1D` | `#FEE2E2` |
| `--aven-color-danger-on-solid` | `#FFFFFF` | `#020617` |

### critical

| Existing CSS variable | Light | Dark |
| --- | --- | --- |
| `--aven-color-critical-text` | `#9F1239` | `#FECDD3` |
| `--aven-color-critical-subtle` | `#FFF1F2` | `#4C0519` |
| `--aven-color-critical-soft` | `#FFE4E6` | `#881337` |
| `--aven-color-critical-border` | `#E11D48` | `#FB7185` |
| `--aven-color-critical-solid` | `#BE123C` | `#FDA4AF` |
| `--aven-color-critical-hover` | `#9F1239` | `#FECDD3` |
| `--aven-color-critical-pressed` | `#881337` | `#FFE4E6` |
| `--aven-color-critical-on-solid` | `#FFFFFF` | `#020617` |

## Calculated sample contrast pairs

Calculated from opaque sRGB token values, without opacity/compositing, rounded to two decimals. This checks default pairs, not rendered components or conformance. Check actual interaction states, focus, translucent overlays and consumer overrides separately.

| Foreground / background (color prefix omitted) | Light contrast | Dark contrast |
| --- | --- | --- |
| `text-primary` / `surface-base` | 15.48:1 | 14.08:1 |
| `text-secondary` / `surface-base` | 7.58:1 | 9.55:1 |
| `text-placeholder` / `surface-base` | 6.22:1 | 8.96:1 |
| `border-interactive` / `surface-base` | 4.76:1 | 6.53:1 |
| `focus-ring` / `surface-base` | 6.70:1 | 9.14:1 |
| `neutral-on-solid` / `neutral-solid` | 10.35:1 | 12.09:1 |
| `neutral-text` / `neutral-subtle` | 13.98:1 | 15.11:1 |
| `accent-on-solid` / `accent-solid` | 6.70:1 | 11.19:1 |
| `accent-text` / `accent-subtle` | 8.01:1 | 10.34:1 |
| `secondary-on-solid` / `secondary-solid` | 7.10:1 | 10.93:1 |
| `secondary-text` / `secondary-subtle` | 8.19:1 | 10.97:1 |
| `info-on-solid` / `info-solid` | 5.93:1 | 12.10:1 |
| `info-text` / `info-subtle` | 7.09:1 | 10.46:1 |
| `success-on-solid` / `success-solid` | 5.48:1 | 13.23:1 |
| `success-text` / `success-subtle` | 7.29:1 | 11.81:1 |
| `warning-on-solid` / `warning-solid` | 5.02:1 | 13.99:1 |
| `warning-text` / `warning-subtle` | 6.84:1 | 12.03:1 |
| `danger-on-solid` / `danger-solid` | 6.47:1 | 10.63:1 |
| `danger-text` / `danger-subtle` | 7.60:1 | 11.16:1 |
| `critical-on-solid` / `critical-solid` | 6.29:1 | 10.67:1 |
| `critical-text` / `critical-subtle` | 7.30:1 | 11.08:1 |

Normal text generally needs 4.5:1, large text 3:1, and applicable non-text boundaries 3:1 against adjacent colors; assess actual context and exceptions using [WCAG 2.2](https://www.w3.org/TR/WCAG22/). Subtle separators cannot be the sole boundary of an otherwise invisible control. Disabled colors are not defaults for meaningful help text.

## Existing non-color tokens

From [non-color-tokens.css](../packages/shared/src/styles/non-color-tokens.css):

| Category | Current values |
| --- | --- |
| Fonts | sans: Inter, Segoe UI, sans-serif; serif: Georgia, Times New Roman, serif; mono: SFMono-Regular, Consolas, monospace |
| Font sizes | xs .75rem; sm .875rem; md 1rem; lg 1.125rem; xl 1.375rem; 2xl 1.75rem; 3xl 2.25rem |
| Line heights | tight 1.2; normal 1.5; relaxed 1.7 |
| Spacing | 1 .25rem; 2 .5rem; 3 .75rem; 4 1rem; 6 1.5rem; 8 2rem |
| Radii | sm .25rem; md .5rem; lg .875rem |

Use the actual token names, e.g. `--aven-font-size-md`, `--aven-space-4`, `--aven-radius-md`. Control heights, focus dimensions, shadow recipes, z-index layers, durations and breakpoints are proposed additions, not existing non-color tokens. Font files are app-owned.

## Optional domain styles

Existing finance, charts, diagrams and gradients entries are optional. Domain palettes retain financial/category meaning; generic controls use core tones. Use gradients with solid fallbacks and non-color cues; keep plots, legends and tooltips in the same resolved theme.
