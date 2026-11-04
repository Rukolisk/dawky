<!-- components/ui/ModaleDawky.vue
     Fenêtre modale accessible (<dialog> natif : focus piégé, Échap). -->
<template>
  <dialog ref="dialogue" class="modale" :aria-labelledby="`${id}-titre`" @close="emit('fermer')" @click="clicFond">
    <div class="modale-contenu">
      <div class="modale-entete">
        <h2 :id="`${id}-titre`" class="titre-modale">{{ titre }}</h2>
        <button type="button" class="modale-fermer" aria-label="Fermer" @click="fermer">
          <Icone nom="fermer" />
        </button>
      </div>
      <slot />
    </div>
  </dialog>
</template>

<script setup lang="ts">
const props = defineProps<{ ouverte: boolean; titre: string }>()
const emit = defineEmits<{ fermer: [] }>()
const dialogue = ref<HTMLDialogElement | null>(null)
const id = useId()

watch(() => props.ouverte, (ouverte) => {
  if (ouverte && !dialogue.value?.open) dialogue.value?.showModal()
  if (!ouverte && dialogue.value?.open) dialogue.value?.close()
}, { flush: 'post' })

onMounted(() => {
  if (props.ouverte) dialogue.value?.showModal()
})

function fermer() {
  dialogue.value?.close()
}

// Clic en dehors du contenu (sur le fond) : fermeture
function clicFond(e: MouseEvent) {
  if (e.target === dialogue.value) fermer()
}
</script>

<style scoped>
.modale {
  border: 0;
  padding: 0;
  width: min(560px, calc(100% - 32px));
  max-height: calc(100dvh - 48px);
  background: var(--blanc);
  color: var(--noir);
}
.modale::backdrop {
  background: rgba(0, 0, 0, 0.5);
}
.modale-contenu {
  padding: var(--e4);
  display: flex;
  flex-direction: column;
  gap: var(--e3);
}
.modale-entete {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--e2);
}
.titre-modale {
  font-size: 40px;
}
.modale-fermer {
  border: 0;
  background: none;
  cursor: pointer;
  min-width: var(--tactile);
  min-height: var(--tactile);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 600px) {
  .modale-contenu {
    padding: var(--e3) var(--marge);
  }
}
</style>
