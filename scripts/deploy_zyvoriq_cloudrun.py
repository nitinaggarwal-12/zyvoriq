#!/usr/bin/env python3
"""
Zero-Daemon OCI Container Image Assembler & Cloud Run Deployer for Zyvoriq (Rule 56)
Packages Next.js standalone build (.next/standalone, .next/static), canonical library_manifest.json,
and the 5-minute (300.0s, 10-Act) Mission: Impossible 10 master reel (ZYV-REEL-MI10-300S)
to us-west1-docker.pkg.dev/ramp-portal-dev/cloud-run-source-deploy/zyvoriq:<tag>,
updates Cloud Run service zyvoriq in ramp-portal-dev (us-west1), and verifies all 4 Rule 56 gates.
"""
from __future__ import annotations

import gzip
import hashlib
import io
import json
import os
import subprocess
import tarfile
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path


def get_gcloud_token() -> str:
    env = os.environ.copy()
    existing = env.get("CLOUDSDK_METRICS_ENVIRONMENT", "")
    env["CLOUDSDK_METRICS_ENVIRONMENT"] = f"{existing} datacloud.antigravity".strip()
    return subprocess.check_output(
        ["gcloud", "auth", "print-access-token"], text=True, env=env
    ).strip()


def http_req(url: str, method: str = "GET", headers: dict | None = None, data: bytes | None = None, timeout: int = 600):
    req = urllib.request.Request(url, data=data, method=method, headers=headers or {})
    return urllib.request.urlopen(req, timeout=timeout)


def blob_exists(dest_host: str, dest_repo: str, digest: str, token: str) -> bool:
    url = f"https://{dest_host}/v2/{dest_repo}/blobs/{digest}"
    try:
        with http_req(url, method="HEAD", headers={"Authorization": f"Bearer {token}"}, timeout=60) as resp:
            return resp.status == 200
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return False
        raise


def upload_blob(dest_host: str, dest_repo: str, digest: str, payload: bytes, token: str) -> None:
    if blob_exists(dest_host, dest_repo, digest, token):
        print(f"  [cache-hit] Blob {digest[:19]}... ({len(payload)} bytes)")
        return
    last_err = None
    for attempt in range(1, 4):
        try:
            if attempt > 1 and blob_exists(dest_host, dest_repo, digest, token):
                print(f"  [cache-hit] Blob {digest[:19]}... ({len(payload)} bytes)")
                return
            init_url = f"https://{dest_host}/v2/{dest_repo}/blobs/uploads/"
            with http_req(
                init_url,
                method="POST",
                headers={"Authorization": f"Bearer {token}", "Content-Length": "0"},
                timeout=120,
            ) as resp:
                loc = resp.headers.get("Location")
            if not loc:
                raise RuntimeError(f"Missing Location header from {init_url}")
            if loc.startswith("/"):
                loc = f"https://{dest_host}{loc}"
            sep = "&" if "?" in loc else "?"
            put_url = f"{loc}{sep}digest={urllib.parse.quote(digest)}"
            with http_req(
                put_url,
                method="PUT",
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/octet-stream",
                    "Content-Length": str(len(payload)),
                },
                data=payload,
                timeout=900,
            ) as _:
                pass
            print(f"  [uploaded]  Blob {digest[:19]}... ({len(payload)} bytes)")
            return
        except Exception as e:
            last_err = e
            print(f"  [retry {attempt}/3] Blob upload {digest[:19]} failed: {e}")
            time.sleep(2 * attempt)
    raise RuntimeError(f"Failed to upload blob {digest} after 3 attempts: {last_err}")


def build_tar_gz_layer(
    file_mappings: list[tuple[str, str]],
    compresslevel: int = 6,
    fixed_mtime: int | None = None,
) -> tuple[bytes, str, str, int]:
    tar_buf = io.BytesIO()
    mtime = fixed_mtime if fixed_mtime is not None else int(time.time())
    added_dirs: set[str] = set()

    def ensure_parent_dirs(tf: tarfile.TarFile, arc_path: str):
        parts = arc_path.strip("/").split("/")[:-1]
        cur = ""
        for p in parts:
            cur = f"{cur}/{p}".lstrip("/")
            if cur not in added_dirs:
                added_dirs.add(cur)
                ti = tarfile.TarInfo(name=cur)
                ti.type = tarfile.DIRTYPE
                ti.mode = 0o755
                ti.uid = 0
                ti.gid = 0
                ti.uname = "root"
                ti.gname = "root"
                ti.mtime = mtime
                tf.addfile(ti)

    with tarfile.open(fileobj=tar_buf, mode="w", format=tarfile.PAX_FORMAT) as tf:
        for local_src, arc_dest in file_mappings:
            src_path = Path(local_src)
            if src_path.is_file():
                arc_clean = arc_dest.lstrip("/")
                ensure_parent_dirs(tf, arc_clean)
                raw = src_path.read_bytes()
                ti = tarfile.TarInfo(name=arc_clean)
                ti.size = len(raw)
                ti.mode = 0o755 if src_path.name.endswith((".py", ".sh", ".mjs", ".js")) else 0o644
                ti.uid = 0
                ti.gid = 0
                ti.uname = "root"
                ti.gname = "root"
                ti.mtime = mtime
                tf.addfile(ti, io.BytesIO(raw))
            elif src_path.is_dir():
                for root, dirs, files in os.walk(src_path):
                    is_dot_next_root = root.endswith("/.next") or root.endswith("\\.next")
                    dirs[:] = sorted([
                        d for d in dirs
                        if d not in (
                            ".git",
                            "__pycache__",
                            ".pytest_cache",
                            ".DS_Store",
                            "canvas",
                            "vitest",
                            "eslint",
                        )
                        and not (is_dot_next_root and d in ("dev", "cache", "diagnostics"))
                    ])
                    rel_dir = os.path.relpath(root, src_path)
                    for fname in sorted(files):
                        if fname in (".DS_Store", "dev.db", "dev.db-journal", "zyvoriq_registry.sqlite") or fname.endswith(".pyc") or fname.startswith(".env"):
                            continue
                        fpath = Path(root) / fname
                        if not fpath.is_file() or fpath.is_symlink():
                            continue
                        rel_file = fname if rel_dir == "." else f"{rel_dir}/{fname}"
                        arc_clean = f"{arc_dest.rstrip('/')}/{rel_file}".lstrip("/")
                        ensure_parent_dirs(tf, arc_clean)
                        raw = fpath.read_bytes()
                        ti = tarfile.TarInfo(name=arc_clean)
                        ti.size = len(raw)
                        ti.mode = 0o755 if fname.endswith((".py", ".sh", ".mjs", ".js")) or "/.bin/" in f"/{arc_clean}" else 0o644
                        ti.uid = 0
                        ti.gid = 0
                        ti.uname = "root"
                        ti.gname = "root"
                        ti.mtime = mtime
                        tf.addfile(ti, io.BytesIO(raw))

    uncompressed_bytes = tar_buf.getvalue()
    diff_id = "sha256:" + hashlib.sha256(uncompressed_bytes).hexdigest()

    gz_buf = io.BytesIO()
    with gzip.GzipFile(filename="", mode="wb", fileobj=gz_buf, compresslevel=compresslevel, mtime=mtime) as gz:
        gz.write(uncompressed_bytes)
    compressed_bytes = gz_buf.getvalue()
    layer_digest = "sha256:" + hashlib.sha256(compressed_bytes).hexdigest()
    return compressed_bytes, diff_id, layer_digest, len(compressed_bytes)


def resolve_base_image(base_host: str, base_repo: str, base_tag: str, token: str) -> tuple[dict, dict, str, dict]:
    auth_headers = {"Authorization": f"Bearer {token}"}
    base_url = f"https://{base_host}/v2/{base_repo}"
    manifest_headers = {
        **auth_headers,
        "Accept": (
            "application/vnd.oci.image.index.v1+json, "
            "application/vnd.docker.distribution.manifest.list.v2+json, "
            "application/vnd.oci.image.manifest.v1+json, "
            "application/vnd.docker.distribution.manifest.v2+json"
        ),
    }
    with http_req(f"{base_url}/manifests/{base_tag}", headers=manifest_headers) as resp:
        manifest_or_idx = json.loads(resp.read().decode())

    if "manifests" in manifest_or_idx:
        amd64_digest = next(
            (m["digest"] for m in manifest_or_idx["manifests"] if m.get("platform", {}).get("os") == "linux" and m.get("platform", {}).get("architecture") == "amd64"),
            None,
        )
        if not amd64_digest:
            raise RuntimeError(f"No linux/amd64 manifest in {base_repo}:{base_tag}")
        with http_req(f"{base_url}/manifests/{amd64_digest}", headers=manifest_headers) as resp:
            base_manifest = json.loads(resp.read().decode())
    else:
        base_manifest = manifest_or_idx

    cfg_digest = base_manifest["config"]["digest"]
    with http_req(f"{base_url}/blobs/{cfg_digest}", headers=auth_headers) as resp:
        base_config = json.loads(resp.read().decode())

    return base_manifest, base_config, base_url, auth_headers


def main() -> None:
    service_name = "zyvoriq"
    token = get_gcloud_token()
    dest_host = "us-west1-docker.pkg.dev"
    dest_repo = f"ramp-portal-dev/cloud-run-source-deploy/{service_name}"
    tag = f"v{datetime.now(timezone.utc).strftime('%Y%m%d-%H%M%S')}-option-a-lean-veo"

    print(f"🚀 Deploying [{service_name}] -> {dest_host}/{dest_repo}:{tag}")

    base_manifest, base_config, base_url, auth_headers = resolve_base_image(
        "us-central1-docker.pkg.dev",
        "bbar-138hf0/cloud-run-source-deploy/zyvoriq",
        "923ba04e-c96c-4886-bef4-a519407f5159",
        token,
    )

    print(f"==> [1/4] Syncing {len(base_manifest['layers'])} base layers...")
    for layer in base_manifest["layers"]:
        ldigest = layer["digest"]
        if blob_exists(dest_host, dest_repo, ldigest, token):
            continue
        with http_req(f"{base_url}/blobs/{ldigest}", headers=auth_headers) as resp:
            blob_bytes = resp.read()
        upload_blob(dest_host, dest_repo, ldigest, blob_bytes, token)

    file_mappings = [
        ("/Users/nitinagga/Documents/zyvoriq/.next/standalone/.next", "app/.next"),
        ("/Users/nitinagga/Documents/zyvoriq/.next/standalone/server.js", "app/server.js"),
        ("/Users/nitinagga/Documents/zyvoriq/.next/standalone/package.json", "app/package.json"),
        ("/Users/nitinagga/Documents/zyvoriq/.next/standalone/node_modules", "app/node_modules"),
        ("/Users/nitinagga/Documents/zyvoriq/.next/static", "app/.next/static"),
        ("/Users/nitinagga/Documents/zyvoriq/lib/server/unifiedFeedbackEngine.cjs", "app/lib/server/unifiedFeedbackEngine.cjs"),
        ("/Users/nitinagga/Documents/zyvoriq/scripts/gate5_self_verify_entrypoint.mjs", "app/scripts/gate5_self_verify_entrypoint.mjs"),
        ("/Users/nitinagga/Documents/zyvoriq/scripts/yt_pipeline.mjs", "app/scripts/yt_pipeline.mjs"),
        ("/Users/nitinagga/Documents/zyvoriq/scripts/characterAnchor.mjs", "app/scripts/characterAnchor.mjs"),
        ("/Users/nitinagga/Documents/zyvoriq/scripts/validateCharacterSheet.mjs", "app/scripts/validateCharacterSheet.mjs"),
        ("/Users/nitinagga/Documents/zyvoriq/scripts/transcription_word_timing_guard.mjs", "app/scripts/transcription_word_timing_guard.mjs"),
        ("/Users/nitinagga/Documents/zyvoriq/public/universal_feedback_widget.js", "app/public/universal_feedback_widget.js"),
        ("/Users/nitinagga/Documents/zyvoriq/public/assets/avatars", "app/public/assets/avatars"),
        ("/Users/nitinagga/Documents/zyvoriq/public/assets/characters", "app/public/assets/characters"),
        ("/Users/nitinagga/Documents/zyvoriq/public/assets/swarm/generated/job_1793105000_mission_impossible_10_multiverse_300s", "app/public/assets/swarm/generated/job_1793105000_mission_impossible_10_multiverse_300s"),
        ("/Users/nitinagga/Documents/zyvoriq/public/assets/swarm/generated/job_1790974000000_kailash_epic", "app/public/assets/swarm/generated/job_1790974000000_kailash_epic"),
        ("/Users/nitinagga/Documents/zyvoriq/public/assets/swarm/generated/job_1790807322189_opt2_native", "app/public/assets/swarm/generated/job_1790807322189_opt2_native"),
        ("/Users/nitinagga/Documents/zyvoriq/public/assets/swarm/generated/job_1790793528334", "app/public/assets/swarm/generated/job_1790793528334"),
        ("/Users/nitinagga/Documents/zyvoriq/public/assets/swarm/generated/job_1790663346051", "app/public/assets/swarm/generated/job_1790663346051"),
        ("/Users/nitinagga/Documents/zyvoriq/public/assets/swarm/generated/job_1790654474523", "app/public/assets/swarm/generated/job_1790654474523"),
        ("/Users/nitinagga/Documents/zyvoriq/public/assets/swarm/generated/job_1792800001_barcelona_bhangra_flamenco", "app/public/assets/swarm/generated/job_1792800001_barcelona_bhangra_flamenco"),
        ("/Users/nitinagga/Documents/zyvoriq/public/assets/swarm/generated/job_1792800002_neotokyo_quantum_observatory", "app/public/assets/swarm/generated/job_1792800002_neotokyo_quantum_observatory"),
        ("/Users/nitinagga/Documents/zyvoriq/public/assets/swarm/spain_pool_english_master_A.mp4", "app/public/assets/swarm/spain_pool_english_master_A.mp4"),
        ("/Users/nitinagga/Documents/zyvoriq/public/assets/swarm/comparisons/02_option1_clone_adk_orcas_omni_lyria3_60s.mp4", "app/public/assets/swarm/comparisons/02_option1_clone_adk_orcas_omni_lyria3_60s.mp4"),
        ("/Users/nitinagga/Documents/zyvoriq/public/assets/swarm/comparisons/04_option2_clone_adk_orcas_omni_native_60s.mp4", "app/public/assets/swarm/comparisons/04_option2_clone_adk_orcas_omni_native_60s.mp4"),
        ("/Users/nitinagga/Documents/zyvoriq/public/assets/swarm/comparisons/09_option2_omni11_dramatic_score_60s_master.mp4", "app/public/assets/swarm/comparisons/09_option2_omni11_dramatic_score_60s_master.mp4"),
        ("/Users/nitinagga/Documents/zyvoriq/public/assets/swarm/comparisons/10_option1_lyria3pro_symphonic_60s_master.mp4", "app/public/assets/swarm/comparisons/10_option1_lyria3pro_symphonic_60s_master.mp4"),
        ("/Users/nitinagga/Documents/zyvoriq/public/assets/swarm/comparisons/11_sacred_kailash_ganesh_shiva_parvati_option2_dialogue_score_60s.mp4", "app/public/assets/swarm/comparisons/11_sacred_kailash_ganesh_shiva_parvati_option2_dialogue_score_60s.mp4"),
        ("/Users/nitinagga/Documents/zyvoriq/public/assets/swarm/comparisons/12_sacred_kailash_ganesh_shiva_parvati_option1_lyria3_devotional_60s.mp4", "app/public/assets/swarm/comparisons/12_sacred_kailash_ganesh_shiva_parvati_option1_lyria3_devotional_60s.mp4"),
        ("/Users/nitinagga/Documents/zyvoriq/public/assets/swarm/library_manifest.json", "app/public/assets/swarm/library_manifest.json"),
        ("/Users/nitinagga/Documents/zyvoriq/data", "app/data"),
    ]

    print("==> [2/4] Building & uploading /app overlay layer...")
    layer_gz, diff_id, layer_digest, layer_size = build_tar_gz_layer(file_mappings)
    token = get_gcloud_token()
    upload_blob(dest_host, dest_repo, layer_digest, layer_gz, token)

    manifest_media_type = base_manifest.get("mediaType", "application/vnd.oci.image.manifest.v1+json")
    layer_media_type = base_manifest["layers"][0].get("mediaType", "application/vnd.oci.image.layer.v1.tar+gzip")
    cfg_media_type = base_manifest["config"].get("mediaType", "application/vnd.oci.image.config.v1+json")

    cfg_obj = base_config.setdefault("config", {})
    cfg_obj["WorkingDir"] = "/app"
    cfg_obj["Cmd"] = ["node", "scripts/gate5_self_verify_entrypoint.mjs"]
    cfg_obj["Entrypoint"] = []
    cfg_obj["User"] = "root"

    base_config["created"] = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    base_config.setdefault("rootfs", {"type": "layers", "diff_ids": []})["diff_ids"].append(diff_id)
    base_config.setdefault("history", []).append(
        {"created": base_config["created"], "created_by": "Zyvoriq Option A Lean Omni-First + Veo 3.1 Safety-Net OCI Overlay"}
    )

    new_cfg_bytes = json.dumps(base_config, separators=(",", ":")).encode("utf-8")
    new_cfg_digest = "sha256:" + hashlib.sha256(new_cfg_bytes).hexdigest()
    upload_blob(dest_host, dest_repo, new_cfg_digest, new_cfg_bytes, token)

    new_manifest = {
        "schemaVersion": 2,
        "mediaType": manifest_media_type,
        "config": {
            "mediaType": cfg_media_type,
            "digest": new_cfg_digest,
            "size": len(new_cfg_bytes),
        },
        "layers": list(base_manifest["layers"]) + [
            {
                "mediaType": layer_media_type,
                "digest": layer_digest,
                "size": layer_size,
            }
        ],
    }
    manifest_bytes = json.dumps(new_manifest, indent=2).encode("utf-8")
    for t in (tag, "latest"):
        m_url = f"https://{dest_host}/v2/{dest_repo}/manifests/{t}"
        with http_req(
            m_url,
            method="PUT",
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": manifest_media_type,
                "Content-Length": str(len(manifest_bytes)),
            },
            data=manifest_bytes,
        ) as resp:
            print(f"  [pushed]    {dest_host}/{dest_repo}:{t} (HTTP {resp.status})")

    image_uri = f"{dest_host}/{dest_repo}:{tag}"
    print(f"==> [3/4] Updating Cloud Run service {service_name} in ramp-portal-dev (us-west1)...")
    env = os.environ.copy()
    env["CLOUDSDK_METRICS_ENVIRONMENT"] = f"{env.get('CLOUDSDK_METRICS_ENVIRONMENT', '')} datacloud.antigravity".strip()
    env["CLOUDSDK_CONTAINER_USE_APPLICATION_DEFAULT_CREDENTIALS"] = "false"
    env["CLOUDSDK_BILLING_QUOTA_PROJECT"] = "ramp-portal-dev"

    subprocess.run(
        [
            "gcloud",
            "run",
            "services",
            "update",
            service_name,
            "--project=ramp-portal-dev",
            "--billing-project=ramp-portal-dev",
            "--region=us-west1",
            f"--image={image_uri}",
            "--quiet",
        ],
        check=True,
        env=env,
    )

    print(f"==> [4/4] Verifying 5 Post-Deploy Readiness & In-Container HTTP E2E Gates for {service_name}...")
    desc_out = subprocess.check_output(
        [
            "gcloud",
            "run",
            "services",
            "describe",
            service_name,
            "--project=ramp-portal-dev",
            "--billing-project=ramp-portal-dev",
            "--region=us-west1",
            "--format=json",
        ],
        text=True,
        env=env,
    )
    svc_json = json.loads(desc_out)
    status = svc_json.get("status", {})
    ingress_mode = svc_json.get("metadata", {}).get("annotations", {}).get("run.googleapis.com/ingress", "")
    ready_rev = status.get("latestReadyRevisionName", "")
    created_rev = status.get("latestCreatedRevisionName", "")
    conds = status.get("conditions", [])
    ready_status = next((c.get("status") for c in conds if c.get("type") == "Ready"), "False")
    traffic_pct = status.get("traffic", [{}])[0].get("percent", 0)
    direct_url = status.get("url", "")
    beyondcorp_url = f"https://{service_name}-248990048888.cr.gclb.goog"

    if ready_rev != created_rev or ready_status != "True" or traffic_pct != 100:
        raise RuntimeError(
            f"Gate check failed for {service_name}: ready={ready_rev}, created={created_rev}, status={ready_status}, traffic={traffic_pct}"
        )

    if ingress_mode != "internal-and-cloud-load-balancing":
        raise RuntimeError(
            f"BeyondCorp ingress policy violation on {service_name}: expected 'internal-and-cloud-load-balancing', got '{ingress_mode}'"
        )

    class _NoRedirect(urllib.request.HTTPRedirectHandler):
        def redirect_request(self, req, fp, code, msg, headers, newurl):
            return None

    no_redirect_opener = urllib.request.build_opener(_NoRedirect)
    beyondcorp_edge_status = 0
    beyondcorp_uberproxy_verified = False
    try:
        with no_redirect_opener.open(f"{beyondcorp_url}/swarm-MUI", timeout=15) as r:
            beyondcorp_edge_status = r.status
            # Unauthenticated CLI probe MUST redirect to corporate SSO, never return 200
            beyondcorp_uberproxy_verified = False
    except urllib.error.HTTPError as e:
        beyondcorp_edge_status = e.code
        loc = (e.headers.get("Location") or "").lower()
        if e.code in (301, 302, 307, 308) and ("login.corp.google.com" in loc or "uberproxy" in loc):
            beyondcorp_uberproxy_verified = True

    direct_run_app_status = 0
    if direct_url:
        try:
            with no_redirect_opener.open(f"{direct_url}/api/health", timeout=10) as r:
                direct_run_app_status = r.status
        except urllib.error.HTTPError as e:
            direct_run_app_status = e.code
        except (urllib.error.URLError, TimeoutError, OSError) as e:
            raise RuntimeError(f"Direct Cloud Run URL probe failed unexpectedly on {direct_url}/api/health: {e}") from e

        if direct_run_app_status != 404:
            raise RuntimeError(
                f"Direct Cloud Run bypass was NOT blocked on {direct_url}/api/health (expected HTTP 404 from Google Front End, got HTTP {direct_run_app_status})"
            )

    if not beyondcorp_uberproxy_verified:
        raise RuntimeError(
            f"BeyondCorp GCLB edge verification failed on {beyondcorp_url}/swarm-MUI (expected 302 UberProxy SSO redirect, got HTTP {beyondcorp_edge_status})"
        )

    startup_probe_log = ""
    boot_selftest_receipt = None
    for _ in range(12):
        try:
            log_out = subprocess.check_output(
                [
                    "gcloud",
                    "logging",
                    "read",
                    f'resource.type="cloud_run_revision" AND resource.labels.revision_name="{ready_rev}" AND (textPayload:"STARTUP" OR textPayload:"CLOUDRUN_BOOT_SELFTEST_")',
                    "--project=ramp-portal-dev",
                    "--billing-project=ramp-portal-dev",
                    "--limit=20",
                    "--format=value(textPayload)",
                ],
                text=True,
                env=env,
                timeout=30,
            ).strip()
            if log_out:
                for line in log_out.splitlines():
                    clean_line = line.strip()
                    if "STARTUP" in clean_line and not startup_probe_log:
                        startup_probe_log = clean_line
                    if "[CLOUDRUN_BOOT_SELFTEST_FAIL]" in clean_line:
                        raise RuntimeError(f"In-container Cloud Run boot self-test FAILED on {ready_rev}: {clean_line}")
                    if "[CLOUDRUN_BOOT_SELFTEST_PASS]" in clean_line and boot_selftest_receipt is None:
                        json_part = clean_line.split("[CLOUDRUN_BOOT_SELFTEST_PASS]", 1)[1].strip()
                        boot_selftest_receipt = json.loads(json_part)
            if startup_probe_log and boot_selftest_receipt is not None:
                break
        except RuntimeError:
            raise
        except Exception:
            pass
        time.sleep(3)

    if not startup_probe_log:
        startup_probe_log = f"Ready=True verified via Cloud Run control plane for {ready_rev}"
    if boot_selftest_receipt is None:
        raise RuntimeError(
            f"Gate 5 failed: [CLOUDRUN_BOOT_SELFTEST_PASS] log receipt not observed in Cloud Logging for {ready_rev}"
        )

    receipt_path = Path("/Users/nitinagga/Documents/zyvoriq/data/cloudrun_deploy_receipt.json")
    receipt = {
        "serviceName": service_name,
        "beyondCorpUrl": beyondcorp_url,
        "directCloudRunUrl": direct_url,
        "ingressPolicy": ingress_mode,
        "beyondCorpEdge": {
            "httpStatus": beyondcorp_edge_status,
            "uberProxyVerified": beyondcorp_uberproxy_verified,
            "directRunAppBypassBlockedHttpStatus": direct_run_app_status,
        },
        "buildProject": "nitina-ggarwal-sandbox-647724",
        "runProject": "ramp-portal-dev",
        "region": "us-west1",
        "latestReadyRevisionName": ready_rev,
        "latestCreatedRevisionName": created_rev,
        "readyStatus": ready_status,
        "trafficPercent": traffic_pct,
        "image": image_uri,
        "startupProbeLog": startup_probe_log,
        "bootSelfTestReceipt": boot_selftest_receipt,
        "defaultCanonicalReelId": "ZYV-REEL-MI10-300S",
        "verifiedAt": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
    }
    receipt_path.parent.mkdir(parents=True, exist_ok=True)
    receipt_path.write_text(json.dumps(receipt, indent=2) + "\n", encoding="utf-8")
    print(f"✅ {service_name} verified on revision {ready_rev} (Ready={ready_status}, Traffic={traffic_pct}%)")
    print(f"✅ BeyondCorp GCLB Edge: HTTP {beyondcorp_edge_status} (UberProxy verified={beyondcorp_uberproxy_verified}, direct run.app bypass HTTP {direct_run_app_status})")
    print(f"✅ Startup probe: {startup_probe_log}")
    print(f"✅ In-container HTTP E2E boot self-test: {json.dumps(boot_selftest_receipt.get('checks', {}))}")


if __name__ == "__main__":
    main()
