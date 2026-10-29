# Kannada phrases to check (BETA)

A fluent Kannada speaker on the team should read every line below and mark it ✅ (correct and natural), ✏️ (fix: write the better wording) or ❌ (remove). Send the marked list back and the rules/text get updated.

Why it matters: a wrong phrase can either miss a scam or look unprofessional in the demo.

## A. Words the scam rules look for (`src/data/rules.js`)

| Rule | Kannada | Meaning (English) |
|---|---|---|
| URG-KN | ತಕ್ಷಣ / ತಕ್ಷಣವೇ / ಕೂಡಲೇ / ಈಗಲೇ / ಇಂದೇ / ಇವತ್ತೇ | immediately / right now / today itself |
| URG-KN | 24 ಗಂಟೆಗಳಲ್ಲಿ / 24 ಗಂಟೆಯೊಳಗೆ | within 24 hours |
| THR-KN | ಖಾತೆ / ಅಕೌಂಟ್ / ಸಿಮ್ / ಕಾರ್ಡ್ / ನಂಬರ್ / ಸಂಖ್ಯೆ / ಕೆವೈಸಿ | account / SIM / card / number / KYC |
| THR-KN | ಬ್ಲಾಕ್ / ಸ್ಥಗಿತ / ಬಂದ್ / ನಿಷ್ಕ್ರಿಯ / ರದ್ದು + ಆಗುತ್ತದೆ / ಆಗುತ್ತೆ / ಆಗಲಿದೆ / ಗೊಳ್ಳುತ್ತದೆ / ಮಾಡಲಾಗುವುದು | will be blocked / suspended / closed / deactivated / cancelled |
| PRT-KN | KYC / ಕೆವೈಸಿ / ಪ್ಯಾನ್ / ಆಧಾರ್ + ಅಪ್ಡೇಟ್ / ನವೀಕರಿಸಿ / ಪರಿಶೀಲಿಸಿ / ಬಾಕಿ ಇದೆ / ಅವಧಿ ಮುಗಿದಿದೆ | KYC/PAN/Aadhaar update / renew / verify / pending / expired |
| CRD-KN | OTP / ಒಟಿಪಿ / ಓಟಿಪಿ / ಪಿನ್ / ಪಾಸ್ವರ್ಡ್ + ಹಂಚಿಕೊಳ್ಳಿ / ಕಳುಹಿಸಿ / ಕಳಿಸಿ / ತಿಳಿಸಿ / ಹೇಳಿ / ನೀಡಿ / ಕೊಡಿ | share / send / tell / give the OTP, PIN, password |
| CRD-KN (not flagged) | …ಹಂಚಿಕೊಳ್ಳಬೇಡಿ / …ಬೇಡ | "don't share" — genuine bank warnings, ignored on purpose |
| FEE-KN | ನೋಂದಣಿ / ರಿಜಿಸ್ಟ್ರೇಶನ್ / ಪ್ರೊಸೆಸಿಂಗ್ + ಶುಲ್ಕ / ಫೀ / ಫೀಸ್ | registration / processing fee |
| FEE-KN | ಶುಲ್ಕ(ವನ್ನು) ಪಾವತಿಸಿ / ಕಟ್ಟಿ / ಕಳುಹಿಸಿ | pay the fee |
| RWD-KN | ನೀವು ಗೆದ್ದಿದ್ದೀರಿ / ಲಾಟರಿ / ಲಕ್ಕಿ ಡ್ರಾ / ಬಹುಮಾನ ಪಡೆಯಲು | you have won / lottery / lucky draw / to get the prize |
| UTL-KN | ವಿದ್ಯುತ್ / ಕರೆಂಟ್ / ಬೆಸ್ಕಾಂ / ಜೆಸ್ಕಾಂ / ಹೆಸ್ಕಾಂ / ಲೈಟ್ + ಕಡಿತ / ಕಟ್ / ಸ್ಥಗಿತ | electricity / current / BESCOM / GESCOM / HESCOM … cut |
| AUTH-KN | ಪೊಲೀಸ್ / ಸೈಬರ್ ಕ್ರೈಮ್ / ಸೈಬರ್ ಸೆಲ್ / ಸಿಬಿಐ / ಕಸ್ಟಮ್ಸ್ + ಮಾತನಾಡುತ್ತಿದ್ದೇನೆ / ಮಾತಾಡ್ತಿದ್ದೀನಿ / ಕರೆ ಮಾಡುತ್ತಿದ್ದೇನೆ | "I am speaking / calling from the police, cyber crime, CBI, customs" |
| AUTH-KN | ಡಿಜಿಟಲ್ ಅರೆಸ್ಟ್ / ಬಂಧನ ವಾರಂಟ್ / ನಿಮ್ಮನ್ನು ಬಂಧಿಸಲಾಗುವುದು / ಪ್ರಕರಣ ದಾಖಲಾಗಿದೆ / ಕೇಸ್ ದಾಖಲಾಗಿದೆ | digital arrest / arrest warrant / you will be arrested / a case has been registered |
| SEC-KN | ಯಾರಿಗೂ ಹೇಳಬೇಡಿ / ಯಾರಿಗೂ ತಿಳಿಸಬೇಡಿ / ರಹಸ್ಯವಾಗಿಡಿ | don't tell anyone / keep it secret |
| GEN-KN | ಆತ್ಮೀಯ ಗ್ರಾಹಕರೇ / ಪ್ರಿಯ ಗ್ರಾಹಕರೇ | Dear customer |

**Kannada in English letters (Kanglish):** `OTP heli / kodi / kalsi / share maadi`, `account block aagutte`, `police station inda maatadtiddini`, `KYC update maadi`; "don't" forms ignored: `beda / bedi / helbedi / yarigu`. Add any common spellings we missed.

## B. Text JaalBreak shows and reads aloud (`src/data/plainLanguage.js`)

| English | Kannada shown / spoken |
|---|---|
| Likely a scam — stop here. | ಇದು ವಂಚನೆ (ಸ್ಕ್ಯಾಮ್) ಇರಬಹುದು — ಇಲ್ಲೇ ನಿಲ್ಲಿಸಿ. |
| Warning signs found — check before you do anything. | ಎಚ್ಚರಿಕೆಯ ಸೂಚನೆಗಳು ಕಂಡುಬಂದಿವೆ — ಏನಾದರೂ ಮಾಡುವ ಮೊದಲು ಪರಿಶೀಲಿಸಿ. |
| No known scam pattern found — that does not make it safe. | ಯಾವುದೇ ಪರಿಚಿತ ವಂಚನೆಯ ಮಾದರಿ ಕಂಡುಬಂದಿಲ್ಲ — ಅದರರ್ಥ ಇದು ಸುರಕ್ಷಿತ ಎಂದಲ್ಲ. |
| Don't click the link. | ಲಿಂಕ್ ಕ್ಲಿಕ್ ಮಾಡಬೇಡಿ. |
| Don't share any OTP, PIN or password. | OTP, PIN ಅಥವಾ ಪಾಸ್‌ವರ್ಡ್ ಯಾರಿಗೂ ಹೇಳಬೇಡಿ. |
| Don't pay, and don't call the number in the message. | ಹಣ ಕಳುಹಿಸಬೇಡಿ, ಸಂದೇಶದಲ್ಲಿರುವ ನಂಬರ್‌ಗೆ ಕರೆ ಮಾಡಬೇಡಿ. |
| If it asks for money, an OTP or a click, still check through the official app or number. | ಇದು ಹಣ, OTP ಅಥವಾ ಕ್ಲಿಕ್ ಕೇಳಿದರೆ, ಅಧಿಕೃತ ಆಪ್ ಅಥವಾ ನಂಬರ್ ಮೂಲಕ ಪರಿಶೀಲಿಸಿ. |
| If money is already gone, call 1930 now. | ಹಣ ಈಗಾಗಲೇ ಹೋಗಿದ್ದರೆ, ತಕ್ಷಣ 1930 ಗೆ ಕರೆ ಮಾಡಿ. |
| Type | ಪ್ರಕಾರ |
| "Ask family" message | ನಮಸ್ಕಾರ, ನನಗೆ ಒಂದು ಸಂದೇಶ ಬಂದಿದೆ, ಅದನ್ನು JaalBreak ನಲ್ಲಿ ಪರಿಶೀಲಿಸಿದೆ. … ನಾನು ಏನನ್ನೂ ಕ್ಲಿಕ್ ಮಾಡಿಲ್ಲ, ಯಾವ OTP ಯನ್ನೂ ಹೇಳಿಲ್ಲ. ಏನಾದರೂ ಮಾಡುವ ಮೊದಲು ನನ್ನ ಜೊತೆ ಪರಿಶೀಲಿಸುತ್ತೀರಾ? |

Scam-type names (same file, `CATEGORY.kn`): ಬ್ಯಾಂಕ್ / KYC ಬ್ಲಾಕ್ ಆಗುವ ವಂಚನೆ · ಉದ್ಯೋಗ ಅಥವಾ ಇಂಟರ್ನ್‌ಶಿಪ್ ಶುಲ್ಕದ ವಂಚನೆ · ಪಾರ್ಸೆಲ್ / ಕಸ್ಟಮ್ಸ್ ಶುಲ್ಕದ ವಂಚನೆ · ಕುಟುಂಬದವರ ಹೆಸರಿನಲ್ಲಿ ವಂಚನೆ · ಬಹುಮಾನ, ರಿಫಂಡ್ ಅಥವಾ ಪಾಯಿಂಟ್ಸ್ ವಂಚನೆ · ಹೂಡಿಕೆ ಅಥವಾ ಟಾಸ್ಕ್ ಗಳಿಕೆ ವಂಚನೆ · ಪೊಲೀಸ್ / ಸರ್ಕಾರಿ ಬೆದರಿಕೆ (ಡಿಜಿಟಲ್ ಅರೆಸ್ಟ್) · ರಿಮೋಟ್ ಆಪ್ / ಟೆಕ್ ಸಪೋರ್ಟ್ ವಂಚನೆ · ವಿದ್ಯುತ್ ಸಂಪರ್ಕ ಕಡಿತದ ವಂಚನೆ · ಬ್ಲ್ಯಾಕ್‌ಮೇಲ್ · ಸೋಶಿಯಲ್ ಮೀಡಿಯಾ ಖಾತೆ ಕದಿಯುವ ವಂಚನೆ · ನಕಲಿ ಟ್ರಾಫಿಕ್ ಇ-ಚಲನ್ · ನಕಲಿ ಸಾಲ ಅಥವಾ ಹಣ ಜಮೆ ವಂಚನೆ · ಸಾಮಾನ್ಯ ಅನುಮಾನಾಸ್ಪದ ಸಂದೇಶ · ಯಾವುದೇ ನಿರ್ದಿಷ್ಟ ಮಾದರಿ ಇಲ್ಲ

## C. Test sentence
`ಆತ್ಮೀಯ ಗ್ರಾಹಕರೇ, ನಿಮ್ಮ ಖಾತೆ ಇಂದು ಬ್ಲಾಕ್ ಆಗುತ್ತದೆ. ತಕ್ಷಣ KYC ಅಪ್ಡೇಟ್ ಮಾಡಿ ಮತ್ತು OTP ಹಂಚಿಕೊಳ್ಳಿ` → should show **Likely a scam**.
`ನಿಮ್ಮ OTP ಅನ್ನು ಯಾರೊಂದಿಗೂ ಹಂಚಿಕೊಳ್ಳಬೇಡಿ` (a real bank warning) → should show **No known scam pattern**.
Please also write 3–5 real Kannada scam messages you or your family have received — they make the best test cases.
