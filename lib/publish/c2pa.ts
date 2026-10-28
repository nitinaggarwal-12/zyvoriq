/**
 * Zyvoriq provenance manifest signer.
 *
 * This produces a small, self-describing JSON manifest that is signed with a
 * real Ed25519 key via node:crypto. It is C2PA-*inspired* (actions + custom
 * assertions + detached signature) but it is NOT a conformant C2PA / JUMBF
 * manifest and must not be presented as one.
 *
 * Key material:
 *   - If `C2PA_SIGNING_KEY_PEM` (PKCS#8 PEM, Ed25519) is set it is used and the
 *     manifest is marked `trusted: true, keySource: "env"`.
 *   - Otherwise an ephemeral key pair is generated at module load. Signatures
 *     made with it verify against the embedded public key but prove nothing
 *     across restarts/instances, so the manifest is marked
 *     `trusted: false, keySource: "ephemeral"`.
 */

import crypto, { type KeyObject } from "node:crypto";

export const PROVENANCE_FORMAT =
  "zyvoriq-provenance-manifest/0.1 (C2PA-inspired; not a conformant C2PA/JUMBF manifest)";

export type ProvenanceKeySource = "env" | "ephemeral";

export interface ProvenanceAssertion {
  label: string;
  data: Record<string, unknown>;
}

export interface ProvenanceManifest {
  format: typeof PROVENANCE_FORMAT;
  instanceId: string;
  assetId: string;
  title: string;
  mediaType: string;
  claimGenerator: { name: string; version: string };
  createdAt: string;
  assertions: ProvenanceAssertion[];
  /** Canonicalization applied to the signed payload (see `canonicalJson`). */
  signedPayloadCanonicalization: "sorted-keys-json";
  signatureAlgorithm: "Ed25519";
  signatureEncoding: "base64url";
  /** base64url(Ed25519(canonicalJson(payload))) */
  signature: string;
  publicKeyPem: string;
  /** sha256 hex of the DER-encoded SubjectPublicKeyInfo */
  publicKeyId: string;
  keySource: ProvenanceKeySource;
  trusted: boolean;
}

/** Fields covered by the signature (everything except the signature block). */
type ProvenanceSignedPayload = Pick<
  ProvenanceManifest,
  "format" | "instanceId" | "assetId" | "title" | "mediaType" | "claimGenerator" | "createdAt" | "assertions"
>;

export interface ProvenanceSigningKeyInfo {
  algorithm: "Ed25519";
  publicKeyId: string;
  publicKeyPem: string;
  keySource: ProvenanceKeySource;
  trusted: boolean;
  /** Set when `C2PA_SIGNING_KEY_PEM` was present but could not be used. */
  keyLoadError: string | null;
}

interface SigningKey extends ProvenanceSigningKeyInfo {
  privateKey: KeyObject;
  publicKey: KeyObject;
}

/**
 * Deterministic JSON serialisation: object keys sorted recursively, arrays in
 * order, no whitespace. (JCS-style; not a claim of RFC 8785 conformance.)
 */
export function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((v) => canonicalJson(v)).join(",")}]`;
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj)
    .filter((k) => obj[k] !== undefined)
    .sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${canonicalJson(obj[k])}`).join(",")}}`;
}

function publicKeyIdFor(publicKey: KeyObject): string {
  const spkiDer = publicKey.export({ type: "spki", format: "der" }) as Buffer;
  return crypto.createHash("sha256").update(spkiDer).digest("hex");
}

function publicKeyPemFor(publicKey: KeyObject): string {
  return publicKey.export({ type: "spki", format: "pem" }).toString();
}

function loadSigningKey(): SigningKey {
  const rawPem = process.env.C2PA_SIGNING_KEY_PEM;
  let keyLoadError: string | null = null;

  if (rawPem && rawPem.trim()) {
    try {
      // Allow single-line env values with literal "\n" sequences.
      const pem = rawPem.includes("\\n") && !rawPem.includes("\n") ? rawPem.replace(/\\n/g, "\n") : rawPem;
      const privateKey = crypto.createPrivateKey({ key: pem, format: "pem" });
      if (privateKey.asymmetricKeyType !== "ed25519") {
        throw new Error(`expected an Ed25519 PKCS#8 key, got ${privateKey.asymmetricKeyType ?? "unknown"}`);
      }
      const publicKey = crypto.createPublicKey(privateKey);
      return {
        algorithm: "Ed25519",
        privateKey,
        publicKey,
        publicKeyId: publicKeyIdFor(publicKey),
        publicKeyPem: publicKeyPemFor(publicKey),
        keySource: "env",
        trusted: true,
        keyLoadError: null,
      };
    } catch (err) {
      keyLoadError = err instanceof Error ? err.message : String(err);
      console.warn(`[provenance] C2PA_SIGNING_KEY_PEM rejected (${keyLoadError}); using an ephemeral key.`);
    }
  }

  const { privateKey, publicKey } = crypto.generateKeyPairSync("ed25519");
  return {
    algorithm: "Ed25519",
    privateKey,
    publicKey,
    publicKeyId: publicKeyIdFor(publicKey),
    publicKeyPem: publicKeyPemFor(publicKey),
    keySource: "ephemeral",
    trusted: false,
    keyLoadError,
  };
}

const signingKey: SigningKey = loadSigningKey();

/** Public description of the active signing key (never exposes the private key). */
export function getProvenanceSigningKeyInfo(): ProvenanceSigningKeyInfo {
  return {
    algorithm: signingKey.algorithm,
    publicKeyId: signingKey.publicKeyId,
    publicKeyPem: signingKey.publicKeyPem,
    keySource: signingKey.keySource,
    trusted: signingKey.trusted,
    keyLoadError: signingKey.keyLoadError,
  };
}

function mediaTypeFor(modality: "video" | "audio" | "code" | "text"): string {
  switch (modality) {
    case "video":
      return "video/mp4";
    case "audio":
      return "audio/wav";
    case "code":
      return "text/plain";
    case "text":
    default:
      return "text/plain";
  }
}

export function generateProvenanceManifest(params: {
  assetId: string;
  title: string;
  modality: "video" | "audio" | "code" | "text";
  /** Caller-supplied quality score; recorded as such, never verified here. */
  vqsScore?: number | null;
  /** Identifiers of evaluators that actually ran (caller-supplied). */
  evaluators?: string[];
  groundingClaims?: Array<{ id: string; claim: string; source: string }>;
  softwareAgent?: string;
}): ProvenanceManifest {
  const createdAt = new Date().toISOString();
  const assertions: ProvenanceAssertion[] = [
    {
      label: "c2pa.actions",
      data: {
        actions: [
          {
            action: "c2pa.created",
            softwareAgent: params.softwareAgent ?? "zyvoriq",
            when: createdAt,
          },
        ],
      },
    },
  ];

  const hasScore = typeof params.vqsScore === "number" && Number.isFinite(params.vqsScore);
  const claims = params.groundingClaims ?? [];
  if (hasScore || (params.evaluators && params.evaluators.length > 0) || claims.length > 0) {
    assertions.push({
      label: "zyvoriq.quality",
      data: {
        source: "caller-supplied",
        verifiedBySigner: false,
        compositeScore: hasScore ? params.vqsScore : null,
        evaluators: params.evaluators ?? [],
        groundingClaims: claims,
      },
    });
  }

  const payload: ProvenanceSignedPayload = {
    format: PROVENANCE_FORMAT,
    instanceId: `urn:uuid:${crypto.randomUUID()}`,
    assetId: params.assetId,
    title: params.title,
    mediaType: mediaTypeFor(params.modality),
    claimGenerator: { name: "zyvoriq/lib/publish/c2pa", version: "0.1" },
    createdAt,
    assertions,
  };

  const signature = crypto
    .sign(null, Buffer.from(canonicalJson(payload), "utf8"), signingKey.privateKey)
    .toString("base64url");

  return {
    ...payload,
    signedPayloadCanonicalization: "sorted-keys-json",
    signatureAlgorithm: "Ed25519",
    signatureEncoding: "base64url",
    signature,
    publicKeyPem: signingKey.publicKeyPem,
    publicKeyId: signingKey.publicKeyId,
    keySource: signingKey.keySource,
    trusted: signingKey.trusted,
  };
}

export interface ProvenanceVerification {
  valid: boolean;
  /** True only when the signature verifies AND the embedded key id matches the embedded PEM. */
  publicKeyIdMatches: boolean;
  publicKeyId: string | null;
  keySource: ProvenanceKeySource | null;
  trusted: boolean;
  reason: string | null;
}

/**
 * Verifies a manifest against the public key embedded in it. A `valid` result
 * proves integrity (the payload was signed by the holder of that key); it does
 * not by itself establish trust in the key — check `trusted` / `keySource`.
 */
export function verifyProvenanceManifest(manifest: ProvenanceManifest): ProvenanceVerification {
  try {
    if (!manifest || manifest.format !== PROVENANCE_FORMAT) {
      return fail("unsupported manifest format", manifest);
    }
    if (manifest.signatureAlgorithm !== "Ed25519" || manifest.signatureEncoding !== "base64url") {
      return fail("unsupported signature algorithm/encoding", manifest);
    }
    if (manifest.signedPayloadCanonicalization !== "sorted-keys-json") {
      return fail("unsupported payload canonicalization", manifest);
    }

    const publicKey = crypto.createPublicKey({ key: manifest.publicKeyPem, format: "pem" });
    if (publicKey.asymmetricKeyType !== "ed25519") {
      return fail("embedded public key is not Ed25519", manifest);
    }
    const publicKeyIdMatches = publicKeyIdFor(publicKey) === manifest.publicKeyId;

    const payload: ProvenanceSignedPayload = {
      format: manifest.format,
      instanceId: manifest.instanceId,
      assetId: manifest.assetId,
      title: manifest.title,
      mediaType: manifest.mediaType,
      claimGenerator: manifest.claimGenerator,
      createdAt: manifest.createdAt,
      assertions: manifest.assertions,
    };

    const signatureOk = crypto.verify(
      null,
      Buffer.from(canonicalJson(payload), "utf8"),
      publicKey,
      Buffer.from(manifest.signature, "base64url")
    );

    const valid = signatureOk && publicKeyIdMatches;
    return {
      valid,
      publicKeyIdMatches,
      publicKeyId: manifest.publicKeyId ?? null,
      keySource: manifest.keySource ?? null,
      trusted: Boolean(valid && manifest.trusted && manifest.keySource === "env"),
      reason: valid ? null : signatureOk ? "publicKeyId does not match embedded public key" : "signature does not verify",
    };
  } catch (err) {
    return fail(err instanceof Error ? err.message : String(err), manifest);
  }
}

function fail(reason: string, manifest: ProvenanceManifest | null | undefined): ProvenanceVerification {
  return {
    valid: false,
    publicKeyIdMatches: false,
    publicKeyId: manifest?.publicKeyId ?? null,
    keySource: manifest?.keySource ?? null,
    trusted: false,
    reason,
  };
}
