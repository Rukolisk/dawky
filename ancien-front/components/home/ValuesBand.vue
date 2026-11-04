<template>
  <div class="vband">
    <div class="container vband__inner">
      <div v-for="v in vals" :key="v.label" class="vband__item">
        <div class="vband__icon">{{ v.icon }}</div>
        <div><strong>{{ v.label }}</strong><span>{{ v.sub }}</span></div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
const vals = [
  { icon:'📏', label:'XS, S, M et L', sub:'Du Chihuahua au Saint-Bernard' },
  { icon:'🎨', label:'Bleu & Jaune', sub:'Les couleurs du chien' },
  { icon:'♻️', label:'Invendus recyclés', sub:'Rien ne se perd chez Dawky' },
  { icon:'🔄', label:'Sans engagement', sub:'Résiliable à tout moment' },
]
</script>
<style scoped>
.vband { background: var(--nuit); padding: 2rem 0; }
.vband__inner { display:flex; gap:2rem; justify-content:center; flex-wrap:wrap; }
.vband__item { display:flex; align-items:center; gap:.9rem; color:white; min-width:190px; }
.vband__icon { width:42px; height:42px; border-radius:50%; background:rgba(246,201,14,.15); display:flex; align-items:center; justify-content:center; font-size:1.2rem; flex-shrink:0; border:1px solid rgba(246,201,14,.2); }
.vband__item strong { display:block; font-size:.88rem; font-weight:600; margin-bottom:.1rem; }
.vband__item span   { font-size:.76rem; color:rgba(255,255,255,.45); }
</style>
