import { SubscriptionPlanFeatureSection, SubscriptionPlanFeatureStyle } from '@bpartners/typescript-client';

interface PlanWithFeatures {
  featureSections?: SubscriptionPlanFeatureSection[];
  inheritedFromPlanName?: string | null;
}

const stripEmphasis = (text: string) => text.replace(/\*\*(.+?)\*\*/g, '$1');

export const getPlanFeatureLines = (plan?: PlanWithFeatures): string[] => {
  const lines = (plan?.featureSections ?? [])
    .flatMap(section => section.items ?? [])
    .filter(item => item.style !== SubscriptionPlanFeatureStyle.EXCLUDED)
    .map(item => stripEmphasis(item.text ?? ''))
    .filter(Boolean);
  return plan?.inheritedFromPlanName ? [`Tout ${plan.inheritedFromPlanName}`, ...lines] : lines;
};
