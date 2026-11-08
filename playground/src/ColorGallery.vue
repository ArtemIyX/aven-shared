<script setup lang="ts">
import { computed, ref } from 'vue'
import colors from './colors-gallery.json'
const theme = ref('light')
const contrast = ref('normal')
const gradientQuery = ref('')
const gradientUse = ref('all')
const visibleGradients = computed(() =>
  colors.gradients.filter((g) => {
    const query = gradientQuery.value.trim().toLowerCase()
    return (
      (!query || `${g.name} ${g.purpose}`.toLowerCase().includes(query)) &&
      (gradientUse.value === 'all' ||
        (gradientUse.value === 'text' ? g.foreground !== 'none' : g.foreground === 'none'))
    )
  }),
)
const primitives = colors.primitives
const semantics = colors.semantics
</script>
<template>
  <section class="color-gallery" :data-aven-theme="theme" :data-aven-contrast="contrast">
    <h2>Color review</h2>
    <div class="gallery-controls">
      <label
        >Theme
        <select v-model="theme">
          <option>light</option>
          <option>dark</option>
          <option>system</option>
        </select></label
      >
      <label
        >Contrast
        <select v-model="contrast">
          <option>normal</option>
          <option>more</option>
        </select></label
      >
    </div>
    <p>Colors are paired with labels, signs and boundaries. Use keyboard Tab to inspect focus.</p>
    <div class="gallery-grid">
      <article class="gallery-panel">
        <h3>Controls and states</h3>
        <button class="gallery-button">Primary action</button> <button disabled>Disabled</button>
        <label>Invalid value <input aria-invalid="true" value="Invalid" /></label
        ><label>Read only <input readonly value="Readable" /></label>
        <p>
          <span class="badge">Success · completed</span>
          <span class="danger-badge">Warning · delayed</span>
        </p>
        <p class="inverse-sample">Inverse surface · readable text</p>
      </article>
      <article class="gallery-panel">
        <h3>Portfolio and tree</h3>
        <table>
          <thead>
            <tr>
              <th>Account</th>
              <th>Return</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr class="selected" tabindex="0">
              <td>▾ Selected portfolio</td>
              <td class="loss">−2.4%</td>
              <td>Edited</td>
            </tr>
            <tr>
              <td>  └ Cash</td>
              <td>0.0%</td>
              <td>Current</td>
            </tr>
            <tr>
              <td>  └ Bond</td>
              <td>—</td>
              <td>Missing / stale</td>
            </tr>
            <tr>
              <td>  └ Equity</td>
              <td class="range-cell">+3.1%</td>
              <td>Range selected</td>
            </tr>
            <tr>
              <th>Total</th>
              <td>+0.7%</td>
              <td>Updated</td>
            </tr>
          </tbody>
        </table>
      </article>
      <article class="gallery-panel">
        <h3>Line and area</h3>
        <svg viewBox="0 0 240 90" role="img" aria-label="Series one rises; series two falls">
          <path
            d="M10 75 L65 50 L120 58 L175 25 L230 12 L230 85 L10 85 Z"
            fill="var(--aven-color-series-01-fill)"
          />
          <path
            d="M10 75 L65 50 L120 58 L175 25 L230 12"
            fill="none"
            stroke="var(--aven-color-series-01-stroke)"
            stroke-width="3"
          />
          <path
            d="M10 18 L65 30 L120 40 L175 36 L230 64"
            fill="none"
            stroke="var(--aven-color-series-02-stroke)"
            stroke-width="3"
            stroke-dasharray="6 3"
          />
        </svg>
        <p>━━ Series 1 · ┄┄ Series 2</p>
      </article>
      <article class="gallery-panel">
        <h3>Allocation and depth</h3>
        <svg
          viewBox="0 0 240 90"
          role="img"
          aria-label="Allocation: bonds 60 percent, cash 40 percent; bid and ask depth"
        >
          <rect
            x="10"
            y="10"
            width="120"
            height="18"
            fill="var(--aven-color-series-01-fill)"
            stroke="var(--aven-color-series-01-stroke)"
          />
          <rect
            x="130"
            y="10"
            width="80"
            height="18"
            fill="var(--aven-color-series-02-fill)"
            stroke="var(--aven-color-series-02-stroke)"
            stroke-dasharray="4 2"
          />
          <path
            d="M10 80 L55 55 L100 65 L110 80Z"
            fill="var(--aven-color-depth-bid-fill)"
            stroke="var(--aven-color-buy-border)"
          />
          <path
            d="M120 80 L160 50 L210 65 L220 80Z"
            fill="var(--aven-color-depth-ask-fill)"
            stroke="var(--aven-color-sell-border)"
            stroke-dasharray="4 2"
          />
        </svg>
        <p>Bonds 60% · Cash 40% · Bid / Ask</p>
      </article>
      <article class="gallery-panel">
        <h3>Heatmap, candles and relationship</h3>
        <div class="heat"><span>−1</span><span>0</span><span>+1</span><span>Missing</span></div>
        <svg
          viewBox="0 0 240 70"
          role="img"
          aria-label="Rising and falling candles; two connected nodes"
        >
          <path d="M25 10v50 M65 10v50" stroke="var(--aven-color-text-primary)" />
          <rect x="18" y="20" width="14" height="25" fill="var(--aven-color-gain-solid)" />
          <rect x="58" y="25" width="14" height="25" fill="var(--aven-color-loss-solid)" />
          <path d="M120 35h55" stroke="var(--aven-color-edge-default)" stroke-width="3" />
          <circle
            cx="120"
            cy="35"
            r="12"
            fill="var(--aven-color-series-01-fill)"
            stroke="var(--aven-color-series-01-stroke)"
          />
          <circle
            cx="190"
            cy="35"
            r="12"
            fill="var(--aven-color-series-02-fill)"
            stroke="var(--aven-color-series-02-stroke)"
          />
        </svg>
        <p>↑ Rising · ↓ Falling · connected nodes</p>
      </article>
    </div>
    <article data-aven-output="print" class="gallery-panel print-preview">
      <h3>Print / monochrome preview</h3>
      <p>━━ Actual +3.2% · ┄┄ Forecast −1.4% · × Missing</p>
      <svg viewBox="0 0 240 70" role="img" aria-label="Actual solid line, forecast dashed line">
        <path
          d="M10 55 L90 35 L180 20"
          fill="none"
          stroke="var(--aven-color-series-01-stroke)"
          stroke-width="3"
        />
        <path
          d="M10 20 L90 40 L180 55"
          fill="none"
          stroke="var(--aven-color-series-02-stroke)"
          stroke-width="3"
          stroke-dasharray="5 4"
        />
      </svg>
    </article>
    <div data-aven-theme="dark" class="gallery-panel">
      Dark scope
      <div data-aven-theme="light" class="gallery-panel">
        Nested light scope <span data-aven-theme="system">· system scope</span>
      </div>
    </div>
    <details>
      <summary>Primitive ramps ({{ primitives.length }})</summary>
      <div class="swatch-grid">
        <div v-for="t in primitives" :key="t.name">
          <span class="swatch" :style="{ backgroundColor: `var(${t.name})` }"></span
          ><code>{{ t.name }}</code
          ><small>{{ t.value }}</small>
        </div>
      </div>
    </details>
    <details>
      <summary>Semantic roles ({{ semantics.length }})</summary>
      <div class="swatch-grid">
        <div v-for="t in semantics" :key="t.name">
          <span class="swatch" :style="{ backgroundColor: `var(${t.name})` }"></span
          ><code>{{ t.name }}</code
          ><small>{{ t.light }} / {{ t.dark }}</small>
        </div>
      </div>
    </details>
    <details>
      <summary>Scales ({{ colors.scales.length }})</summary>
      <div v-for="s in colors.scales" :key="s.name">
        <p>{{ s.name }} — {{ s.direction }}</p>
        <div class="scale">
          <span
            v-for="n in s.count"
            :key="n"
            :style="{
              backgroundColor: `var(--aven-scale-${s.name}-${String(n).padStart(2, '0')})`,
            }"
          ></span>
        </div>
      </div>
    </details>
    <details>
      <summary>Gradients and solid fallbacks ({{ colors.gradients.length }})</summary>
      <div class="gallery-controls gradient-filters">
        <label
          >Find a gradient
          <input v-model="gradientQuery" type="search" placeholder="Name or purpose" /></label
        ><label
          >Allowed use
          <select v-model="gradientUse">
            <option value="all">All gradients</option>
            <option value="text">Supports text</option>
            <option value="decorative">No text</option>
          </select></label
        >
      </div>
      <p>Showing {{ visibleGradients.length }} of {{ colors.gradients.length }} gradients.</p>
      <div class="gallery-grid">
        <div v-for="g in visibleGradients" :key="g.name">
          <p>{{ g.name }} · foreground: {{ g.foreground }}</p>
          <div
            class="gradient"
            :style="{
              backgroundColor: `var(--aven-gradient-${g.name}-fallback)`,
              backgroundImage: `var(--aven-gradient-${g.name}-image)`,
            }"
          ></div>
          <div
            class="fallback"
            :style="{ backgroundColor: `var(--aven-gradient-${g.name}-fallback)` }"
          ></div>
          <small>{{ g.purpose }}</small>
        </div>
      </div>
    </details>
  </section>
</template>
