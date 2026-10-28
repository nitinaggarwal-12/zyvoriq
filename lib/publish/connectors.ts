/**
 * Zyvoriq omnichannel publishing connectors.
 *
 * Each connector either performs a real HTTP call to the platform and returns
 * the remote id the platform handed back, or reports honestly that it is not
 * connected / not implemented. Nothing here fabricates ids, URLs or statuses.
 *
 * Connector status today:
 *   - linkedin: real call to `POST /v2/ugcPosts` (needs LINKEDIN_OAUTH_TOKEN + LINKEDIN_AUTHOR_URN).
 *   - x:        real call to `POST /2/tweets` (needs a user-context X_API_BEARER_TOKEN).
 *   - youtube:  NOT implemented — a video upload requires the resumable media
 *               upload protocol, which this module does not perform.
 *   - substack: NOT implemented — Substack exposes no public publishing API.
 */

import { generateProvenanceManifest, type ProvenanceManifest } from "./c2pa";

export type PublishChannel = "linkedin" | "youtube" | "x" | "substack";

export interface PublishRequest {
  campaignId: string;
  title: string;
  narrationScript: string;
  videoS3Url?: string;
  audioS3Url?: string;
  diagramSvgXml?: string;
  /** Caller-supplied quality score; recorded in the manifest as unverified. */
  vqsScore?: number | null;
  /** Evaluator identifiers that actually ran (caller-supplied). */
  evaluators?: string[];
  channels: PublishChannel[];
  groundingClaims?: Array<{ id: string; claim: string; source: string }>;
}

export type ChannelPublishStatus = "PUBLISHED" | "FAILED" | "NOT_CONNECTED";

export interface ChannelPublishResult {
  channel: PublishChannel;
  status: ChannelPublishStatus;
  /** Remote id returned by the platform; null unless status is PUBLISHED. */
  externalPostId: string | null;
  /** Platform URL for the remote id; null unless status is PUBLISHED. */
  externalUrl: string | null;
  /** Instance id of the provenance manifest attached to this dispatch. */
  provenanceManifestId: string;
  /** base64url Ed25519 signature of the provenance manifest. */
  provenanceSignature: string;
  /** Set only when a real platform call completed (success or failure). */
  attemptedAt: string | null;
  upstreamStatus: number | null;
  connectorImplemented: boolean;
  requiredEnv: string[];
  message: string;
}

export interface DispatchOutcome {
  batchId: string;
  manifest: ProvenanceManifest;
  results: ChannelPublishResult[];
  /** True only when every requested channel returned a real remote id. */
  allSuccess: boolean;
  /** True when no requested channel had a configured, implemented connector. */
  noneConnected: boolean;
}

function envPresent(name: string): boolean {
  const v = process.env[name];
  return typeof v === "string" && v.trim().length > 0;
}

function notConnected(
  channel: PublishChannel,
  manifest: ProvenanceManifest,
  requiredEnv: string[],
  connectorImplemented: boolean,
  message: string
): ChannelPublishResult {
  return {
    channel,
    status: "NOT_CONNECTED",
    externalPostId: null,
    externalUrl: null,
    provenanceManifestId: manifest.instanceId,
    provenanceSignature: manifest.signature,
    attemptedAt: null,
    upstreamStatus: null,
    connectorImplemented,
    requiredEnv,
    message,
  };
}

async function readUpstreamError(res: Response): Promise<string> {
  const text = await res.text().catch(() => "");
  return text ? text.slice(0, 300) : `HTTP ${res.status}`;
}

export class OmnichannelPublisher {
  /**
   * 1. LinkedIn UGC Posts API (text/article share).
   */
  public async publishToLinkedIn(req: PublishRequest, manifest: ProvenanceManifest): Promise<ChannelPublishResult> {
    const requiredEnv = ["LINKEDIN_OAUTH_TOKEN", "LINKEDIN_AUTHOR_URN"];
    const token = process.env.LINKEDIN_OAUTH_TOKEN?.trim();
    const authorUrn = process.env.LINKEDIN_AUTHOR_URN?.trim();
    if (!token || !authorUrn) {
      return notConnected(
        "linkedin",
        manifest,
        requiredEnv,
        true,
        "No LinkedIn connector is configured on this deployment (missing LINKEDIN_OAUTH_TOKEN and/or LINKEDIN_AUTHOR_URN)."
      );
    }

    const attemptedAt = new Date().toISOString();
    try {
      const payload = {
        author: authorUrn,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: { text: `${req.title}\n\n${req.narrationScript}` },
            shareMediaCategory: req.videoS3Url ? "ARTICLE" : "NONE",
            ...(req.videoS3Url
              ? {
                  media: [
                    {
                      status: "READY",
                      originalUrl: req.videoS3Url,
                      title: { text: req.title },
                    },
                  ],
                }
              : {}),
          },
        },
        visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
      };

      const res = await fetch("https://api.linkedin.com/v2/ugcPosts", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "X-Restli-Protocol-Version": "2.0.0",
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(20_000),
      });

      if (!res.ok) {
        return {
          channel: "linkedin",
          status: "FAILED",
          externalPostId: null,
          externalUrl: null,
          provenanceManifestId: manifest.instanceId,
          provenanceSignature: manifest.signature,
          attemptedAt,
          upstreamStatus: res.status,
          connectorImplemented: true,
          requiredEnv,
          message: `LinkedIn API returned HTTP ${res.status}: ${await readUpstreamError(res)}`,
        };
      }

      const data = await res.json().catch(() => ({} as Record<string, unknown>));
      const remoteId = typeof data?.id === "string" && data.id ? data.id : res.headers.get("x-restli-id");
      if (!remoteId) {
        return {
          channel: "linkedin",
          status: "FAILED",
          externalPostId: null,
          externalUrl: null,
          provenanceManifestId: manifest.instanceId,
          provenanceSignature: manifest.signature,
          attemptedAt,
          upstreamStatus: res.status,
          connectorImplemented: true,
          requiredEnv,
          message: "LinkedIn API responded without a post id; not treating as published.",
        };
      }

      return {
        channel: "linkedin",
        status: "PUBLISHED",
        externalPostId: remoteId,
        externalUrl: `https://www.linkedin.com/feed/update/${encodeURIComponent(remoteId)}`,
        provenanceManifestId: manifest.instanceId,
        provenanceSignature: manifest.signature,
        attemptedAt,
        upstreamStatus: res.status,
        connectorImplemented: true,
        requiredEnv,
        message: `Published to LinkedIn (${remoteId}).`,
      };
    } catch (err) {
      return {
        channel: "linkedin",
        status: "FAILED",
        externalPostId: null,
        externalUrl: null,
        provenanceManifestId: manifest.instanceId,
        provenanceSignature: manifest.signature,
        attemptedAt,
        upstreamStatus: null,
        connectorImplemented: true,
        requiredEnv,
        message: `LinkedIn request failed: ${err instanceof Error ? err.message : String(err)}`,
      };
    }
  }

  /**
   * 2. YouTube Data API v3 — not implemented.
   * `videos.insert` requires the media body via the resumable/multipart upload
   * protocol; posting JSON metadata alone cannot publish a video.
   */
  public async publishToYouTube(_req: PublishRequest, manifest: ProvenanceManifest): Promise<ChannelPublishResult> {
    return notConnected(
      "youtube",
      manifest,
      ["YOUTUBE_OAUTH_TOKEN"],
      false,
      "No YouTube connector is implemented on this deployment (video upload requires the resumable media upload protocol)."
    );
  }

  /**
   * 3. X API v2 — `POST /2/tweets`. Requires a user-context access token.
   */
  public async publishToX(req: PublishRequest, manifest: ProvenanceManifest): Promise<ChannelPublishResult> {
    const requiredEnv = ["X_API_BEARER_TOKEN"];
    const token = process.env.X_API_BEARER_TOKEN?.trim();
    if (!token) {
      return notConnected(
        "x",
        manifest,
        requiredEnv,
        true,
        "No X connector is configured on this deployment (missing X_API_BEARER_TOKEN)."
      );
    }

    const attemptedAt = new Date().toISOString();
    try {
      const text = `${req.title}\n\n${req.narrationScript}`.slice(0, 280);
      const res = await fetch("https://api.twitter.com/2/tweets", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
        signal: AbortSignal.timeout(20_000),
      });

      if (!res.ok) {
        return {
          channel: "x",
          status: "FAILED",
          externalPostId: null,
          externalUrl: null,
          provenanceManifestId: manifest.instanceId,
          provenanceSignature: manifest.signature,
          attemptedAt,
          upstreamStatus: res.status,
          connectorImplemented: true,
          requiredEnv,
          message: `X API returned HTTP ${res.status}: ${await readUpstreamError(res)}`,
        };
      }

      const data = await res.json().catch(() => ({} as Record<string, any>));
      const remoteId = typeof data?.data?.id === "string" && data.data.id ? (data.data.id as string) : null;
      if (!remoteId) {
        return {
          channel: "x",
          status: "FAILED",
          externalPostId: null,
          externalUrl: null,
          provenanceManifestId: manifest.instanceId,
          provenanceSignature: manifest.signature,
          attemptedAt,
          upstreamStatus: res.status,
          connectorImplemented: true,
          requiredEnv,
          message: "X API responded without a tweet id; not treating as published.",
        };
      }

      return {
        channel: "x",
        status: "PUBLISHED",
        externalPostId: remoteId,
        externalUrl: `https://x.com/i/web/status/${encodeURIComponent(remoteId)}`,
        provenanceManifestId: manifest.instanceId,
        provenanceSignature: manifest.signature,
        attemptedAt,
        upstreamStatus: res.status,
        connectorImplemented: true,
        requiredEnv,
        message: `Published to X (${remoteId}).`,
      };
    } catch (err) {
      return {
        channel: "x",
        status: "FAILED",
        externalPostId: null,
        externalUrl: null,
        provenanceManifestId: manifest.instanceId,
        provenanceSignature: manifest.signature,
        attemptedAt,
        upstreamStatus: null,
        connectorImplemented: true,
        requiredEnv,
        message: `X request failed: ${err instanceof Error ? err.message : String(err)}`,
      };
    }
  }

  /**
   * 4. Substack — not implemented (no public publishing API).
   */
  public async publishToSubstack(_req: PublishRequest, manifest: ProvenanceManifest): Promise<ChannelPublishResult> {
    return notConnected(
      "substack",
      manifest,
      [],
      false,
      "No Substack connector is implemented on this deployment (Substack exposes no public publishing API)."
    );
  }

  /**
   * Batch dispatcher across all requested channels.
   */
  public async dispatchCampaign(req: PublishRequest): Promise<DispatchOutcome> {
    const batchId = `batch_${Date.now()}`;
    const manifest = generateProvenanceManifest({
      assetId: req.campaignId,
      title: req.title,
      modality: "video",
      vqsScore: req.vqsScore ?? null,
      evaluators: req.evaluators ?? [],
      groundingClaims: req.groundingClaims ?? [],
      softwareAgent: "zyvoriq/lib/publish/connectors",
    });

    const results: ChannelPublishResult[] = [];
    for (const channel of req.channels) {
      if (channel === "linkedin") {
        results.push(await this.publishToLinkedIn(req, manifest));
      } else if (channel === "youtube") {
        results.push(await this.publishToYouTube(req, manifest));
      } else if (channel === "x") {
        results.push(await this.publishToX(req, manifest));
      } else if (channel === "substack") {
        results.push(await this.publishToSubstack(req, manifest));
      }
    }

    return {
      batchId,
      manifest,
      results,
      allSuccess: results.length > 0 && results.every((r) => r.status === "PUBLISHED" && Boolean(r.externalPostId)),
      noneConnected: results.length === 0 || results.every((r) => r.status === "NOT_CONNECTED"),
    };
  }

  /** Which channels currently have a configured, implemented connector. */
  public connectorStatus(): Record<PublishChannel, { implemented: boolean; configured: boolean; requiredEnv: string[] }> {
    return {
      linkedin: {
        implemented: true,
        configured: envPresent("LINKEDIN_OAUTH_TOKEN") && envPresent("LINKEDIN_AUTHOR_URN"),
        requiredEnv: ["LINKEDIN_OAUTH_TOKEN", "LINKEDIN_AUTHOR_URN"],
      },
      x: { implemented: true, configured: envPresent("X_API_BEARER_TOKEN"), requiredEnv: ["X_API_BEARER_TOKEN"] },
      youtube: { implemented: false, configured: false, requiredEnv: ["YOUTUBE_OAUTH_TOKEN"] },
      substack: { implemented: false, configured: false, requiredEnv: [] },
    };
  }
}

export const publisher = new OmnichannelPublisher();
