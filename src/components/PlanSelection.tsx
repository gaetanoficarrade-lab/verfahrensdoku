import { Check, ArrowRight, Crown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePlatformSettings } from '@/hooks/usePlatformSettings';

interface PlanCardProps {
  name: string;
  price: string;
  priceNote?: string;
  setupFee?: string;
  features: string[];
  highlighted?: boolean;
  checkoutUrlKey: string;
  checkoutUrls: Record<string, string>;
  currentPlan?: string | null;
}

function PlanCard({ name, price, priceNote, setupFee, features, highlighted, checkoutUrlKey, checkoutUrls, currentPlan }: PlanCardProps) {
  const checkoutUrl = checkoutUrls[checkoutUrlKey];
  const isCurrent = currentPlan?.toLowerCase() === name.toLowerCase();

  return (
    <Card className={`relative flex flex-col ${highlighted ? 'border-primary shadow-lg ring-2 ring-primary/20' : ''}`}>
      {highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground px-3 py-1 text-xs">Beliebt</Badge>
        </div>
      )}
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-lg">{name}</CardTitle>
        <div className="mt-2">
          <span className="text-3xl font-bold text-foreground">{price}</span>
          {priceNote && <span className="text-sm text-muted-foreground ml-1">{priceNote}</span>}
        </div>
        {setupFee && (
          <p className="text-xs text-muted-foreground mt-1">+ {setupFee} einmalige Setup-Gebühr</p>
        )}
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <ul className="space-y-2 flex-1 mb-6">
          {features.map((f, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span className="text-muted-foreground">{f}</span>
            </li>
          ))}
        </ul>
        {isCurrent ? (
          <Button variant="outline" disabled className="w-full">
            <Crown className="h-4 w-4 mr-2" />
            Aktueller Plan
          </Button>
        ) : checkoutUrl ? (
          <Button
            className="w-full"
            variant={highlighted ? 'default' : 'outline'}
            onClick={() => window.open(checkoutUrl, '_blank')}
          >
            <ArrowRight className="h-4 w-4 mr-2" />
            Jetzt kaufen
          </Button>
        ) : (
          <Button variant="outline" disabled className="w-full">
            Checkout-URL nicht konfiguriert
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

interface PlanSelectionProps {
  currentPlan?: string | null;
}

export default function PlanSelection({ currentPlan }: PlanSelectionProps) {
  const { settings, loading } = usePlatformSettings([
    'funnelpay_checkout_solo',
    'funnelpay_checkout_berater',
    'funnelpay_checkout_agentur',
  ]);

  const checkoutUrls = {
    solo: settings['funnelpay_checkout_solo'] || 'https://funnelpay.de/checkout/GoBD-Suite Solo Plan',
    berater: settings['funnelpay_checkout_berater'] || '',
    agentur: settings['funnelpay_checkout_agentur'] || '',
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <PlanCard
        name="Solo"
        price="980€"
        priceNote="einmalig"
        features={[
          '1 Mandant',
          'Unbegrenzte Revisionen',
          'KI-Textgenerierung',
          'PDF-Export',
          '12 Monate Laufzeit',
          'Renewal: 199€/Jahr',
        ]}
        checkoutUrlKey="solo"
        checkoutUrls={checkoutUrls}
        currentPlan={currentPlan}
      />
      <PlanCard
        name="Berater"
        price="399€"
        priceNote="/Monat"
        setupFee="590€"
        highlighted
        features={[
          'Bis zu 5 Mandanten',
          'Berater-Portal',
          'Team-Verwaltung',
          'Webhooks & Vorlagen',
          'E-Mail-Vorlagen',
          'Aktivitäts-Log',
          
        ]}
        checkoutUrlKey="berater"
        checkoutUrls={checkoutUrls}
        currentPlan={currentPlan}
      />
      <PlanCard
        name="Agentur"
        price="799€"
        priceNote="/Monat"
        setupFee="590€"
        features={[
          'Unbegrenzte Mandanten',
          'Alles aus Berater',
          'Whitelabel-Branding',
          'Eigenes Logo & Farben',
          'Custom Domain (bald)',
          'Prioritäts-Support',
        ]}
        checkoutUrlKey="agentur"
        checkoutUrls={checkoutUrls}
        currentPlan={currentPlan}
      />
    </div>
  );
}
