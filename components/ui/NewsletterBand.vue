<template>
  <div class="nl">
    <div class="nl__inner container">
      <div class="nl__text">
        <p class="section-tag section-tag-yellow">Newsletter</p>
        <h2>Les news Dawky<br />dans votre boîte 🐾</h2>
        <p>Thèmes du mois, conseils, produits exclusifs. Pas de spam.</p>
      </div>
      <div class="nl__form-wrap">
        <div v-if="done" class="nl__success">
          <span>🎉</span>
          <div><strong>Inscription confirmée !</strong><p>{{ done }}</p></div>
        </div>
        <form v-else class="nl__form" @submit.prevent="submit">
          <input v-model="prenom" type="text"  class="form-input nl__input" placeholder="Votre prénom" />
          <input v-model="email"  type="email" class="form-input nl__input" placeholder="Votre email *" required />
          <button type="submit" class="btn btn-yellow btn-full btn-lg" :disabled="loading">
            {{ loading ? '…' : "S'inscrire 🐾" }}
          </button>
          <p v-if="err" class="nl__err">{{ err }}</p>
        </form>
        <p class="nl__rgpd">Désinscription possible à tout moment.</p>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
const prenom=ref(''); const email=ref(''); const loading=ref(false); const done=ref(''); const err=ref('')
async function submit() {
  loading.value=true; err.value=''
  try { const r=await $fetch<{message:string}>('/api/newsletter',{method:'POST',body:{email:email.value,prenom:prenom.value||undefined}}); done.value=r.message }
  catch(e:any){ err.value=e?.data?.statusMessage??'Erreur' }
  finally{ loading.value=false }
}
</script>
<style scoped>
.nl { background:var(--nuit); padding:5rem 0; }
.nl__inner { display:grid; grid-template-columns:1fr 1fr; gap:4rem; align-items:center; }
.nl__text h2 { font-family:var(--font-display); font-size:clamp(1.6rem,2.5vw,2.2rem); font-weight:900; color:white; margin-bottom:.8rem; line-height:1.2; }
.nl__text p  { color:rgba(255,255,255,.5); font-size:.92rem; line-height:1.65; }
.nl__form { display:flex; flex-direction:column; gap:.7rem; }
.nl__input { background:rgba(255,255,255,.08); border-color:rgba(255,255,255,.15); color:white; }
.nl__input::placeholder { color:rgba(255,255,255,.3); }
.nl__input:focus { border-color:var(--jaune-vif); box-shadow:0 0 0 3px rgba(246,201,14,.15); }
.nl__success { display:flex;gap:1rem;align-items:flex-start;background:rgba(246,201,14,.1);border-radius:var(--r-lg);padding:1.4rem;border:1px solid rgba(246,201,14,.2); }
.nl__success span { font-size:2rem; }
.nl__success strong { color:white; display:block; margin-bottom:.2rem; }
.nl__success p { color:rgba(255,255,255,.55); font-size:.88rem; }
.nl__err  { color:#FC8181; font-size:.82rem; }
.nl__rgpd { font-size:.72rem; color:rgba(255,255,255,.25); margin-top:.4rem; line-height:1.5; }
@media(max-width:800px){ .nl__inner { grid-template-columns:1fr; gap:2rem; } }
</style>
