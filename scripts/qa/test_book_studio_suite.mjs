import assert from "node:assert";
import {
  BOOK_OPPORTUNITY_CATALOG,
  calculateBOI,
  getBookOpportunityCatalog,
  generateChapterProse,
  compileEpubMetadata,
  compilePrintPdfLayout,
  compileAudiobookMaster,
  generateBookTokPromoReels
} from "../../lib/book/bookStudioEngine.js";

console.log("================================================================================");
console.log("🚀 EXECUTING ORIGINAL BOOK STUDIO & TRANSMEDIA QA TEST SUITE");
console.log("================================================================================");

// -----------------------------------------------------------------------------
// TEST 1: Book Opportunity Index (BOI) Scoring Algorithm
// -----------------------------------------------------------------------------
console.log("\n🧪 TEST 1: Testing BOI Mathematical Calculation Engine...");
const boiHighDemand = calculateBOI(9.5, 9.2, "low", 1.3);
assert.ok(boiHighDemand >= 95, `High trope velocity + low catalog density must produce BOI >= 95, got: ${boiHighDemand}`);

const boiSaturated = calculateBOI(3.0, 3.0, "high", 0.9);
assert.ok(boiSaturated < 45, `Saturated market must produce BOI < 45, got: ${boiSaturated}`);

console.log(`  ✓ High-Demand BOI Score: ${boiHighDemand}/100`);
console.log(`  ✓ Saturated Market BOI Score: ${boiSaturated}/100`);
console.log("  ✅ Test 1 Passed!");

// -----------------------------------------------------------------------------
// TEST 2: Mythology, History & Master Stylometry Catalog
// -----------------------------------------------------------------------------
console.log("\n🧪 TEST 2: Testing Book Opportunity Catalog & Lore Bibles...");
const catalog = getBookOpportunityCatalog();
assert.ok(catalog.length >= 2, "Must contain at least 2 pre-engineered book recipes");

const hadesVenice = catalog.find(b => b.id === "book-hades-venice-noir");
assert.ok(hadesVenice, "Found Hades Venice Noir book recipe");
assert.strictEqual(hadesVenice.mythology, "greek_mediterranean");
assert.strictEqual(hadesVenice.historicalEra, "renaissance_venice");
assert.strictEqual(hadesVenice.authorStyle, "george_rr_martin");
assert.ok(hadesVenice.targetWordCount >= 70000, "Book target word count is >= 70,000 words");
assert.ok(hadesVenice.worldLoreBible.magicOrTechnologyLaws.length >= 2, "Contains hard magic/technology laws");
assert.ok(hadesVenice.characterGraph.length >= 2, "Contains dynamic character matrix");

console.log(`  ✓ Validated "${hadesVenice.title}" (${hadesVenice.targetWordCount.toLocaleString()} words, ${hadesVenice.targetPages} pages)`);
console.log(`    • Comps: ${hadesVenice.compTitles.join(" • ")}`);
console.log(`    • Tropes: ${hadesVenice.tropeStack.join(", ")}`);
console.log("  ✅ Test 2 Passed!");

// -----------------------------------------------------------------------------
// TEST 3: Chapter Prose Generation & Drop Cap Formatting
// -----------------------------------------------------------------------------
console.log("\n🧪 TEST 3: Testing Chapter Prose Generation & Drop Cap Formatting...");
const ch1 = generateChapterProse(hadesVenice, 1);
assert.ok(ch1.title.includes("Chapter 1:"), "Formatted Chapter 1 title");
assert.strictEqual(ch1.dropCapLetter, "T", "Drop cap letter initialized");
assert.ok(ch1.formattedText.length > 200, "Rich chapter prose generated");
assert.ok(ch1.wordCount >= 3000, "Chapter word count meets granular standard (>= 3,000 words)");

console.log(`  ✓ Generated: ${ch1.title} (${ch1.wordCount} words)`);
console.log(`  ✓ Drop Cap: '${ch1.dropCapLetter}'`);
console.log(`  ✓ Opening Excerpt: "${ch1.formattedText.slice(0, 110)}..."`);
console.log("  ✅ Test 3 Passed!");

// -----------------------------------------------------------------------------
// TEST 4: Multi-Modal Publishing Transpiler (EPUB, Print PDF, Audible M4B)
// -----------------------------------------------------------------------------
console.log("\n🧪 TEST 4: Testing Multi-Modal Publishing Compilers...");
const epub = compileEpubMetadata(hadesVenice);
assert.strictEqual(epub.title, hadesVenice.title);
assert.ok(epub.opfManifestXml.includes("package xmlns"), "Valid EPUB 3 OPF XML generated");
assert.strictEqual(epub.tableOfContents.length, hadesVenice.chapters.length, "All chapters in TOC");

const pdf = compilePrintPdfLayout(hadesVenice);
assert.strictEqual(pdf.trimSize, "6x9_trade");
assert.strictEqual(pdf.pageCount, hadesVenice.targetPages);
assert.strictEqual(pdf.gutterMarginMm, 19.05, "Standard 0.75-inch gutter margin for print binding");

const audio = compileAudiobookMaster(hadesVenice);
assert.ok(audio.totalDurationMinutes >= 400, "Audiobook total duration >= 400 minutes");
assert.strictEqual(audio.duckingDb, -18, "Audiobook soundtrack ducks to -18dB during narration");

console.log(`  ✓ Kindle EPUB: OPF XML verified (${epub.tableOfContents.length} chapters)`);
console.log(`  ✓ Print PDF: 6"×9" Trade Paperback (${pdf.pageCount} pages, 19.05mm gutter)`);
console.log(`  ✓ Full-Cast Audiobook: ${audio.totalDurationMinutes} mins total duration (ducking: ${audio.duckingDb}dB)`);
console.log("  ✅ Test 4 Passed!");

// -----------------------------------------------------------------------------
// TEST 5: #BookTok 60s Video Trailer Campaign
// -----------------------------------------------------------------------------
console.log("\n🧪 TEST 5: Testing #BookTok Viral Video Launch Campaign...");
const trailers = generateBookTokPromoReels(hadesVenice);
assert.ok(trailers.length >= 3, "Generated at least 3 distinct #BookTok trailer scripts");

const firstTrailer = trailers[0];
assert.ok(firstTrailer.script.includes("POV:"), "Trailer uses high-converting POV hook");
assert.ok(firstTrailer.kineticSubtitles.includes("Hormozi"), "Uses Hormozi kinetic subtitles styling");

console.log(`  ✓ Generated ${trailers.length} #BookTok Video Trailers:`);
trailers.forEach(t => console.log(`    • ${t.title}: "${t.script.slice(0, 75)}..."`));
console.log("  ✅ Test 5 Passed!");

console.log("\n================================================================================");
console.log("🎉 ALL 5 ORIGINAL BOOK STUDIO QA TESTS PASSED WITH 100% ACCURACY!");
console.log("================================================================================\n");
