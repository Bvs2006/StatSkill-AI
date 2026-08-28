import { useState, useEffect, useRef } from "react";
import { runPythonCode, runSqlQuery, type ExecutionResult } from "../services/pyodideRunner";

export interface LabExercise {
  id: string;
  title: string;
  domain: string;
  language: "python" | "sql" | "r";
  difficulty: "Basic" | "Intermediate" | "Advanced";
  instructions: string;
  initialCode: string;
  solutionHint: string;
  sampleData?: string;
}

export const OFFICIAL_LAB_EXERCISES: LabExercise[] = [
  {
    id: "lab-cpi",
    title: "Consumer Price Index (CPI) Laspeyres Calculation",
    domain: "Official Statistics & Price Indices",
    language: "python",
    difficulty: "Intermediate",
    instructions: "Compute the all-India weighted Consumer Price Index (CPI) using the Modified Laspeyres Index formula over 6 commodity groups.",
    initialCode: `# Official Statistics Lab: CPI Compilation
# Modified Laspeyres: CPI = sum(Weight_i * (Current_Price_i / Base_Price_i)) / sum(Weight_i) * 100

commodity_groups = [
    {"name": "Food & Beverages", "weight": 45.86, "base_price": 100.0, "current_price": 118.50},
    {"name": "Pan & Tobacco", "weight": 2.38, "base_price": 100.0, "current_price": 112.00},
    {"name": "Clothing & Footwear", "weight": 6.53, "base_price": 100.0, "current_price": 115.20},
    {"name": "Housing", "weight": 10.07, "base_price": 100.0, "current_price": 121.40},
    {"name": "Fuel & Light", "weight": 6.84, "base_price": 100.0, "current_price": 108.90},
    {"name": "Miscellaneous", "weight": 28.32, "base_price": 100.0, "current_price": 116.80},
]

total_weighted_relatives = sum(
    item["weight"] * (item["current_price"] / item["base_price"])
    for item in commodity_groups
)
total_weight = sum(item["weight"] for item in commodity_groups)

cpi_combined = (total_weighted_relatives / total_weight) * 100
inflation_rate = cpi_combined - 100.0

print("═══════════════════════════════════════════════════")
print("  NATIONAL CONSUMER PRICE INDEX (CPI) COMPILATION  ")
print("═══════════════════════════════════════════════════")
print(f"Total Base Basket Weight : {total_weight:.2f}")
print(f"Current Period CPI Index : {cpi_combined:.2f}")
print(f"Year-over-Year Inflation : {inflation_rate:.2f}%")
`,
    solutionHint: "Formula: I_CPI = sum(W_i * (P_t / P_0)) / sum(W_i) * 100. Check that item weights sum to exactly 100.0.",
    sampleData: `Commodity_Group,Weight_Share,Base_Price_2012,Current_Price_2026
Food & Beverages,45.86,100.00,118.50
Pan & Tobacco,2.38,100.00,112.00
Clothing & Footwear,6.53,100.00,115.20
Housing,10.07,100.00,121.40
Fuel & Light,6.84,100.00,108.90
Miscellaneous,28.32,100.00,116.80`,
  },
  {
    id: "lab-plfs-weights",
    title: "NSSO Multi-Stage Survey Weight Multipliers",
    domain: "Survey Sampling & PLFS",
    language: "python",
    difficulty: "Advanced",
    instructions: "Apply NSSO sampling multipliers (Multiplier/100 or /200) to estimate total rural employed population from sample records.",
    initialCode: `# PLFS Microdata Estimation Lab
# Sample microdata record structure: (Household_ID, Stratum, Multiplier, Persons_Employed)

sample_records = [
    {"hh_id": "01001", "stratum": "Rural-Punjab", "multiplier": 24000, "employed_count": 3},
    {"hh_id": "01002", "stratum": "Rural-Punjab", "multiplier": 24000, "employed_count": 2},
    {"hh_id": "02001", "stratum": "Rural-Kerala", "multiplier": 18500, "employed_count": 4},
    {"hh_id": "02002", "stratum": "Rural-Kerala", "multiplier": 18500, "employed_count": 1},
    {"hh_id": "03001", "stratum": "Rural-Bihar",  "multiplier": 32000, "employed_count": 5},
]

# NSSO Sub-sample Combined Weight formula: Multiplier / 100 (or / 200 for 2 sub-rounds)
estimated_total_employed = 0
stratum_estimates = {}

for rec in sample_records:
    effective_weight = rec["multiplier"] / 100.0
    hh_employed = rec["employed_count"] * effective_weight
    estimated_total_employed += hh_employed
    
    st = rec["stratum"]
    stratum_estimates[st] = stratum_estimates.get(st, 0) + hh_employed

print("┌─────────────────────────────────────────────────┐")
print("│    PLFS SUB-SAMPLE AGGREGATION & ESTIMATION     │")
print("└─────────────────────────────────────────────────┘")
for st, count in stratum_estimates.items():
    print(f"• Stratum {st:15s}: {count:,.0f} persons")
print("───────────────────────────────────────────────────")
print(f"Total Estimated Employed Population: {estimated_total_employed:,.0f}")
`,
    solutionHint: "When aggregating 2 independent sub-samples, divide the raw multiplier by 200 to obtain unbiased national totals.",
    sampleData: `Household_ID,Stratum_Code,FSU_Multiplier,Persons_Employed,Sector
01001,Rural-Punjab,24000,3,Rural
01002,Rural-Punjab,24000,2,Rural
02001,Rural-Kerala,18500,4,Rural
02002,Rural-Kerala,18500,1,Rural
03001,Rural-Bihar,32000,5,Rural`,
  },
  {
    id: "lab-sql-census",
    title: "SQL Querying for Administrative Enterprise Registry",
    domain: "Database Management & Big Data",
    language: "sql",
    difficulty: "Basic",
    instructions: "Query official enterprise and price registry microdata to filter top manufacturing clusters by state and index output.",
    initialCode: `-- Official SQL Lab: Administrative Enterprise Registry
SELECT 
    State_Code,
    Sector,
    Commodity_Grp,
    Weight_Share,
    Index_Value
FROM 
    National_Statistical_Registry.Price_Series_2026
WHERE 
    Weight_Share > 5.0
ORDER BY 
    Index_Value DESC;`,
    solutionHint: "Use WHERE Weight_Share > 5.0 and ORDER BY Index_Value DESC to isolate high-impact statistical drivers.",
    sampleData: `State_Code,Sector,Commodity_Grp,Weight_Share,Index_Value
07 (DEL),Urban,Food & Bev,39.06,188.40
27 (MAH),Urban,Housing,21.67,174.20
33 (TN),Rural,Fuel & Light,07.94,162.90
19 (WB),Rural,Miscellaneous,18.23,179.80
09 (UP),Combined,Clothing,06.50,183.10
29 (KTK),Urban,Education,05.80,191.30
03 (PB),Rural,Transport,08.40,169.50`,
  },
  {
    id: "lab-gva-rebase",
    title: "National Accounts GVA Deflator & Real Growth",
    domain: "National Accounts & SDC Aggregates",
    language: "python",
    difficulty: "Intermediate",
    instructions: "Compute Sectoral Real Gross Value Added (GVA) at Constant Prices using Implicit Price Deflators (IPD).",
    initialCode: `# National Accounts Division (NAD) GVA Deflation Lab
# Formula: Real GVA = (Nominal GVA / IPD_Deflator) * 100

sectors = [
    {"sector": "Agriculture & Allied", "nominal_cr": 3842100, "deflator": 159.39},
    {"sector": "Manufacturing", "nominal_cr": 4219800, "deflator": 141.59},
    {"sector": "Construction", "nominal_cr": 2190400, "deflator": 153.08},
    {"sector": "Services & Trade", "nominal_cr": 4980200, "deflator": 140.67},
]

total_nominal = 0
total_real = 0

print("═══════════════════════════════════════════════════")
print("  NATIONAL ACCOUNTS SECTORAL REAL GVA (2011-12 BASE) ")
print("═══════════════════════════════════════════════════")

for s in sectors:
    real_gva = (s["nominal_cr"] / s["deflator"]) * 100.0
    total_nominal += s["nominal_cr"]
    total_real += real_gva
    print(f"• {s['sector']:22s}: Nominal ₹{s['nominal_cr']:,.0f} Cr ➔ Real ₹{real_gva:,.0f} Cr")

overall_deflator = (total_nominal / total_real) * 100.0

print("───────────────────────────────────────────────────")
print(f"Total Nominal GVA : ₹{total_nominal:,.0f} Crore")
print(f"Total Real GVA    : ₹{total_real:,.0f} Crore")
print(f"Overall Economy Implicit Deflator : {overall_deflator:.2f}")
`,
    solutionHint: "Real GVA = (Nominal GVA / Price Deflator) * 100. The overall deflator is the Paasche-weighted aggregate.",
    sampleData: `Sector,Nominal_GVA_Crore,IPD_Deflator,Base_Year
Agriculture & Allied,3842100,159.39,2011-12
Manufacturing,4219800,141.59,2011-12
Construction,2190400,153.08,2011-12
Services & Trade,4980200,140.67,2011-12`,
  },
  {
    id: "lab-dpdp-k-anonymity",
    title: "DPDP Act k-Anonymity Microdata Perturbation",
    domain: "Data Privacy & SDC Governance",
    language: "python",
    difficulty: "Advanced",
    instructions: "Evaluate microdata anonymity and suppress quasi-identifiers to guarantee k-anonymity (k >= 3) before public release.",
    initialCode: `# DPDP Act 2023 Microdata Privacy Lab: k-Anonymity Verification
# Quasi-Identifiers: (District_Code, Age_Bracket, Gender)

microdata = [
    {"id": 101, "district": "2701", "age_bracket": "25-34", "gender": "F", "diagnosis": "Hypertension"},
    {"id": 102, "district": "2701", "age_bracket": "25-34", "gender": "F", "diagnosis": "Normal"},
    {"id": 103, "district": "2701", "age_bracket": "25-34", "gender": "F", "diagnosis": "Asthma"},
    {"id": 104, "district": "2702", "age_bracket": "45-54", "gender": "M", "diagnosis": "Diabetes"},
    {"id": 105, "district": "2702", "age_bracket": "45-54", "gender": "M", "diagnosis": "Normal"},
    {"id": 106, "district": "2702", "age_bracket": "45-54", "gender": "M", "diagnosis": "Hypertension"},
]

# Count frequencies of quasi-identifier equivalence classes
equivalence_classes = {}

for rec in microdata:
    key = f"{rec['district']}_{rec['age_bracket']}_{rec['gender']}"
    equivalence_classes[key] = equivalence_classes.get(key, 0) + 1

k_value = min(equivalence_classes.values())
is_compliant = k_value >= 3

print("═══════════════════════════════════════════════════")
print("  STATISTICAL DISCLOSURE CONTROL (SDC) AUDIT       ")
print("═══════════════════════════════════════════════════")
for eq_class, count in equivalence_classes.items():
    print(f"• Equivalence Class [{eq_class}]: {count} records")

print("───────────────────────────────────────────────────")
print(f"Achieved k-Anonymity Value : k = {k_value}")
print(f"DPDP Act Public Release Status : {'COMPLIANT (APPROVED)' if is_compliant else 'NON-COMPLIANT (REQUIRES SUPPRESSION)'}")
`,
    solutionHint: "k-anonymity requires every combination of quasi-identifiers to occur in at least k records across the released sample.",
    sampleData: `Record_ID,District_Code,Age_Bracket,Gender,Health_Metric
101,2701,25-34,F,Hypertension
102,2701,25-34,F,Normal
103,2701,25-34,F,Asthma
104,2702,45-54,M,Diabetes
105,2702,45-54,M,Normal
106,2702,45-54,M,Hypertension`,
  },
];

export function LiveTerminalModal({
  exercise,
  isOpen,
  onClose,
}: {
  exercise: LabExercise | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [code, setCode] = useState("");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [selectedEx, setSelectedEx] = useState<LabExercise>(OFFICIAL_LAB_EXERCISES[0]);
  const [activeTab, setActiveTab] = useState<"terminal" | "dataset" | "solution">("terminal");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (exercise) {
      setSelectedEx(exercise);
      setCode(exercise.initialCode);
      setResult(null);
    } else {
      setSelectedEx(OFFICIAL_LAB_EXERCISES[0]);
      setCode(OFFICIAL_LAB_EXERCISES[0].initialCode);
      setResult(null);
    }
    setActiveTab("terminal");
  }, [exercise, isOpen]);

  if (!isOpen) return null;

  async function handleRun() {
    setRunning(true);
    setResult(null);
    setActiveTab("terminal");
    try {
      if (selectedEx.language === "python") {
        const res = await runPythonCode(code);
        setResult(res);
      } else {
        const res = await runSqlQuery(code);
        setResult(res);
      }
    } catch (e: any) {
      setResult({
        stdout: "",
        stderr: e?.message || "Execution error",
        executionTimeMs: 0,
        success: false,
      });
    } finally {
      setRunning(false);
    }
  }

  function handleSwitchExercise(ex: LabExercise) {
    setSelectedEx(ex);
    setCode(ex.initialCode);
    setResult(null);
    setActiveTab("terminal");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleRun();
    }
  }

  function handleDownloadOutput() {
    if (!result?.stdout) return;
    const blob = new Blob([result.stdout], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${selectedEx.id}_output.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#1E2430] text-gray-100 rounded-2xl shadow-2xl border border-gray-700 w-full max-w-5xl h-[88vh] flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="bg-[#141923] px-5 py-3.5 border-b border-gray-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            </div>
            <div className="h-4 w-px bg-gray-700 mx-1" />
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-mono text-[#FF7A00]">
                {selectedEx.language.toUpperCase()} STATISTICAL SANDBOX
              </span>
              <span className="text-xs text-gray-400">·</span>
              <span className="text-xs text-gray-300 font-medium truncate max-w-[280px] sm:max-w-md">
                {selectedEx.title}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Exercise Selector */}
            <select
              value={selectedEx.id}
              onChange={(e) => {
                const found = OFFICIAL_LAB_EXERCISES.find((x) => x.id === e.target.value);
                if (found) handleSwitchExercise(found);
              }}
              className="bg-[#1E2430] border border-gray-700 text-gray-300 text-xs rounded-lg px-2.5 py-1 focus:outline-none max-w-[180px] sm:max-w-xs truncate"
            >
              {OFFICIAL_LAB_EXERCISES.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.title} ({ex.language.toUpperCase()})
                </option>
              ))}
            </select>

            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Middle Body */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 min-h-0 divide-y lg:divide-y-0 lg:divide-x divide-gray-800">
          {/* Left: Code Editor */}
          <div className="flex flex-col h-full bg-[#161B22]">
            <div className="px-4 py-2 bg-[#12161E] border-b border-gray-800 flex items-center justify-between text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <span className="font-mono text-emerald-400 font-semibold">
                  main.{selectedEx.language === "python" ? "py" : "sql"}
                </span>
                <span className="text-[10px] text-gray-500 font-mono">(Ctrl+Enter to Run)</span>
              </div>
              <button
                onClick={() => setCode(selectedEx.initialCode)}
                className="hover:text-gray-200 text-[11px] font-mono text-gray-400 hover:underline cursor-pointer"
              >
                Reset Code ↺
              </button>
            </div>
            <textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              className="flex-1 w-full p-4 bg-transparent text-gray-100 font-mono text-xs leading-relaxed resize-none focus:outline-none selection:bg-[#0B3D66]"
            />
          </div>

          {/* Right: Tabbed Output Console & Inspector */}
          <div className="flex flex-col h-full bg-[#0F131A]">
            {/* Lab Objective Bar */}
            <div className="p-3.5 bg-[#141821] border-b border-gray-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#FF7A00] font-bold uppercase tracking-wider block">
                  {selectedEx.domain}
                </span>
                <p className="text-xs text-gray-300 mt-0.5">{selectedEx.instructions}</p>
              </div>
            </div>

            {/* Right Pane Navigation Tabs */}
            <div className="flex bg-[#12161E] px-3 border-b border-gray-800 text-xs font-medium gap-2">
              <button
                onClick={() => setActiveTab("terminal")}
                className={`py-2 px-3 border-b-2 transition-all cursor-pointer ${
                  activeTab === "terminal"
                    ? "border-[#FF7A00] text-white font-bold"
                    : "border-transparent text-gray-400 hover:text-gray-200"
                }`}
              >
                🖥️ Terminal Output
              </button>
              <button
                onClick={() => setActiveTab("dataset")}
                className={`py-2 px-3 border-b-2 transition-all cursor-pointer ${
                  activeTab === "dataset"
                    ? "border-[#FF7A00] text-white font-bold"
                    : "border-transparent text-gray-400 hover:text-gray-200"
                }`}
              >
                📊 Sample Dataset (CSV)
              </button>
              <button
                onClick={() => setActiveTab("solution")}
                className={`py-2 px-3 border-b-2 transition-all cursor-pointer ${
                  activeTab === "solution"
                    ? "border-[#FF7A00] text-white font-bold"
                    : "border-transparent text-gray-400 hover:text-gray-200"
                }`}
              >
                💡 Solution &amp; Method
              </button>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 p-4 overflow-y-auto font-mono text-xs">
              {activeTab === "terminal" && (
                <div>
                  <div className="text-gray-500 mb-2 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2">
                      <span>Execution Result:</span>
                      {result?.engineUsed && (
                        <span className="text-[10px] text-amber-400 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-800/60 font-sans font-bold">
                          ⚡ {result.engineUsed}
                        </span>
                      )}
                    </div>
                    {result && (
                      <div className="flex items-center gap-3">
                        <span className={result.success ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                          {result.executionTimeMs}ms
                        </span>
                        <button
                          onClick={() => setResult(null)}
                          className="text-gray-400 hover:text-white text-[10px] cursor-pointer"
                        >
                          Clear 🗑️
                        </button>
                        <button
                          onClick={handleDownloadOutput}
                          className="text-gray-400 hover:text-white text-[10px] cursor-pointer"
                        >
                          Save 💾
                        </button>
                      </div>
                    )}
                  </div>

                  {!result && !running && (
                    <div className="text-gray-500 italic py-6 text-center">
                      Click <strong className="text-[#FF7A00]">"▶ Run Code"</strong> or press <strong className="text-white">Ctrl+Enter</strong> to execute statistical script.
                    </div>
                  )}

                  {running && (
                    <div className="flex items-center gap-2 text-amber-400 animate-pulse py-6 justify-center">
                      <span className="animate-spin text-lg">◌</span>
                      <span>Executing statistical model in browser sandbox...</span>
                    </div>
                  )}

                  {result && (
                    <div className="space-y-2">
                      {result.stdout && (
                        <pre className="text-emerald-300 whitespace-pre-wrap leading-relaxed bg-[#0A0D14] p-3.5 rounded-xl border border-gray-800 shadow-inner">
                          {result.stdout}
                        </pre>
                      )}
                      {result.stderr && (
                        <pre className="text-rose-400 whitespace-pre-wrap leading-relaxed bg-rose-950/40 p-3.5 rounded-xl border border-rose-800">
                          {result.stderr}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "dataset" && (
                <div className="space-y-3">
                  <div className="text-xs text-gray-400 font-sans">
                    Preloaded official microdata schema for this laboratory:
                  </div>
                  <pre className="text-amber-200/90 whitespace-pre bg-[#0A0D14] p-3.5 rounded-xl border border-gray-800 overflow-x-auto text-[11px] leading-relaxed">
                    {selectedEx.sampleData || "No preloaded CSV table for this exercise."}
                  </pre>
                </div>
              )}

              {activeTab === "solution" && (
                <div className="space-y-3 font-sans">
                  <div className="bg-blue-950/40 border border-blue-800/80 p-4 rounded-xl text-blue-200 text-xs leading-relaxed">
                    <strong className="text-white block mb-1">📐 Statistical Theory &amp; Methodology:</strong>
                    {selectedEx.solutionHint}
                  </div>
                  <div className="text-[11px] text-gray-400 leading-relaxed">
                    Official Reference: National Statistical Systems Training Academy (NSSTA) Practical Guide on Survey Data Analysis &amp; Microdata Deflation.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Action Footer */}
        <div className="bg-[#141923] px-5 py-3 border-t border-gray-800 flex items-center justify-between shrink-0">
          <div className="text-xs text-gray-400 flex items-center gap-2">
            <span className="text-emerald-400 text-sm">●</span>
            <span className="hidden sm:inline">100% Free · Client-side WebAssembly &amp; Statistical Engine</span>
            <span className="sm:hidden text-[10px]">WASM Sandbox Active</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handleRun}
              disabled={running}
              className="px-6 py-2.5 text-xs font-bold text-white bg-[#FF7A00] hover:bg-[#e06a00] active:scale-95 disabled:opacity-50 rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              {running ? (
                <>
                  <span className="animate-spin">◌</span>
                  <span>Executing...</span>
                </>
              ) : (
                <>
                  <span>▶ Run Code</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
