# MET-001 — North-Star Metrics & Product Quality Economics

| Attribute | Value |
| :--- | :--- |
| Document ID | MET-001 |
| Owner | Product Analytics / Quality |
| Version | 2.0.0 |
| Status | Active |
| Priority | P0 |
| Parents | STR-001, BUS-001, PRD-000 |

## 1. Primary north star — PFRR

**Publishable First-Render Rate (PFRR)**

> Percentage of completed productions that the intended user/reviewer would publish without substantive manual correction.

A typography nudge or optional preference tweak does not necessarily fail PFRR; fixing wrong identity, broken continuity, incorrect claims, unusable audio, pacing/story problems, missing assets or substantial regeneration does.

### Target ladder

- R1 learning target: **>80%** on the defined benchmark cohort.
- Category-leading target: **>90%**.
- Stretch target: **>95%**.

These are targets, not current claims. Every reported PFRR value must include cohort, sample size and acceptance protocol.

## 2. Strategic companion metrics

### Cost per Publishable Minute (CPM-P)
Total attributable generation, retry, QA and rendering cost divided by minutes of accepted/publishable output.

### Human Creative Effort Saved
Difference between baseline human work minutes and human work minutes required with Zyvoriq for equivalent accepted output.

### Time to First Publishable Output
Elapsed time from accepted brief/job creation to the first production meeting publishability criteria.

## 3. Quality diagnostics

Track separately rather than hiding blockers inside a composite score:

- technical render success;
- correct requested duration/timeline;
- missing/undecodable asset rate;
- identity continuity;
- visual/environment/object/action continuity;
- A/V synchronization;
- caption synchronization/readability;
- audio quality/loudness continuity;
- semantic visual ↔ narration alignment;
- story/hook/payoff quality;
- platform compliance;
- targeted repair success;
- regeneration/waste rate.

## 4. Initial R1 target gates

These are benchmark goals to validate, not statements of current production performance:

| Metric | Initial target |
| :--- | :---: |
| Technical render success | >99% |
| Correct target duration | >99% |
| Missing required asset rate | <0.5% |
| Caption sync score | >97 |
| A/V sync score | >95 |
| Identity continuity score | >95 |
| Visual continuity score | >90 |
| Semantic alignment score | >92 |
| Audio quality score | >95 |
| Platform compliance | 100% blocking-rule pass |
| PFRR | >80% initially |

Scores require a documented evaluator and calibration procedure in QAT-001 before they are treated as meaningful.

## 5. Behavioral/product metrics

- project → final master conversion;
- final master → actual publish conversion;
- abandonment after generation;
- manual edit minutes;
- assets/fields users lock most often;
- repeated regeneration by failure taxonomy;
- weekly creators/teams publishing;
- creator/team retention.

**Not publishing** is an important negative signal even when automated QA passes.

## 6. Outcome metrics

Depending on user objective:

- view/3-second retention;
- average watch time/completion/rewatch;
- saves/shares/comments/follows;
- clicks/leads/conversions;
- authority/trust or education measures where explicitly defined.

Do not conflate platform correlation with causal impact. Experiment design/confidence belongs in AI-006/QAT-001.

## 7. Provider/economic telemetry

For every provider/model/task where measurable:

- latency/queue time;
- generation cost;
- retry count;
- failure taxonomy;
- QA result;
- human acceptance;
- repair requirement;
- privacy/policy route used.

This dataset powers future routing without making a single model the product moat.
