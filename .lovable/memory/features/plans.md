Plan-Struktur, Testmodus-Regeln und erlaubte Feature-Flags für Solo/Berater/Agentur.

## Pläne (Stand 2026-03-14)

| Plan | Preis | Setup Fee | Mandanten | Trial | Whitelabel | Portal |
|------|-------|-----------|-----------|-------|------------|--------|
| Solo | 980€ einmalig | — | 1 | 7d | Nein | Nein |
| Berater | 399€/Monat | 590€ | 5 | 7d | Nein | Ja |
| Agentur | 799€/Monat | 590€ | Unbegrenzt | 7d | Ja | Ja |

- Solo: 12 Monate Laufzeit, Renewal 199€/Jahr
- Upgrade Berater→Agentur: keine erneute Setup Fee
- DB-Tabelle: `plans` (erweitert um price_type, setup_fee, trial_days, feature flags etc.)
- DB-Tabelle: `plan_upgrade_rules` für Upgrade-Pfade

## Feature-Einschränkungen nach Plan
- **Solo**: Nur VD erstellen + unbegrenzte Revisionen. KEIN Branding, Team, Webhooks, Vorlagen, E-Mail-Vorlagen, Affiliate, Aktivitäts-Log, Whitelabel.
- **Berater**: Alles außer Branding (Farben/Logo) und Whitelabel.
- **Agentur**: Alle Features.

## Sidebar-Filterung
- Hook `useTenantPlan` liefert Feature-Flags (canBrand, canWhitelabel, canManageTeam etc.)
- `AppSidebar` filtert `allTenantSettingsItems` basierend auf `requiresFn`

## Admin-Funktionen
- `is_free` (boolean) auf tenants: Komplett kostenloses Unterkonto
- `trial_active` (boolean) auf tenants: Testphase ein/ausschalten
- Beide Felder als Switch im Unterkonto-Dialog

## Testmodus-Regeln (ALLE Pläne inkl. Solo)
- 7 Tage ab Registrierung, für ALLE drei Pläne (Solo, Berater, Agentur)
- subscription_status = 'trialing', trial_ends_at = NOW() + 7 Tage
- Nur Muster GmbH Mandant sichtbar, keine eigenen Mandanten anlegen
- Max 2 Kapitel bearbeitbar
- PDF mit Wasserzeichen "MUSTER-VERFAHRENSDOKUMENTATION"
- Banner: "Testmodus aktiv – noch X Tage | Jetzt freischalten"
- Kein Whitelabel im Testmodus
- Hook: `useTrialRestrictions` zentralisiert alle Trial-Checks

## Testmodus-Ende
- Solo: checkout.session.completed (Einmalzahlung 980€) → status='active'
- Berater/Agentur: customer.subscription.created (Abo aktiv) → status='active'
- Nach Aktivierung: alle Einschränkungen fallen weg, Muster GmbH bleibt
- Nach Ablauf ohne Aktivierung: Account sperren
