<!-- components/ui/RaceAutocomplete.vue
     Saisie assistée de la race (combobox ARIA, navigation clavier,
     recherche insensible aux accents côté serveur). -->
<template>
  <div class="auto" @keydown="clavier">
    <input
      :id="id"
      v-model="saisie"
      class="input"
      type="text"
      role="combobox"
      autocomplete="off"
      :placeholder="placeholder"
      :aria-expanded="ouvert"
      :aria-controls="`${id}-liste`"
      :aria-activedescendant="actif >= 0 ? `${id}-opt-${actif}` : undefined"
      aria-autocomplete="list"
      @focus="chercher"
      @input="chercher"
      @blur="fermerPlusTard"
    />
    <ul v-show="ouvert" :id="`${id}-liste`" class="auto-liste" role="listbox">
      <li
        v-for="(r, i) in suggestions" :id="`${id}-opt-${i}`" :key="r"
        role="option" :aria-selected="i === actif" class="auto-option" :class="{ actif: i === actif }"
        @mousedown.prevent="choisir(r)"
      >{{ r }}</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{ modelValue: string; id: string; placeholder?: string }>(), {
  placeholder: 'Commencez à saisir',
})
const emit = defineEmits<{ 'update:modelValue': [string] }>()

const saisie = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v),
})
const suggestions = ref<string[]>([])
const ouvert = ref(false)
const actif = ref(-1)

const chercher = useDebounceFn(async () => {
  if (saisie.value.trim().length < 2) {
    ouvert.value = false
    return
  }
  try {
    suggestions.value = await $fetch<string[]>('/api/geo/races', { query: { q: saisie.value } })
  } catch {
    suggestions.value = []
  }
  // Pas de liste si la saisie correspond déjà exactement à une race
  ouvert.value = suggestions.value.length > 0
    && !(suggestions.value.length === 1 && suggestions.value[0] === saisie.value)
  actif.value = -1
}, 200)

function choisir(race: string) {
  saisie.value = race
  ouvert.value = false
}

function fermerPlusTard() {
  setTimeout(() => { ouvert.value = false }, 100)
}

function clavier(e: KeyboardEvent) {
  if (!ouvert.value) return
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    actif.value = (actif.value + 1) % suggestions.value.length
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    actif.value = actif.value <= 0 ? suggestions.value.length - 1 : actif.value - 1
  } else if (e.key === 'Enter' && actif.value >= 0) {
    e.preventDefault()
    choisir(suggestions.value[actif.value]!)
  } else if (e.key === 'Escape') {
    ouvert.value = false
  }
}
</script>

<style scoped>
.auto {
  position: relative;
}
.auto-liste {
  position: absolute;
  z-index: 10;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  margin: 0;
  padding: 4px 0;
  list-style: none;
  background: var(--blanc);
  border: 1px solid var(--noir);
  border-radius: var(--rayon-champ);
  max-height: 280px;
  overflow-y: auto;
}
.auto-option {
  padding: 10px 16px;
  font-size: 16px;
  cursor: pointer;
  min-height: var(--tactile);
  display: flex;
  align-items: center;
}
.auto-option.actif,
.auto-option:hover {
  background: var(--fond-gris);
}
</style>
