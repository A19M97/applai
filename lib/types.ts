export interface Question {
  question: string
  hint: string
}

export interface MatchAnalysis {
  score: number
  commonSkills: string[]
  missingSkills: string[]
  strengths: string[]
  coverLetterTips: string[]
}

export interface InterviewPrep {
  technicalQuestions: Question[]
  behavioralQuestions: Question[]
}

export interface Session {
  cv: string
  jobDescription: string
  analysis?: MatchAnalysis
  prep?: InterviewPrep
}
