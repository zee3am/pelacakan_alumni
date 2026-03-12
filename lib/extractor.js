/**
 * Ekstraksi Data dari DuckDuckGo Search
 * Melakukan pencarian web riil dan mem-parsing hasilnya.
 */

import * as cheerio from "cheerio";
import { calculateConfidence } from "./scoring.js";

const DUCKDUCKGO_HTML_URL = "https://html.duckduckgo.com/html/";

/**
 * Melakukan pencarian DuckDuckGo dan mem-parsing hasil HTML.
 * @param {string} query - Query pencarian
 * @returns {Promise<Array<{title: string, url: string, snippet: string}>>}
 */
async function searchDuckDuckGo(query) {
  try {
    const params = new URLSearchParams({ q: query });
    const response = await fetch(DUCKDUCKGO_HTML_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      body: params.toString(),
    });

    if (!response.ok) {
      console.error(`DuckDuckGo search failed with status: ${response.status}`);
      return [];
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const results = [];

    $(".result").each((i, el) => {
      if (i >= 10) return false; // Limit to 10 results

      const titleEl = $(el).find(".result__a");
      const snippetEl = $(el).find(".result__snippet");
      const urlEl = $(el).find(".result__url");

      const title = titleEl.text().trim();
      const snippet = snippetEl.text().trim();
      let url = "";

      // Try to extract URL from href
      const href = titleEl.attr("href") || "";
      if (href.startsWith("//duckduckgo.com/l/")) {
        // DDG redirect URL - extract the actual URL from uddg parameter
        try {
          const urlObj = new URL("https:" + href);
          url = urlObj.searchParams.get("uddg") || urlEl.text().trim();
        } catch {
          url = urlEl.text().trim();
        }
      } else if (href.startsWith("http")) {
        url = href;
      } else {
        url = urlEl.text().trim();
        if (url && !url.startsWith("http")) {
          url = "https://" + url;
        }
      }

      if (title && url) {
        results.push({ title, url, snippet });
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

  // LinkedIn-focused search
  queries.push(`site:linkedin.com/in "${name}"`);

  // General professional search
  if (target.afiliasi_kampus) {
    queries.push(`"${name}" "${target.afiliasi_kampus}"`);
  }

  // Field-specific search
  if (target.bidang_pekerjaan) {
    queries.push(`"${name}" ${target.bidang_pekerjaan}`);
  }

  // Academic search
  if (target.afiliasi_kampus && target.program_studi) {
    queries.push(
      `"${name}" ${target.afiliasi_kampus} ${target.program_studi}`
    );
  }

  // If no specific fields, do a general search
  if (queries.length === 1) {
    queries.push(`"${name}" alumni`);
  }

  return queries;
}

/**
 * Mengekstrak data publik untuk target alumni menggunakan DuckDuckGo.
 * @param {object} target - Data target alumni dari database
 * @returns {Promise<Array<{sumber: string, url: string, ringkasan_jabatan: string, confidence_score: number, confidence_label: string}>>}
 */
export async function extractPublicData(target) {
  const queries = buildSearchQueries(target);
  const allResults = [];
  const seenUrls = new Set();

  for (const query of queries) {
    // Add a small delay between requests to be polite
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const searchResults = await searchDuckDuckGo(query);

    for (const result of searchResults) {
      // Deduplicate by URL
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

  // Sort by confidence score descending
  allResults.sort((a, b) => b.confidence_score - a.confidence_score);

  // Return top 15 results
  return allResults.slice(0, 15);
}
