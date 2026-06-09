# Security Specification: YouTube SEO Optimizer App (VidIQ Style)

## 1. Data Invariants
- **Owner Lock**: All user data (saved keywords, tags, templates, generated titles, SEO analysis outputs) is strictly tied to their `userId` subcollection prefix.
- **Strict Size/Type Constraints**: Video titles cannot exceed 200 characters (matching YouTube limits). Tag arrays are constrained to standard size boundaries. Descriptive drafts are bounded at 5000 characters.
- **Search Queries Immortality**: Search keyword metrics are cached as historical entries and are immutable after creation.
- **Strict Temporal Integrity**: Audit dates use `request.time` server timestamps to prevent spoofing of chronological metrics.

## 2. The "Dirty Dozen" Spoof/Attack Payloads
Below are 12 malicious payloads designed to trace potential vulnerabilities:
1. **Malicious Ownership Shift (SavedItem)**: User Bobby attempts to write an asset under Alice's `userId` collection.
2. **Resource Poisoning (Poison ID)**: Specifying a 2MB base64 string as the `itemId` parameter.
3. **Ghost Fields Injection (Shadow Update)**: Attempting to insert a malicious boolean flag `isVerifiedBrandChannel: true` inside a SavedItem.
4. **Keyword Scoring Inflation**: Creating a mock keyword analysis entry with `overallScore: 9999` (violating strict bounds).
5. **No-Verification Profile Writing**: Writing assets before verifying their email status.
6. **Title Over-limit Splat**: Creating a title entity containing 50,000 characters of junk to stress memory.
7. **Description Spam Spray**: Creating descriptions containing massive script loops.
8. **Malicious Audit Bypass**: Creating a falsified SEO audits document with direct score overwrite of `score = 100` even though checklist is empty.
9. **Fake Time Spoofing**: Setting historical analytical dates in the year 2045 via local client payload timestamp.
10. **Array Explosion**: Flooding the tags list with index lists exceeding 1,000 items.
11. **Malicious Query Scraping**: Triggering a list query requesting other people's keyword search metrics.
12. **Status Shortcut Bypass**: Bypassing custom state attributes.

## 3. Deployment Rules Draft
Rules defined in `/firestore.rules` must reject all these payloads.
