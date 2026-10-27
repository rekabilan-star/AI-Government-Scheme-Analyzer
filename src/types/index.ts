export interface UserProfile {
  age?: number;
  dob?: string;
  gender?: 'Male' | 'Female' | 'Transgender' | 'Other' | '';
  state?: string;
  district?: string;
  occupation?: string;
  annualFamilyIncome?: number;
  education?: string;
  socialCategory?: 'General' | 'OBC' | 'SC' | 'ST' | 'EWS' | '';
  disabilityStatus?: boolean;
  maritalStatus?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'citizen' | 'admin';
  profile: UserProfile;
  createdAt: string;
  updatedAt: string;
}

export interface SchemeBenefit {
  description: string;
  financialAmount?: number;
  frequency?: string;
  nonFinancial?: string[];
}

export interface SchemeEligibilityCriteria {
  minAge?: number;
  maxAge?: number;
  maxAnnualIncome?: number;
  minAnnualIncome?: number;
  allowedStates?: string[];
  allowedDistricts?: string[];
  allowedOccupations?: string[];
  allowedEducation?: string[];
  allowedGenders?: string[];
  allowedCategories?: string[];
  disabilityRequired?: boolean;
  specialConditions?: string[];
}

export interface RequiredDocument {
  name: string;
  description: string;
  mandatory: boolean;
  issuingAuthority?: string;
}

export interface GovernmentScheme {
  id: string;
  name: string;
  shortName: string;
  code: string;
  description: string;
  ministry: string;
  category: 'Agriculture & Rural' | 'Healthcare & Sanitation' | 'Education & Learning' | 'Housing & Shelter' | 'Business & Entrepreneurship' | 'Social Security & Pension' | 'Women & Child Development' | 'Skill & Employment';
  benefits: SchemeBenefit;
  eligibility: SchemeEligibilityCriteria;
  requiredDocuments: RequiredDocument[];
  applicationProcedure: string[];
  officialSourceUrl: string;
  officialApplicationUrl: string;
  tags: string[];
  isActive: boolean;
  deadline?: string;
  createdAt: string;
  updatedAt: string;
}

export type EligibilityStatus = 'Eligible' | 'Potentially Eligible' | 'Ineligible' | 'Insufficient Information';

export interface CriterionResult {
  criterion: string;
  expected: string;
  actual: string;
  status: 'satisfied' | 'notSatisfied' | 'missingInfo';
  details?: string;
}

export interface EligibilityEvaluation {
  schemeId: string;
  schemeName: string;
  status: EligibilityStatus;
  overallScore: number;
  satisfiedCriteria: CriterionResult[];
  unmetCriteria: CriterionResult[];
  missingCriteria: CriterionResult[];
  summary: string;
  aiExplanation?: string;
  evaluatedAt: string;
  disclaimer: string;
}

export interface SchemeRecommendation {
  scheme: GovernmentScheme;
  matchScore: number;
  eligibilityStatus: EligibilityStatus;
  evaluation: EligibilityEvaluation;
  reasons: string[];
  keyHighlights: string[];
}

export type ApplicationTrackingStatus = 'Not Started' | 'Preparing Documents' | 'Ready to Apply' | 'Submitted' | 'Completed';

export interface ApplicationTracking {
  id: string;
  userId: string;
  schemeId: string;
  schemeName: string;
  schemeCategory: string;
  ministry: string;
  status: ApplicationTrackingStatus;
  applicationDate?: string;
  trackingNumber?: string;
  notes?: string;
  checklist: Array<{
    docName: string;
    completed: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface SavedScheme {
  id: string;
  userId: string;
  schemeId: string;
  scheme: GovernmentScheme;
  notes?: string;
  savedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'alert' | 'scheme_update';
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface Feedback {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  rating: number;
  category: string;
  comment: string;
  adminResponse?: string;
  createdAt: string;
}
