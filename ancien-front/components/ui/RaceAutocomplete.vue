<!-- components/ui/RaceAutocomplete.vue -->
<template>
  <div class="race-wrap" ref="wrapRef">
    <input
      :value="modelValue"
      type="text"
      class="form-input"
      placeholder="Labrador, Berger Allemand…"
      autocomplete="off"
      @input="onInput"
      @focus="open = suggestions.length > 0"
      @keydown.down.prevent="moveDown"
      @keydown.up.prevent="moveUp"
      @keydown.enter.prevent="selectActive"
      @keydown.escape="open = false"
    />
    <Transition name="addr-drop">
      <ul v-if="open && suggestions.length" class="race-dropdown">
        <li
          v-for="(r, i) in suggestions"
          :key="r"
          :class="['race-option', { 'race-option--active': i === activeIdx }]"
          @mousedown.prevent="select(r)"
        >
          🐕 {{ r }}
        </li>
      </ul>
    </Transition>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ modelValue: string }>()
const emit  = defineEmits<{ 'update:modelValue': [v: string] }>()

const suggestions = ref<string[]>([])
const open       = ref(false)
const activeIdx  = ref(-1)
const wrapRef    = ref<HTMLElement | null>(null)
let timer: ReturnType<typeof setTimeout> | null = null

async function onInput(e: Event) {
  const val = (e.target as HTMLInputElement).value
  emit('update:modelValue', val)
  if (timer) clearTimeout(timer)
  if (val.length < 2) { suggestions.value = []; open.value = false; return }
  timer = setTimeout(async () => {
    const res = await $fetch<string[]>('/api/geo/races', { params: { q: val } })
    suggestions.value = res
    open.value = res.length > 0
  }, 200)
}

function select(r: string) {
  emit('update:modelValue', r)
  open.value = false
}
function moveDown() { activeIdx.value = Math.min(activeIdx.value + 1, suggestions.value.length - 1) }
function moveUp()   { activeIdx.value = Math.max(activeIdx.value - 1, -1) }
function selectActive() { if (activeIdx.value >= 0) select(suggestions.value[activeIdx.value]) }

onMounted(() => {
  document.addEventListener('click', (e) => {
    if (wrapRef.value && !wrapRef.value.contains(e.target as Node)) open.value = false
  })
})
</script>

<style scoped>
.race-wrap { position: relative; }
.race-dropdown {
  position: absolute; top: calc(100% + 4px); left: 0; right: 0;
  background: white; border-radius: 14px;
  border: 1.5px solid var(--brume);
  box-shadow: var(--shadow-lg);
  z-index: 200; list-style: none; overflow: hidden;
}
.race-option {
  padding: .7rem 1rem; cursor: pointer; font-size: .9rem;
  color: var(--text); transition: background .15s;
  border-bottom: 1px solid var(--neige);
}
.race-option:last-child { border: none; }
.race-option:hover, .race-option--active { background: #FFF4E6; }

.addr-drop-enter-active, .addr-drop-leave-active { transition: opacity .15s, transform .15s; }
.addr-drop-enter-from, .addr-drop-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
