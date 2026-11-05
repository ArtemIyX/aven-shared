<script setup lang="ts">
import { ref } from 'vue'
import { AvenText } from '@wellsaik/aven-shared'

const userName = ref('Avery')
</script>

<template>
  <main class="aven-app playground-shell">
    <section class="playground-intro">
      <AvenText type="title">Aven shared design system</AvenText>
      <AvenText class="intro-copy">
        A small text component with semantic markup, themeable tokens, and ordinary Vue slots.
      </AvenText>
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
            Hello <strong>{{ userName }}</strong>. <a href="#profile">Open your profile</a>.
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

    <section class="playground-card playground-theme" aria-labelledby="theme-example">
      <AvenText id="theme-example" type="header1">Scoped theme override</AvenText>
      <AvenText>
        These colors and type defaults come from <code>.playground-theme</code>, so the rest of the
        page keeps the shared defaults.
      </AvenText>
      <AvenText type="header2">A local application theme</AvenText>
    </section>
  </main>
</template>
