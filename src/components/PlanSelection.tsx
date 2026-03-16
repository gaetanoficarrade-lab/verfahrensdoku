import { useState } from 'react';
import { Check, ArrowRight, Crown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePlatformSettings } from '@/hooks/usePlatformSettings';

interface PlanCardProps {
  name: string;
  price: string;
  originalPrice?: string;
  priceNote?: string;
  setupFee?: string;
  features: string[];
  highlighted?: boolean;
  checkoutUrl: string;
  currentPlan?: string | null;
  isAnnual?: boolean;
}

function PlanCard({ name, price, originalPrice, priceNote, setupFee, features, highlighted, checkoutUrl, currentPlan, isAnnual }: PlanCardProps) {
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
          {isAnnual && originalPrice && (
            <span className="text-lg font-bold line-through mr-2" style={{ color: '#E53E3E' }}>{originalPrice}</span>
          )}
          <span className="text-3xl font-bold" style={{ color: isAnnual && originalPrice ? '#38A169' : undefined }}>{price}</span>
          {priceNote && <span className="text-sm text-muted-foreground ml-1">{priceNote}</span>}
        </div>
        {isAnnual && originalPrice && (
          <p className="text-xs font-semibold mt-1" style={{ color: '#38A169' }}>17 % gespart</p>
        )}
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
  const [annual, setAnnual] = useState(false);
  const { settings, loading } = usePlatformSettings([
    'funnelpay_checkout_solo',
    'funnelpay_checkout_berater',
    'funnelpay_checkout_agentur',
  ]);

  const checkoutUrls = {
    solo: settings['funnelpay_checkout_solo'] || 'https://funnelpay.de/checkout/GoBD-Suite Solo Plan',
    berater: annual
      ? 'https://funnelpay.de/checkout/GoBD-Suite Berater Plan Jährl.'
      : (settings['funnelpay_checkout_berater'] || 'https://funnelpay.de/checkout/GoBD-Suite Berater Plan'),
    agentur: annual
      ? 'https://funnelpay.de/checkout/GoBD-Suite Agentur Plan-Jährl.'
      : (settings['funnelpay_checkout_agentur'] || 'https://funnelpay.de/checkout/GoBD-Suite Agentur Plan'),
  };

  return (
    <div>
      {/* Annual/Monthly Toggle */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <div className="inline-flex rounded-full p-1 border border-border bg-muted/50">
          <button
            onClick={() => setAnnual(false)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${!annual ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
          >
            Monatlich
          </button>
          <button
            onClick={() => setAnnual(true)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${annual ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
          >
            Jährlich
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500 text-white">–17 %</span>
          </button>
        </div>
      </div>

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
          checkoutUrl={checkoutUrls.solo}
          currentPlan={currentPlan}
        />
        <PlanCard
          name="Berater"
          price={annual ? '332€' : '399€'}
          originalPrice={annual ? '399€' : undefined}
          priceNote="/Monat"
          setupFee="590€"
          highlighted
          isAnnual={annual}
          features={[
            'Bis zu 5 Mandanten',
            'Berater-Portal',
            'Team-Verwaltung',
            'Webhooks & Vorlagen',
            'E-Mail-Vorlagen',
            'Aktivitäts-Log',
          ]}
          checkoutUrl={checkoutUrls.berater}
          currentPlan={currentPlan}
        />
        <PlanCard
          name="Agentur"
          price={annual ? '665€' : '799€'}
          originalPrice={annual ? '799€' : undefined}
          priceNote="/Monat"
          setupFee="590€"
          isAnnual={annual}
          features={[
            'Unbegrenzte Mandanten',
            'Alles aus Berater',
            'Whitelabel-Branding',
            'Eigenes Logo & Farben',
            'Custom Domain (bald)',
            'Prioritäts-Support',
          ]}
          checkoutUrl={checkoutUrls.agentur}
          currentPlan={currentPlan}
        />
      </div>
    </div>
  );
}
