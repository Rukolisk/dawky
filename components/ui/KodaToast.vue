<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast">
        <div v-for="t in toasts" :key="t.id" :class="['toast',`toast--${t.type}`]" @click="remove(t.id)">
          <span>{{ {success:'✓',error:'✕',info:'🐾'}[t.type] }}</span>
          <span>{{ t.message }}</span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>
<script setup lang="ts">
const { toasts, remove } = useToast()
</script>
