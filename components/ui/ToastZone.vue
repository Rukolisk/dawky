<!-- components/ui/ToastZone.vue — notifications (cf. useToast) -->
<template>
  <div class="toasts" role="status" aria-live="polite">
    <TransitionGroup name="toast">
      <div v-for="t in toasts" :key="t.id" class="toast" :class="`toast-${t.type}`">
        <span>{{ t.message }}</span>
        <button type="button" class="toast-fermer" aria-label="Fermer" @click="remove(t.id)">
          <Icone nom="fermer" :taille="18" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
const { toasts, remove } = useToast()
</script>

<style scoped>
.toasts {
  position: fixed;
  bottom: var(--e3);
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: var(--e1);
  width: min(480px, calc(100% - 40px));
}
.toast {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--e2);
  padding: 14px 18px;
  background: var(--noir);
  color: var(--blanc);
  font-size: 16px;
}
.toast-error { background: var(--erreur); }
.toast-success { background: var(--burgundy); }
.toast-fermer {
  background: none;
  border: 0;
  color: inherit;
  cursor: pointer;
  display: inline-flex;
  min-width: 32px;
  min-height: 32px;
  align-items: center;
  justify-content: center;
}
.toast-enter-active,
.toast-leave-active { transition: opacity 0.2s, transform 0.2s; }
.toast-enter-from,
.toast-leave-to { opacity: 0; transform: translateY(8px); }
</style>
