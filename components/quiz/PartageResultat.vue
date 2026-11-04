<!-- components/quiz/PartageResultat.vue — partage du résultat du quiz en
     image (F-18, US-32). Image 1080 × 1350 (format portrait Instagram)
     dessinée dans le navigateur ; partage natif sur mobile, sinon
     téléchargement. -->
<template>
  <button type="button" class="lien" :disabled="enCours" @click="partager">
    {{ enCours ? 'Préparation de l\'image…' : 'Partager son résultat' }}
  </button>
</template>

<script setup lang="ts">
const props = defineProps<{
  nom: string
  taille: string
  photo: string
  etiquettes: string[]
}>()

const toast = useToast()
const enCours = ref(false)

const L = 1080
const H = 1350
const MARGE = 72
const BURGUNDY = '#4F0926'
const TITRE = 'Playfair, Georgia, serif'
const TEXTE = '"M PLUS Rounded 1c", Arial, sans-serif'

function chargerImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

// Dessine l'image en la recadrant pour remplir la zone (comme object-fit: cover)
function dessinerCouvrant(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number, focaleY = 0.3) {
  const echelle = Math.max(w / img.width, h / img.height)
  const sw = w / echelle
  const sh = h / echelle
  const sx = (img.width - sw) / 2
  const sy = (img.height - sh) * focaleY
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h)
}

async function genererImage(): Promise<Blob> {
  await Promise.all([
    document.fonts.load(`300 120px ${TITRE}`),
    document.fonts.load(`italic 300 120px ${TITRE}`),
    document.fonts.load(`700 28px ${TEXTE}`),
    document.fonts.load(`400 34px ${TEXTE}`),
  ])
  const [photo, logo] = await Promise.all([chargerImage(props.photo), chargerImage('/images/logo-dawky-blanc.png')])

  const canvas = document.createElement('canvas')
  canvas.width = L
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, L, H)

  // Photo, fondue vers le noir en bas
  const hautPhoto = 800
  dessinerCouvrant(ctx, photo, 0, 0, L, hautPhoto)
  const fondu = ctx.createLinearGradient(0, hautPhoto - 260, 0, hautPhoto)
  fondu.addColorStop(0, 'rgba(0,0,0,0)')
  fondu.addColorStop(1, 'rgba(0,0,0,1)')
  ctx.fillStyle = fondu
  ctx.fillRect(0, hautPhoto - 260, L, 260)
  // Léger voile en haut pour la lisibilité du logo
  const voile = ctx.createLinearGradient(0, 0, 0, 220)
  voile.addColorStop(0, 'rgba(0,0,0,0.45)')
  voile.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = voile
  ctx.fillRect(0, 0, L, 220)

  const largeurLogo = 230
  ctx.drawImage(logo, MARGE, 56, largeurLogo, (logo.height / logo.width) * largeurLogo)

  // Surtitre
  ctx.fillStyle = 'rgba(255,255,255,0.75)'
  ctx.font = `700 28px ${TEXTE}`
  ctx.letterSpacing = '4px'
  ctx.fillText('MON RÉSULTAT DAWKY', MARGE, 870)
  ctx.letterSpacing = '0px'

  // « Max est un L. » : réduit si le prénom est long
  const debut = `${props.nom} est `
  const fin = `un ${props.taille}.`
  let taillePolice = 124
  const largeurTitre = () => {
    ctx.font = `300 ${taillePolice}px ${TITRE}`
    const a = ctx.measureText(debut).width
    ctx.font = `italic 300 ${taillePolice}px ${TITRE}`
    return a + ctx.measureText(fin).width
  }
  while (largeurTitre() > L - 2 * MARGE && taillePolice > 60) taillePolice -= 4
  ctx.fillStyle = '#fff'
  ctx.font = `300 ${taillePolice}px ${TITRE}`
  ctx.fillText(debut, MARGE, 1010)
  const x = MARGE + ctx.measureText(debut).width
  ctx.font = `italic 300 ${taillePolice}px ${TITRE}`
  ctx.fillText(fin, x, 1010)

  // Profil du chien
  ctx.font = `400 34px ${TEXTE}`
  ctx.fillStyle = 'rgba(255,255,255,0.85)'
  let ligne = ''
  let y = 1085
  for (const e of props.etiquettes.slice(0, 5)) {
    const essai = ligne ? `${ligne} · ${e}` : e
    if (ctx.measureText(essai).width > L - 2 * MARGE && ligne) {
      ctx.fillText(ligne, MARGE, y)
      ligne = e
      y += 48
    } else {
      ligne = essai
    }
  }
  if (ligne) ctx.fillText(ligne, MARGE, y)

  // Bandeau d'appel
  ctx.fillStyle = BURGUNDY
  ctx.fillRect(0, H - 130, L, 130)
  ctx.fillStyle = '#fff'
  ctx.font = `700 34px ${TEXTE}`
  ctx.fillText('Trouve la box de ton chien sur dawky.fr', MARGE, H - 52)

  return new Promise((resolve, reject) => canvas.toBlob(b => (b ? resolve(b) : reject(new Error('image'))), 'image/png'))
}

async function partager() {
  enCours.value = true
  try {
    const blob = await genererImage()
    const nomFichier = `dawky-${props.nom.toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '-') || 'resultat'}.png`
    const fichier = new File([blob], nomFichier, { type: 'image/png' })

    if (navigator.canShare?.({ files: [fichier] })) {
      await navigator.share({
        files: [fichier],
        title: 'Mon résultat Dawky',
        text: `${props.nom} est un ${props.taille} ! Trouve la box de ton chien sur dawky.fr`,
      })
      return
    }
    // Ordinateur : téléchargement de l'image
    const lien = document.createElement('a')
    lien.href = URL.createObjectURL(blob)
    lien.download = nomFichier
    lien.click()
    URL.revokeObjectURL(lien.href)
    toast.success('Image téléchargée : partagez-la sur vos réseaux !')
  } catch (err) {
    // Partage annulé par l'utilisateur : rien à signaler
    if ((err as Error)?.name !== 'AbortError') toast.error('L\'image n\'a pas pu être créée.')
  } finally {
    enCours.value = false
  }
}

defineExpose({ genererImage })
</script>
