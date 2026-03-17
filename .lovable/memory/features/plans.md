Plan-Struktur, Testmodus-Regeln und erlaubte Feature-Flags für Solo/Berater/Agentur.

## Zwei Wege ins Tool

### Weg 1: Kostenloser Test (7 Tage)
- Seite: /test-starten (öffentlich, kein Token nötig)
- Formular: Name, E-Mail, Firma, Passwort
- Edge Function: `create-trial-account` (erstellt Tenant + User + Muster GmbH)
- subscription_status = 'trialing', trial_ends_at = NOW()+7d, plan = null
- Einschränkungen: nur Muster GmbH, max 2 Kapitel, Wasserzeichen, Banner

### Weg 2: Direktkauf (Funnelpay)
- Kunde kauft auf gaetanoficarra.de → Funnelpay Webhook
- subscription_status = 'active', plan = solo/berater/agentur
- KEIN Testmodus, sofort volles Konto

## Upgrade im Tool
- PlanSelection-Komponente zeigt Solo/Berater/Agentur
- Checkout-URLs aus platform_settings: funnelpay_checkout_solo/berater/agentur
- Nach Kauf: Funnelpay Webhook → findOrCreateTenant setzt status='active'

## Pläne

| Plan | Preis | Mandanten | Whitelabel | Portal |
|------|-------|-----------|------------|--------|
| Solo | 980€ einmalig | 1 | Nein | Nein |
| Berater | 399€/Monat | 5 | Nein | Ja |
| Agentur | 799€/Monat | Unbegrenzt | Ja | Ja |

- Solo: 12 Monate Laufzeit, Renewal 199€/Jahr
- Keine Setup-Gebühren (entfernt)

## Feature-Einschränkungen nach Plan
- **Solo**: Nur VD erstellen. KEIN Branding, Team, Webhooks, Vorlagen, Affiliate.
- **Berater**: Alles außer Branding und Whitelabel.
- **Agentur**: Alle Features.

## Testmodus-Einschränkungen
- Nur Muster GmbH Mandant, keine eigenen anlegen
- Max 2 Kapitel bearbeitbar
- PDF mit Wasserzeichen "MUSTER-VERFAHRENSDOKUMENTATION"
- Banner: "Testmodus aktiv – noch X Tage | Jetzt upgraden"
- Hook: `useTrialRestrictions` zentralisiert alle Trial-Checks
- Nach 7 Tagen: /trial-expired mit Plan-Auswahl

## Testmodus-Ende
- Upgrade via PlanSelection → Funnelpay Checkout
- Funnelpay Webhook → status='active', Plan zugewiesen
- Alle Einschränkungen fallen weg, Muster GmbH bleibt

## Checkout-URLs (platform_settings)
- funnelpay_checkout_solo
- funnelpay_checkout_berater
- funnelpay_checkout_agentur
