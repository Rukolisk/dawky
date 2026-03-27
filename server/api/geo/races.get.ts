// server/api/geo/races.get.ts
// Retourne la liste des races de chiens (The Dog API ou liste statique enrichie)
// GET /api/geo/races?q=lab

import { z } from 'zod'
import { parseQuery, withErrorHandling } from '~/server/utils/api'

// Liste complète des races françaises (traduite)
const RACES_CHIENS = [
  'Affenpinscher','Airedale Terrier','Akita Inu','Akita Américain','Alaskan Malamute',
  'American Bully','American Staffordshire Terrier','Basenji','Basset Hound',
  'Beagle','Beauceron','Berger Allemand','Berger Australien','Berger Belge Malinois',
  'Berger Belge Tervueren','Berger Blanc Suisse','Berger des Pyrénées','Berger de Shetland',
  'Bichon Frisé','Bichon Maltais','Border Collie','Border Terrier','Boston Terrier',
  'Bouledogue Américain','Bouledogue Français','Bouledogue Anglais','Bouvier des Flandres',
  'Boxer','Braque de Weimar','Braque Français','Briard','Bull Terrier','Bullmastiff',
  'Cairn Terrier','Caniche Nain','Caniche Moyen','Caniche Royal','Caniche Toy',
  'Cane Corso','Cavalier King Charles Spaniel','Chihuahua','Chow-Chow',
  'Clumber Spaniel','Cocker Américain','Cocker Anglais','Colley à poil long',
  'Dachshund (Teckel)','Dalmatien','Dobermann','Dogue Allemand','Dogue de Bordeaux',
  'Épagneul Breton','Épagneul Japonais','Épagneul Tibétain','Eurasier',
  'Flat-Coated Retriever','Fox Terrier','Golden Retriever','Grand Danois',
  'Greyhound','Griffon Bruxellois','Husky Sibérien','Jack Russell Terrier',
  'Labrador Retriever','Lagotto Romagnolo','Leonberg','Lévrier Afghan',
  'Lévrier Irlandais','Lhassa Apso','Malinois','Mastiff Anglais',
  'Montagne des Pyrénées','Mops (Carlin)','Newfoundland','Norfolk Terrier',
  'Norwich Terrier','Pékinois','Pinscher Nain','Pointer','Rottweiler',
  'Rough Collie','Saint-Bernard','Samoyède','Schnauzer Géant','Schnauzer Moyen',
  'Schnauzer Nain','Scottish Terrier','Setter Anglais','Setter Irlandais',
  'Shiba Inu','Shih Tzu','Siberian Husky','Spitz Allemand','Spitz Nain',
  'Springer Anglais','Staffordshire Bull Terrier','Terre-Neuve',
  'Tosa Inu','Vizsla','Weimaraner','West Highland White Terrier',
  'Whippet','Yorkshire Terrier','Croisé / Bâtard','Autre race',
].sort()

const querySchema = z.object({
  q: z.string().default(''),
})

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    const { q } = parseQuery(event, querySchema)

    if (!q || q.length < 2) return RACES_CHIENS.slice(0, 10)

    const search = q.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    return RACES_CHIENS.filter(r =>
      r.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(search)
    ).slice(0, 8)
  })
})
