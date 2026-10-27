import { GoogleGenAI } from '@google/genai';
import { GovernmentScheme, UserProfile, EligibilityEvaluation, SchemeRecommendation } from '../models/types.js';

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return aiClient;
}

export async function explainEligibilityAI(
  scheme: GovernmentScheme,
  profile: UserProfile | undefined,
  evaluation: EligibilityEvaluation
): Promise<string> {
  const ai = getAiClient();
  if (!ai) {
    return `Based on official eligibility guidelines, you have a status of "${evaluation.status}" with ${evaluation.satisfiedCriteria.length} criterion satisfied. Missing/unmet criteria: ${[...evaluation.unmetCriteria, ...evaluation.missingCriteria].map(c => c.criterion).join(', ') || 'None'}. (Configure GEMINI_API_KEY in Secrets for detailed AI-generated natural language analysis).`;
  }

  const prompt = `
You are an expert Government Welfare Scheme Advisor for Indian Citizens.
Explain the following deterministic eligibility evaluation in clear, warm, and highly structured language.
CRITICAL RULES:
1. Do NOT change, contradict, or override the deterministic eligibility status (${evaluation.status}) or the satisfied/unmet criteria.
2. Ground all statements strictly in the provided scheme facts.
3. Keep the response to 2-3 concise paragraphs or bullet points explaining what they satisfy, what (if anything) is missing or unmet, and the immediate next actionable step.
4. Conclude with a note that this is an informational assessment and final authority rests with the government department.

Scheme Details:
- Name: ${scheme.name} (${scheme.shortName})
- Ministry: ${scheme.ministry}
- Benefits: ${scheme.benefits.description}
- Official Application URL: ${scheme.officialApplicationUrl}

User Profile:
- Age: ${profile?.age ?? 'Not specified'}
- Gender: ${profile?.gender ?? 'Not specified'}
- Occupation: ${profile?.occupation ?? 'Not specified'}
- State: ${profile?.state ?? 'Not specified'}
- Annual Income: ₹${profile?.annualFamilyIncome?.toLocaleString('en-IN') ?? 'Not specified'}
- Category: ${profile?.socialCategory ?? 'Not specified'}
- Disability: ${profile?.disabilityStatus ? 'Yes' : 'No'}

Deterministic Evaluation Results:
- Status: ${evaluation.status}
- Satisfied Criteria: ${evaluation.satisfiedCriteria.map(c => `${c.criterion}: ${c.actual} (Required: ${c.expected})`).join('; ')}
- Unmet Criteria: ${evaluation.unmetCriteria.map(c => `${c.criterion}: ${c.actual} (Required: ${c.expected})`).join('; ') || 'None'}
- Missing Information: ${evaluation.missingCriteria.map(c => `${c.criterion}: Required ${c.expected}`).join('; ') || 'None'}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are a professional, courteous Indian government welfare scheme analyst. Always maintain strict fidelity to the deterministic eligibility assessment provided.'
      }
    });

    return response.text || evaluation.summary;
  } catch (err: any) {
    console.error('Error generating eligibility explanation with Gemini:', err.message);
    return `Analysis: Your status is evaluated as ${evaluation.status}. ${evaluation.summary}`;
  }
}

export async function explainRecommendationsAI(
  profile: UserProfile | undefined,
  topRecommendations: SchemeRecommendation[]
): Promise<string> {
  const ai = getAiClient();
  if (!ai) {
    return 'Your personalized recommendations have been ranked based on your profile occupation, income bracket, and category qualifications.';
  }

  const schemeList = topRecommendations.slice(0, 4).map(r =>
    `- ${r.scheme.name} (Match: ${r.matchScore}%, Status: ${r.eligibilityStatus}): ${r.reasons.join(', ')}`
  ).join('\n');

  const prompt = `
You are an intelligent Government Scheme Advisory assistant.
Provide a personalized 2-sentence encouraging overview to the citizen summarizing why these specific top welfare schemes match their profile.

Citizen Profile:
- Occupation: ${profile?.occupation || 'Citizen'}
- State: ${profile?.state || 'India'}
- Annual Income: ₹${profile?.annualFamilyIncome?.toLocaleString('en-IN') || 'Undisclosed'}
- Social Category: ${profile?.socialCategory || 'General'}

Top Matching Schemes:
${schemeList}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an encouraging, professional civic advisor. Keep your summary to 2-3 brief, helpful sentences.'
      }
    });

    return response.text || 'Personalized recommendations generated successfully based on your profile attributes.';
  } catch (err: any) {
    console.error('Error generating recommendations overview with Gemini:', err.message);
    return 'Personalized recommendations have been generated based on your profile attributes and official scheme rules.';
  }
}

export async function chatAssistantAI(
  userMessage: string,
  history: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }>,
  profile?: UserProfile,
  schemes: GovernmentScheme[] = []
): Promise<{ reply: string; referencedSchemes: string[] }> {
  const ai = getAiClient();

  // If AI key is not available, provide structured database search answer
  if (!ai) {
    const query = userMessage.toLowerCase();
    const matched = schemes.filter(s =>
      s.name.toLowerCase().includes(query) ||
      s.shortName.toLowerCase().includes(query) ||
      s.category.toLowerCase().includes(query) ||
      s.description.toLowerCase().includes(query)
    ).slice(0, 3);

    if (matched.length > 0) {
      const schemeText = matched.map(s =>
        `• **${s.name}** (${s.ministry})\n  - Benefit: ${s.benefits.description}\n  - Official portal: ${s.officialSourceUrl}`
      ).join('\n\n');

      return {
        reply: `Here are official schemes from our database matching your inquiry:\n\n${schemeText}\n\n*Note: Add your GEMINI_API_KEY in the Secrets panel for real-time conversational AI explanations.*`,
        referencedSchemes: matched.map(m => m.name)
      };
    }

    return {
      reply: 'I am the AI Government Scheme Assistant. You can ask me about schemes for farmers, healthcare, scholarships, street vendors, housing, or women entrepreneurs. To enable full conversational AI, please ensure your GEMINI_API_KEY is configured.',
      referencedSchemes: []
    };
  }

  // Build context of verified schemes from MongoDB database
  const schemesContext = schemes.map(s => `
Scheme: ${s.name} (${s.shortName})
Category: ${s.category} | Ministry: ${s.ministry}
Benefits: ${s.benefits.description} (Financial: ₹${s.benefits.financialAmount ?? 0})
Eligibility: Min Age: ${s.eligibility.minAge ?? 'N/A'}, Max Age: ${s.eligibility.maxAge ?? 'N/A'}, Max Income: ₹${s.eligibility.maxAnnualIncome ?? 'N/A'}, Occupations: ${s.eligibility.allowedOccupations?.join(', ') || 'All'}, Genders: ${s.eligibility.allowedGenders?.join(', ') || 'All'}, Categories: ${s.eligibility.allowedCategories?.join(', ') || 'All'}
Required Documents: ${s.requiredDocuments.map(d => d.name).join(', ')}
Official Portal: ${s.officialSourceUrl} | Application URL: ${s.officialApplicationUrl}
---------------------------------`).join('\n');

  const citizenContext = profile ? `
Current Citizen Profile:
- Age: ${profile.age ?? 'Not provided'}
- Gender: ${profile.gender ?? 'Not provided'}
- Occupation: ${profile.occupation ?? 'Not provided'}
- State: ${profile.state ?? 'Not provided'}, District: ${profile.district ?? 'Not provided'}
- Annual Family Income: ₹${profile.annualFamilyIncome?.toLocaleString('en-IN') ?? 'Not provided'}
- Social Category: ${profile.socialCategory ?? 'Not provided'}
- Disability: ${profile.disabilityStatus ? 'Yes' : 'No'}
` : 'Citizen is not logged in or profile is incomplete.';

  const systemInstruction = `
You are the Official AI Government Scheme Advisor for the "Government Scheme Analyzer and Recommendation System".
You help Indian citizens understand welfare schemes, eligibility requirements, application steps, and necessary documents.

STRICT INSTRUCTIONS:
1. Ground your answers ONLY in authentic, verified government schemes provided in the SCHEMES DATABASE below. Never fabricate schemes, ministries, deadlines, or unofficial URLs.
2. If the user asks about eligibility, compare their profile with the scheme's criteria transparently.
3. Always clearly distinguish between system guidance and official government decisions: remind users that final sanctioning is determined by the respective government authority.
4. Format your responses with clear markdown headers, bold highlights, and clean bullet points.
5. If the citizen is asking about required documents, list the exact official documents stored in the database.
6. Provide official portal links when relevant.

CURRENT CITIZEN CONTEXT:
${citizenContext}

SCHEMES DATABASE (VERIFIED FROM DATABASE):
${schemesContext}
`;

  try {
    const formattedHistory = history.slice(-6).map(h => ({
      role: h.role,
      parts: h.parts
    }));

    const contents = [
      ...formattedHistory,
      {
        role: 'user',
        parts: [{ text: userMessage }]
      }
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.3
      }
    });

    const replyText = response.text || 'I apologize, but I could not formulate an answer at this moment. Please check the scheme details directly.';

    // Extract mentioned schemes
    const referencedSchemes = schemes
      .filter(s => replyText.toLowerCase().includes(s.shortName.toLowerCase()) || replyText.toLowerCase().includes(s.name.toLowerCase()))
      .map(s => s.name);

    return {
      reply: replyText,
      referencedSchemes
    };
  } catch (err: any) {
    console.error('Error during AI chat with Gemini:', err.message);
    return {
      reply: `An error occurred while contacting the AI service: ${err.message}. You can still browse all verified government schemes directly in the Schemes Directory.`,
      referencedSchemes: []
    };
  }
}
