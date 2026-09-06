#!/bin/bash
set -e

cd ~/zyvoriq

PORT=3333
echo "Cleaning up any existing process on port $PORT..."
fuser -k $PORT/tcp 2>/dev/null || true

echo "Building fresh Next.js production build..."
npm run check

echo "Starting Next.js production server on Cloudtop (port $PORT)..."
npx next start -p $PORT &
SERVER_PID=$!

cleanup() {
  echo "Stopping Next.js server (PID $SERVER_PID)..."
  kill -9 $SERVER_PID 2>/dev/null || true
  fuser -k $PORT/tcp 2>/dev/null || true
}
trap cleanup EXIT

echo "Waiting for server to become ready on http://localhost:$PORT..."
READY=0
for i in {1..40}; do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT || echo "000")
  if [ "$CODE" = "200" ]; then
    echo "Server is UP and responding HTTP 200 (attempt $i)!"
    READY=1
    break
  fi
  sleep 1
done

if [ "$READY" -ne 1 ]; then
  echo "Server failed to start within timeout!"
  exit 1
fi

echo "Running Puppeteer E2E test harness on Cloudtop..."
TEST_PORT=$PORT node scripts/verify_omni_multiphase_studio_cloudtop.mjs

echo "Remote verification suite completed successfully!"
