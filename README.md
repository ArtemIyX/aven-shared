# @aven/shared

A small shared design system for Aven applications. It provides semantic CSS tokens, optional application defaults, and one Vue 3 text component.

## Install and import styles

Install the package in a Vue 3 application:

```sh
npm install @aven/shared
```

Import the CSS once from the application entry point, in this order:

```ts
import '@aven/shared/tokens.css'
import '@aven/shared/base.css' // Optional; opt in by adding .aven-app to an application root.
import '@aven/shared/style.css'
```

`tokens.css` declares defaults on `:root`. Import application overrides after the package styles, or define the same `--aven-*` properties on an application subtree. The component does not import CSS automatically, so applications choose the CSS files they need.

## AvenText

```vue
<script setup lang="ts">
import { AvenText } from '@aven/shared'
</script>

<template>
  <AvenText type="title">My application</AvenText>

  <AvenText type="header2" as="h3">A section title</AvenText>

  <AvenText>
    Hello <strong>{{ userName }}</strong>.
    <a href="/profile">Open your profile</a>
  </AvenText>

  <AvenText type="quote">
    A quotation with <em>custom emphasis</em>.
  </AvenText>
</template>
```

`type` is optional and defaults to `text`. Supported visual types and default elements are `title` (`h1`), `header1` (`h1`), `header2` (`h2`), `header3` (`h3`), `text` (`p`), `quote` (`blockquote`), and `caption` (`span`). `title` has a larger visual style than `header1`.

The optional `as` prop accepts a standard HTML element name and changes the rendered element without changing its visual type. Choose heading levels based on the document structure, not only the appearance you want. The component forwards normal attributes and listeners to its single root and renders its default slot as Vue content. Slot content must be valid inside the selected element (for example, do not put a paragraph inside a `span`).

The component is also available from `@aven/shared/AvenText`.

## Customization

All public tokens and component classes begin with `aven`. The default tokens cover semantic colors, font families, font sizes, line heights, spacing, and radii. Override tokens globally after the package CSS or within an application subtree:

```css
:root {
  --aven-color-accent: #385d83;
  --aven-font-family-sans: "Aptos", sans-serif;
}

.account-area {
  --aven-color-text: #25382f;
  --aven-color-surface: #f1f7f2;
}
```

Use ordinary `class` and `style` attributes for component-specific customization. The component also exposes `--aven-text-color`, `--aven-text-font-family`, `--aven-text-font-size`, `--aven-text-font-weight`, and `--aven-text-line-height`. Component selectors use low specificity, and slotted child elements are not styled by the library.

## Local development

From this repository, install dependencies and run the playground:

```sh
npm install
npm run dev
```

The playground aliases `@aven/shared` to the local source and demonstrates every text type, slot markup, semantic element overrides, classes, inline styles, and a scoped theme. The package checks are:

```sh
npm run typecheck
npm run build
npm run build:playground
npm test
npm run pack:check
```

`npm test` runs after the build because it checks the compiled component. These local commands work against this repository; they do not require a published package.

To test the actual packed package from another local application, first build and create the tarball:

```sh
npm run build
npm pack
```

Then, in the consuming application's directory, install the generated tarball by its path:

```sh
npm install ../aven-shared/aven-shared-0.1.0.tgz
```

The tarball contains the compiled JavaScript, generated TypeScript declarations, README, and CSS files addressed by the package exports. This local tarball workflow does not publish anything.

## Future release workflow

After a version is ready, build and review the package, update the package version, publish that version to the npm registry, then upgrade the consuming application to the new version. The following are future examples and require a published package and registry access:

```sh
# In @aven/shared, after choosing the next version:
npm version patch
npm run build
npm publish --access public

# In a consuming application:
npm install @aven/shared@latest
```
