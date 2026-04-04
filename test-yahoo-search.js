import * as cheerio from "cheerio";

async function testYahoo() {
  const url = 'https://search.yahoo.com/search?p=site:linkedin.com/in+"Ahmad+Fauzi"';
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36' } });
  const html = await res.text();
  const $ = cheerio.load(html);
  
  const results = [];
  $(".algo").each((i, el) => {
    results.push($(el).find("h3 a").text());
  });
  console.log("Yahoo Count:", results.length);
  if (results.length > 0) console.log(results[0]);
}

testYahoo();
