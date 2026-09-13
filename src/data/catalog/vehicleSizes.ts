import type { VehicleSize } from './types'

/** Transport size taxonomy for event logistics (reference + create form). */
export const vehicleSizes: VehicleSize[] = [
  {
    id: 'vs-sprinter',
    label: 'Sprinter / Kastenwagen',
    shortLabel: 'Sprinter',
    volumeM3Hint: '10–15 m³',
    payloadHint: 'bis ca. 1,2 t',
    withDriver: 'optional',
    notes: 'City-fähig, Last-Mile, kleine PA/Licht-Cases',
  },
  {
    id: 'vs-35t',
    label: '3,5 t Transporter',
    shortLabel: '3,5 t',
    volumeM3Hint: '15–20 m³',
    payloadHint: 'bis 3,5 t zGG',
    withDriver: 'optional',
    notes: 'Führerschein B / BE je nach Anhänger',
  },
  {
    id: 'vs-75t',
    label: '7,5 t LKW',
    shortLabel: '7,5 t',
    volumeM3Hint: '30–40 m³',
    payloadHint: 'ca. 3–4 t Nutzlast',
    withDriver: true,
    notes: 'Standard Event-Touring, CE-Führerschein',
  },
  {
    id: 'vs-12t',
    label: '12 t LKW',
    shortLabel: '12 t',
    volumeM3Hint: '40–50 m³',
    payloadHint: 'ca. 5–7 t Nutzlast',
    withDriver: true,
  },
  {
    id: 'vs-40t-jumbo',
    label: '40 t Jumbo / Planen-Sattel',
    shortLabel: '40 t Jumbo',
    volumeM3Hint: 'ca. 100–120 m³',
    payloadHint: 'bis ca. 24 t',
    withDriver: true,
    notes: 'Großes Rig / Festival-Loads',
  },
  {
    id: 'vs-mega-koffer',
    label: 'Mega-Koffer / Kofferauflieger',
    shortLabel: 'Mega-Koffer',
    volumeM3Hint: 'ca. 100 m³+',
    payloadHint: 'je nach Achskonfig',
    withDriver: true,
    notes: 'Wettergeschützt, oft mit Hebebühne',
  },
  {
    id: 'vs-trailer-with-driver',
    label: 'Anhänger / Trailer mit Fahrer',
    shortLabel: 'Trailer + Fahrer',
    volumeM3Hint: 'variabel',
    payloadHint: 'variabel',
    withDriver: true,
  },
  {
    id: 'vs-trailer-solo',
    label: 'Anhänger / Trailer ohne Fahrer',
    shortLabel: 'Trailer solo',
    volumeM3Hint: 'variabel',
    payloadHint: 'variabel',
    withDriver: false,
    notes: 'Nur Gerät — Zugmaschine kundenseitig',
  },
]

export function getVehicleSize(id: string) {
  return vehicleSizes.find((v) => v.id === id)
}
