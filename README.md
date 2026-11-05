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
npm install ../aven-shared/wellsaik-aven-shared-0.1.1.tgz
```

The tarball contains the compiled JavaScript, generated TypeScript declarations, README, and CSS files addressed by the package exports. This local tarball workflow does not publish anything.

## Release workflow

The first public version (`0.1.0`) is a one-time manual setup. After that, put every version bump in a pull request so the required checks run before the version reaches `main`.

### Prepare a release PR

Create a release branch and bump the version there. For example, after `0.1.1` has shipped, a patch release would be:

```sh
git switch -c release/v0.1.2
npm version patch --no-git-tag-version
git add package.json package-lock.json
git commit -m "chore: release v0.1.2"
git push -u origin release/v0.1.2
```

For a minor or major release, use `npm version minor --no-git-tag-version` or `npm version major --no-git-tag-version`, and name the branch and commit for the resulting version. Open a PR to `main`, let the required checks pass, and merge it.

When that version reaches `main`, `publish.yml` validates the package and publishes the version from `package.json` if it is not already on npm. The workflow does not edit or push to `main`. Normal pushes with an already-published version are validated and then skipped.

### Retry a publish

If publishing failed after the version PR was merged, open **Actions → Publish @wellsaik/aven-shared → Run workflow**, select `main`, and run it again. The workflow retries the current `package.json` version if npm does not have it yet; it skips the version if it is already published. The manual button is available after this workflow is merged into the default branch.

Type-check, build, test, or package-check failures stop before publishing. The workflow saves logs and available package outputs for 14 days.

Trusted publishing uses GitHub's short-lived OIDC identity instead of a stored npm write token. The release workflow needs `id-token: write` to publish. Configure npm's trusted publisher for `ArtemIyX/aven-shared` and workflow filename `publish.yml`; the package must already exist on npm for trusted publishing to work.

The initial `0.1.0` publication and npm trusted-publisher setup are one-time manual steps. Subsequent releases use the PR, merge, and publish flow above.

## License

This package is distributed under the MIT License. See [LICENSE](./LICENSE).
