// Algeria's 58 wilayas (administrative provinces), with approximate
// chef-lieu (capital) coordinates used as map centroids when an atelier
// hasn't set a precise address/lat-lng. Not survey-grade precision —
// good enough to place a pin within the right province.
export interface Wilaya {
  code: string;
  name_fr: string;
  name_ar: string;
  name_en: string;
  lat: number;
  lng: number;
}

export const ALGERIA_WILAYAS: Wilaya[] = [
  { code: "01", name_fr: "Adrar", name_ar: "أدرار", name_en: "Adrar", lat: 27.87, lng: -0.29 },
  { code: "02", name_fr: "Chlef", name_ar: "الشلف", name_en: "Chlef", lat: 36.17, lng: 1.33 },
  { code: "03", name_fr: "Laghouat", name_ar: "الأغواط", name_en: "Laghouat", lat: 33.8, lng: 2.86 },
  { code: "04", name_fr: "Oum El Bouaghi", name_ar: "أم البواقي", name_en: "Oum El Bouaghi", lat: 35.87, lng: 7.11 },
  { code: "05", name_fr: "Batna", name_ar: "باتنة", name_en: "Batna", lat: 35.56, lng: 6.17 },
  { code: "06", name_fr: "Béjaïa", name_ar: "بجاية", name_en: "Béjaïa", lat: 36.75, lng: 5.08 },
  { code: "07", name_fr: "Biskra", name_ar: "بسكرة", name_en: "Biskra", lat: 34.85, lng: 5.73 },
  { code: "08", name_fr: "Béchar", name_ar: "بشار", name_en: "Béchar", lat: 31.62, lng: -2.22 },
  { code: "09", name_fr: "Blida", name_ar: "البليدة", name_en: "Blida", lat: 36.47, lng: 2.83 },
  { code: "10", name_fr: "Bouira", name_ar: "البويرة", name_en: "Bouira", lat: 36.38, lng: 3.9 },
  { code: "11", name_fr: "Tamanrasset", name_ar: "تمنراست", name_en: "Tamanrasset", lat: 22.79, lng: 5.53 },
  { code: "12", name_fr: "Tébessa", name_ar: "تبسة", name_en: "Tébessa", lat: 35.4, lng: 8.12 },
  { code: "13", name_fr: "Tlemcen", name_ar: "تلمسان", name_en: "Tlemcen", lat: 34.88, lng: -1.32 },
  { code: "14", name_fr: "Tiaret", name_ar: "تيارت", name_en: "Tiaret", lat: 35.37, lng: 1.32 },
  { code: "15", name_fr: "Tizi Ouzou", name_ar: "تيزي وزو", name_en: "Tizi Ouzou", lat: 36.72, lng: 4.05 },
  { code: "16", name_fr: "Alger", name_ar: "الجزائر", name_en: "Algiers", lat: 36.75, lng: 3.06 },
  { code: "17", name_fr: "Djelfa", name_ar: "الجلفة", name_en: "Djelfa", lat: 34.67, lng: 3.25 },
  { code: "18", name_fr: "Jijel", name_ar: "جيجل", name_en: "Jijel", lat: 36.82, lng: 5.77 },
  { code: "19", name_fr: "Sétif", name_ar: "سطيف", name_en: "Sétif", lat: 36.19, lng: 5.41 },
  { code: "20", name_fr: "Saïda", name_ar: "سعيدة", name_en: "Saïda", lat: 34.83, lng: 0.15 },
  { code: "21", name_fr: "Skikda", name_ar: "سكيكدة", name_en: "Skikda", lat: 36.88, lng: 6.91 },
  { code: "22", name_fr: "Sidi Bel Abbès", name_ar: "سيدي بلعباس", name_en: "Sidi Bel Abbès", lat: 35.19, lng: -0.63 },
  { code: "23", name_fr: "Annaba", name_ar: "عنابة", name_en: "Annaba", lat: 36.9, lng: 7.77 },
  { code: "24", name_fr: "Guelma", name_ar: "قالمة", name_en: "Guelma", lat: 36.46, lng: 7.43 },
  { code: "25", name_fr: "Constantine", name_ar: "قسنطينة", name_en: "Constantine", lat: 36.37, lng: 6.61 },
  { code: "26", name_fr: "Médéa", name_ar: "المدية", name_en: "Médéa", lat: 36.26, lng: 2.75 },
  { code: "27", name_fr: "Mostaganem", name_ar: "مستغانم", name_en: "Mostaganem", lat: 35.93, lng: 0.09 },
  { code: "28", name_fr: "M'Sila", name_ar: "المسيلة", name_en: "M'Sila", lat: 35.71, lng: 4.54 },
  { code: "29", name_fr: "Mascara", name_ar: "معسكر", name_en: "Mascara", lat: 35.4, lng: 0.14 },
  { code: "30", name_fr: "Ouargla", name_ar: "ورقلة", name_en: "Ouargla", lat: 31.95, lng: 5.33 },
  { code: "31", name_fr: "Oran", name_ar: "وهران", name_en: "Oran", lat: 35.7, lng: -0.63 },
  { code: "32", name_fr: "El Bayadh", name_ar: "البيض", name_en: "El Bayadh", lat: 33.68, lng: 1.02 },
  { code: "33", name_fr: "Illizi", name_ar: "إليزي", name_en: "Illizi", lat: 26.48, lng: 8.47 },
  { code: "34", name_fr: "Bordj Bou Arréridj", name_ar: "برج بوعريريج", name_en: "Bordj Bou Arréridj", lat: 36.07, lng: 4.76 },
  { code: "35", name_fr: "Boumerdès", name_ar: "بومرداس", name_en: "Boumerdès", lat: 36.77, lng: 3.47 },
  { code: "36", name_fr: "El Tarf", name_ar: "الطارف", name_en: "El Tarf", lat: 36.77, lng: 8.31 },
  { code: "37", name_fr: "Tindouf", name_ar: "تندوف", name_en: "Tindouf", lat: 27.67, lng: -8.15 },
  { code: "38", name_fr: "Tissemsilt", name_ar: "تيسمسيلت", name_en: "Tissemsilt", lat: 35.61, lng: 1.81 },
  { code: "39", name_fr: "El Oued", name_ar: "الوادي", name_en: "El Oued", lat: 33.35, lng: 6.87 },
  { code: "40", name_fr: "Khenchela", name_ar: "خنشلة", name_en: "Khenchela", lat: 35.44, lng: 7.14 },
  { code: "41", name_fr: "Souk Ahras", name_ar: "سوق أهراس", name_en: "Souk Ahras", lat: 36.29, lng: 7.95 },
  { code: "42", name_fr: "Tipaza", name_ar: "تيبازة", name_en: "Tipaza", lat: 36.59, lng: 2.45 },
  { code: "43", name_fr: "Mila", name_ar: "ميلة", name_en: "Mila", lat: 36.45, lng: 6.26 },
  { code: "44", name_fr: "Aïn Defla", name_ar: "عين الدفلى", name_en: "Aïn Defla", lat: 36.26, lng: 1.97 },
  { code: "45", name_fr: "Naâma", name_ar: "النعامة", name_en: "Naâma", lat: 33.27, lng: -0.31 },
  { code: "46", name_fr: "Aïn Témouchent", name_ar: "عين تموشنت", name_en: "Aïn Témouchent", lat: 35.3, lng: -1.14 },
  { code: "47", name_fr: "Ghardaïa", name_ar: "غرداية", name_en: "Ghardaïa", lat: 32.49, lng: 3.67 },
  { code: "48", name_fr: "Relizane", name_ar: "غليزان", name_en: "Relizane", lat: 35.74, lng: 0.56 },
  { code: "49", name_fr: "Timimoun", name_ar: "تيميمون", name_en: "Timimoun", lat: 29.26, lng: 0.24 },
  { code: "50", name_fr: "Bordj Badji Mokhtar", name_ar: "برج باجي مختار", name_en: "Bordj Badji Mokhtar", lat: 21.33, lng: 0.95 },
  { code: "51", name_fr: "Ouled Djellal", name_ar: "أولاد جلال", name_en: "Ouled Djellal", lat: 34.42, lng: 5.07 },
  { code: "52", name_fr: "Béni Abbès", name_ar: "بني عباس", name_en: "Béni Abbès", lat: 30.13, lng: -2.17 },
  { code: "53", name_fr: "In Salah", name_ar: "عين صالح", name_en: "In Salah", lat: 27.19, lng: 2.48 },
  { code: "54", name_fr: "In Guezzam", name_ar: "عين قزام", name_en: "In Guezzam", lat: 19.57, lng: 5.77 },
  { code: "55", name_fr: "Touggourt", name_ar: "تقرت", name_en: "Touggourt", lat: 33.1, lng: 6.06 },
  { code: "56", name_fr: "Djanet", name_ar: "جانت", name_en: "Djanet", lat: 24.56, lng: 9.48 },
  { code: "57", name_fr: "El M'Ghair", name_ar: "المغير", name_en: "El M'Ghair", lat: 33.95, lng: 5.92 },
  { code: "58", name_fr: "El Meniaa", name_ar: "المنيعة", name_en: "El Meniaa", lat: 30.58, lng: 2.88 },
];

export function getWilayaName(wilayaNameFr: string | null | undefined, locale: string): string {
  if (!wilayaNameFr) return "";
  const match = ALGERIA_WILAYAS.find((w) => w.name_fr.toLowerCase() === wilayaNameFr.toLowerCase());
  if (!match) return wilayaNameFr;
  if (locale === "ar") return match.name_ar;
  if (locale === "en") return match.name_en;
  return match.name_fr;
}

// Algeria's approximate bounding box, used to set the map's initial view.
export const ALGERIA_CENTER = { lat: 28.5, lng: 2.6 };
export const ALGERIA_DEFAULT_ZOOM = 4.6;
