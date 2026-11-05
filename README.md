# @wellsaik/aven-shared

A small shared design system for Aven applications. It provides semantic CSS tokens, optional application defaults, and one Vue 3 text component.

## Install and import styles

Install the package in a Vue 3 application:

```sh
npm install @wellsaik/aven-shared
```

Import the CSS once from the application entry point, in this order:

```ts
import '@wellsaik/aven-shared/tokens.css'
import '@wellsaik/aven-shared/base.css' // Optional; opt in by adding .aven-app to an application root.
import '@wellsaik/aven-shared/style.css'
```

`tokens.css` declares defaults on `:root`. Import application overrides after the package styles, or define the same `--aven-*` properties on an application subtree. The component does not import CSS automatically, so applications choose the CSS files they need.

## AvenText

```vue
<script setup lang="ts">
import { AvenText } from '@wellsaik/aven-shared'
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

The component is also available from `@wellsaik/aven-shared/AvenText`.

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

The playground aliases `@wellsaik/aven-shared` to the local source and demonstrates every text type, slot markup, semantic element overrides, classes, inline styles, and a scoped theme. The package checks are:

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
npm install ../aven-shared/wellsaik-aven-shared-0.1.0.tgz
```

The tarball contains the compiled JavaScript, generated TypeScript declarations, README, and CSS files addressed by the package exports. This local tarball workflow does not publish anything.

## Release workflow

The first public version is a one-time manual setup. The package currently starts at `0.1.0`.

1. Sign in to npm with the `wellsaik` account and two-factor authentication enabled. This package uses your user scope, `@wellsaik`.
2. From the repository, install and validate the package:

   ```sh
   npm ci
   npm run typecheck
   npm run build
   npm run build:playground
   npm test
   npm run pack:check
   ```

3. Publish the initial public version once:

   ```sh
   npm login
   npm publish --access public
   ```

4. After the package exists and the `publish.yml` workflow is on the GitHub repository, open the npm package settings and add a GitHub Actions trusted publisher for `ArtemIyX/aven-shared`, using the workflow filename `publish.yml`. Explicitly allow direct `npm publish`. Configure this shortly before merging the workflow so the first trusted publish can validate the configuration.
5. Merge the workflow to `main`. The merge push will run the first automated patch release.

After setup, every push to `main`, including documentation-only changes, runs validation, increments the patch version, commits the updated `package.json` and lockfile, and publishes that version to npm. The version commit uses GitHub's workflow token and does not start another push workflow.

To release manually, open **Actions → Publish @wellsaik/aven-shared → Run workflow**, select `main`, and choose `patch`, `minor`, `major`, or `current`. The first three choices bump and commit a version before publishing. `current` retries the version already in `package.json`; if npm already has it, the run reports that and skips publishing. The manual button is available after this workflow is merged into the default branch.

Build, test, or package-check failures stop before the version commit and publish. If npm publishing fails after the version commit, use the manual `current` option to retry. The workflow saves logs and available package outputs for 14 days.

Trusted publishing uses GitHub's short-lived OIDC identity instead of a stored npm write token. GitHub Actions needs `contents: write` to commit version bumps and `id-token: write` to publish. Repository settings and branch rules must allow the workflow to push to `main`.

These publishing instructions describe the release workflow; publishing was not run as part of local development.

## License

This package is distributed under the MIT License. See [LICENSE](./LICENSE).
