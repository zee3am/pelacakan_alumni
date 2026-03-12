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
    const url = `${DUCKDUCKGO_HTML_URL}?${params.toString()}`;
    
    // Try POST first as it's less likely to be blocked than GET for some scrapers
    let response = await fetch(DUCKDUCKGO_HTML_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0",
        "Origin": "https://duckduckgo.com",
        "Referer": "https://duckduckgo.com/",
      },
      body: params.toString(),
    });

    // If POST fails or returns nothing, try GET
    if (!response.ok) {
      console.warn(`DDG POST failed (${response.status}), trying GET...`);
      response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
        }
      });
    }

    if (!response.ok) {
      console.error(`DuckDuckGo search failed both POST and GET. Status: ${response.status}`);
      return [];
    }

    const html = await response.text();
    
    // Check if we hit a bot wall
    if (html.includes("ddg-captcha") || html.includes("robot") || html.length < 500) {
      console.warn("DuckDuckGo might have blocked the request (Captcha or empty response)");
      return [];
    }

    const $ = cheerio.load(html);
    const results = [];

    $(".result").each((i, el) => {
      // Look for title and snippet in common DDG HTML structures
      const titleEl = $(el).find(".result__a");
      const snippetEl = $(el).find(".result__snippet");
      const urlEl = $(el).find(".result__url");

      const title = titleEl.text().trim();
      const snippet = snippetEl.text().trim();
      let resUrl = "";

      const href = titleEl.attr("href") || "";
      if (href.includes("uddg=")) {
        try {
          const parts = href.split("uddg=");
          if (parts.length > 1) {
            resUrl = decodeURIComponent(parts[1].split("&")[0]);
          }
        } catch {
          resUrl = href;
        }
      } else if (href.startsWith("http")) {
        resUrl = href;
      } else {
        resUrl = urlEl.text().trim();
      }

      if (title && (resUrl || snippet)) {
        results.push({ 
          title, 
          url: resUrl.startsWith("http") ? resUrl : `https://${resUrl}`, 
          snippet 
        });
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
