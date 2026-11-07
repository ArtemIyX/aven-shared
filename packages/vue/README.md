# @wellsaik/aven-vue

Vue 3 components for Aven. Install `@wellsaik/aven-vue`, `@wellsaik/aven-shared`, and Vue 3.3 or newer within the declared peer range. Import components and public types from `@wellsaik/aven-vue`; import `@wellsaik/aven-shared/tokens.css` and `@wellsaik/aven-vue/style.css` explicitly in the application entry point.

```ts
import '@wellsaik/aven-shared/tokens.css'
import '@wellsaik/aven-vue/style.css'
import { AvenButton, AvenField, AvenInput, AvenProvider } from '@wellsaik/aven-vue'
```

The stylesheet subpath points to the CSS extracted from Vue SFCs plus the retained AvenText foundation styles. Importing component JavaScript does not inject global CSS. See the [component catalog](../../docs/component-catalog.md), [usage reference](../../docs/vue-component-usage.md), [theme reference](../../docs/component-theme-reference.md), and [implementation status](../../docs/component-implementation-status.md) for contracts and current coverage.
