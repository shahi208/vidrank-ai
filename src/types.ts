export interface RelatedKeyword {
  keyword: string;
  searchVolume: number; // 0-100 scale
  competition: number; // 0-100 scale
  overallScore: number; // 0-100 composite
  searchTrend: "up" | "stable" | "down";
}

export interface KeywordAnalysis {
  keyword: string;
  searchVolume: number;
  competition: number;
  overallScore: number;
  strategyTip: string;
  related: RelatedKeyword[];
}

export interface GeneratedTitle {
  titleName: string;
  ctrScore: number;
  hookType: "Curiosity" | "Numeric List" | "Fear" | "Value Promise" | "Comparative" | "Trending Topic";
  whyItWorks: string;
  urgencyRating: "High" | "Medium" | "Low";
}

export interface GeneratedTags {
  tags: {
    primary: string[];
    secondary: string[];
    broad: string[];
  };
  hashtags: string[];
  optimizationSummary: string;
}

export interface GeneratedDescription {
  descriptionBody: string;
  tips: string[];
}

export interface AuditFeedbackItem {
  metric: string;
  status: "excellent" | "needs_improvement" | "critical";
  suggestion: string;
}

export interface AuditReport {
  overallScore: number;
  checklist: {
    titleLengthOk: boolean;
    descriptionLengthOk: boolean;
    hasCallToAction: boolean;
    hasSocialLinks: boolean;
    keywordInTitle: boolean;
    keywordInDescription: boolean;
    tagsOptimized: boolean;
    clickTriggerPresense: boolean;
  };
  feedback: AuditFeedbackItem[];
}

export interface ScriptSection {
  timeframe: string;
  title: string;
  visualDirectorNotes: string;
  scriptObjective: string;
}

export interface ScriptSketch {
  outlineTitle: string;
  hookIdea: string;
  introEngagementTip: string;
  sections: ScriptSection[];
  outroEngagement: string;
}

// Durable Database entities saved in Firebase Firestore
export interface SavedItemDoc {
  id: string; // unique item id in subcollection
  userId: string;
  type: "title" | "keyword_list" | "description" | "script" | "audit";
  titleName: string;
  content: string; // serialized data or description text
  seoScore?: number;
  tags?: string[];
  createdAt: string; // ISO timestamp string
}

export interface SearchQueryDoc {
  id: string;
  userId: string;
  keyword: string;
  searchVolume: number;
  competition: number;
  overallScore: number;
  createdAt: string;
}

export interface SeoAuditDoc {
  id: string;
  userId: string;
  videoTitle: string;
  videoDescription?: string;
  tags?: string[];
  score: number;
  checklist: Record<string, boolean>;
  suggestions?: string[];
  createdAt: string;
}
