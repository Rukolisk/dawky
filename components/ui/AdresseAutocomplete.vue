<!-- components/ui/AdresseAutocomplete.vue
     Saisie assistée d'adresse (API adresse.data.gouv.fr via /api/geo/adresse).
     Le choix d'une suggestion remplit aussi le code postal et la ville. -->
<template>
  <div class="auto" @keydown="clavier">
    <input
      :id="id"
      v-model="saisie"
      class="input"
      type="text"
      role="combobox"
      autocomplete="address-line1"
      placeholder="Commencez à saisir, on complète pour vous"
      :aria-expanded="ouvert"
      :aria-controls="`${id}-liste`"
      :aria-activedescendant="actif >= 0 ? `${id}-opt-${actif}` : undefined"
      aria-autocomplete="list"
      @input="chercher"
      @blur="fermerPlusTard"
    />
    <ul v-show="ouvert" :id="`${id}-liste`" class="auto-liste" role="listbox">
      <li
        v-for="(s, i) in suggestions" :id="`${id}-opt-${i}`" :key="s.label"
        role="option" :aria-selected="i === actif" class="auto-option" :class="{ actif: i === actif }"
        @mousedown.prevent="choisir(s)"
      >{{ s.label }}</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
interface Suggestion { label: string; nom: string; codePostal: string; ville: string }

const props = defineProps<{ modelValue: string; id: string }>()
const emit = defineEmits<{
  'update:modelValue': [string]
  choisir: [{ ligne1: string; codePostal: string; ville: string }]
}>()

const saisie = computed({ get: () => props.modelValue, set: v => emit('update:modelValue', v) })
const suggestions = ref<Suggestion[]>([])
const ouvert = ref(false)
const actif = ref(-1)

const chercher = useDebounceFn(async () => {
  if (saisie.value.trim().length < 4) {
    ouvert.value = false
    return
  }
  try {
    suggestions.value = await $fetch<Suggestion[]>('/api/geo/adresse', {
      query: { q: saisie.value, type: 'housenumber', limit: 5 },
    })
  } catch {
    // Service indisponible : la saisie manuelle reste possible
    suggestions.value = []
  }
  ouvert.value = suggestions.value.length > 0
  actif.value = -1
}, 280)

function choisir(s: Suggestion) {
  emit('update:modelValue', s.nom)
  emit('choisir', { ligne1: s.nom, codePostal: s.codePostal, ville: s.ville })
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
.auto { position: relative; }
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
.auto-option:hover { background: var(--fond-gris); }
</style>
