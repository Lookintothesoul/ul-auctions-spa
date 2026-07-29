export interface CityDictionaryItem {
  name: string
  gc_id: number
}

export const CITIES: CityDictionaryItem[] = [
  { name: 'Пермь', gc_id: 59 },
  { name: 'Москва', gc_id: 100 },
  { name: 'Санкт-Петербург', gc_id: 101 },
  { name: 'Екатеринбург', gc_id: 102 },
  { name: 'Новосибирск', gc_id: 103 },
  { name: 'Казань', gc_id: 104 },
  { name: 'Челябинск', gc_id: 105 },
  { name: 'Самара', gc_id: 106 },
  { name: 'Уфа', gc_id: 107 },
  { name: 'Красноярск', gc_id: 108 },
]

export function getCityGcId(cityName: string | undefined): number | undefined {
  if (!cityName) return undefined
  return CITIES.find((c) => c.name === cityName)?.gc_id
}
