/**
 * Ekstraksi Data dari DuckDuckGo Search
 * Melakukan pencarian web riil dan mem-parsing hasilnya.
 */

import * as cheerio from "cheerio";
import { calculateConfidence } from "./scoring.js";

const DUCKDUCKGO_LITE_URL = "https://lite.duckduckgo.com/lite/";

/**
 * Melakukan pencarian DuckDuckGo Lite dan mem-parsing hasil HTML.
 * @param {string} query - Query pencarian
 * @returns {Promise<Array<{title: string, url: string, snippet: string}>>}
 */
async function searchDuckDuckGo(query) {
  try {
    const params = new URLSearchParams({ q: query });
    
    // DuckDuckGo Lite menggunakan POST ke /lite/
    const response = await fetch(DUCKDUCKGO_LITE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      body: params.toString(),
    });

    if (!response.ok) {
      console.error(`DDG Lite failed: ${response.status}`);
      return [];
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const results = [];

    // Parsing struktur DuckDuckGo Lite
    // Hasil biasanya ada di dalam table
    $("table").last().find("tr").each((i, el) => {
      // Baris hasil biasanya punya 3 baris: Judul, Snippet, URL
      const titleLink = $(el).find(".result-link");
      if (titleLink.length > 0) {
        const title = titleLink.text().trim();
        const url = titleLink.attr("href");
        
        // Snippet biasanya ada di baris berikutnya atau elemen setelahnya
        const snippet = $(el).next().find(".result-snippet").text().trim();

        if (title && url) {
          // Bersihkan URL dari redirect DDG jika ada
          let cleanUrl = url;
          if (url.includes("uddg=")) {
            try {
              cleanUrl = decodeURIComponent(url.split("uddg=")[1].split("&")[0]);
            } catch (e) {}
          }

          results.push({
            title,
            url: cleanUrl.startsWith("http") ? cleanUrl : `https://${cleanUrl}`,
            snippet: snippet || ""
          });
        }
      }
    });

    return results;
  } catch (error) {
    console.error("DuckDuckGo search error:", error);
    return [];
  }
}

/**
 * Membangun query pencarian dari data target alumni.
 * @param {object} target - Data target alumni  
 * @returns {string[]} Array of search queries
 */
function buildSearchQueries(target) {
  const queries = [];
  const name = target.nama;

  // LinkedIn search (paling akurat)
  queries.push(`site:linkedin.com/in "${name}"`);

  // General search dengan kampus
  if (target.afiliasi_kampus) {
    // Kita buat lebih fleksibel: coba Tanpa tanda kutip jika yang pakai kutip gagal
    queries.push(`${name} ${target.afiliasi_kampus}`);
  }

  return queries;
}

/**
 * Mengekstrak data publik untuk target alumni.
 * @param {object} target - Data target alumni dari database
 * @returns {Promise<Array<{sumber: string, url: string, ringkasan_jabatan: string, confidence_score: number, confidence_label: string}>>}
 */
export async function extractPublicData(target) {
  const queries = buildSearchQueries(target);
  const allResults = [];
  const seenUrls = new Set();

  for (const query of queries) {
    // Jeda antar request
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const searchResults = await searchDuckDuckGo(query);

    if (searchResults.length > 0) {
      for (const result of searchResults) {
        const cleanUrl = result.url.split("?")[0].split("#")[0];
        if (seenUrls.has(cleanUrl)) continue;
        seenUrls.add(cleanUrl);

        const evidence = {
          sumber: result.title,
          url: result.url,
          ringkasan_jabatan: result.snippet,
        };

        const { score, label } = calculateConfidence(target, evidence);

        allResults.push({
          ...evidence,
          confidence_score: score,
          confidence_label: label,
        });
      }
    }
  }

  allResults.sort((a, b) => b.confidence_score - a.confidence_score);
  return allResults.slice(0, 15);
}
