<!-- components/commande/PointRelaisSelecteur.vue
     Choix d'un point relais Mondial Relay (widget officiel, carte
     OpenStreetMap). Les scripts ne sont chargés qu'à l'ouverture.

     Code enseigne : NUXT_PUBLIC_MONDIAL_RELAY_BRAND (« BDTEST » = mode test,
     à remplacer par le code fourni par Mondial Relay à l'ouverture du compte). -->
<template>
  <div class="relais">
    <p v-if="erreur" class="message-erreur" role="alert">{{ erreur }}</p>
    <p v-else-if="chargement" class="petit texte-secondaire">Chargement des points relais…</p>
    <div :id="idZone" ref="zone" class="relais-widget" />
    <input :id="idCible" type="hidden" />
  </div>
</template>

<script setup lang="ts">
export interface PointRelais { id: string; libelle: string }

const props = defineProps<{ codePostal: string }>()
const emit = defineEmits<{ choisir: [PointRelais | null] }>()

const uid = useId()
const idZone = `relais-${uid}`
const idCible = `relais-cible-${uid}`
const zone = ref<HTMLElement | null>(null)
const chargement = ref(true)
const erreur = ref('')

// Les scripts jQuery + Mondial Relay sont partagés entre les instances
let scripts: Promise<void> | null = null
function charger(src: string) {
  return new Promise<void>((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve()
    const s = document.createElement('script')
    s.src = src
    s.onload = () => resolve()
    s.onerror = () => reject(new Error(src))
    document.head.appendChild(s)
  })
}
function chargerScripts() {
  scripts ??= (async () => {
    if (!(window as any).jQuery) await charger('https://code.jquery.com/jquery-3.7.1.min.js')
    await charger('https://widget.mondialrelay.com/parcelshop-picker/jquery.plugin.mondialrelay.parcelshoppicker.min.js')
  })()
  return scripts
}

interface ChoixMondialRelay { ID: string; Nom: string; Adresse1: string; Adresse2: string; CP: string; Ville: string; Pays: string }

async function afficher() {
  erreur.value = ''
  chargement.value = true
  try {
    await chargerScripts()
    const $ = (window as any).jQuery
    $(`#${idZone}`).empty().MR_ParcelShopPicker({
      Target: `#${idCible}`,
      Brand: useRuntimeConfig().public.mondialRelayBrand || 'BDTEST  ',
      Country: 'FR',
      PostCode: /^\d{5}$/.test(props.codePostal) ? props.codePostal : '',
      ColLivMod: '24R',
      NbResults: '7',
      Responsive: true,
      ShowResultsOnMap: true,
      OnParcelShopSelected: (pr: ChoixMondialRelay) => {
        if (!pr?.ID) return emit('choisir', null)
        emit('choisir', {
          id: `${pr.Pays}-${pr.ID}`,
          libelle: [pr.Nom, pr.Adresse1, `${pr.CP} ${pr.Ville}`].map(s => s?.trim()).filter(Boolean).join(', '),
        })
      },
    })
  } catch {
    erreur.value = 'Impossible d\'afficher les points relais. Vérifiez votre connexion ou choisissez la livraison à domicile.'
  } finally {
    chargement.value = false
  }
}

onMounted(afficher)
// Nouvelle adresse saisie : on relance la recherche autour du code postal
watch(() => props.codePostal, (cp, ancien) => {
  if (/^\d{5}$/.test(cp) && cp !== ancien) afficher()
})
</script>

<style scoped>
.relais {
  display: flex;
  flex-direction: column;
  gap: var(--e1);
}
.relais-widget {
  min-height: 120px;
  font-size: 14px;
}
/* Le widget impose des largeurs fixes : on le laisse s'adapter */
.relais-widget :deep(.MRW-Container),
.relais-widget :deep(.Target-Widget) {
  max-width: 100% !important;
}
</style>
