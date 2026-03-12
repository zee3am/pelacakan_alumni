import { extractPublicData } from './lib/extractor.js';

const testAlumni = {
  nama: "Ahmad Fauzi",
  afiliasi_kampus: "Universitas Muhammadiyah Malang",
  bidang_pekerjaan: ""
};

console.log("Testing tracking for:", testAlumni.nama);
extractPublicData(testAlumni).then(results => {
  console.log("Results found:", results.length);
  results.forEach((r, i) => {
    console.log(`${i+1}. [${r.confidence_score}] ${r.sumber} - ${r.url}`);
  });
  
  if (results.length === 0) {
    console.log("No results found. DDG might be blocking the request or query is too restrictive.");
  }
}).catch(err => {
  console.error("Error during test:", err);
});
