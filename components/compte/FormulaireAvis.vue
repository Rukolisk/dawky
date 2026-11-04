<!-- components/compte/FormulaireAvis.vue — avis client avec photo facultative
     (US-33, F-55). Publié après modération dans le back-office.
     La photo est redimensionnée dans le navigateur avant l'envoi : poids
     réduit et métadonnées (dont la position GPS) supprimées. -->
<template>
  <div class="avis">
    <p v-if="envoye" class="confirmation" role="status">
      <strong>Merci&nbsp;!</strong> Votre avis sera publié après relecture par l'équipe.
    </p>
    <form v-else class="formulaire" novalidate @submit.prevent="envoyer">
      <fieldset class="etoiles">
        <legend class="libelle">Votre note</legend>
        <label v-for="n in 5" :key="n" class="etoile" :class="{ pleine: n <= (survol || note) }" @mouseenter="survol = n" @mouseleave="survol = 0">
          <input v-model="note" type="radio" name="note" :value="n" class="sr-only" />
          <span aria-hidden="true">★</span>
          <span class="sr-only">{{ n }} sur 5</span>
        </label>
      </fieldset>

      <div class="champ">
        <label for="avis-texte">Votre avis</label>
        <textarea
          id="avis-texte" v-model.trim="commentaire" class="input" rows="4" maxlength="1000"
          placeholder="Qu'a-t-il préféré dans sa box ?"
        />
        <p class="petit texte-secondaire">{{ commentaire.length }}/1000, 10 caractères minimum.</p>
      </div>

      <div class="champ">
        <span class="libelle">Une photo de l'unboxing <span class="texte-secondaire">facultatif</span></span>
        <label class="btn btn-secondaire fichier">
          <input type="file" accept="image/jpeg,image/png,image/webp" class="sr-only" @change="choisirPhoto" />
          {{ photo ? 'Changer de photo' : 'Ajouter une photo' }}
        </label>
        <div v-if="apercu" class="apercu">
          <img :src="apercu" alt="Aperçu de votre photo" />
          <button type="button" class="lien petit" @click="retirerPhoto">Retirer la photo</button>
        </div>
      </div>

      <p v-if="erreur" class="message-erreur" role="alert">{{ erreur }}</p>
      <button class="btn btn-principal" :disabled="envoi">{{ envoi ? 'Envoi…' : 'Publier mon avis' }}</button>
    </form>
  </div>
</template>

<script setup lang="ts">
const note = ref(0)
const survol = ref(0)
const commentaire = ref('')
const photo = ref<Blob | null>(null)
const apercu = ref<string | null>(null)
const erreur = ref('')
const envoi = ref(false)
const envoye = ref(false)

const COTE_MAX = 1600

// Redimensionne et ré-encode en JPEG (supprime les métadonnées EXIF)
async function preparerPhoto(fichier: File): Promise<Blob> {
  const image = await createImageBitmap(fichier, { imageOrientation: 'from-image' })
  const ratio = Math.min(1, COTE_MAX / Math.max(image.width, image.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(image.width * ratio)
  canvas.height = Math.round(image.height * ratio)
  canvas.getContext('2d')!.drawImage(image, 0, 0, canvas.width, canvas.height)
  image.close()
  return new Promise((resolve, reject) => canvas.toBlob(b => (b ? resolve(b) : reject(new Error('conversion'))), 'image/jpeg', 0.85))
}

async function choisirPhoto(e: Event) {
  erreur.value = ''
  const fichier = (e.target as HTMLInputElement).files?.[0]
  if (!fichier) return
  if (!fichier.type.startsWith('image/')) {
    erreur.value = 'Choisissez une image (JPEG, PNG ou WebP).'
    return
  }
  try {
    photo.value = await preparerPhoto(fichier)
    if (apercu.value) URL.revokeObjectURL(apercu.value)
    apercu.value = URL.createObjectURL(photo.value)
  } catch {
    erreur.value = 'Cette image n\'a pas pu être lue. Essayez une autre photo.'
  }
}

function retirerPhoto() {
  if (apercu.value) URL.revokeObjectURL(apercu.value)
  photo.value = null
  apercu.value = null
}

onBeforeUnmount(() => { if (apercu.value) URL.revokeObjectURL(apercu.value) })

async function envoyer() {
  erreur.value = ''
  if (!note.value) return (erreur.value = 'Choisissez une note de 1 à 5.')
  if (commentaire.value.length < 10) return (erreur.value = 'Votre avis est un peu court (10 caractères minimum).')

  const donnees = new FormData()
  donnees.append('note', String(note.value))
  donnees.append('commentaire', commentaire.value)
  if (photo.value) donnees.append('photo', photo.value, 'photo.jpg')

  envoi.value = true
  try {
    await api('/api/avis', { method: 'POST', body: donnees })
    envoye.value = true
    retirerPhoto()
  } catch (err) {
    erreur.value = versApiError(err).message
  } finally {
    envoi.value = false
  }
}
</script>

<style scoped>
.formulaire {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--e3);
  max-width: 640px;
}
.formulaire .champ {
  width: 100%;
}
.libelle {
  font-size: 16px;
  font-weight: 500;
}
.etoiles {
  border: 0;
  margin: 0;
  padding: 0;
  display: flex;
  gap: 4px;
}
.etoiles legend {
  margin-bottom: 6px;
}
.etoile {
  font-size: 34px;
  line-height: 1;
  color: var(--filet);
  cursor: pointer;
  min-width: var(--tactile);
  min-height: var(--tactile);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.etoile.pleine {
  color: var(--burgundy);
}
.etoile:has(input:focus-visible) {
  outline: 2px solid var(--burgundy);
  outline-offset: 2px;
}
.fichier {
  align-self: flex-start;
  cursor: pointer;
}
.apercu {
  display: flex;
  align-items: flex-end;
  gap: var(--e2);
}
.apercu img {
  width: 140px;
  height: 140px;
  object-fit: cover;
}
.confirmation {
  background: var(--fond-gris);
  border-left: 3px solid var(--burgundy);
  padding: var(--e2) var(--e3);
}
</style>
