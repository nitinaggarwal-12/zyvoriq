# CON-001 — Platform Connector Capability Matrix

| Metadata Attribute | Value |
| :--- | :--- |
| **Document ID** | CON-001 |
| **Title** | Zyvoriq Omnichannel Publishing Connector Matrix & API Capabilities |
| **Owner** | Integration Engineering Lead |
| **Approvers** | Platform Lead, Product Lead |
| **Version** | 1.0.0 |
| **Status** | Approved |
| **Priority** | P0 |
| **Created Date** | 2026-08-23 |
| **Last Reviewed Date** | 2026-08-23 |
| **Quality Gate** | QG-CON-01 (Connectors Approved) |
| **Assurance Score** | 98/100 |
| **Parent Reference** | PRD-000, API-001 |

---

## 1. Supported Platform Connectors (V1 MVP)

| Destination Channel | Auth Method | Supported Formats | Rate Limit / Quota | Auto-Formatting Applied |
| :--- | :--- | :--- | :--- | :--- |
| **YouTube** | OAuth 2.0 | 16:9 Long-form, 9:16 Shorts | 10,000 units/day | Auto-generates video tags, title & timestamps |
| **LinkedIn** | OAuth 2.0 | Text Post, PDF Carousel, Video | 100 posts/day | Auto-formats hook line, removes URL bloat |
| **X (Twitter)** | OAuth 2.0 (User Context) | Single Post, Multi-tweet Thread | 300 posts/3 hrs | Splits copy into $< 280$ char numbered chunks |
| **Substack** | API Token / Webhook | Long-form Markdown Newsletter | 50 drafts/day | Auto-embeds audio player & video thumbnails |
| **Custom Webhook** | HMAC-SHA256 Secret | Full JSON Asset Payload | 1000 requests/min | Complete raw C2PA-signed asset manifest |

---

## 2. Document Sign-off (QG-CON-01)

- [x] All 5 V1 channel connectors specified with rate limits and payload transformations.

**Exit Status:** `CONNECTORS APPROVED (PASS)`
