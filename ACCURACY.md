# How accurate is JaalBreak? (rules v1.2.0, measured 29 Oct 2026)

**Short answer for judges:** on 150 real scam-candidate messages we had never looked at before, JaalBreak flags **76% of real scams** (up from 57% in v1.1.1), flags **0 of 17 genuine messages**, and wrongly flags only **1.3% of 5,191 genuine messages** in a larger public set.

## Data
- Source: real messages from public datasets bundled in the open-source "ScamShield AI" project (MIT licence) — the *Smishing Dataset* (shaghayegh-hp), *UCI SMS Spam*, *Indian Telecom SMS*, *Kaggle Hindi*, *Indian Cyber Scam Hinglish*. Only rows marked as real (`real_…`) were used; their synthetic rows were excluded.
- Their own scam labels are noisy (ordinary offers like "Paytm cashback" are labelled "UPI fraud"), so we **hand-checked** samples against one strict definition:
  > A **scam** tries to get money, an OTP/password, personal details, or a click/call under a false pretence (fake bank, fake prize, fake job, fake bill, threats). A real promotion is **not** a scam.
- Labels: `S` real scam, `P` promotion/spam, `G` genuine, `U` unclear (ignored). Files: `tools/benchmark/`.

## Results ("flagged" = Several warning signs or Strong)

| Test | v1.1.1 | v1.2.0 |
|---|---|---|
| **Blind holdout — 150 messages never seen while writing rules:** real scams flagged (n=42) | 57.1% | **76.2%** |
| … of those, marked "Strong" | 4.8% | 11.9% |
| … promotions flagged (n=83) | 7.2% | 7.2% |
| … genuine flagged (n=17) | 0% | **0%** |
| First hand-checked sample (400 messages; used while writing rules, so optimistic): real scams flagged (n=114) | 53.5% | 69.3% |
| Large public set: genuine messages wrongly flagged (n=5,191) | 1.2% | **1.3%** |

## Honest limits
- 150 is small; the true catch rate could be several points higher or lower.
- Most dataset messages are in English and many are from outside India; Hindi, Hinglish and Kannada were tested only with our own examples.
- One person did the hand-labelling. A second labeller would make it stronger.
- "Strong" is deliberately strict: most caught scams show as "Several warning signs".

Re-run any time: `node tools/benchmark/score.mjs`
