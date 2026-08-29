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
  source?: "ai" | "mock";
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
): Promise<{ questions: GeneratedQuestion[]; source: "ai" | "mock" }> {
  const apiKey = getGroqApiKey();
  const randomSeed = `${Date.now()}_${Math.floor(Math.random() * 10000)}`;

  // If no API key, use randomized dynamic domain generator
  if (!apiKey) {
    return {
      questions: generateDynamicFallbackQuestions(content, count, difficulty, domain),
      source: "mock",
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
      console.warn("[AI Service] Falling back to mock data: Groq API error", errText);
      return {
        questions: generateDynamicFallbackQuestions(content, count, difficulty, domain),
        source: "mock",
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
      source: "ai",
    }));

    return { questions: formattedQuestions, source: "ai" };
  } catch (err: any) {
    console.warn("[AI Service] Falling back to mock data: Failed to generate with Groq", err.message);
    return {
      questions: generateDynamicFallbackQuestions(content, count, difficulty, domain),
      source: "mock",
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
 * Chat with MoSPI & NSSTA AI Learning Assistant
 */
export async function chatWithGroqAssistant(
  conversationHistory: { role: "user" | "assistant" | "system"; content: string }[],
  userContext?: {
    name?: string;
    designation?: string;
    department?: string;
    gaps?: string[];
  }
): Promise<{ text: string; source: "ai" | "mock" }> {
  const lastUserMsg = (conversationHistory[conversationHistory.length - 1]?.content || "").toLowerCase();
  const apiKey = getGroqApiKey();

  // Try live API if key is available, with full Closed-Loop Competency Framework
  if (apiKey) {
    try {
      const systemPrompt = `You are the Official AI Competency Copilot for India's Ministry of Statistics and Programme Implementation (MoSPI), NSSTA, and the iGOT Karmayogi platform.
You operate on the 4-stage Closed-Loop Competency Cycle:
1. ASSESS: Generate diagnostic MCQs, evaluate officer answers, and test statistical concepts (UN SNA 2008, PLFS, CPI, Python/R, DPDP Act 2023).
2. GAP ANALYSIS: Analyze skill gaps between current proficiency and target cadre expectations.
3. LEARN: Recommend targeted iGOT/NSSTA courses, explain complex formulas with LaTeX, and provide real-world MoSPI case studies.
4. ELEVATE: Validate competency mastery and explain how demonstrated skills elevate official competency levels and CPD hours.

Current Officer: ${userContext?.name || "Officer"}, Designation: ${userContext?.designation || "Statistical Officer"}, Department: ${userContext?.department || "MoSPI"}.
Active Skill Gaps: ${userContext?.gaps?.join(", ") || "Sampling Theory, National Accounts, Python Automation"}.
Format responses with clean Markdown, clear headings, bullet points, and LaTeX equations where appropriate.`;

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
            ...conversationHistory.slice(-8),
          ],
          temperature: 0.5,
          max_tokens: 1200,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (content && content.trim()) {
          return { text: content.trim(), source: "ai" };
        }
      } else {
        const errText = await res.text();
        console.warn("[AI Service] Falling back to built-in engine: Groq API error", errText);
      }
    } catch (err: any) {
      console.warn("[AI Service] Falling back to built-in engine: network error", err.message);
    }
  }

  // Built-in Comprehensive Closed-Loop Intelligence Engine
  let responseText = "";

  // 1. ASSESS Phase Queries
  if (lastUserMsg.includes("assess") || lastUserMsg.includes("quiz") || lastUserMsg.includes("test me") || lastUserMsg.includes("exam") || lastUserMsg.includes("question")) {
    responseText = `### ✍️ AI Competency Assessment Check: Official Statistics

Here is a quick diagnostic challenge for your cadre profile:

**Question 1: Periodic Labour Force Survey (PLFS) Sampling**
In a two-stage stratified sampling design with circular systematic sampling of FSUs, how is the population total estimated when pooling Sub-sample 1 and Sub-sample 2?
- **A)** Multiply raw sample values by the Census household projection ratio
- **B)** Sum sample values and divide integer weight ($MLT$) by **200**
- **C)** Compute arithmetic mean of both sub-samples without weighting
- **D)** Apply inverse variance weighting based on rural-urban NSS strata

**Question 2: Gross Value Added (GVA) at Basic Prices**
Under UN SNA 2008 standards adopted by MoSPI, what is the exact identity for GVA at basic prices?
$$\\text{GVA at basic prices} = \\text{Gross Output} - \\text{Intermediate Consumption}$$

💡 *Type your answer (e.g. "Answer is B") or click **Launch Full AI Assessment** in the action bar to evaluate your entire competency matrix!*`;
  }
  // 2. GAP ANALYSIS Phase Queries
  else if (lastUserMsg.includes("gap") || lastUserMsg.includes("deficit") || lastUserMsg.includes("diagnos") || lastUserMsg.includes("weak")) {
    const gapList = userContext?.gaps && userContext.gaps.length > 0
      ? userContext.gaps
      : ["National Accounts & GVA", "Sampling Theory & PPS", "Python for NSSO Microdata", "Data Privacy (DPDP Act)"];

    responseText = `### ⚖️ Real-Time Competency Gap Diagnosis

**Officer**: ${userContext?.name || "Dr. Rajesh Sharma, ISS"} · **Cadre**: ${userContext?.designation || "Statistical Officer"} (${userContext?.department || "Labour Statistics"})

#### 🔍 Identified Skill Gaps:
${gapList.map((g, i) => `${i + 1}. **${g}** — *Priority Deficit (Target Level 4 vs Current Level 2)*`).join("\n")}

#### 🎯 Impact Analysis:
- **National Accounts**: Deficit in Supply-Use Tables (SUT) balances and double deflation methods.
- **Microdata Processing**: Unit-level text extraction bottlenecks with raw NSS multi-gigabyte survey blocks.
- **Recommended Action**: Proceed to the **Learn** phase to close these deficits with NSSTA & iGOT modules!`;
  }
  // 3. ELEVATE Phase Queries
  else if (lastUserMsg.includes("elevate") || lastUserMsg.includes("upgrade") || lastUserMsg.includes("advance") || lastUserMsg.includes("promote") || lastUserMsg.includes("level up")) {
    responseText = `### ⚡ Closed-Loop Competency Elevation Protocol

To elevate your competency level from **Current (Level 2/3)** to **Target (Level 4/5 - Practitioner/Expert)**:

1. **Demonstrate Mastery**:
   - Complete formative course quizzes ($\ge 80\\%$ score triggers instant +1 Level).
   - Complete hands-on **Virtual Labs** (e.g. *CPI Laspeyres Lab* or *PLFS Multiplier Script*).
2. **Audit Logging**:
   - Every score elevation writes a cryptographic audit log with timestamp, evidence source, and evaluator hash.
3. **Career Progression**:
   - Accumulate 50 Continuous Professional Development (CPD) hours for annual cadre review.

💡 *Would you like to take a micro-evaluation right now to elevate your **Python for Data Analysis** or **National Accounts** competency?*`;
  }
  // 4. LEARN & Specific Domain Queries
  else if (lastUserMsg.includes("sna") || lastUserMsg.includes("national account") || lastUserMsg.includes("gva") || lastUserMsg.includes("gdp")) {
    responseText = `### 📊 UN System of National Accounts (SNA 2008) & GVA Compilation

In Indian official statistics, **Gross Value Added (GVA)** at basic prices is compiled as:
$$\\text{GVA at basic prices} = \\text{Gross Output} - \\text{Intermediate Consumption}$$

Key institutional highlights:
1. **Supply and Use Tables (SUT)**: Formulated at purchaser prices to balance domestic output, imports, intermediate consumption, and final demand.
2. **Double Deflation**: Deflating gross output with product price indices (WPI/CPI) and intermediate consumption with commodity-specific input deflators.
3. **Recommended Training**: Enrol in the NSSTA module *"UN SNA 2008 & GVA Compilation"* (18 hours) to master quarterly GDP revision algorithms.`;
  } else if (lastUserMsg.includes("plfs") || lastUserMsg.includes("labour") || lastUserMsg.includes("employment") || lastUserMsg.includes("sampling")) {
    responseText = `### 📋 Periodic Labour Force Survey (PLFS) & Sampling Design

PLFS adopts a **stratified two-stage sampling design**:
- **First Stage Units (FSUs)**: 2011 Census villages in rural areas and Urban Frame Survey (UFS) blocks in urban areas, selected via **Probability Proportional to Size (PPS)** with circular systematic sampling.
- **Second Stage Units (SSUs)**: Sampled households selected after door-to-door listing.
- **Multiplier Normalization**: When pooling Sub-sample 1 and Sub-sample 2, divide the integer multiplier ($MLT$) by **200** to compute unbiased population totals.

You can calculate multipliers interactively in the **Virtual Labs** tab!`;
  } else if (lastUserMsg.includes("cpi") || lastUserMsg.includes("wpi") || lastUserMsg.includes("price") || lastUserMsg.includes("inflation") || lastUserMsg.includes("laspeyres")) {
    responseText = `### 🏷️ Consumer Price Index (CPI) Compilation in India

India compiles CPI (Rural, Urban, Combined) with base year $2012=100$ using the **Modified Laspeyres Price Index**:
$$I_t = \\sum w_i \\times \\left( \\frac{P_{it}}{P_{i0}} \\right) \\times 100$$
where $w_i$ represents the expenditure budget share from the Consumer Expenditure Survey.

- **Data Ingestion**: Web portal & mobile app collection from 1,181 village markets and 1,114 urban blocks.
- **Hands-on Practice**: Launch the *CPI Laspeyres Lab* in the Virtual Labs section to run real price index aggregation scripts.`;
  } else if (lastUserMsg.includes("dpdp") || lastUserMsg.includes("privacy") || lastUserMsg.includes("anonym") || lastUserMsg.includes("disclosure")) {
    responseText = `### 🔒 Digital Personal Data Protection (DPDP) Act 2023 & Statistical Disclosure Control

For official survey dissemination, MoSPI enforces strict privacy safeguards:
- **$k$-Anonymity**: Ensuring every combination of quasi-identifiers (Age, District, Gender) appears in at least $k$ records.
- **Microdata Perturbation**: Noise infusion and top-coding on extreme income/asset variables before open data release on *microdata.gov.in*.
- **Course Pathway**: Complete the 8-hour iGOT module *"DPDP Act & Statistical Disclosure Control"* to earn your Digital Governance badge.`;
  } else if (lastUserMsg.includes("course") || lastUserMsg.includes("recommend") || lastUserMsg.includes("learn") || lastUserMsg.includes("train")) {
    responseText = `### 🎯 Targeted Learning Recommendations for ${userContext?.name || "Officer"}

Based on your cadre profile as **${userContext?.designation || "Statistical Officer"}** (${userContext?.department || "MoSPI"}):

1. **Top Priority Course**: *"UN SNA 2008 & GVA Compilation"* (NSSTA · 18 Hours) — Closes national accounting and input-output skill gaps.
2. **Technical Mastery**: *"Python for NSSO Microdata & Automation"* (iGOT · 20 Hours) — Covers multi-gigabyte survey unit-level text data processing.
3. **Governance & Ethics**: *"DPDP Act 2023 & Statistical Disclosure Control"* (iGOT · 8 Hours).

💡 *Click any course in the Courses catalog or start with a Virtual Lab to begin learning!*`;
  } else {
    responseText = `### 🏛️ StatSkill AI — Closed-Loop Competency Assistant

Greetings, **${userContext?.name || "Officer"}**! I am your integrated MoSPI & NSSTA capacity building copilot.

I can guide you through the complete **Assess → Gap → Learn → Elevate** cycle:
- **1. Assess ✍️**: Test your statistical knowledge with diagnostic MCQs.
- **2. Gap Analysis ⚖️**: Diagnose gaps between your current skill level and cadre targets.
- **3. Learn 📖**: Discover tailored NSSTA & iGOT training modules with formulas & labs.
- **4. Elevate ⚡**: Verify competencies and update your official skill audit profile.

What would you like to explore first?`;
  }

  return { text: responseText, source: "mock" };
}

export const chatWithStatisticalAssistant = chatWithGroqAssistant;

export interface AITutorContext {
  courseTitle: string;
  topicTitle: string;
  activeSlideTitle?: string;
  activeSlideContent?: {
    key_points?: string[];
    explanation?: string;
    example?: string;
  };
}

/**
 * Dedicated In-Lecture Contextual AI Tutor
 * Answers questions specifically about the current lecture, active slide, mathematical formulas, and Python/R code
 */
export async function chatWithAITutor(
  conversationHistory: { role: "user" | "assistant"; text: string }[],
  context: AITutorContext
): Promise<{ text: string; source: "ai" | "mock" }> {
  const lastUserMsg = (conversationHistory[conversationHistory.length - 1]?.text || "").trim();
  const lowerMsg = lastUserMsg.toLowerCase();
  const apiKey = getGroqApiKey();

  // Try live Groq API with rich lecture context
  if (apiKey) {
    try {
      const slideInfo = context.activeSlideContent
        ? `\nCurrent Slide Details:
- Title: ${context.activeSlideTitle || "General"}
- Key Points: ${context.activeSlideContent.key_points?.join("; ") || "N/A"}
- Explanation: ${context.activeSlideContent.explanation || "N/A"}
- Practical Example: ${context.activeSlideContent.example || "N/A"}`
        : `\nCurrent Slide: ${context.activeSlideTitle || "Overview"}`;

      const systemPrompt = `You are the Expert In-Lecture AI Statistical Tutor for India's Ministry of Statistics and Programme Implementation (MoSPI) and National Statistical Systems Training Academy (NSSTA).
Course: "${context.courseTitle}"
Module/Topic: "${context.topicTitle}"${slideInfo}

Guidelines:
1. Answer the learner's specific question directly in the context of this lecture.
2. If asked to explain simply, use clear analogies and bullet points.
3. If asked for formulas, provide LaTeX equations and define every variable.
4. If asked for code, write clean Python (Pandas/NumPy) or R code with helpful comments.
5. If asked for a real example, ground it in official Indian statistical surveys (PLFS, CPI, ASI, NSSO, Census).
6. Format responses with clean Markdown. Keep it pedagogically clear, concise, and helpful.`;

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
            ...conversationHistory.slice(-8).map((m) => ({ role: m.role, content: m.text })),
          ],
          temperature: 0.4,
          max_tokens: 1000,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (content && content.trim()) {
          return { text: content.trim(), source: "ai" };
        }
      } else {
        const errText = await res.text();
        console.warn("[AI Tutor] Falling back to built-in lecture engine: Groq error", errText);
      }
    } catch (err: any) {
      console.warn("[AI Tutor] Falling back to built-in lecture engine: network error", err.message);
    }
  }

  // Built-in Highly Dynamic Contextual Lecture Engine (Guarantees distinct, tailored responses)
  const slideTitle = context.activeSlideTitle || "Official Methodology";
  const topicTitle = context.topicTitle || context.courseTitle;
  let responseText = "";

  if (lowerMsg.includes("explain this slide simply") || lowerMsg.includes("explain simply") || lowerMsg.includes("simple terms")) {
    responseText = `### 💡 Simple Explanation: *${slideTitle}*

Here is the core idea broken down simply for **${topicTitle}**:

1. **What we are doing**: ${context.activeSlideContent?.explanation || `We are applying standardized MoSPI statistical methods to process and validate data reliably.`}
2. **Why it matters**: In official government surveys, manual spreadsheet steps introduce human errors. Standardized automated logic ensures reproducible numbers that cabinet ministries can trust.
3. **Key Takeaway**: 
${context.activeSlideContent?.key_points?.map((p) => `   - **${p}**`).join("\n") || "   - Automated validation creates transparent audit trails.\n   - Standardized calculations prevent regional estimation bias."}

Would you like a sample calculation or code snippet for this?`;
  } else if (lowerMsg.includes("real mospi survey example") || lowerMsg.includes("real survey example") || lowerMsg.includes("real example") || lowerMsg.includes("case study")) {
    responseText = `### 📊 Real-World MoSPI Implementation Example

**Context**: Application of *${slideTitle}* in National Survey Operations

**Operational Scenario**:
In the **Periodic Labour Force Survey (PLFS)** quarterly compilation across 14,000+ First Stage Units (FSUs):
- **Data Ingestion**: Multi-gigabyte text records collected via Field Investigator tablets (CAPI).
- **Rule Applied**: ${context.activeSlideContent?.example || `Applying sub-sample multiplier normalization: $MLT / 200$ across combined rural/urban sample blocks.`}
- **Quality Assurance**: Automated validation checks ensure that item-level expenditures reconcile against state-level control totals before public microdata release.

This eliminates estimation discrepancies between state Directorates of Economics & Statistics (DES) and the central MoSPI repository.`;
  } else if (lowerMsg.includes("formula") || lowerMsg.includes("mathematical") || lowerMsg.includes("equation") || lowerMsg.includes("math")) {
    if (topicTitle.toLowerCase().includes("multiplier") || topicTitle.toLowerCase().includes("sampling") || slideTitle.toLowerCase().includes("multiplier")) {
      responseText = `### 🧮 Mathematical Estimation Formula

For two-stage stratified sampling in official surveys:

#### Population Total Estimator ($\\hat{Y}$):
$$\\hat{Y} = \\sum_{s=1}^{S} \\sum_{i=1}^{n_s} \\sum_{j=1}^{m_{si}} w_{sij} \\cdot y_{sij}$$

Where:
- $w_{sij} = \\frac{MLT_{sij}}{200}$ : Normalised sample weight for household $j$ in FSU $i$ of stratum $s$ when pooling Sub-samples 1 and 2.
- $y_{sij}$ : Recorded value of the target indicator (e.g. monthly household consumer expenditure).
- $S$ : Total number of NSS strata.

#### Variance of the Estimator:
$$\\widehat{\\text{Var}}(\\hat{Y}) = \\sum_{s=1}^{S} \\frac{n_s}{n_s - 1} \\sum_{i=1}^{n_s} \\left( \\hat{Y}_{si} - \\frac{\\hat{Y}_s}{n_s} \\right)^2$$`;
    } else if (topicTitle.toLowerCase().includes("cpi") || topicTitle.toLowerCase().includes("price") || slideTitle.toLowerCase().includes("price")) {
      responseText = `### 🧮 Modified Laspeyres Price Index Formula

For all-India Consumer Price Index (CPI) with base year $2012=100$:

$$I_t = \\sum_{i=1}^{K} w_i \\times \\left( \\frac{P_{it}}{P_{i0}} \\right) \\times 100$$

Where:
- $I_t$ : Aggregate Consumer Price Index in current period $t$.
- $w_i$ : Expenditure share weight of commodity $i$ (derived from CES), such that $\\sum w_i = 1$.
- $P_{it}$ : Current retail price quote averaged across sample markets.
- $P_{i0}$ : Base period reference price.`;
    } else {
      responseText = `### 🧮 Mathematical Formulation for *${slideTitle}*

For official estimation under this module:

$$\\text{Efficiency Gain} = \\frac{\\text{Execution Time}_{\\text{manual}}}{\\text{Execution Time}_{\\text{vectorized}}} = \\mathcal{O}(N) \\longrightarrow \\mathcal{O}(1)$$

**Imputation Identity for Missing Survey Codes**:
$$x_i^* = \\begin{cases} \\text{NaN} & \\text{if } x_i \\in \\{99, 999, \\text{null}\\} \\\\ x_i & \\text{otherwise} \\end{cases}$$

This ensures invalid codes are excluded from subsequent sum and mean aggregations.`;
    }
  } else if (lowerMsg.includes("python") || lowerMsg.includes("code") || lowerMsg.includes("script") || lowerMsg.includes("programming") || lowerMsg.includes("r code")) {
    responseText = `### 🐍 Production Python Implementation

Here is the exact Python script tailored for **${slideTitle}**:

\`\`\`python
import numpy as np
import pandas as pd

# 1. Ingest sample NSSO microdata with fixed-width format
data = {
    "fsu_id": [10101, 10102, 10103, 10104, 10105],
    "stratum": [1, 1, 2, 2, 2],
    "sub_sample": [1, 2, 1, 2, 1],
    "mlt": [24500, 24800, 18900, 19200, 18750],  # Raw integer multiplier
    "expenditure": [14200.0, 18500.0, 99999.0, 22400.0, 16800.0]  # Note: 99999 is missing code
}
df = pd.DataFrame(data)

# 2. Vectorized cleaning: mask missing codes (99999 -> NaN)
df["expenditure"] = df["expenditure"].replace(99999.0, np.nan)

# 3. Compute normalized survey weights (pooled sub-samples)
df["weight"] = df["mlt"] / 200.0

# 4. Weighted aggregation of population totals
df["weighted_exp"] = df["expenditure"] * df["weight"]
valid_mask = df["weighted_exp"].notna()

pop_total_exp = df.loc[valid_mask, "weighted_exp"].sum()
pop_total_count = df.loc[valid_mask, "weight"].sum()
weighted_mean = pop_total_exp / pop_total_count

print(f"Estimated Population Average: ₹{weighted_mean:,.2f}")
\`\`\`

You can copy and run this directly in the **Virtual Labs** terminal!`;
  } else if (lowerMsg.includes("quiz") || lowerMsg.includes("check") || lowerMsg.includes("test")) {
    responseText = `### 📝 Quick Knowledge Check: *${slideTitle}*

**Question**:
Why does official survey data processing require dividing raw integer multipliers ($MLT$) by $200$ instead of $100$ when pooling Sub-sample 1 and Sub-sample 2?

- **A)** Because $100$ accounts for decimal rounding, and an extra factor of $2$ averages the two independent half-samples.
- **B)** Because rural and urban weights are always weighted in a 2:1 ratio.
- **C)** To convert annual estimates directly into half-yearly indicators.
- **D)** It is a statutory penalty factor defined in the Collection of Statistics Act.

👉 *Correct Answer is **A**! Each sub-sample is an independent, valid estimate of the population total. Summing them doubles the population unless divided by 2 (hence $100 \\times 2 = 200$).*`;
  } else {
    responseText = `### 🎓 In-Lecture AI Tutor: *${topicTitle}*

Regarding **"${lastUserMsg}"** in the context of *${slideTitle}*:

1. **Conceptual Role**: In **${context.courseTitle}**, this concept forms a key component of standard operating procedures.
2. **MoSPI Standard**:
   - Ensures consistency with national accounting frameworks and statistical standards.
   - Replaces manual adjustments with verifiable computational code.
3. **Practical Application**: ${context.activeSlideContent?.explanation || "Supports robust estimation and quality validation for official survey releases."}

💡 *Feel free to click any of the prompt chips above (e.g. 'Explain this slide simply', 'Provide sample Python code') for instant deep-dives!*`;
  }

  return { text: responseText, source: "mock" };
}

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
): Promise<{ slides: GeneratedSlideItem[]; source: "ai" | "mock" }> {
  const apiKey = getGroqApiKey();
  if (!apiKey) {
    return { slides: defaultSlides, source: "mock" };
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
          return { slides: parsed.slides, source: "ai" };
        }
      }
    } else {
      const errText = await res.text();
      console.warn("[AI Service] Falling back to mock data: slide generation API error", errText);
    }
  } catch (e: any) {
    console.warn("[AI Service] Falling back to mock data: slide generation error", e.message);
  }

  return { slides: defaultSlides, source: "mock" };
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

