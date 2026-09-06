const startTime = Date.now();
console.log("Polling Railway until commit c7f9c3c goes live...");

while (true) {
  try {
    const res = await fetch("https://zyvoriq.up.railway.app/assets/video/napoleon_180s_master.mp4", { method: 'HEAD' });
    if (res.status === 200) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      const len = res.headers.get("content-length");
      console.log(`\n🎉 SUCCESS! Railway deployed in ${elapsed}s! Asset HTTP 200 OK (size: ${(len / 1024 / 1024).toFixed(1)} MB)!`);
      process.exit(0);
    }
  } catch (err) {}

  process.stdout.write(".");
  await new Promise(r => setTimeout(r, 4000));

  if (Date.now() - startTime > 300000) {
    console.error("\nTimed out waiting for Railway asset");
    process.exit(1);
  }
}
