<!-- pages/admin/invendus.vue — produits restants par mois (US-19, F-63)
     et lots retirés à J-30 à donner aux associations -->
<template>
  <div class="a-page">
    <div class="a-entete">
      <div>
        <h1 class="a-titre">Produits restants</h1>
        <p class="petit texte-secondaire">Disponibles dans Compose ta box après la clôture du mois.</p>
      </div>
      <p class="a-sous-titre">Total : {{ donnees?.stockTotal ?? 0 }} produits</p>
    </div>

    <p v-if="!donnees" class="a-vide">Chargement…</p>
    <template v-else>
      <p v-if="!Object.keys(donnees.parMois).length" class="a-vide">Aucun produit restant. Ils apparaîtront ici à la clôture du mois.</p>
      <section v-for="(lots, mois) in donnees.parMois" :key="mois" class="bloc">
        <h2 class="a-sous-titre">{{ moisLisible(String(mois), true) }}</h2>
        <div class="a-table-defilante">
          <table class="a-table">
            <thead><tr><th>Produit</th><th>Catégorie</th><th>Date limite</th><th>Stock</th></tr></thead>
            <tbody>
              <tr v-for="l in lots" :key="l.id">
                <td>{{ l.produit.emoji }} {{ l.produit.nom }} <span v-if="!l.produit.actif" class="a-statut">désactivé</span></td>
                <td>{{ LIBELLES_CATEGORIE[l.produit.categorie] }}</td>
                <td>{{ l.dateLimite ? dateLongue(l.dateLimite) : '—' }}</td>
                <td>
                  <input
                    :value="l.quantite" class="input a-input-court" type="number" min="0" :aria-label="`Stock de ${l.produit.nom}`"
                    @change="majStock(l.id, Number(($event.target as HTMLInputElement).value))"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="bloc a-encart">
        <h2 class="a-sous-titre">À donner aux associations</h2>
        <p class="petit">Lots retirés du site un mois avant leur date limite.</p>
        <p v-if="!donnees.aDonner.length" class="a-vide">Rien à donner pour le moment.</p>
        <table v-else class="a-table">
          <thead><tr><th>Produit</th><th>Retiré le</th><th>Quantité</th><th /></tr></thead>
          <tbody>
            <tr v-for="l in donnees.aDonner" :key="l.id">
              <td>{{ l.produit.emoji }} {{ l.produit.nom }}</td>
              <td>{{ l.retireLe ? dateLongue(l.retireLe) : '—' }}</td>
              <td>{{ l.quantite }}</td>
              <td><button type="button" class="lien petit" @click="ouvrirDon(l)">Enregistrer un don</button></td>
            </tr>
          </tbody>
        </table>
      </section>
    </template>

    <ModaleDawky :ouverte="!!don" titre="Enregistrer un don" @fermer="don = null">
      <form v-if="don" class="a-formulaire" novalidate @submit.prevent="enregistrerDon">
        <p>{{ don.nom }} · {{ don.max }} disponible{{ don.max > 1 ? 's' : '' }}</p>
        <div class="champ"><label for="d-asso">Association</label><input id="d-asso" v-model.trim="don.association" class="input" /></div>
        <div class="champ"><label for="d-qte">Quantité</label><input id="d-qte" v-model.number="don.quantite" class="input a-input-court" type="number" min="1" :max="don.max" /></div>
        <button class="btn btn-principal btn-bloc" :disabled="envoi || !don.association || !don.quantite">Enregistrer</button>
      </form>
    </ModaleDawky>
  </div>
</template>

<script setup lang="ts">
import type { Categorie } from '~/composables/types'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Produits restants — Back-office Dawky', robots: 'noindex' })

interface LotInvendu {
  id: string; quantite: number; dateLimite: string | null; retireLe?: string | null
  produit: { nom: string; emoji: string; categorie: Categorie; actif?: boolean }
}

const { envoi, executer } = useActionAdmin()
const donnees = ref<{ parMois: Record<string, LotInvendu[]>; stockTotal: number; aDonner: LotInvendu[] } | null>(null)
const don = ref<{ lotId: string; nom: string; max: number; quantite: number; association: string } | null>(null)

async function charger() {
  const r = await executer(() => api<NonNullable<typeof donnees.value>>('/api/admin/invendus'))
  if (r) donnees.value = r
}
onMounted(charger)

async function majStock(id: string, quantite: number) {
  if (Number.isNaN(quantite) || quantite < 0) return
  if (await executer(() => api(`/api/admin/lots/${id}`, { method: 'PUT', body: { quantite } }), 'Stock mis à jour')) await charger()
}

function ouvrirDon(l: LotInvendu) {
  don.value = { lotId: l.id, nom: l.produit.nom, max: l.quantite, quantite: l.quantite, association: '' }
}

async function enregistrerDon() {
  const d = don.value!
  const ok = await executer(() => api('/api/admin/dons', {
    method: 'POST',
    body: { lotId: d.lotId, quantite: d.quantite, association: d.association },
  }), 'Don enregistré')
  if (!ok) return
  don.value = null
  await charger()
}
</script>

<style scoped>
.bloc {
  display: flex;
  flex-direction: column;
  gap: var(--e2);
}
</style>
