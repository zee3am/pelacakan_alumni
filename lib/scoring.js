/**
 * Sistem Skoring (Scoring System) untuk Alumni Tracker
 * Menghitung confidence score berdasarkan kesamaan data target dan evidence.
 */

/**
 * Menghitung kesamaan string menggunakan algoritma Dice Coefficient.
 * @param {string} str1 
 * @param {string} str2 
 * @returns {number} similarity ratio (0-1)
 */
function stringSimilarity(str1, str2) {
  if (!str1 || !str2) return 0;
  
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  if (s1 === s2) return 1;
  if (s1.length < 2 || s2.length < 2) return 0;

  // Check if one contains the other
  if (s1.includes(s2) || s2.includes(s1)) return 0.85;

  // Dice coefficient using bigrams
  const bigrams1 = new Map();
  for (let i = 0; i < s1.length - 1; i++) {
    const bigram = s1.substring(i, i + 2);
    bigrams1.set(bigram, (bigrams1.get(bigram) || 0) + 1);
  }

  let intersectionSize = 0;
  for (let i = 0; i < s2.length - 1; i++) {
    const bigram = s2.substring(i, i + 2);
    const count = bigrams1.get(bigram) || 0;
    if (count > 0) {
      bigrams1.set(bigram, count - 1);
      intersectionSize++;
    }
  }

  return (2 * intersectionSize) / (s1.length - 1 + s2.length - 1);
}

/**
 * Cek apakah keyword ada dalam text
 */
function containsKeyword(text, keyword) {
  if (!text || !keyword) return false;
  return text.toLowerCase().includes(keyword.toLowerCase());
}

/**
 * Menghitung Confidence Score antara target alumni dan evidence yang ditemukan.
 * 
 * @param {object} target - Data target alumni
 * @param {object} evidence - Data evidence/bukti yang ditemukan
 * @returns {{ score: number, label: string }}
 */
export function calculateConfidence(target, evidence) {
  let score = 0;
  const weights = {
    nama: 40,
    afiliasi: 20,
    kota: 15,
    bidang: 15,
    url_quality: 10,
  };

  // 1. Kecocokan Nama (bobot 40)
  const evidenceText = `${evidence.sumber || ""} ${evidence.ringkasan_jabatan || ""} ${evidence.url || ""}`;
  const nameSimilarity = stringSimilarity(target.nama, evidenceText);
  
  // Check if the full name appears in evidence text
  if (containsKeyword(evidenceText, target.nama)) {
    score += weights.nama;
  } else {
    // Check individual name parts
    const nameParts = target.nama.split(" ");
    let namePartsFound = 0;
    for (const part of nameParts) {
      if (part.length > 2 && containsKeyword(evidenceText, part)) {
        namePartsFound++;
      }
    }
    const namePartRatio = nameParts.length > 0 ? namePartsFound / nameParts.length : 0;
    score += weights.nama * namePartRatio * 0.8;
  }

  // 2. Kecocokan Afiliasi/Kampus (bobot 20)
  if (target.afiliasi_kampus && containsKeyword(evidenceText, target.afiliasi_kampus)) {
    score += weights.afiliasi;
  } else if (target.afiliasi_kampus) {
    const afiliasiSim = stringSimilarity(target.afiliasi_kampus, evidenceText);
    score += weights.afiliasi * afiliasiSim * 0.6;
  }

  // 3. Kecocokan Kota (bobot 15)
  if (target.kota && containsKeyword(evidenceText, target.kota)) {
    score += weights.kota;
  }

  // 4. Kecocokan Bidang Pekerjaan (bobot 15)
  if (target.bidang_pekerjaan && containsKeyword(evidenceText, target.bidang_pekerjaan)) {
    score += weights.bidang;
  } else if (target.bidang_pekerjaan) {
    const bidangSim = stringSimilarity(target.bidang_pekerjaan, evidenceText);
    score += weights.bidang * bidangSim * 0.5;
  }

  // 5. Kualitas URL (bobot 10)
  const url = (evidence.url || "").toLowerCase();
  if (url.includes("linkedin.com")) {
    score += weights.url_quality;
  } else if (url.includes("scholar.google") || url.includes("researchgate.net")) {
    score += weights.url_quality * 0.9;
  } else if (url.includes("github.com") || url.includes("medium.com")) {
    score += weights.url_quality * 0.7;
  } else if (url.includes("instagram.com") || url.includes("twitter.com") || url.includes("x.com")) {
    score += weights.url_quality * 0.5;
  } else {
    score += weights.url_quality * 0.3;
  }

  // Clamp score
  score = Math.round(Math.min(100, Math.max(0, score)));

  // Determine label
  let label;
  if (score >= 70) {
    label = "Kemungkinan Kuat";
  } else if (score >= 40) {
    label = "Perlu Verifikasi";
  } else {
    label = "Tidak Cocok";
  }

  return { score, label };
}
