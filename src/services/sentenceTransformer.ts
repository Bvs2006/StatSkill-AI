// ──────────────────────────────────────────────
// In-Browser Sentence Transformer & Vector Similarity Engine
// ──────────────────────────────────────────────
// Uses client-side embeddings (Transformers.js / all-MiniLM-L6-v2)
// with zero API keys, running 100% in browser WebAssembly
// ──────────────────────────────────────────────

import { type CourseItem } from "./storageService";

export interface SemanticMatchResult {
  course: CourseItem;
  similarityScore: number; // 0.0 to 1.0 (percentage)
  matchedKeywords: string[];
}

let embeddingPipelinePromise: Promise<any> | null = null;

/**
 * Initialize or load Transformers.js pipeline dynamically from CDN
 */
export async function getEmbeddingPipeline(): Promise<any> {
  if (typeof window === "undefined") return null;

  if (!embeddingPipelinePromise) {
    embeddingPipelinePromise = (async () => {
      try {
        // Dynamically import Transformers.js from ESM CDN
        const { pipeline, env } = await import(
          /* @vite-ignore */ "https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/transformers.min.js"
        );

        // Configure environment for browser
        env.allowLocalModels = false;
        env.useBrowserCache = true;

        // Load quantized all-MiniLM-L6-v2 (compact 22MB vector model)
        const extractor = await pipeline(
          "feature-extraction",
          "Xenova/all-MiniLM-L6-v2",
          { quantized: true }
        );
        return extractor;
      } catch (err) {
        console.warn("Transformers.js pipeline initialization warning, using high-speed TF-IDF subword vector fallback:", err);
        return null;
      }
    })();
  }

  return embeddingPipelinePromise;
}

/**
 * Compute dense embedding vector for text
 */
export async function computeEmbedding(text: string): Promise<number[]> {
  try {
    const extractor = await getEmbeddingPipeline();
    if (extractor) {
      const output = await extractor(text, { pooling: "mean", normalize: true });
      return Array.from(output.data);
    }
  } catch (e) {
    console.warn("Vector extraction fallback:", e);
  }

  // Fast mathematical subword embedding fallback
  return computeLightweightVector(text);
}

/**
 * Calculate Cosine Similarity between two vectors: (A · B) / (||A|| * ||B||)
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA.length || !vecB.length || vecA.length !== vecB.length) {
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  return Math.max(0, Math.min(1, similarity));
}

/**
 * High-speed mathematical subword dense vector generator for zero-latency offline matching
 */
function computeLightweightVector(text: string, dimensions: number = 64): number[] {
  const clean = text.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
  const tokens = clean.split(/\s+/).filter(Boolean);
  const vector = new Array(dimensions).fill(0);

  if (tokens.length === 0) return vector;

  tokens.forEach((token, idx) => {
    // Generate hash distribution across dimensions
    let hash = 0;
    for (let i = 0; i < token.length; i++) {
      hash = (hash << 5) - hash + token.charCodeAt(i);
      hash |= 0;
    }
    const bucket = Math.abs(hash) % dimensions;
    // Weight earlier tokens and specific domain words higher
    const weight = 1.0 + (tokens.length - idx) / tokens.length;
    vector[bucket] += weight;

    // Check 3-gram subwords
    if (token.length >= 3) {
      for (let s = 0; s <= token.length - 3; s++) {
        const sub = token.slice(s, s + 3);
        let subHash = 0;
        for (let j = 0; j < sub.length; j++) {
          subHash = (subHash << 3) + sub.charCodeAt(j);
        }
        vector[Math.abs(subHash) % dimensions] += 0.3;
      }
    }
  });

  // L2 Normalize
  const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  if (norm > 0) {
    for (let i = 0; i < dimensions; i++) {
      vector[i] /= norm;
    }
  }

  return vector;
}

/**
 * Perform Semantic Vector Search on iGOT / NSSTA Course Catalog
 */
export async function semanticSearchCourses(
  query: string,
  courses: CourseItem[],
  minThreshold: number = 0.25
): Promise<SemanticMatchResult[]> {
  if (!query.trim() || courses.length === 0) {
    return courses.map((c) => ({
      course: c,
      similarityScore: 1.0,
      matchedKeywords: [],
    }));
  }

  const queryVector = await computeEmbedding(query);

  const results: SemanticMatchResult[] = [];

  for (const course of courses) {
    const courseContent = `${course.title} ${course.category} ${course.competencyTarget} ${course.description}`;
    const courseVector = await computeEmbedding(courseContent);
    const score = cosineSimilarity(queryVector, courseVector);

    // Extract overlapping domain keywords
    const qWords = query.toLowerCase().split(/\s+/);
    const matched = qWords.filter(
      (w) => w.length > 3 && courseContent.toLowerCase().includes(w)
    );

    results.push({
      course,
      similarityScore: Math.round(score * 100) / 100,
      matchedKeywords: matched,
    });
  }

  // Sort descending by semantic similarity score
  return results
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .filter((r) => r.similarityScore >= minThreshold || r.matchedKeywords.length > 0);
}

/**
 * Match Active Competency Gaps to Recommended Courses using Vector Similarity
 */
export async function matchCompetencyGapsToCourses(
  gaps: { skill: string; gap: number }[],
  courses: CourseItem[]
): Promise<{ course: CourseItem; matchedSkill: string; similarityScore: number }[]> {
  if (!gaps.length || !courses.length) return [];

  const matchedList: { course: CourseItem; matchedSkill: string; similarityScore: number }[] = [];

  for (const g of gaps) {
    const skillVector = await computeEmbedding(g.skill);

    for (const course of courses) {
      const courseVector = await computeEmbedding(
        `${course.competencyTarget} ${course.title} ${course.description}`
      );
      const score = cosineSimilarity(skillVector, courseVector);

      if (score >= 0.35) {
        matchedList.push({
          course,
          matchedSkill: g.skill,
          similarityScore: score,
        });
      }
    }
  }

  // Deduplicate by course ID taking highest score
  const uniqueMap = new Map<string, { course: CourseItem; matchedSkill: string; similarityScore: number }>();
  for (const item of matchedList) {
    const existing = uniqueMap.get(item.course.id);
    if (!existing || item.similarityScore > existing.similarityScore) {
      uniqueMap.set(item.course.id, item);
    }
  }

  return Array.from(uniqueMap.values()).sort((a, b) => b.similarityScore - a.similarityScore);
}

/**
 * RAG Chunking: Extract most relevant document chunks based on domain query
 */
export async function extractRelevantChunksForRAG(
  documentText: string,
  targetDomain: string,
  topChunks: number = 3
): Promise<string> {
  // Split document into paragraphs / semantic chunks
  const paragraphs = documentText
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 60);

  if (paragraphs.length <= topChunks) {
    return documentText.slice(0, 6000);
  }

  const queryVector = await computeEmbedding(
    `${targetDomain} official statistics sampling survey methodology guidelines definitions calculation formula`
  );

  const scoredChunks: { chunk: string; score: number }[] = [];

  for (const chunk of paragraphs) {
    const chunkVector = await computeEmbedding(chunk);
    const score = cosineSimilarity(queryVector, chunkVector);
    scoredChunks.push({ chunk, score });
  }

  scoredChunks.sort((a, b) => b.score - a.score);

  return scoredChunks
    .slice(0, topChunks)
    .map((s) => s.chunk)
    .join("\n\n---\n\n");
}
