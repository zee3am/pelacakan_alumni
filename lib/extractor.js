/**
 * Ekstraksi Data dari DuckDuckGo Search
 * Melakukan pencarian web riil dan mem-parsing hasilnya.
 */

import * as cheerio from "cheerio";
import { calculateConfidence } from "./scoring.js";

const DUCKDUCKGO_LITE_URL = "https://lite.duckduckgo.com/lite/";
const YAHOO_SEARCH_URL = "https://search.yahoo.com/search";

/**
 * Mencoba mencari menggunakan Yahoo Search sebagai fallback.
 */
async function searchYahoo(query) {
  try {
    const params = new URLSearchParams({ p: query });
    const response = await fetch(`${YAHOO_SEARCH_URL}?${params.toString()}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      },
    });

    if (!response.ok) return [];

    const html = await response.text();
    const $ = cheerio.load(html);
    const results = [];

    $(".algo").each((i, el) => {
      const title = $(el).find("h3 a").first().text().trim();
      const url = $(el).find("h3 a").first().attr("href");
      const snippet = $(el).find(".compText, .st").text().trim();

      if (title && url) {
        results.push({ title, url, snippet });
      }
    });

    return results;
  } catch (e) {
    console.error("Yahoo fallback error:", e);
    return [];
  }
}

/**
 * Melakukan pencarian DuckDuckGo Lite.
 */
async function searchDuckDuckGo(query) {
  try {
    const params = new URLSearchParams({ q: query });
    const response = await fetch(DUCKDUCKGO_LITE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
      },
      body: params.toString(),
    });

    if (!response.ok) return [];

    const html = await response.text();
    const $ = cheerio.load(html);
    const results = [];

    $("table").last().find("tr").each((i, el) => {
      const titleLink = $(el).find(".result-link");
      if (titleLink.length > 0) {
        const title = titleLink.text().trim();
        const url = titleLink.attr("href");
        const snippet = $(el).next().find(".result-snippet").text().trim();

        if (title && url) {
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
    return [];
  }
}

/**
 * Membangun query pencarian.
 */
function buildSearchQueries(target) {
  const name = target.nama;
  const queries = [];
  
  // Mencoba berbagai kombinasi
  queries.push(`site:linkedin.com/in "${name}"`);
  
  if (target.afiliasi_kampus) {
    queries.push(`"${name}" "${target.afiliasi_kampus}"`);
    queries.push(`${name} ${target.afiliasi_kampus}`);
  }

  return queries;
}

/**
 * Mengekstrak data publik.
 */
export async function extractPublicData(target) {
  const queries = buildSearchQueries(target);
  const allResults = [];
  const seenUrls = new Set();

  for (const query of queries) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Coba DDG Lite
    let searchResults = await searchDuckDuckGo(query);
    
    // Jika DDG gagal/diblokir, coba Yahoo
    if (searchResults.length === 0) {
      console.log(`DDG Empty for [${query}], trying Yahoo...`);
      searchResults = await searchYahoo(query);
    }

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
