<!-- components/ui/KodaToast.vue -->
<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast">
        <div v-for="t in toasts" :key="t.id" :class="['toast', `toast--${t.type}`]" @click="remove(t.id)">
          <span class="toast__icon">{{ icons[t.type] }}</span>
          <span class="toast__msg">{{ t.message }}</span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const { toasts, remove } = useToast()
const icons = { success: '🐾', error: '😿', info: '🐶' }
</script>
