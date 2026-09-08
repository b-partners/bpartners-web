import { SubscriptionPlan, SubscriptionPlanComparisonEntry } from '@bpartners/typescript-client';

type ComparisonCell = boolean | string;

interface ComparisonRow {
  section: string;
  label: string;
  usage: ComparisonCell;
  essential: ComparisonCell;
  pro: ComparisonCell;
  expert: ComparisonCell;
}

const comparisonMatrix: ComparisonRow[] = [
  { section: 'Métrés — cœur BIRDIA', label: 'Surface rampant, pente, périmètre', usage: true, essential: true, pro: true, expert: true },
  { section: 'Métrés — cœur BIRDIA', label: 'Faîtage, rives, égouts, noues (linéaires)', usage: true, essential: true, pro: true, expert: true },
  { section: 'Métrés — cœur BIRDIA', label: 'Maquette 3D des pans (visualisation)', usage: true, essential: true, pro: true, expert: true },
  { section: 'Métrés — cœur BIRDIA', label: 'Export CAO / BIM (DXF, IFC)', usage: true, essential: true, pro: true, expert: true },
  { section: 'Livrables & formats', label: 'Rapport PDF + emprise GeoJSON', usage: true, essential: true, pro: true, expert: true },
  { section: 'Livrables & formats', label: 'Marque blanche / co-branding rapport', usage: false, essential: true, pro: true, expert: true },
  { section: 'Équipe & process', label: 'Bouton sur votre site pour génération de prospects', usage: false, essential: true, pro: true, expert: true },
  { section: 'Équipe & process', label: 'Module devis automatisé', usage: false, essential: false, pro: true, expert: true },
  { section: 'Intégration & monitoring', label: 'Accès API & webhooks', usage: false, essential: false, pro: false, expert: true },
  { section: 'Intégration & monitoring', label: 'Monitoring annuel (re-scan auto)', usage: false, essential: false, pro: false, expert: true },
  {
    section: 'Communauté BIRDIA — chantiers proposés',
    label: 'Chantiers proposés / mois',
    usage: false,
    essential: '1 (particulier, entretien)',
    pro: '+2 (particuliers, entretiens)',
    expert: '+5 (particuliers, entretiens, AO)',
  },
  {
    section: 'Communauté BIRDIA — chantiers proposés',
    label: "Outil d'aide aux appels d'offres publics ou grands groupes",
    usage: false,
    essential: false,
    pro: true,
    expert: true,
  },
  { section: 'Support', label: 'Support', usage: 'Email', essential: '7j/7 email', pro: 'Prioritaire', expert: 'Dédié 4h ouvrées' },
];

const toComparisonEntry = (section: string, label: string, cell: ComparisonCell): SubscriptionPlanComparisonEntry =>
  typeof cell === 'string'
    ? { sectionTitle: section, label, kind: 'TEXT', text: cell }
    : { sectionTitle: section, label, kind: cell ? 'INCLUDED' : 'EXCLUDED', text: null };

const comparisonEntriesFor = (key: 'usage' | 'essential' | 'pro' | 'expert') =>
  comparisonMatrix.map(row => toComparisonEntry(row.section, row.label, row[key]));

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'plan-expert',
    name: 'Expert',
    description: 'Pour les multi-agences et les intégrations par API.',
    billingType: 'COMMITMENT',
    priceInCentsWithoutVat: 19900,
    priceInCentsWithVat: 23880,
    vatPercent: 2000,
    overageUnitPriceInCents: 300,
    freeUsageThreshold: 60,
    includedCreditsPerBillingPeriod: 60,
    annualDiscountPercent: 10,
    annualPriceInCentsWithoutVat: 214900,
    annualPriceInCentsWithVat: 257880,
    isMostChosen: false,
    isDeprecated: false,
    displayPosition: 4,
    inheritedFromPlanName: 'Pro',
    comparisonEntries: comparisonEntriesFor('expert'),
    featureSections: [
      {
        items: [
          { text: '**Communauté BIRDIA** — +5 chantiers / mois', style: 'HIGHLIGHTED' },
          { text: '3 € HT / analyse supplémentaire' },
          { text: 'Accès API & webhooks' },
          { text: 'Monitoring annuel — re-scan automatique' },
          { text: 'Multi-agences / multi-marques' },
          { text: 'Support dédié 4 h ouvrées' },
        ],
      },
    ],
  },
  {
    id: 'plan-legacy',
    name: 'Ancien plan',
    description: 'Plan obsolète qui ne doit pas être affiché.',
    billingType: 'COMMITMENT',
    priceInCentsWithoutVat: 2900,
    priceInCentsWithVat: 3480,
    vatPercent: 2000,
    isMostChosen: false,
    isDeprecated: true,
    displayPosition: 2,
    featureSections: [{ items: [{ text: 'Fonctionnalités héritées' }] }],
  },
  {
    id: 'plan-usage',
    name: "À l'usage",
    description: 'Sans engagement — payez ce que vous consommez.',
    billingType: 'USAGE_BASED',
    priceInCentsWithoutVat: 0,
    priceInCentsWithVat: 0,
    vatPercent: 2000,
    overageUnitPriceInCents: 1000,
    includedCreditsPerBillingPeriod: 0,
    isMostChosen: false,
    isDeprecated: false,
    displayPosition: 1,
    comparisonEntries: comparisonEntriesFor('usage'),
    featureSections: [
      {
        title: 'Métrés inclus',
        items: [
          { text: 'Métrés 2D — surface, pente, périmètre', style: 'HIGHLIGHTED' },
          { text: 'Métrés détaillés — faîtage, rives, égouts, noues', style: 'HIGHLIGHTED' },
          { text: 'Maquette 3D des pans (visualisation)', style: 'HIGHLIGHTED' },
          { text: 'Export CAO / BIM (DXF, IFC)', style: 'HIGHLIGHTED' },
        ],
      },
      {
        items: [{ text: 'Export PDF + emprise GeoJSON' }, { text: 'Support email' }, { text: 'Marque blanche / co-branding', style: 'EXCLUDED' }],
      },
    ],
  },
  {
    id: 'plan-pro',
    name: 'Pro',
    description: 'Pour les PME en croissance et les équipes multi-utilisateurs.',
    billingType: 'COMMITMENT',
    priceInCentsWithoutVat: 9900,
    priceInCentsWithVat: 11880,
    vatPercent: 2000,
    overageUnitPriceInCents: 400,
    freeUsageThreshold: 25,
    includedCreditsPerBillingPeriod: 25,
    annualDiscountPercent: 10,
    annualPriceInCentsWithoutVat: 106900,
    annualPriceInCentsWithVat: 128280,
    isMostChosen: false,
    isDeprecated: false,
    displayPosition: 3,
    inheritedFromPlanName: 'Essentiel',
    comparisonEntries: comparisonEntriesFor('pro'),
    featureSections: [
      {
        items: [
          { text: '**Communauté BIRDIA** — +2 chantiers / mois', style: 'HIGHLIGHTED' },
          { text: "**Outil d'aide aux appels d'offres** publics ou grands groupes", style: 'HIGHLIGHTED' },
          { text: '4 € HT / analyse supplémentaire' },
          { text: 'Module devis automatisé' },
          { text: 'Support prioritaire' },
        ],
      },
    ],
  },
  {
    id: 'plan-essential',
    name: 'Essentiel',
    description: 'Le pack tout-en-un pour les artisans et TPE.',
    billingType: 'COMMITMENT',
    priceInCentsWithoutVat: 4900,
    priceInCentsWithVat: 5880,
    vatPercent: 2000,
    overageUnitPriceInCents: 500,
    freeUsageThreshold: 10,
    includedCreditsPerBillingPeriod: 10,
    trialPeriodDays: 7,
    annualDiscountPercent: 10,
    annualPriceInCentsWithoutVat: 52900,
    annualPriceInCentsWithVat: 63480,
    isMostChosen: true,
    isDeprecated: false,
    displayPosition: 2,
    comparisonEntries: comparisonEntriesFor('essential'),
    featureSections: [
      {
        title: 'Métrés inclus',
        items: [
          { text: 'Métrés 2D — surface, pente, périmètre', style: 'HIGHLIGHTED' },
          { text: 'Métrés détaillés — faîtage, rives, égouts, noues', style: 'HIGHLIGHTED' },
          { text: 'Maquette 3D des pans (visualisation)', style: 'HIGHLIGHTED' },
        ],
      },
      {
        items: [
          { text: '5 € HT / analyse supplémentaire' },
          { text: 'Marque blanche / co-branding du rapport' },
          { text: 'Bouton sur votre site pour génération de prospects' },
          { text: 'Assistance 7j/7 par courriel' },
        ],
      },
    ],
  },
];
