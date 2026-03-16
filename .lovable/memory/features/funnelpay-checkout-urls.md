Funnelpay Checkout URLs für die drei Pläne (Stand: aktuell).

## Checkout URLs
- Solo: https://funnelpay.de/checkout/GoBD-Suite Solo Plan
- Berater (monatlich): https://funnelpay.de/checkout/GoBD-Suite Berater Plan
- Berater (jährlich): https://funnelpay.de/checkout/GoBD-Suite Berater Plan Jährl.
- Agentur (monatlich): https://funnelpay.de/checkout/GoBD-Suite Agentur Plan
- Agentur (jährlich): https://funnelpay.de/checkout/GoBD-Suite Agentur Plan-Jährl.

## Verwendung
- PlanSelection.tsx: Fallback-URLs wenn platform_settings leer
- MarketingPage.tsx: PriceCard checkoutUrl prop
- FuerDienstleister.tsx: Direkter Link in Berater- und Agentur-Card
- FuerSelbststaendige.tsx: Direkter Link im Solo-Card
