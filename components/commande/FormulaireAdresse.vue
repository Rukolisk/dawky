<!-- components/commande/FormulaireAdresse.vue — adresse de livraison -->
<template>
  <div class="adresse">
    <div class="ligne">
      <div class="champ">
        <label :for="`${prefixe}-prenom`">Prénom</label>
        <input :id="`${prefixe}-prenom`" v-model.trim="modele.prenom" class="input" autocomplete="given-name" required />
      </div>
      <div class="champ">
        <label :for="`${prefixe}-nom`">Nom</label>
        <input :id="`${prefixe}-nom`" v-model.trim="modele.nom" class="input" autocomplete="family-name" required />
      </div>
    </div>
    <div class="champ">
      <label :for="`${prefixe}-ligne1`">Adresse</label>
      <AdresseAutocomplete :id="`${prefixe}-ligne1`" v-model="modele.ligne1" @choisir="remplir" />
    </div>
    <div class="champ">
      <label :for="`${prefixe}-ligne2`">Complément (bâtiment, étage…) <span class="texte-secondaire">facultatif</span></label>
      <input :id="`${prefixe}-ligne2`" v-model.trim="modele.ligne2" class="input" autocomplete="address-line2" />
    </div>
    <div class="ligne">
      <div class="champ">
        <label :for="`${prefixe}-cp`">Code postal</label>
        <input
          :id="`${prefixe}-cp`" v-model.trim="modele.codePostal" class="input" inputmode="numeric"
          autocomplete="postal-code" maxlength="5" required @input="villesDuCodePostal"
        />
      </div>
      <div class="champ">
        <label :for="`${prefixe}-ville`">Ville</label>
        <input :id="`${prefixe}-ville`" v-model.trim="modele.ville" class="input" autocomplete="address-level2" required :list="`${prefixe}-villes`" />
        <datalist :id="`${prefixe}-villes`">
          <option v-for="v in villes" :key="v" :value="v" />
        </datalist>
      </div>
    </div>
    <div v-if="avecTelephone" class="champ">
      <label :for="`${prefixe}-tel`">Téléphone <span class="texte-secondaire">facultatif, pour le livreur</span></label>
      <input :id="`${prefixe}-tel`" v-model.trim="modele.telephone" class="input" type="tel" autocomplete="tel" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AdresseSaisie } from '~/composables/adresse'

withDefaults(defineProps<{ prefixe?: string; avecTelephone?: boolean }>(), { prefixe: 'adr', avecTelephone: true })
const modele = defineModel<AdresseSaisie>({ required: true })
const villes = ref<string[]>([])

function remplir(a: { ligne1: string; codePostal: string; ville: string }) {
  Object.assign(modele.value, a)
}

// Code postal saisi à la main : on propose les villes correspondantes,
// et on remplit directement s'il n'y en a qu'une
const villesDuCodePostal = useDebounceFn(async () => {
  if (!/^\d{5}$/.test(modele.value.codePostal)) return
  try {
    const res = await $fetch<Array<{ ville: string }>>('/api/geo/adresse', {
      query: { q: modele.value.codePostal, type: 'municipality', limit: 10 },
    })
    villes.value = [...new Set(res.map(r => r.ville))]
    if (villes.value.length === 1 && !modele.value.ville) modele.value.ville = villes.value[0]!
  } catch {
    villes.value = []
  }
}, 280)
</script>


<style scoped>
.adresse {
  display: flex;
  flex-direction: column;
  gap: var(--e2);
}
.ligne {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--e2);
}
.champ label .texte-secondaire {
  font-weight: 400;
  font-size: 14px;
}
</style>
