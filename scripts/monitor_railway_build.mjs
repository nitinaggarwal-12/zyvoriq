const startTime = Date.now();
console.log("Monitoring Railway production deployment for commit c7f9c3c...");

while (true) {
  try {
    const res = await fetch("https://zyvoriq.up.railway.app/");
    const html = await res.text();
    if (html.includes("Custom Synthesis Active")) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`\n🎉 SUCCESS: Live Railway deployment detected in ${elapsed}s!`);
      console.log("Verified string literal 'Custom Synthesis Active' is LIVE on CDN!");
      process.exit(0);
    }
  } catch (err) {
    // transient network error during deployment swap
  }

  process.stdout.write(".");
  await new Promise(r => setTimeout(r, 5000));

  if (Date.now() - startTime > 300000) { // 5 min timeout
    console.error("\nTimed out waiting for Railway build");
    process.exit(1);
  }
}
