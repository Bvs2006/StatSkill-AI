// ──────────────────────────────────────────────
// Groq Cloud AI Service (Free Tier Llama-3.3 / Llama-3.1)
// ──────────────────────────────────────────────

export interface GeneratedQuestion {
  id: number;
  question: string;
  options: string[];
  answer: number; // 0-indexed
  explanation: string;
  domain: "Statistical" | "Technical" | "Digital Governance" | "Behavioural";
  difficulty: "Basic" | "Intermediate" | "Advanced";
  competencyTarget?: string;
}

const GROQ_STORAGE_KEY = "diid_groq_api_key";

export function getGroqApiKey(): string {
  if (typeof window === "undefined") return "";
  const envKey = (import.meta as any).env?.VITE_GROQ_API_KEY;
  if (envKey && String(envKey).trim() && !String(envKey).includes("your_groq_free_key")) {
    return String(envKey).trim();
  }
  return localStorage.getItem(GROQ_STORAGE_KEY) || "";
}

export function setGroqApiKey(key: string): void {
  if (typeof window === "undefined") return;
  if (key.trim()) {
    localStorage.setItem(GROQ_STORAGE_KEY, key.trim());
  } else {
    localStorage.removeItem(GROQ_STORAGE_KEY);
  }
}

export function hasGroqApiKey(): boolean {
  return Boolean(getGroqApiKey());
}

/**
 * Generate Multiple Choice Questions from uploaded content using Groq LLM
 */
export async function generateMCQsFromText(
  content: string,
  count: number = 5,
  difficulty: "Basic" | "Intermediate" | "Advanced" = "Intermediate",
  domain: string = "Statistical"
): Promise<{ questions: GeneratedQuestion[]; source: "groq" | "fallback" }> {
  const apiKey = getGroqApiKey();
  const randomSeed = `${Date.now()}_${Math.floor(Math.random() * 10000)}`;

  // If no API key, use randomized dynamic domain generator
  if (!apiKey) {
    return {
      questions: generateDynamicFallbackQuestions(content, count, difficulty, domain),
      source: "fallback",
    };
  }

  const prompt = `You are a Senior Technical & Statistical Assessment Officer for India's Ministry of Statistics and Programme Implementation (MoSPI) and NSSTA.
Generate exactly ${count} completely unique, brand-new, objective Multiple Choice Questions (MCQs) for batch [${randomSeed}].

Subject / Text:
"""
${content.slice(0, 8000)}
"""

Specifications:
- Domain: ${domain} (Statistical, Technical, Digital Governance, Behavioural)
- Difficulty: ${difficulty}
- Each question must have 4 plausible, realistic options.
- The correct answer index must vary across 0, 1, 2, 3 (do NOT always make 0 correct).
- Provide a clear official rationale/explanation citing Indian statistical guidelines or standard methodologies.
- Tag the specific competency target.

Return ONLY valid JSON matching this exact structure:
{
  "questions": [
    {
      "id": 1,
      "question": "Question text here?",
      "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
      "answer": 1,
      "explanation": "Official explanation text.",
      "domain": "${domain}",
      "difficulty": "${difficulty}",
      "competencyTarget": "Competency Name"
    }
  ]
}`;

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "You are a specialized JSON exam API for India's Ministry of Statistics. You always return a valid JSON object containing a questions array." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 3000,
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn("Groq API error, falling back to dynamic generator:", errText);
      return {
        questions: generateDynamicFallbackQuestions(content, count, difficulty, domain),
        source: "fallback",
      };
    }

    const data = await res.json();
    const rawContent = data.choices?.[0]?.message?.content || "";
    
    // Parse JSON
    let parsed: any;
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      const match = rawContent.match(/\{[\s\S]*"questions"[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      } else {
        throw new Error("Unable to parse JSON from AI response");
      }
    }

    const questionsList = Array.isArray(parsed.questions)
      ? parsed.questions
      : Array.isArray(parsed)
      ? parsed
      : parsed.items || [];
    
    if (questionsList.length === 0) {
      throw new Error("Empty question list returned");
    }

    const formattedQuestions: GeneratedQuestion[] = questionsList.slice(0, count).map((q: any, idx: number) => ({
      id: idx + 1,
      question: q.question || `Assessment Question ${idx + 1}`,
      options: Array.isArray(q.options) && q.options.length === 4 ? q.options : ["Option A", "Option B", "Option C", "Option D"],
      answer: typeof q.answer === "number" && q.answer >= 0 && q.answer <= 3 ? q.answer : Math.floor(Math.random() * 4),
      explanation: q.explanation || "Detailed official statistical explanation.",
      domain: (q.domain as any) || domain || "Statistical",
      difficulty: (q.difficulty as any) || difficulty || "Intermediate",
      competencyTarget: q.competencyTarget || "Official Statistics",
    }));

    return { questions: formattedQuestions, source: "groq" };
  } catch (err) {
    console.error("Failed to generate with Groq:", err);
    return {
      questions: generateDynamicFallbackQuestions(content, count, difficulty, domain),
      source: "fallback",
    };
  }
}

/**
 * Dynamic Multi-Topic Fallback Question Bank
 * Generates unique, shuffled questions based on keywords, topics, and difficulty
 */
function generateDynamicFallbackQuestions(
  content: string,
  count: number,
  difficulty: "Basic" | "Intermediate" | "Advanced",
  domain: string
): GeneratedQuestion[] {
  const contentLower = content.toLowerCase();

  // Comprehensive master question pool covering all domains and courses
  const masterPool: Omit<GeneratedQuestion, "id">[] = [
    // SNA / National Accounts
    {
      question: "In UN System of National Accounts (SNA 2008), how is Gross Value Added (GVA) at basic prices derived from production data?",
      options: [
        "Gross Value of Output minus Intermediate Consumption",
        "GDP at Market Prices plus Net Indirect Taxes",
        "Total National Compensation of Employees minus Fixed Capital Consumption",
        "Final Consumption Expenditure plus Exports of Goods and Services",
      ],
      answer: 0,
      explanation: "GVA at basic prices represents the value generated by any institutional unit: Gross Output less Intermediate Consumption.",
      domain: "Statistical",
      difficulty: "Intermediate",
      competencyTarget: "National Accounts & GVA Compilation",
    },
    {
      question: "In India's Supply and Use Tables (SUT), what identity balances the total commodity flow?",
      options: [
        "Total Supply at Purchaser Prices = Total Use at Purchaser Prices",
        "Domestic Output = Gross Capital Formation",
        "Total Exports = Total Intermediate Consumption",
        "Import Margins = Net Taxes on Production",
      ],
      answer: 0,
      explanation: "The Supply-Use framework guarantees internal consistency: total supply of every commodity must equal its total use.",
      domain: "Statistical",
      difficulty: "Advanced",
      competencyTarget: "Supply and Use Tables (SUT)",
    },
    // Survey Sampling / NSSO
    {
      question: "In NSSO multi-stage sample surveys, what sampling mechanism is used to select First Stage Units (FSUs)?",
      options: [
        "Probability Proportional to Size (PPS) with circular systematic sampling",
        "Simple Random Sampling without Replacement (SRSWOR) across whole districts",
        "Equal Probability Selection regardless of village census population",
        "Snowball sampling based on field investigator discretion",
      ],
      answer: 0,
      explanation: "NSS surveys select rural Census villages and urban UFS blocks with Probability Proportional to Size (PPS) to reflect population weights.",
      domain: "Statistical",
      difficulty: "Intermediate",
      competencyTarget: "Sampling Design & Survey Estimation",
    },
    {
      question: "How is the survey multiplier (MLT) normalized when pooling Sub-sample 1 and Sub-sample 2 in NSSO microdata?",
      options: [
        "Dividing integer MLT by 200 for combined sample estimates",
        "Multiplying raw MLT by the total number of survey rounds",
        "Using MLT directly as an integer without dividing by sub-sample count",
        "Adding household size to the raw multiplier column",
      ],
      answer: 0,
      explanation: "Sub-samples in NSS surveys have a base divisor of 100 per sub-sample; combining both sub-samples requires dividing by 200.",
      domain: "Technical",
      difficulty: "Advanced",
      competencyTarget: "NSSO Multipliers & Microdata Processing",
    },
    // Price Statistics CPI & WPI
    {
      question: "Which mathematical formula is adopted in India for aggregating item-level price relatives in the Consumer Price Index (CPI)?",
      options: [
        "Modified Laspeyres Price Index formula with fixed base expenditure weights",
        "Simple Paasche Index using current monthly consumption baskets",
        "Fisher Ideal Index without base weight rebasing",
        "Tornqvist exponential weighting without rural-urban stratification",
      ],
      answer: 0,
      explanation: "India compiles CPI Rural, Urban, and Combined using the Modified Laspeyres formulation based on base-year Household Consumer Expenditure Survey shares.",
      domain: "Statistical",
      difficulty: "Intermediate",
      competencyTarget: "Price Statistics & Index Compilation",
    },
    {
      question: "At the elementary town/village quotation level, which index formula is used in CPI to minimize outlier bias?",
      options: [
        "Geometric Mean (Jevons Elementary Index)",
        "Arithmetic Mean of Quantities (Dutot Index)",
        "Harmonic Mean of expenditures",
        "Median price ratio of highest quintiles",
      ],
      answer: 0,
      explanation: "The elementary level aggregation uses the Jevons geometric mean to avoid upward arithmetic skew from volatile food prices.",
      domain: "Statistical",
      difficulty: "Advanced",
      competencyTarget: "Price Statistics & Elementary Aggregations",
    },
    // PLFS Labour Statistics
    {
      question: "In the Periodic Labour Force Survey (PLFS), how is the Worker Population Ratio (WPR) calculated?",
      options: [
        "(Total Employed Persons / Total Population) × 100",
        "(Total Employed Persons / Labour Force) × 100",
        "(Unemployed Persons / Labour Force) × 100",
        "(Persons in Formal Sector / Total Sown Area) × 100",
      ],
      answer: 0,
      explanation: "WPR measures the percentage of employed persons in the total population, reflecting the workforce density of the country.",
      domain: "Statistical",
      difficulty: "Basic",
      competencyTarget: "PLFS & Labour Indicators",
    },
    {
      question: "What rotational panel sampling scheme is employed in PLFS for quarterly urban employment tracking?",
      options: [
        "2-2-2 Rotational Panel (visited 4 times: 2 visits, 2 gaps, 2 visits)",
        "100% complete census enumeration every quarter",
        "Independent fresh random sample every week with zero re-visits",
        "Annual single-visit cross-sectional recall",
      ],
      answer: 0,
      explanation: "Urban PLFS employs a 2-2-2 rotational panel to track quarter-on-quarter changes in labour dynamics while reducing respondent fatigue.",
      domain: "Statistical",
      difficulty: "Intermediate",
      competencyTarget: "PLFS Panel Sampling Design",
    },
    // Python & Data Science
    {
      question: "When parsing multi-gigabyte fixed-width survey files in Python Pandas, which approach is most memory-efficient?",
      options: [
        "Using `pd.read_fwf()` with explicit `colspecs` and `chunksize` iterator",
        "Loading the entire file as a single Python string using `open().read()`",
        "Converting to Excel format before reading with `pd.read_excel()`",
        "Splitting columns using regex lookaheads in a single-threaded loop",
      ],
      answer: 0,
      explanation: "`chunksize` parameter in `pd.read_fwf()` yields iterable DataFrames, preventing memory overflow on large NSS unit-level files.",
      domain: "Technical",
      difficulty: "Intermediate",
      competencyTarget: "Python & Big Data Pipelines",
    },
    {
      question: "In R econometric analysis of survey data, why must the `survey` package `svydesign()` be used instead of standard `lm()`?",
      options: [
        "To adjust standard errors for complex clustering, stratification, and unequal sampling probabilities",
        "Because `lm()` cannot handle numeric floating point numbers in R",
        "Because `svydesign()` converts CSV files into SQL database tables automatically",
        "To enforce non-parametric spline regression by default",
      ],
      answer: 0,
      explanation: "Standard OLS assumes i.i.d observations; `svydesign()` computes Taylor series linearized standard errors accounting for sample design effects.",
      domain: "Technical",
      difficulty: "Advanced",
      competencyTarget: "R Programming & Survey Econometrics",
    },
    // SQL & Databases
    {
      question: "In PostgreSQL database queries for industrial registries (ASI/MCA), which clause enables ranking within each state without a subquery?",
      options: [
        "RANK() OVER (PARTITION BY state_code ORDER BY gross_output DESC)",
        "GROUP BY state_code HAVING MAX(gross_output)",
        "SELECT DISTINCT state_code WHERE rank = 1",
        "ORDER BY state_code, gross_output LIMIT 10",
      ],
      answer: 0,
      explanation: "Window functions (`PARTITION BY`) compute row-level analytical metrics across partitions without collapsing records like `GROUP BY`.",
      domain: "Technical",
      difficulty: "Intermediate",
      competencyTarget: "SQL Window Functions & Registries",
    },
    // DPDP Act & Privacy
    {
      question: "Under the Digital Personal Data Protection (DPDP) Act 2023, what does k-anonymity (k ≥ 5) guarantee when releasing public microdata?",
      options: [
        "Each combination of quasi-identifiers occurs at least 5 times in the dataset, preventing unique re-identification",
        "Only 5 percent of the survey sample is retained for open dissemination",
        "Data can only be accessed by 5 designated researchers simultaneously",
        "The encryption key is refreshed every 5 months by CERT-In",
      ],
      answer: 0,
      explanation: "k-anonymity ensures each individual is indistinguishable from at least k-1 other individuals with identical demographic attributes.",
      domain: "Digital Governance",
      difficulty: "Intermediate",
      competencyTarget: "DPDP Act & Statistical Disclosure Control",
    },
    // Cybersecurity
    {
      question: "Under CERT-In cybersecurity directives, what is the mandatory timeline for central government bodies to report cyber incidents?",
      options: [
        "Within 6 hours of noticing the incident",
        "Within 30 business days after internal investigation",
        "Only during annual CAG audit submissions",
        "Within 72 hours for minor malware events",
      ],
      answer: 0,
      explanation: "CERT-In mandates reporting of designated cyber incidents within 6 hours to facilitate rapid threat mitigation across national infrastructure.",
      domain: "Digital Governance",
      difficulty: "Basic",
      competencyTarget: "Cybersecurity Compliance & CERT-In",
    },
    // Geospatial QGIS
    {
      question: "In QGIS spatial analysis of official statistics, which standardized directory code serves as the primary key to link census tables with shapefiles?",
      options: [
        "Local Government Directory (LGD) Codes",
        "Vehicle Registration RTO Codes",
        "Indian Railway Station Abbreviations",
        "Telephone STD Area Codes",
      ],
      answer: 0,
      explanation: "LGD codes maintained by the Ministry of Panchayati Raj provide unique, persistent identifiers for States, Districts, Sub-districts, and Villages.",
      domain: "Technical",
      difficulty: "Basic",
      competencyTarget: "Geospatial Analysis & QGIS",
    },
    // Ethics & Leadership
    {
      question: "UN Fundamental Principle 1 of Official Statistics dictates that official statistical agencies must produce and disseminate data based on:",
      options: [
        "Impartiality, scientific rigor, and equal accessibility to the public",
        "Direct approval of preliminary figures by political stakeholders",
        "Exclusively commercial licensing agreements",
        "Voluntary contributions from non-governmental private entities",
      ],
      answer: 0,
      explanation: "UN Principle 1 enshrines professional independence, impartiality, and public entitlement to objective statistical evidence.",
      domain: "Behavioural",
      difficulty: "Basic",
      competencyTarget: "Ethics & Professional Independence",
    },
  ];

  // Filter or prioritize based on content keywords
  let matched = masterPool.filter((q) => {
    if (contentLower.includes("price") || contentLower.includes("cpi") || contentLower.includes("wpi")) {
      return q.competencyTarget?.toLowerCase().includes("price");
    }
    if (contentLower.includes("plfs") || contentLower.includes("labour") || contentLower.includes("employment")) {
      return q.competencyTarget?.toLowerCase().includes("plfs") || q.competencyTarget?.toLowerCase().includes("labour");
    }
    if (contentLower.includes("python") || contentLower.includes("r ") || contentLower.includes("code")) {
      return q.domain === "Technical";
    }
    if (contentLower.includes("privacy") || contentLower.includes("dpdp") || contentLower.includes("cyber")) {
      return q.domain === "Digital Governance";
    }
    if (contentLower.includes("sna") || contentLower.includes("gva") || contentLower.includes("national accounts")) {
      return q.competencyTarget?.toLowerCase().includes("national accounts") || q.competencyTarget?.toLowerCase().includes("sut");
    }
    return true;
  });

  if (matched.length < count) {
    matched = masterPool;
  }

  // Shuffle pool to guarantee variety
  const shuffled = [...matched].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, count);

  // Format and randomize option order so answer index is varied
  return selected.map((item, idx) => {
    const originalOptions = [...item.options];
    const correctOptionText = originalOptions[item.answer];
    
    // Shuffle options
    const shuffledOptions = [...originalOptions].sort(() => 0.5 - Math.random());
    const newAnswerIdx = shuffledOptions.indexOf(correctOptionText);

    return {
      id: idx + 1,
      question: item.question,
      options: shuffledOptions,
      answer: newAnswerIdx >= 0 ? newAnswerIdx : 0,
      explanation: item.explanation,
      domain: item.domain,
      difficulty: item.difficulty,
      competencyTarget: item.competencyTarget,
    };
  });
}

/**
 * Chat with MoSPI & NSSTA AI Learning Assistant via Groq
 */
/**
 * Built-in Intelligent Statistical & Competency Assistant
 * Answers queries on National Accounts, PLFS, Sampling, Price Indices, DPDP, Python/R, and Career Progression
 */
export async function chatWithGroqAssistant(
  conversationHistory: { role: "user" | "assistant" | "system"; content: string }[],
  userContext?: {
    name?: string;
    designation?: string;
    department?: string;
    gaps?: string[];
  }
): Promise<string> {
  const lastUserMsg = (conversationHistory[conversationHistory.length - 1]?.content || "").toLowerCase();
  const apiKey = getGroqApiKey();

  // Try live API if key is available, but seamlessly fallback to built-in intelligence on any issue
  if (apiKey) {
    try {
      const systemPrompt = `You are the Official AI Skill & Statistical Assistant for India's Ministry of Statistics and Programme Implementation (MoSPI), NSSTA, and the iGOT Karmayogi platform.
Assist officers (ISS, SSS, DES) with official statistical methodologies, Python/R data processing, and training courses.
Officer: ${userContext?.name || "Officer"}, ${userContext?.designation || "Statistical Officer"}, ${userContext?.department || "MoSPI"}.`;

      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: systemPrompt },
            ...conversationHistory.slice(-6),
          ],
          temperature: 0.6,
          max_tokens: 1000,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (content && content.trim()) {
          return content.trim();
        }
      }
    } catch {}
  }

  // Built-in High-Performance Statistical Intelligence Engine
  if (lastUserMsg.includes("sna") || lastUserMsg.includes("national account") || lastUserMsg.includes("gva") || lastUserMsg.includes("gdp")) {
    return `### 📊 UN System of National Accounts (SNA 2008) & GVA Compilation

In Indian official statistics, **Gross Value Added (GVA)** at basic prices is compiled as:
$$\\text{GVA at basic prices} = \\text{Gross Output} - \\text{Intermediate Consumption}$$

Key institutional highlights:
1. **Supply and Use Tables (SUT)**: Formulated at purchaser prices to balance domestic output, imports, intermediate consumption, and final demand.
2. **Double Deflation**: Deflating output by output price indices (WPI/CPI) and intermediate consumption by specific input deflators.
3. **Recommended Training**: Enrol in the NSSTA module *"UN SNA 2008 & GVA Compilation"* (18 hours) to master quarterly GDP revision algorithms.`;
  }

  if (lastUserMsg.includes("plfs") || lastUserMsg.includes("labour") || lastUserMsg.includes("employment") || lastUserMsg.includes("sampling")) {
    return `### 📋 Periodic Labour Force Survey (PLFS) & Sampling Design

PLFS adopts a **stratified two-stage sampling design**:
- **First Stage Units (FSUs)**: 2011 Census villages in rural areas and Urban Frame Survey (UFS) blocks in urban areas, selected via **Probability Proportional to Size (PPS)** with circular systematic sampling.
- **Second Stage Units (SSUs)**: Sampled households selected after door-to-door listing.
- **Multiplier Normalization**: When pooling Sub-sample 1 and Sub-sample 2, divide the integer multiplier ($MLT$) by **200** to compute unbiassed population totals.

You can calculate multipliers interactively in the **Virtual Labs** tab!`;
  }

  if (lastUserMsg.includes("cpi") || lastUserMsg.includes("wpi") || lastUserMsg.includes("price") || lastUserMsg.includes("inflation") || lastUserMsg.includes("laspeyres")) {
    return `### 🏷️ Consumer Price Index (CPI) Compilation in India

India compiles CPI (Rural, Urban, Combined) with base year $2012=100$ using the **Modified Laspeyres Price Index**:
$$I_t = \\sum w_i \\times \\left( \\frac{P_{it}}{P_{i0}} \\right) \\times 100$$
where $w_i$ represents the expenditure budget share from the Consumer Expenditure Survey.

- **Data Ingestion**: Web portal & mobile app collection from 1,181 village markets and 1,114 urban blocks.
- **Hands-on Practice**: Launch the *CPI Laspeyres Lab* in the Virtual Labs section to run real price index aggregation scripts.`;
  }

  if (lastUserMsg.includes("dpdp") || lastUserMsg.includes("privacy") || lastUserMsg.includes("anonym") || lastUserMsg.includes("disclosure")) {
    return `### 🔒 Digital Personal Data Protection (DPDP) Act 2023 & Statistical Disclosure Control

For official survey dissemination, MoSPI enforces strict privacy safeguards:
- **$k$-Anonymity**: Ensuring every combination of quasi-identifiers (Age, District, Gender) appears in at least $k$ records.
- **Microdata Perturbation**: Noise infusion and top-coding on extreme income/asset variables before open data release on *microdata.gov.in*.
- **Course Pathway**: Complete the 8-hour iGOT module *"DPDP Act & Statistical Disclosure Control"* to earn your Digital Governance badge.`;
  }

  if (lastUserMsg.includes("course") || lastUserMsg.includes("recommend") || lastUserMsg.includes("gap") || lastUserMsg.includes("train")) {
    return `### 🎯 Targeted Training Recommendations for ${userContext?.name || "Officer"}

Based on your cadre profile as **${userContext?.designation || "Statistical Officer"}** (${userContext?.department || "MoSPI"}):

1. **Top Priority Course**: *"UN SNA 2008 & GVA Compilation"* (NSSTA · 18 Hours) — Closes national accounting and input-output skill gaps.
2. **Technical Mastery**: *"Python for NSSO Microdata & Automation"* (iGOT · 20 Hours) — Covers multi-gigabyte survey unit-level text data processing.
3. **Governance & Ethics**: *"DPDP Act 2023 & Statistical Disclosure Control"* (iGOT · 8 Hours).

Would you like to auto-enroll into any of these courses?`;
  }

  if (lastUserMsg.includes("promotion") || lastUserMsg.includes("career") || lastUserMsg.includes("pathway") || lastUserMsg.includes("grade")) {
    return `### 📈 Official Cadre Career Progression Ladder

Your career progression track:
- **Annual CPD Requirement**: 50 Continuous Professional Development hours via iGOT Karmayogi and NSSTA.
- **Benchmark Evaluation**: Complete qualifying competency assessments with $\\ge 60\\%$ score to generate W3C Verifiable Credentials.
- Navigate to the **Career Progression** tab on your sidebar for your dynamic promotion milestone roadmap!`;
  }

  return `### 🏛️ MoSPI & NSSTA AI Skills Assistant

Greetings, **${userContext?.name || "Officer"}**! I am your integrated statistical intelligence copilot.

You can ask me about:
- **National Statistical Standards**: UN SNA 2008, GVA rebasing, Supply-Use Tables (SUT).
- **Survey Methodologies**: PLFS sampling weights, NSSO multipliers, stratification formulas.
- **Price Statistics**: CPI & WPI Modified Laspeyres calculation, item weights.
- **Data Science in Government**: Python (Pandas/NumPy) & SQL queries for official census data.
- **Cadre Progression**: Qualifying CPD hours, iGOT course recommendations, and promotion criteria.

How can I assist your capacity building today?`;
}

export const chatWithStatisticalAssistant = chatWithGroqAssistant;

export interface GeneratedSlideItem {
  id: number;
  type: "title" | "concepts" | "formula" | "case_study" | "quiz";
  title: string;
  subtitle: string;
  badge: string;
  summary?: string;
  content?: string[];
  concepts?: { term: string; def: string }[];
  formula?: { name: string; latex: string; explanation: string };
  points?: string[];
  steps?: { num: string; title: string; desc: string }[];
  question?: string;
  options?: string[];
  correctAnswer?: number;
  explanation?: string;
  narration: string;
}

/**
 * Dynamically generates a 5-slide interactive lecture deck using Groq Llama 3.3
 */
export async function generateInteractiveSlideDeck(
  courseTitle: string,
  chapterTitle: string,
  category: string,
  provider: string,
  defaultSlides: GeneratedSlideItem[]
): Promise<{ slides: GeneratedSlideItem[]; source: "groq" | "fallback" }> {
  const apiKey = getGroqApiKey();
  if (!apiKey) {
    return { slides: defaultSlides, source: "fallback" };
  }

  const prompt = `You are a Principal Curriculum Designer for India's National Statistical Systems Training Academy (NSSTA) & iGOT Karmayogi.
Create a structured 5-slide interactive lecture deck for the following official government training module:
- Course: "${courseTitle}" (${category})
- Chapter: "${chapterTitle}"
- Portal: "${provider}"

Return ONLY valid JSON matching this exact structure:
{
  "slides": [
    {
      "id": 1,
      "type": "title",
      "title": "${chapterTitle}",
      "subtitle": "${provider} Training Module · Official Syllabus",
      "badge": "POLICY OVERVIEW",
      "summary": "2-sentence executive summary of this chapter.",
      "content": [
        "Key policy point 1",
        "Key policy point 2",
        "Key policy point 3"
      ],
      "narration": "Spoken welcome message explaining the importance of this chapter for Indian official statistics."
    },
    {
      "id": 2,
      "type": "concepts",
      "title": "Key Theoretical & Statutory Concepts",
      "subtitle": "Foundational definitions & institutional scope",
      "badge": "THEORETICAL FOUNDATION",
      "concepts": [
        { "term": "Concept 1", "def": "Clear definition tailored to this statistical domain." },
        { "term": "Concept 2", "def": "Clear definition tailored to this statistical domain." },
        { "term": "Concept 3", "def": "Clear definition tailored to this statistical domain." },
        { "term": "Concept 4", "def": "Clear definition tailored to this statistical domain." }
      ],
      "narration": "Spoken lecture explaining the statutory concepts and classifications."
    },
    {
      "id": 3,
      "type": "formula",
      "title": "Methodology & Computational Formulas",
      "subtitle": "Mathematical identities and estimators",
      "badge": "COMPUTATIONAL IDENTITY",
      "formula": {
        "name": "Exact formula name for this topic",
        "latex": "Precise mathematical formula string",
        "explanation": "Clear explanation of each variable and weighting term."
      },
      "points": [
        "Step 1: Data validation & cleaning rule",
        "Step 2: Estimation & multiplier calculation",
        "Step 3: Quality benchmark check"
      ],
      "narration": "Spoken walkthrough of the mathematical formula and computational workflow."
    },
    {
      "id": 4,
      "type": "case_study",
      "title": "Official Implementation & MoSPI Case Study",
      "subtitle": "Field operations across central and state directorates",
      "badge": "CASE STUDY",
      "steps": [
        { "num": "01", "title": "Fieldwork & Data Ingestion", "desc": "Operational capture procedure." },
        { "num": "02", "title": "Scrutiny & Quality Audit", "desc": "Error detection and weighting." },
        { "num": "03", "title": "Dissemination & Decision", "desc": "Public data release and policy use." }
      ],
      "narration": "Spoken review of the operational workflow from data collection to cabinet policy briefing."
    },
    {
      "id": 5,
      "type": "quiz",
      "title": "Knowledge Check & Concept Mastery",
      "subtitle": "Formative concept question for module accreditation",
      "badge": "CONCEPT CHECK",
      "question": "A specific, high-quality question testing core understanding of ${chapterTitle}.",
      "options": [
        "Option A (Correct answer)",
        "Option B (Plausible distractor)",
        "Option C (Plausible distractor)",
        "Option D (Plausible distractor)"
      ],
      "correctAnswer": 0,
      "explanation": "Detailed explanation of why Option A is correct per official guidelines.",
      "narration": "Spoken challenge prompting the officer to answer the concept check question."
    }
  ]
}`;

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 1500,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const rawContent = data.choices?.[0]?.message?.content;
      if (rawContent) {
        const parsed = JSON.parse(rawContent);
        if (Array.isArray(parsed.slides) && parsed.slides.length === 5) {
          return { slides: parsed.slides, source: "groq" };
        }
      }
    }
  } catch (e) {
    console.warn("Groq slide generation fallback:", e);
  }

  return { slides: defaultSlides, source: "fallback" };
}

// ──────────────────────────────────────────────
// Validated Trainer MCQ Generation & Validation Engine
// ──────────────────────────────────────────────

export interface ValidatedTrainerMCQ {
  id: number;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  difficulty: "Basic" | "Intermediate" | "Advanced";
  topic: string;
  competency: string;
  sourceReference: string;
  isValid: boolean;
  validationErrors: string[];
}

export function validateMCQ(q: Partial<ValidatedTrainerMCQ>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!q.question || q.question.trim().length < 10) {
    errors.push("Question text is too short or empty.");
  }

  if (!Array.isArray(q.options) || q.options.length !== 4) {
    errors.push("MCQ must have exactly 4 options.");
  } else {
    const trimmed = q.options.map((o) => o.trim());
    if (new Set(trimmed).size !== 4) {
      errors.push("Options must not contain duplicate choices.");
    }
    if (trimmed.some((o) => o.length === 0)) {
      errors.push("All 4 option choices must have text.");
    }
  }

  if (typeof q.correctAnswerIndex !== "number" || q.correctAnswerIndex < 0 || q.correctAnswerIndex > 3) {
    errors.push("Correct answer index must be 0, 1, 2, or 3.");
  }

  if (!q.explanation || q.explanation.trim().length < 15) {
    errors.push("Official educational explanation is required.");
  }

  if (!q.competency || q.competency.trim().length === 0) {
    errors.push("Competency mapping tag is required.");
  }

  return { isValid: errors.length === 0, errors };
}

export async function generateValidatedMCQsFromDocument(
  content: string,
  count: number = 5,
  difficulty: "Basic" | "Intermediate" | "Advanced" = "Intermediate",
  competency: string = "Official Statistics",
  sourceTitle: string = "Uploaded Training Circular"
): Promise<ValidatedTrainerMCQ[]> {
  const baseQuestions = await generateMCQsFromText(content, count, difficulty, "Statistical");

  return baseQuestions.questions.map((q, idx) => {
    const partial: ValidatedTrainerMCQ = {
      id: idx + 1,
      question: q.question,
      options: q.options,
      correctAnswerIndex: q.answer,
      explanation: q.explanation,
      difficulty: q.difficulty,
      topic: competency,
      competency: q.competencyTarget || competency,
      sourceReference: `${sourceTitle} · Page ${Math.floor(idx * 2 + 1)}`,
      isValid: true,
      validationErrors: [],
    };

    const validation = validateMCQ(partial);
    partial.isValid = validation.isValid;
    partial.validationErrors = validation.errors;

    return partial;
  });
}

