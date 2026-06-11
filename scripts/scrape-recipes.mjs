// Scrapes recipe pages and appends new entries to src/data/recipes.js.
// Reads JSON-LD Recipe schema from each URL, maps to the app's recipe shape,
// dedupes against existing recipes, and rewrites the data file.
//
// Usage: node scripts/scrape-recipes.mjs <urls-file> [maxCount]

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const RECIPES_PATH = join(__dirname, "../src/data/recipes.js");
const UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

const SOURCE_NAMES = {
  "www.budgetbytes.com": "Budget Bytes",
  "www.skinnytaste.com": "Skinnytaste",
  "www.wholekitchensink.com": "Whole Kitchen Sink",
};

function parseDurationMinutes(iso) {
  if (!iso || typeof iso !== "string") return 0;
  const m = iso.match(/P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?/);
  if (!m) return 0;
  return (Number(m[1]) || 0) * 1440 + (Number(m[2]) || 0) * 60 + (Number(m[3]) || 0);
}

function stripHtml(text) {
  return String(text)
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&#?\w+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function firstSentences(text, maxLen = 180) {
  const clean = stripHtml(text);
  if (clean.length <= maxLen) return clean;
  const cut = clean.slice(0, maxLen);
  const lastPeriod = cut.lastIndexOf(". ");
  return lastPeriod > 60 ? cut.slice(0, lastPeriod + 1) : cut.trimEnd() + "…";
}

function findRecipeNode(node) {
  if (!node || typeof node !== "object") return null;
  if (Array.isArray(node)) {
    for (const item of node) {
      const found = findRecipeNode(item);
      if (found) return found;
    }
    return null;
  }
  const type = node["@type"];
  const types = Array.isArray(type) ? type : [type];
  if (types.includes("Recipe")) return node;
  if (node["@graph"]) return findRecipeNode(node["@graph"]);
  return null;
}

function extractImage(image) {
  if (!image) return null;
  if (typeof image === "string") return image;
  if (Array.isArray(image)) return extractImage(image[0]);
  if (image.url) return image.url;
  return null;
}

function extractSteps(instructions) {
  const steps = [];
  const walk = (node) => {
    if (!node) return;
    if (Array.isArray(node)) return node.forEach(walk);
    if (typeof node === "string") return steps.push(stripHtml(node));
    if (node["@type"] === "HowToSection") return walk(node.itemListElement);
    if (node.text) return steps.push(stripHtml(node.text));
  };
  walk(instructions);
  return steps.filter(Boolean);
}

function extractServings(recipeYield) {
  const y = Array.isArray(recipeYield) ? recipeYield[0] : recipeYield;
  const n = parseInt(String(y), 10);
  return Number.isFinite(n) && n > 0 ? n : 4;
}

function buildTags(recipe, totalMinutes) {
  const raw = []
    .concat(recipe.recipeCategory || [])
    .concat(recipe.recipeCuisine || [])
    .concat(typeof recipe.keywords === "string" ? recipe.keywords.split(",") : recipe.keywords || []);
  const tags = new Set();
  for (const tag of raw) {
    const t = stripHtml(tag).toLowerCase().replace(/[^a-z0-9 ]/g, "").trim().replace(/\s+/g, "-");
    if (t && t.length <= 20 && !/^\d/.test(t)) tags.add(t);
    if (tags.size >= 4) break;
  }
  if (totalMinutes > 0 && totalMinutes <= 30) tags.add("quick");
  tags.add("kid-friendly");
  return [...tags].slice(0, 6);
}

function slugFromUrl(url) {
  return new URL(url).pathname.replace(/\//g, "").replace(/-\d+-ww-pts$|-lightened-up$|-makeover$/, "");
}

async function scrape(url) {
  const res = await fetch(url, { headers: { "user-agent": UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  const blocks = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)];
  for (const [, json] of blocks) {
    let data;
    try {
      data = JSON.parse(json);
    } catch {
      continue;
    }
    const r = findRecipeNode(data);
    if (!r) continue;
    const prepTime = parseDurationMinutes(r.prepTime);
    const cookTime = parseDurationMinutes(r.cookTime) || parseDurationMinutes(r.totalTime) - prepTime;
    const total = prepTime + cookTime;
    const image = extractImage(r.image);
    const ingredients = (r.recipeIngredient || []).map(stripHtml);
    const steps = extractSteps(r.recipeInstructions);
    if (!r.name || !image || !ingredients.length || !steps.length) return null;
    return {
      id: slugFromUrl(url),
      title: stripHtml(r.name),
      description: firstSentences(r.description || ""),
      image,
      prepTime,
      cookTime: Math.max(cookTime, 0),
      servings: extractServings(r.recipeYield),
      difficulty: total <= 45 ? "easy" : "medium",
      tags: buildTags(r, total),
      ingredients,
      steps,
      sourceUrl: url,
      sourceName: SOURCE_NAMES[new URL(url).hostname] || new URL(url).hostname,
    };
  }
  return null;
}

const [urlsFile, maxArg] = process.argv.slice(2);
if (!urlsFile) {
  console.error("Usage: node scripts/scrape-recipes.mjs <urls-file> [maxCount]");
  process.exit(1);
}
const maxCount = Number(maxArg) || Infinity;
const urls = readFileSync(urlsFile, "utf8").split("\n").map((l) => l.trim()).filter(Boolean);

const { recipes: existing } = await import(RECIPES_PATH);
const existingIds = new Set(existing.map((r) => r.id));
const existingUrls = new Set(existing.map((r) => r.sourceUrl));
const existingTitles = new Set(existing.map((r) => r.title.toLowerCase()));

const added = [];
for (const url of urls) {
  if (added.length >= maxCount) break;
  if (existingUrls.has(url)) {
    console.log(`skip (already present): ${url}`);
    continue;
  }
  try {
    const recipe = await scrape(url);
    if (!recipe) {
      console.log(`skip (no usable recipe data): ${url}`);
      continue;
    }
    if (existingIds.has(recipe.id) || existingTitles.has(recipe.title.toLowerCase())) {
      console.log(`skip (duplicate id/title): ${url}`);
      continue;
    }
    existingIds.add(recipe.id);
    existingTitles.add(recipe.title.toLowerCase());
    added.push(recipe);
    console.log(`ok [${added.length}]: ${recipe.title} (${recipe.prepTime}+${recipe.cookTime}min, ${recipe.difficulty})`);
  } catch (err) {
    console.log(`skip (fetch failed: ${err.message}): ${url}`);
  }
  await new Promise((resolve) => setTimeout(resolve, 300));
}

if (!added.length) {
  console.log("No new recipes added.");
  process.exit(0);
}

const source = readFileSync(RECIPES_PATH, "utf8");
const closing = source.lastIndexOf("\n];");
if (closing === -1) throw new Error("Could not find closing bracket in recipes.js");
const entries = added
  .map((r) => "  " + JSON.stringify(r, null, 2).replace(/\n/g, "\n  "))
  .join(",\n");
const updated = source.slice(0, closing) + ",\n" + entries + source.slice(closing);
writeFileSync(RECIPES_PATH, updated);
console.log(`\nAdded ${added.length} recipes to src/data/recipes.js (total ${existing.length + added.length}).`);
