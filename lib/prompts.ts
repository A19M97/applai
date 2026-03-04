export function buildMatchPrompt(cv: string, jd: string, locale: string = 'en'): string {
  const languageInstruction = locale === 'it'
    ? 'Respond in Italian. All string values must be in Italian.'
    : 'Respond in English. All string values must be in English.'
  return `You are an expert recruiter and career coach. Analyze the compatibility between the following CV and job description. ${languageInstruction}

CV:
${cv}

Job Description:
${jd}

Return your analysis as exactly 5 lines of NDJSON (Newline Delimited JSON). Each line must be a single complete valid JSON object. Do not include any other text, explanation, or markdown fences.

Line 1: {"score": <integer 0-100 representing overall match percentage>}
Line 2: {"commonSkills": <array of skill strings present in both CV and JD>}
Line 3: {"missingSkills": <array of skill strings required by JD but absent in CV>}
Line 4: {"strengths": <array of strings describing the candidate's key strengths for this role>}
Line 5: {"coverLetterTips": <array of strings with specific tips to write a compelling cover letter>}

Example output format (values are illustrative):
{"score": 72}
{"commonSkills": ["Python", "SQL", "Docker"]}
{"missingSkills": ["Kubernetes", "Go"]}
{"strengths": ["Strong backend experience", "Proven team leadership"]}
{"coverLetterTips": ["Highlight your Python expertise", "Address the Kubernetes gap proactively"]}`
}

export function buildInterviewPrompt(cv: string, jd: string, locale: string = 'en'): string {
  const languageInstruction = locale === 'it'
    ? 'Respond in Italian. All string values must be in Italian.'
    : 'Respond in English. All string values must be in English.'
  return `You are an expert technical interviewer and career coach. Based on the CV and job description below, generate tailored interview preparation questions. ${languageInstruction}

CV:
${cv}

Job Description:
${jd}

Return exactly 8 lines of NDJSON (Newline Delimited JSON). Each line must be a single complete valid JSON object. Do not include any other text, explanation, or markdown fences.

Lines 1-5 are technical questions:
{"technicalQuestion": {"question": "<question text>", "hint": "<guidance on how to answer>"}}

Lines 6-8 are behavioral questions:
{"behavioralQuestion": {"question": "<question text>", "hint": "<guidance on how to answer>"}}

Example output format (values are illustrative):
{"technicalQuestion": {"question": "How would you design a REST API for this system?", "hint": "Focus on resource modeling and HTTP semantics"}}
{"technicalQuestion": {"question": "Explain your approach to database indexing.", "hint": "Mention trade-offs between read and write performance"}}
{"technicalQuestion": {"question": "How do you handle race conditions in concurrent code?", "hint": "Discuss locks, atomic operations, or immutable state"}}
{"technicalQuestion": {"question": "What CI/CD practices have you implemented?", "hint": "Describe pipeline stages and deployment strategies"}}
{"technicalQuestion": {"question": "How would you optimize a slow SQL query?", "hint": "Walk through EXPLAIN plan analysis and indexing strategies"}}
{"behavioralQuestion": {"question": "Describe a time you disagreed with a technical decision.", "hint": "Use the STAR method; show constructive conflict resolution"}}
{"behavioralQuestion": {"question": "How do you prioritize tasks under tight deadlines?", "hint": "Demonstrate structured prioritization and communication"}}
{"behavioralQuestion": {"question": "Tell me about a project that didn't go as planned.", "hint": "Show ownership, learning, and course-correction skills"}}`
}
