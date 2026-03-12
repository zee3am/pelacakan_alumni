const cheerio = require("cheerio");
const fs = require("fs");

const html = fs.readFileSync("yahoo.html", "utf8");
const $ = cheerio.load(html);
const res = [];
$(".algo").each((i, el) => {
  const title = $(el).find("h3 a").text().trim();
  const href = $(el).find("h3 a").attr("href");
  const snippet = $(el).find(".compText").text().trim();
  res.push({title, href, snippet});
});
console.log(res);
