import { GovernmentScheme, UserProfile, EligibilityEvaluation, CriterionResult, EligibilityStatus } from '../models/types.js';

export function evaluateEligibility(scheme: GovernmentScheme, profile?: UserProfile): EligibilityEvaluation {
  const satisfied: CriterionResult[] = [];
  const notSatisfied: CriterionResult[] = [];
  const missing: CriterionResult[] = [];

  const disclaimer = 'INFORMATIONAL ASSESSMENT ONLY: This eligibility analysis is generated deterministically by the system based on user-provided profile data and official scheme rules. Final eligibility verification and benefit sanctioning are exclusively decided by the respective Government Ministry or issuing Authority upon verification of physical/original documents.';

  if (!profile) {
    return {
      schemeId: scheme.id,
      schemeName: scheme.name,
      status: 'Insufficient Information',
      overallScore: 20,
      satisfiedCriteria: [],
      unmetCriteria: [],
      missingCriteria: [
        {
          criterion: 'Profile Completion',
          expected: 'Completed citizen profile',
          actual: 'No profile found',
          status: 'missingInfo',
          details: 'Please complete your citizen profile to evaluate your eligibility.'
        }
      ],
      summary: 'Citizen profile data is missing. Please update your profile with age, occupation, income, and category to analyze eligibility.',
      evaluatedAt: new Date().toISOString(),
      disclaimer
    };
  }

  const crit = scheme.eligibility;

  // 1. Age Evaluation
  if (crit.minAge !== undefined || crit.maxAge !== undefined) {
    const min = crit.minAge ?? 0;
    const max = crit.maxAge ?? 120;
    const expectedStr = crit.minAge !== undefined && crit.maxAge !== undefined
      ? `${min} - ${max} years`
      : crit.minAge !== undefined ? `At least ${min} years` : `Up to ${max} years`;

    if (profile.age === undefined || profile.age === null) {
      missing.push({
        criterion: 'Age Requirement',
        expected: expectedStr,
        actual: 'Not specified in profile',
        status: 'missingInfo',
        details: 'Age is required to verify age bracket eligibility.'
      });
    } else if (profile.age >= min && profile.age <= max) {
      satisfied.push({
        criterion: 'Age Requirement',
        expected: expectedStr,
        actual: `${profile.age} years`,
        status: 'satisfied',
        details: `Your age (${profile.age}) meets the required criterion of ${expectedStr}.`
      });
    } else {
      notSatisfied.push({
        criterion: 'Age Requirement',
        expected: expectedStr,
        actual: `${profile.age} years`,
        status: 'notSatisfied',
        details: `Your age (${profile.age}) does not fall within the mandated bracket of ${expectedStr}.`
      });
    }
  }

  // 2. Annual Income Evaluation
  if (crit.maxAnnualIncome !== undefined || crit.minAnnualIncome !== undefined) {
    const maxInc = crit.maxAnnualIncome;
    const minInc = crit.minAnnualIncome ?? 0;
    const expectedStr = maxInc !== undefined
      ? `Up to ₹${maxInc.toLocaleString('en-IN')}/year`
      : `At least ₹${minInc.toLocaleString('en-IN')}/year`;

    if (profile.annualFamilyIncome === undefined || profile.annualFamilyIncome === null) {
      missing.push({
        criterion: 'Annual Family Income Limit',
        expected: expectedStr,
        actual: 'Not specified in profile',
        status: 'missingInfo',
        details: 'Please update your family income to verify economic threshold qualification.'
      });
    } else {
      let isIncomeOk = true;
      if (maxInc !== undefined && profile.annualFamilyIncome > maxInc) isIncomeOk = false;
      if (minInc !== undefined && profile.annualFamilyIncome < minInc) isIncomeOk = false;

      if (isIncomeOk) {
        satisfied.push({
          criterion: 'Annual Family Income Limit',
          expected: expectedStr,
          actual: `₹${profile.annualFamilyIncome.toLocaleString('en-IN')}/year`,
          status: 'satisfied',
          details: `Your annual family income (₹${profile.annualFamilyIncome.toLocaleString('en-IN')}) is within the allowable limit (${expectedStr}).`
        });
      } else {
        notSatisfied.push({
          criterion: 'Annual Family Income Limit',
          expected: expectedStr,
          actual: `₹${profile.annualFamilyIncome.toLocaleString('en-IN')}/year`,
          status: 'notSatisfied',
          details: `Your family income exceeds the mandated threshold (${expectedStr}).`
        });
      }
    }
  }

  // 3. Gender Requirement
  if (crit.allowedGenders && crit.allowedGenders.length > 0 && !crit.allowedGenders.includes('All')) {
    const expectedGenders = crit.allowedGenders;
    if (!profile.gender) {
      missing.push({
        criterion: 'Gender Eligibility',
        expected: expectedGenders.join(', '),
        actual: 'Not specified in profile',
        status: 'missingInfo',
        details: `This scheme is designated for ${expectedGenders.join(' / ')} applicants.`
      });
    } else if (expectedGenders.includes(profile.gender)) {
      satisfied.push({
        criterion: 'Gender Eligibility',
        expected: expectedGenders.join(', '),
        actual: profile.gender,
        status: 'satisfied',
        details: `Your gender (${profile.gender}) matches the scheme requirements.`
      });
    } else {
      notSatisfied.push({
        criterion: 'Gender Eligibility',
        expected: expectedGenders.join(', '),
        actual: profile.gender,
        status: 'notSatisfied',
        details: `Scheme benefits are specifically reserved for ${expectedGenders.join(', ')} applicants.`
      });
    }
  }

  // 4. Occupation Requirement
  if (crit.allowedOccupations && crit.allowedOccupations.length > 0 && !crit.allowedOccupations.includes('All')) {
    const expectedOccs = crit.allowedOccupations;
    if (!profile.occupation) {
      missing.push({
        criterion: 'Occupation Category',
        expected: expectedOccs.join(', '),
        actual: 'Not specified in profile',
        status: 'missingInfo',
        details: 'Scheme is targeted toward specific occupational sectors.'
      });
    } else {
      // Check exact or partial match
      const isOccMatch = expectedOccs.some(occ =>
        occ.toLowerCase() === profile.occupation?.toLowerCase() ||
        profile.occupation?.toLowerCase().includes(occ.toLowerCase()) ||
        occ.toLowerCase().includes(profile.occupation?.toLowerCase() || '')
      );

      if (isOccMatch) {
        satisfied.push({
          criterion: 'Occupation Category',
          expected: expectedOccs.join(', '),
          actual: profile.occupation,
          status: 'satisfied',
          details: `Your occupation (${profile.occupation}) directly matches eligible target groups.`
        });
      } else {
        notSatisfied.push({
          criterion: 'Occupation Category',
          expected: expectedOccs.join(', '),
          actual: profile.occupation,
          status: 'notSatisfied',
          details: `Targeted exclusively for: ${expectedOccs.join(', ')}.`
        });
      }
    }
  }

  // 5. Social Category (SC/ST/OBC/General)
  if (crit.allowedCategories && crit.allowedCategories.length > 0 && !crit.allowedCategories.includes('All')) {
    const expectedCats = crit.allowedCategories;
    if (!profile.socialCategory) {
      missing.push({
        criterion: 'Social Category',
        expected: expectedCats.join(', '),
        actual: 'Not specified in profile',
        status: 'missingInfo',
        details: 'Social category affects reservation, fee waivers, or specific quotas.'
      });
    } else if (expectedCats.includes(profile.socialCategory)) {
      satisfied.push({
        criterion: 'Social Category',
        expected: expectedCats.join(', '),
        actual: profile.socialCategory,
        status: 'satisfied',
        details: `Your category (${profile.socialCategory}) is eligible for this scheme.`
      });
    } else {
      notSatisfied.push({
        criterion: 'Social Category',
        expected: expectedCats.join(', '),
        actual: profile.socialCategory,
        status: 'notSatisfied',
        details: `Benefits under this scheme are designated for ${expectedCats.join(', ')} categories.`
      });
    }
  }

  // 6. Geographic / State Limitation
  if (crit.allowedStates && crit.allowedStates.length > 0 && !crit.allowedStates.includes('All India')) {
    const expectedStates = crit.allowedStates;
    if (!profile.state) {
      missing.push({
        criterion: 'State Residency',
        expected: expectedStates.join(', '),
        actual: 'Not specified in profile',
        status: 'missingInfo',
        details: 'State domicile verification required.'
      });
    } else if (expectedStates.includes(profile.state)) {
      satisfied.push({
        criterion: 'State Residency',
        expected: expectedStates.join(', '),
        actual: profile.state,
        status: 'satisfied',
        details: `Your state (${profile.state}) is covered under this state/regional scheme.`
      });
    } else {
      notSatisfied.push({
        criterion: 'State Residency',
        expected: expectedStates.join(', '),
        actual: profile.state,
        status: 'notSatisfied',
        details: `Scheme is restricted to residents of: ${expectedStates.join(', ')}.`
      });
    }
  } else {
    // All India scheme
    satisfied.push({
      criterion: 'Geographic Scope',
      expected: 'Pan-India Citizen Coverage',
      actual: profile.state || 'Indian Resident',
      status: 'satisfied',
      details: 'This Central Government scheme applies to all Indian states and Union Territories.'
    });
  }

  // 7. Disability Status
  if (crit.disabilityRequired) {
    if (profile.disabilityStatus === undefined || profile.disabilityStatus === null) {
      missing.push({
        criterion: 'Disability / Divyangjan Status',
        expected: 'Certified Benchmark Disability (40%+)',
        actual: 'Not specified in profile',
        status: 'missingInfo',
        details: 'This scheme is specifically for Persons with Disabilities (Divyangjan).'
      });
    } else if (profile.disabilityStatus === true) {
      satisfied.push({
        criterion: 'Disability / Divyangjan Status',
        expected: 'Certified Benchmark Disability',
        actual: 'Declared in profile',
        status: 'satisfied',
        details: 'Qualifies for Divyangjan assistive aid benefits.'
      });
    } else {
      notSatisfied.push({
        criterion: 'Disability / Divyangjan Status',
        expected: 'Certified Benchmark Disability (40%+)',
        actual: 'No disability indicated',
        status: 'notSatisfied',
        details: 'This welfare program is reserved exclusively for Divyangjan / differently-abled citizens.'
      });
    }
  }

  // 8. Education Requirement
  if (crit.allowedEducation && crit.allowedEducation.length > 0 && !crit.allowedEducation.includes('Any')) {
    const expectedEdu = crit.allowedEducation;
    if (!profile.education) {
      missing.push({
        criterion: 'Educational Qualification',
        expected: expectedEdu.join(', '),
        actual: 'Not specified in profile',
        status: 'missingInfo',
        details: 'Educational background is required to verify scholastic qualification.'
      });
    } else if (expectedEdu.includes(profile.education)) {
      satisfied.push({
        criterion: 'Educational Qualification',
        expected: expectedEdu.join(', '),
        actual: profile.education,
        status: 'satisfied',
        details: `Your qualification (${profile.education}) satisfies the entry criteria.`
      });
    } else {
      // If higher degree or general eligibility
      satisfied.push({
        criterion: 'Educational Qualification',
        expected: expectedEdu.join(', '),
        actual: profile.education,
        status: 'satisfied',
        details: `Your qualification (${profile.education}) is considered for application review.`
      });
    }
  }

  // Overall Status Determination
  let status: EligibilityStatus = 'Eligible';
  let overallScore = 100;

  const totalEvaluated = satisfied.length + notSatisfied.length + missing.length;

  if (notSatisfied.length > 0) {
    status = 'Ineligible';
    // Score based on satisfied vs total
    overallScore = Math.max(0, Math.round((satisfied.length / Math.max(totalEvaluated, 1)) * 40));
  } else if (missing.length > 0) {
    if (satisfied.length === 0) {
      status = 'Insufficient Information';
      overallScore = 25;
    } else {
      status = 'Potentially Eligible';
      overallScore = Math.min(85, Math.round((satisfied.length / Math.max(totalEvaluated, 1)) * 100));
    }
  } else {
    status = 'Eligible';
    overallScore = 95;
  }

  let summary = '';
  if (status === 'Eligible') {
    summary = `You meet all ${satisfied.length} verified criteria evaluated for ${scheme.name}. You can proceed to check document requirements and prepare your application.`;
  } else if (status === 'Potentially Eligible') {
    summary = `You satisfy ${satisfied.length} major eligibility conditions, but ${missing.length} detail(s) (such as ${missing.map(m => m.criterion).join(', ')}) are unverified in your profile. Please complete them to confirm eligibility.`;
  } else if (status === 'Ineligible') {
    summary = `Based on your profile, you do not currently satisfy ${notSatisfied.length} requirement(s): ${notSatisfied.map(n => n.criterion).join(', ')}.`;
  } else {
    summary = 'Crucial profile parameters are missing. Please complete your citizen profile to determine eligibility.';
  }

  return {
    schemeId: scheme.id,
    schemeName: scheme.name,
    status,
    overallScore,
    satisfiedCriteria: satisfied,
    unmetCriteria: notSatisfied,
    missingCriteria: missing,
    summary,
    evaluatedAt: new Date().toISOString(),
    disclaimer
  };
}
