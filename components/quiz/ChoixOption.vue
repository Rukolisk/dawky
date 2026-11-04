<!-- components/quiz/ChoixOption.vue
     Option cliquable pleine largeur (radio ou case à cocher), zone
     tactile de 56 px. S'utilise dans un <fieldset> avec <legend>. -->
<template>
  <label class="option" :class="{ choisie: estChoisie }">
    <input
      class="sr-only"
      :type="multiple ? 'checkbox' : 'radio'"
      :name="nom"
      :value="valeur"
      :checked="estChoisie"
      @change="basculer"
    />
    <span v-if="multiple" class="case" aria-hidden="true"><Icone v-if="estChoisie" nom="check" :taille="14" /></span>
    <span class="option-libelle"><slot /></span>
    <span v-if="!multiple" class="radio" aria-hidden="true" />
  </label>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: unknown
  valeur: unknown
  nom: string
  multiple?: boolean
}>()
const emit = defineEmits<{ 'update:modelValue': [unknown] }>()

const estChoisie = computed(() => props.multiple
  ? (props.modelValue as unknown[]).includes(props.valeur)
  : props.modelValue === props.valeur)

function basculer() {
  if (!props.multiple) return emit('update:modelValue', props.valeur)
  const liste = props.modelValue as unknown[]
  emit('update:modelValue', estChoisie.value ? liste.filter(v => v !== props.valeur) : [...liste, props.valeur])
}
</script>

<style scoped>
.option {
  display: flex;
  align-items: center;
  gap: 14px;
  min-height: var(--tactile-grand);
  padding: 12px 18px;
  border: 1px solid var(--noir);
  border-radius: var(--rayon-champ);
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background var(--transition), border-color var(--transition);
}
.option:hover {
  background: var(--fond-gris);
}
.option.choisie {
  background: var(--fond-gris);
  border-color: var(--burgundy);
  box-shadow: inset 0 0 0 1px var(--burgundy);
  font-weight: 700;
}
.option:has(input:focus-visible) {
  outline: 2px solid var(--burgundy);
  outline-offset: 3px;
}
.option-libelle {
  flex: 1;
}
.radio {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1px solid var(--texte-secondaire);
  flex-shrink: 0;
}
.choisie .radio {
  border-color: var(--burgundy);
  background: radial-gradient(circle, var(--burgundy) 0 5px, var(--blanc) 6px);
}
.case {
  width: 20px;
  height: 20px;
  border: 1px solid var(--texte-secondaire);
  border-radius: 3px;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--blanc);
}
.choisie .case {
  background: var(--burgundy);
  border-color: var(--burgundy);
}
</style>
