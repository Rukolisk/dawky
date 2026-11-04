<!-- components/ui/AdresseAutocomplete.vue -->
<!-- Autocomplétion d'adresse via api-adresse.data.gouv.fr -->
<template>
  <div class="addr-wrap" ref="wrapRef">
    <input
      v-bind="$attrs"
      :value="modelValue"
      type="text"
      class="form-input"
      :placeholder="placeholder"
      autocomplete="off"
      @input="onInput"
      @focus="open = suggestions.length > 0"
      @keydown.down.prevent="moveDown"
      @keydown.up.prevent="moveUp"
      @keydown.enter.prevent="selectActive"
      @keydown.escape="open = false"
    />
    <div v-if="loading" class="addr-spinner">⏳</div>

    <Transition name="addr-drop">
      <ul v-if="open && suggestions.length" class="addr-dropdown">
        <li
          v-for="(s, i) in suggestions"
          :key="s.label"
          :class="['addr-option', { 'addr-option--active': i === activeIdx }]"
          @mousedown.prevent="select(s)"
        >
          <span class="addr-option__icon">{{ typeIcon(s.type) }}</span>
          <div>
            <span class="addr-option__label">{{ s.label }}</span>
            <span class="addr-option__sub">{{ s.codePostal }} {{ s.ville }}</span>
          </div>
        </li>
      </ul>
    </Transition>
  </div>
</template>

<script setup lang="ts">
interface Suggestion {
  label: string; nom: string; codePostal: string
  ville: string; citycode: string; type: string
}

const props = withDefaults(defineProps<{
  modelValue: string
  placeholder?: string
  type?: 'housenumber' | 'street' | 'locality' | 'municipality'
}>(), {
  placeholder: 'Commencez à taper votre adresse…',
  type: 'housenumber',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'select': [suggestion: Suggestion]
}>()

const suggestions = ref<Suggestion[]>([])
const open       = ref(false)
const loading    = ref(false)
const activeIdx  = ref(-1)
const wrapRef    = ref<HTMLElement | null>(null)

let debounceTimer: ReturnType<typeof setTimeout> | null = null

async function onInput(e: Event) {
  const val = (e.target as HTMLInputElement).value
  emit('update:modelValue', val)
  activeIdx.value = -1

  if (debounceTimer) clearTimeout(debounceTimer)
  if (val.length < 3) { suggestions.value = []; open.value = false; return }

  debounceTimer = setTimeout(async () => {
    loading.value = true
    try {
      const params: Record<string, string> = { q: val, limit: '6' }
      if (props.type) params.type = props.type
      const res = await $fetch<Suggestion[]>('/api/geo/adresse', { params })
      suggestions.value = res
      open.value = res.length > 0
    } catch { suggestions.value = [] }
    finally { loading.value = false }
  }, 280)
}

function select(s: Suggestion) {
  emit('update:modelValue', s.label)
  emit('select', s)
  open.value = false
  suggestions.value = []
}

function moveDown() {
  if (!open.value) return
  activeIdx.value = Math.min(activeIdx.value + 1, suggestions.value.length - 1)
}
function moveUp() {
  activeIdx.value = Math.max(activeIdx.value - 1, -1)
}
function selectActive() {
  if (activeIdx.value >= 0) select(suggestions.value[activeIdx.value])
}

function typeIcon(type: string) {
  if (type === 'housenumber') return '🏠'
  if (type === 'street')      return '🛣️'
  if (type === 'municipality') return '🏙️'
  return '📍'
}

// Fermer si clic en dehors
onMounted(() => {
  document.addEventListener('click', (e) => {
    if (wrapRef.value && !wrapRef.value.contains(e.target as Node)) {
      open.value = false
    }
  })
})
</script>

<style scoped>
.addr-wrap { position: relative; }
.addr-spinner {
  position: absolute; right: .8rem; top: 50%; transform: translateY(-50%);
  font-size: .9rem; pointer-events: none;
}

.addr-dropdown {
  position: absolute; top: calc(100% + 4px); left: 0; right: 0;
  background: white; border-radius: 14px;
  border: 1.5px solid var(--brume);
  box-shadow: var(--shadow-lg);
  z-index: 200; list-style: none; overflow: hidden;
  max-height: 300px; overflow-y: auto;
}
.addr-option {
  display: flex; align-items: center; gap: .8rem;
  padding: .75rem 1rem; cursor: pointer;
  transition: background .15s; border-bottom: 1px solid var(--neige);
}
.addr-option:last-child { border: none; }
.addr-option:hover,
.addr-option--active { background: #FFF4E6; }
.addr-option__icon { font-size: 1.1rem; flex-shrink: 0; }
.addr-option__label { display: block; font-size: .9rem; font-weight: 500; color: var(--nuit); }
.addr-option__sub   { font-size: .76rem; color: var(--muted); }

.addr-drop-enter-active, .addr-drop-leave-active { transition: opacity .15s, transform .15s; }
.addr-drop-enter-from, .addr-drop-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
