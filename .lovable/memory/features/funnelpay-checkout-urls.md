Funnelpay Checkout URLs für die drei Pläne.

## Checkout URLs
- Solo: https://funnelpay.de/checkout/GoBD-Suite Solo Plan
- Berater: https://funnelpay.de/checkout/GoBD-Suite Berater Plan
- Agentur: https://funnelpay.de/checkout/GoBD-Suite Agentur Plan

## Verwendung
- PlanSelection.tsx: Fallback-URLs wenn platform_settings leer
- MarketingPage.tsx: PriceCard checkoutUrl prop
- FuerDienstleister.tsx: Direkter Link in Berater- und Agentur-Card
- FuerSelbststaendige.tsx: Direkter Link im Solo-Card
