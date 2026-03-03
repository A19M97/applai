export function buildMatchPrompt(cv: string, jd: string, locale: string = 'en'): string {
  const languageInstruction = locale === 'it'
    ? 'Respond in Italian. All string values in the JSON must be in Italian.'
    : 'Respond in English. All string values in the JSON must be in English.'
  return `You are an expert recruiter and career coach. Analyze the compatibility between the following CV and job description. ${languageInstruction}

CV:
${cv}

Job Description:
${jd}

Return ONLY a valid JSON object with no preamble, no explanation, and no markdown formatting. The JSON must strictly conform to this structure:
{
  "score": <number between 0 and 100 representing overall match percentage>,
  "commonSkills": <array of strings listing skills present in both CV and JD>,
  "missingSkills": <array of strings listing skills required by JD but absent in CV>,
  "strengths": <array of strings describing the candidate's key strengths for this role>,
  "coverLetterTips": <array of strings with specific tips to write a compelling cover letter for this role>
}`
}

export function buildInterviewPrompt(cv: string, jd: string, matchSummary: string, locale: string = 'en'): string {
  const languageInstruction = locale === 'it'
    ? 'Respond in Italian. All string values in the JSON must be in Italian.'
    : 'Respond in English. All string values in the JSON must be in English.'
  return `You are an expert technical interviewer and career coach. Based on the CV, job description, and match analysis below, generate tailored interview preparation questions. ${languageInstruction}

CV:
${cv}

Job Description:
${jd}

Match Analysis Summary:
${matchSummary}

Return ONLY a valid JSON object with no preamble, no explanation, and no markdown formatting. The JSON must strictly conform to this structure:
{
  "technicalQuestions": <array of exactly 5 objects, each with "question" (string) and "hint" (string with guidance on how to answer)>,
  "behavioralQuestions": <array of exactly 3 objects, each with "question" (string) and "hint" (string with guidance on how to answer)>
}`
}
