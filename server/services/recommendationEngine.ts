import { GovernmentScheme, UserProfile, SchemeRecommendation } from '../models/types.js';
import { evaluateEligibility } from './eligibilityEngine.js';

export function getRecommendations(schemes: GovernmentScheme[], profile?: UserProfile): SchemeRecommendation[] {
  const activeSchemes = schemes.filter(s => s.isActive);
  const recommendations: SchemeRecommendation[] = [];

  for (const scheme of activeSchemes) {
    const evaluation = evaluateEligibility(scheme, profile);
    const reasons: string[] = [];
    const keyHighlights: string[] = [];

    let score = 0;

    // Base score from eligibility status
    if (evaluation.status === 'Eligible') {
      score += 55;
      reasons.push('Meets all verified eligibility criteria for this scheme');
    } else if (evaluation.status === 'Potentially Eligible') {
      score += 35;
      reasons.push('High potential match; satisfies primary criteria pending document verification');
    } else if (evaluation.status === 'Ineligible') {
      score += 5;
    } else {
      score += 20;
    }

    if (profile) {
      // Occupation affinity
      if (
        profile.occupation &&
        scheme.eligibility.allowedOccupations &&
        scheme.eligibility.allowedOccupations.length > 0 &&
        !scheme.eligibility.allowedOccupations.includes('All')
      ) {
        const occMatch = scheme.eligibility.allowedOccupations.some(occ =>
          occ.toLowerCase() === profile.occupation?.toLowerCase() ||
          profile.occupation?.toLowerCase().includes(occ.toLowerCase())
        );
        if (occMatch) {
          score += 20;
          reasons.push(`Tailored specifically for ${profile.occupation}s`);
        }
      }

      // Income bracket affinity
      if (
        profile.annualFamilyIncome !== undefined &&
        scheme.eligibility.maxAnnualIncome !== undefined &&
        profile.annualFamilyIncome <= scheme.eligibility.maxAnnualIncome
      ) {
        score += 15;
        reasons.push(`Income of ₹${profile.annualFamilyIncome.toLocaleString('en-IN')} qualifies under the ₹${scheme.eligibility.maxAnnualIncome.toLocaleString('en-IN')} ceiling`);
      }

      // Social category match
      if (
        profile.socialCategory &&
        scheme.eligibility.allowedCategories &&
        scheme.eligibility.allowedCategories.includes(profile.socialCategory)
      ) {
        score += 10;
        reasons.push(`Targeted benefits for ${profile.socialCategory} category`);
      }

      // Gender specific benefit
      if (
        profile.gender &&
        scheme.eligibility.allowedGenders &&
        scheme.eligibility.allowedGenders.includes(profile.gender) &&
        !scheme.eligibility.allowedGenders.includes('All')
      ) {
        score += 10;
        reasons.push(`Dedicated welfare initiative for ${profile.gender} citizens`);
      }
    }

    // Key scheme highlights
    if (scheme.benefits.financialAmount) {
      keyHighlights.push(`Financial benefit up to ₹${scheme.benefits.financialAmount.toLocaleString('en-IN')} (${scheme.benefits.frequency || 'Direct Benefit'})`);
    }
    if (scheme.benefits.nonFinancial && scheme.benefits.nonFinancial.length > 0) {
      keyHighlights.push(scheme.benefits.nonFinancial[0]);
    }
    keyHighlights.push(`Administered by ${scheme.ministry}`);

    // Cap match score between 0 and 99% (never claim 100% guarantee of government approval)
    const finalScore = Math.min(98, Math.max(10, score));

    recommendations.push({
      scheme,
      matchScore: finalScore,
      eligibilityStatus: evaluation.status,
      evaluation,
      reasons: reasons.length > 0 ? reasons : ['General central welfare initiative applicable to citizens'],
      keyHighlights
    });
  }

  // Sort descending by matchScore
  return recommendations.sort((a, b) => b.matchScore - a.matchScore);
}
