# filing guide, uspto pro se provisional, the cheap version

**draft v0.1, founder review before filing.** this package is informational, prepared for self-filing. it does not constitute legal advice.

you are filing a provisional patent on the SkillRank algorithm before public launch. $130, ~45 minutes, locks in your priority date for 12 months. read this end to end before you open patent center.

---

## a. pre-filing checklist

before you touch the upload form, have all of this in front of you.

**eligibility (micro entity).** you qualify if all four are true:
- [ ] gross income last calendar year < ~$231,420 (the cap is 3x median household income, uspto publishes the exact current number, check before you certify).
- [ ] named as inventor on fewer than 4 prior non-provisional u.s. applications (provisionals, foreign, and prior-employer-assigned applications don't count).
- [ ] you also qualify as a small entity under 37 cfr 1.27 (basically: not assigned to a >500-employee org).
- [ ] not under obligation to assign the patent to an entity that itself fails the income test.

if you're going to assign this provisional to implexa inc. later, you're still fine, as long as implexa inc. would also pass micro-entity criteria today.

**documents, all as pdfs.**
- [ ] `cover-sheet.pdf` (export from `cover-sheet.md` after filling placeholders)
- [ ] `specification.pdf` (export from `specification.md`)
- [ ] `claims.pdf` (export from `claims.md`)
- [ ] `drawings.pdf` (you actually have to make this one in draw.io or excalidraw, the .md is the blueprint)
- [ ] `micro-entity-cert.pdf` (uspto form PTO/SB/15A, download from uspto.gov forms page, fill, sign, scan)

**accounts.**
- [ ] uspto.gov account at https://account.uspto.gov/ (sign up if you don't have one, takes 10 min, requires identity verification with login.gov)
- [ ] uspto financial manager set up at https://fees.uspto.gov/ with a payment method loaded (credit card, debit, or ach)

**money.** $130 (micro entity provisional fee as of 2026). check current rate at https://www.uspto.gov/learning-and-resources/fees-and-payment.

**placeholders to fill in cover-sheet.md before exporting.**
- [ ] exact legal name as it appears on your government id
- [ ] residence city/state/country
- [ ] mailing address (this becomes part of the public record once the application matures, use a po box if you don't want your home address out there)
- [ ] citizenship
- [ ] telephone

---

## b. filing through patent center

patent center is at https://patentcenter.uspto.gov/. uspto retired the older EFS-Web in 2024. patent center is the only path now.

1. sign in with your uspto.gov account.
2. click "new submission" → "provisional application."
3. fill the application data form. fields you'll see:
   - applicant type → "individual" (or "individual" → list yourself as inventor, even if you plan to assign later)
   - entity size → "micro entity"
   - title → paste the title from the cover sheet verbatim
   - correspondence address → use the same address as on the cover sheet, or a separate correspondence-only address
4. upload documents. patent center accepts multiple pdfs. recommended order:
   - cover sheet
   - specification
   - claims (optional, but you're including them, upload them)
   - drawings (single pdf with all 7 figures, one figure per page)
   - micro entity certification (PTO/SB/15A)
5. pay the fee. choose "financial manager" payment, select your loaded payment method, confirm $130 charge.
6. review the assembly. patent center shows you a preview of everything you uploaded. read every page. catch typos now, not later.
7. submit. you'll get a confirmation page with:
   - **application number** (looks like 63/XXX,XXX, this is your provisional serial number)
   - **filing date** (today, this is your priority date, this is the thing you're paying $130 for)
   - **confirmation number** (uspto internal id)
   - **receipt pdf** (download and save, this is your proof of filing)
8. screenshot the confirmation page. save the receipt pdf. email it to yourself. archive it in two places.

filing complete. you are now legally entitled to use "patent pending" in marketing materials.

---

## c. immediately after filing

- [ ] save the receipt pdf in at least two places (laptop + cloud drive at minimum)
- [ ] note the application number in your password manager or a note app you'll have access to in 12 months
- [ ] set a calendar reminder for **month 10** (not month 12) to start the non-provisional process. you want buffer.
- [ ] set a second calendar reminder for **month 11** with a hard "non-provisional must be drafted by now" gate
- [ ] update implexa marketing copy to include "patent pending" where appropriate (footer, about page, launch posts)
- [ ] tell co-conspirators / co-founders / advisors only the bare fact that the provisional is filed, not the specifics, until you've decided on disclosure strategy
- [ ] open a spreadsheet labeled "patent: novel material disclosed publicly after filing date" and log every blog post, demo, github commit, or talk that touches the SkillRank algorithm. this matters for the non-provisional later.

---

## d. common pitfalls to avoid

- **don't publicly disclose details that are NOT in the spec before filing.** anything you say publicly before the filing date can become prior art against your own patent. anything new (not in the spec) that you say publicly after the filing date can also bite you when you file the non-provisional. include every embodiment you might want to claim later, in this provisional, even if you're not sure.
- **don't skip the drawings.** "provisional doesn't require formal drawings" is half-true. uspto can reject a provisional that lacks drawings adequate to enable the invention. the .md blueprint for the 7 figures must be turned into actual pdf drawings before you upload.
- **don't file with "consisting of" anywhere in the claims.** that's a closed-list term in patent drafting. you want "comprising" for everything (open list). the claims doc already uses "comprising" throughout, just don't accidentally edit it.
- **don't file with vague novelty language.** patent center won't reject you for vagueness on the provisional, but a vague spec hurts you when you fight prior art in the non-provisional. the spec doc already names the novelty pillars (cross-vendor, asymmetric privacy, multi-signal, work signatures). don't weaken them in review.
- **don't pay the wrong fee.** micro entity is $130. small entity is ~$260. large entity is ~$650. if you accidentally pay large entity, patent center will not refund the difference automatically, you'd have to file a refund petition.
- **don't forget to e-sign the cover sheet.** patent center asks for an electronic signature (`/Rabi Gupta/` style, slashes around your name). do this when prompted, don't skip.

---

## e. cost breakdown

| item | cost (usd) | when | notes |
|---|---|---|---|
| uspto micro entity provisional fee | $130 | today | the only required spend |
| optional: patent search service | $500 to $2000 | skip for provisional | do this before the non-provisional, not now |
| optional: patent attorney review of this provisional | $500 to $1500 | skip if you're comfortable pro se | the provisional is the place to pro-se; the non-provisional is not |
| year-12 non-provisional filing fee + claims fees | $1000 to $2000 | month 11 to 12 | depends on entity status at that point and number of claims |
| year-12 non-provisional attorney fees (recommended) | $8000 to $20000 | month 11 to 12 | get a real attorney for the non-provisional, don't pro-se this one |
| optional: prior-art search before non-provisional | $1000 to $3000 | month 9 to 10 | useful intel before you spend on the non-provisional |
| **total cost path 1: pro-se forever** | ~$1500 to $3000 | over 12 months | risky; non-provisional pro-se is a real legal hazard |
| **total cost path 2: pro-se provisional, attorney non-provisional** | ~$10000 to $25000 | over 12 months | recommended path |

today's spend is $130. everything else is a decision you'll make with 11 months of additional data.

---

## f. strategic notes

- **the provisional is the cheap version, on purpose.** it buys 12 months of "patent pending" status and a priority date. that's it. you do not yet have an enforceable patent. you can't sue anyone on a provisional.
- **what to do with the 12 months.** three things:
  1. validate the algorithm in production. ship SkillRank phase a, b, c. measure recommendation install rate. if it doesn't move the needle, the patent may not be worth the non-provisional spend.
  2. raise capital if you want vc-funded patent strategy (most vcs respect "patent pending" but don't fund patent prosecution specifically, they fund the company).
  3. accumulate prior-art evidence and your own publication trail dated AFTER the filing date, which serves as defensive material for the non-provisional.
- **if the algorithm evolves materially before month 12.** file a new provisional on the improvements. you can stack provisionals. each new provisional gets its own 12-month clock, and the non-provisional can claim priority back to all of them via a continuation-in-part. cheap insurance.
- **non-provisional is not a pro-se zone.** when month 11 rolls around, hire a real patent attorney. budget $10k to $20k. the non-provisional is the document that actually gets you an issued patent; the claim drafting and prior-art battles are not where you save money.
- **pct / international.** if implexa has international ambitions and you want patent protection in europe or china, you have to file a pct application within 12 months of the provisional. that's a separate $4000+ spend and a conversation for month 9 or 10. for most early-stage saas companies the answer is "just file in the us for now and add pct later if the company scales internationally."
- **trade-secret-vs-patent tension.** filing a patent eventually publishes the algorithm. if you decide later that SkillRank is more valuable as a trade secret than as a patent, you can abandon the provisional before it converts (let the 12-month clock run out, don't file the non-provisional). nothing forces you to convert. the $130 is not refundable but you've lost nothing else.

---

## g. when in doubt

- uspto pro se assistance program: https://www.uspto.gov/patents/basics/using-legal-services/pro-se-assistance-program (free help line for self-filers)
- uspto patent center help: https://www.uspto.gov/patents/apply/patent-center (forms, walkthroughs, faqs)
- micro entity fee schedule: https://www.uspto.gov/learning-and-resources/fees-and-payment/patent-fees
- inventor's assistance center: 1-800-786-9199 (free, will not give legal advice, will help with procedure)

if you hit anything that feels like a legal judgment call (novelty disputes, claim scope, prior art interpretation, assignment timing), stop and call a patent attorney before you click submit. $300 for a one-hour consult beats a $25k non-provisional that gets rejected on something you could have fixed in the provisional.

---

ready to file? open https://patentcenter.uspto.gov/ and follow section b. 45 minutes, $130, done.
