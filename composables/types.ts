// composables/types.ts
// Types des données renvoyées par l'API (cf. BACKEND.md)

export type Taille = 'S' | 'M' | 'L'
export type Categorie = 'FRIANDISE' | 'MASTICATION' | 'JOUET' | 'ACCESSOIRE'
export type NiveauActivite = 'FAIBLE' | 'MODERE' | 'ELEVE'

export interface Allergene { code: string; nom: string }

export interface Adresse {
  id: string
  libelle: string | null
  prenom: string
  nom: string
  ligne1: string
  ligne2: string | null
  codePostal: string
  ville: string
  pays: string
  telephone: string | null
  parDefaut: boolean
}

export interface Chien {
  id: string
  nom: string
  race: string | null
  dateNaissance: string | null
  ageMois: number | null
  poids: number
  taille: Taille
  tailleConseillee: Taille
  changementTailleConseille: boolean
  niveauActivite: NiveauActivite
  estMacheur: boolean
  comportement: string | null
  sensibleTraces: boolean
  allergenes: Allergene[]
  allergiesAutres: string | null
  profilAllergieValide: boolean
}

export interface Profil {
  id: string
  email: string
  prenom: string
  nom: string
  telephone: string | null
  role: 'USER' | 'ADMIN'
  codeParrainage: string
  adresses: Adresse[]
  adresseComplete: boolean
  chiens: Chien[]
  abonnementsActifs: number
}

export interface Formule {
  id: string
  slug: string
  nom: string
  description: string
  type: 'SURPRISE' | 'SAISONNIERE' | 'COMPOSE'
  prix: Partial<Record<Taille, number>>
  contenu: Partial<Record<Taille, Partial<Record<Categorie, number>>>> | null
  dateDebutVente: string | null
  dateFinVente: string | null
  disponible: boolean
}

export interface Catalogue {
  formules: Formule[]
  seuilsTaille: { S: number; M: number }
  fraisPort: number
  fraisPortOffertDes: number
  dureesCadeau: number[]
  pauseMaxMois: number
}

export interface ResultatQuiz {
  id: string
  chienId: string | null
  taille: Taille
  tailleCalculee: Taille
  formuleRecommandee: 'SURPRISE' | 'COMPOSE'
  contenu: Partial<Record<Categorie, number>> | null
  prixSurpriseMensuel: number | null
  prixCompose: number | null
  fraisPort: number
  allergenesExclus: Allergene[]
  message: string
}

export interface Avis {
  id: string
  note: number
  commentaire: string
  photoUrl: string | null
  prenom: string
  createdAt: string
}

export interface AbonnementClient {
  id: string
  statut: string
  taille: Taille
  prixMensuel: number
  dateFin: string | null
  pauseJusquau: string | null
  chien: { id: string; nom: string; poids: number }
  prochaineBox: { date: string; taille: Taille; theme: string | null } | null
  tailleConseillee: Taille
  changementTailleConseille: boolean
  historique: Array<{ id: string; mois: string | null; theme: string | null; taille: Taille; statut: string; numeroSuivi: string | null }>
}

export interface CommandeClient {
  id: string
  numero: number
  type: 'BOX_MENSUELLE' | 'COMPOSE' | 'SAISONNIERE'
  taille: Taille
  statut: string
  total: number
  createdAt: string
  factureUrl: string | null
  numeroSuivi: string | null
  transporteur: string | null
  chien: { nom: string } | null
  formula: { nom: string } | null
  boxMensuelle: { mois: string; theme: string | null } | null
  selections: Array<{ quantite: number; produit: { nom: string; emoji: string } }>
}
