import { useState, useEffect, useRef } from "react";
import { runPythonCode, runSqlQuery, type ExecutionResult } from "../services/pyodideRunner";
import { applyClosedLoopCompetencyUpdate } from "../services/storageService";

export interface LabExercise {
  id: string;
  title: string;
  domain: string;
  language: "python" | "sql" | "r";
  difficulty: "Basic" | "Intermediate" | "Advanced";
  instructions: string;
  initialCode: string;
  solutionCode: string;
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
    instructions: "Write a script to compute the all-India weighted Consumer Price Index (CPI) using the Modified Laspeyres Index formula over 6 commodity groups.",
    initialCode: `# Official Statistics Lab: CPI Compilation
# Problem: Compute the all-India weighted Consumer Price Index (CPI) using the Modified Laspeyres Index.
# Formula: CPI = sum(Weight_i * (Current_Price_i / Base_Price_i)) / sum(Weight_i) * 100

commodity_groups = [
    {"name": "Food & Beverages", "weight": 45.86, "base_price": 100.0, "current_price": 118.50},
    {"name": "Pan & Tobacco", "weight": 2.38, "base_price": 100.0, "current_price": 112.00},
    {"name": "Clothing & Footwear", "weight": 6.53, "base_price": 100.0, "current_price": 115.20},
    {"name": "Housing", "weight": 10.07, "base_price": 100.0, "current_price": 121.40},
    {"name": "Fuel & Light", "weight": 6.84, "base_price": 100.0, "current_price": 108.90},
    {"name": "Miscellaneous", "weight": 28.32, "base_price": 100.0, "current_price": 116.80},
]

# TODO: 1. Calculate sum of weighted price relatives across all commodity groups
# Formula component: item["weight"] * (item["current_price"] / item["base_price"])
total_weighted_relatives = 0.0

# TODO: 2. Calculate total base basket weight (sum of all group weights)
total_weight = 0.0

# TODO: 3. Calculate cpi_combined = (total_weighted_relatives / total_weight) * 100
cpi_combined = 0.0

# TODO: 4. Calculate inflation_rate = cpi_combined - 100.0
inflation_rate = 0.0

# --- WRITE YOUR PYTHON CODE BELOW ---



# Print summary report
print("═══════════════════════════════════════════════════")
print("  NATIONAL CONSUMER PRICE INDEX (CPI) COMPILATION  ")
print("═══════════════════════════════════════════════════")
print(f"Total Base Basket Weight : {total_weight:.2f}")
print(f"Current Period CPI Index : {cpi_combined:.2f}")
print(f"Year-over-Year Inflation : {inflation_rate:.2f}%")
`,
    solutionCode: `# Official Statistics Lab: CPI Compilation
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
    solutionHint: "Formula: I_CPI = sum(W_i * (P_t / P_0)) / sum(W_i) * 100. Iterate over commodity_groups with list comprehension or a for-loop.",
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
    instructions: "Write Python code to apply NSSO sampling multipliers (effective weight = multiplier / 100.0) to estimate total rural employed population from sample records.",
    initialCode: `# PLFS Microdata Estimation Lab
# Problem: Calculate weighted population estimates using sampling multipliers.

sample_records = [
    {"hh_id": "01001", "stratum": "Rural-Punjab", "multiplier": 24000, "employed_count": 3},
    {"hh_id": "01002", "stratum": "Rural-Punjab", "multiplier": 24000, "employed_count": 2},
    {"hh_id": "02001", "stratum": "Rural-Kerala", "multiplier": 18500, "employed_count": 4},
    {"hh_id": "02002", "stratum": "Rural-Kerala", "multiplier": 18500, "employed_count": 1},
    {"hh_id": "03001", "stratum": "Rural-Bihar",  "multiplier": 32000, "employed_count": 5},
]

estimated_total_employed = 0
stratum_estimates = {}

# TODO: 1. Loop through each record in sample_records
# TODO: 2. Compute effective_weight = rec["multiplier"] / 100.0
# TODO: 3. Compute hh_employed = rec["employed_count"] * effective_weight
# TODO: 4. Accumulate into estimated_total_employed and stratum_estimates dictionary

# --- WRITE YOUR PYTHON CODE BELOW ---



print("┌─────────────────────────────────────────────────┐")
print("│    PLFS SUB-SAMPLE AGGREGATION & ESTIMATION     │")
print("└─────────────────────────────────────────────────┘")
for st, count in stratum_estimates.items():
    print(f"• Stratum {st:15s}: {count:,.0f} persons")
print("───────────────────────────────────────────────────")
print(f"Total Estimated Employed Population: {estimated_total_employed:,.0f}")
`,
    solutionCode: `# PLFS Microdata Estimation Lab
sample_records = [
    {"hh_id": "01001", "stratum": "Rural-Punjab", "multiplier": 24000, "employed_count": 3},
    {"hh_id": "01002", "stratum": "Rural-Punjab", "multiplier": 24000, "employed_count": 2},
    {"hh_id": "02001", "stratum": "Rural-Kerala", "multiplier": 18500, "employed_count": 4},
    {"hh_id": "02002", "stratum": "Rural-Kerala", "multiplier": 18500, "employed_count": 1},
    {"hh_id": "03001", "stratum": "Rural-Bihar",  "multiplier": 32000, "employed_count": 5},
]

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
    solutionHint: "When aggregating NSSO survey records, multiply raw employed counts by (multiplier / 100) and sum across strata.",
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
    instructions: "Write a SQL query over National_Statistical_Registry to select State_Code, Sector, Commodity_Grp, Weight_Share, and Index_Value where Weight_Share > 5.0, ordered by Index_Value descending.",
    initialCode: `-- Official SQL Lab: Administrative Enterprise Registry
-- Problem: Query official price series to find high-impact statistical drivers.
-- 
-- Requirements:
-- 1. Select State_Code, Sector, Commodity_Grp, Weight_Share, and Index_Value
-- 2. From table: Price_Series_2026
-- 3. Filter where Weight_Share > 5.0
-- 4. Order by Index_Value DESC

-- --- WRITE YOUR SQL QUERY BELOW ---


`,
    solutionCode: `-- Official SQL Lab: Administrative Enterprise Registry
SELECT 
    State_Code,
    Sector,
    Commodity_Grp,
    Weight_Share,
    Index_Value
FROM 
    Price_Series_2026
WHERE 
    Weight_Share > 5.0
ORDER BY 
    Index_Value DESC;`,
    solutionHint: "Use SELECT column_names FROM Price_Series_2026 WHERE Weight_Share > 5.0 ORDER BY Index_Value DESC;",
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
    instructions: "Write Python code to compute Sectoral Real Gross Value Added (GVA) at Constant Prices using Implicit Price Deflators (IPD).",
    initialCode: `# National Accounts Division (NAD) GVA Deflation Lab
# Problem: Compute Sectoral Real GVA using Implicit Price Deflators (IPD).
# Formula: Real GVA = (Nominal GVA / IPD_Deflator) * 100

sectors = [
    {"sector": "Agriculture & Allied", "nominal_cr": 3842100, "deflator": 159.39},
    {"sector": "Manufacturing", "nominal_cr": 4219800, "deflator": 141.59},
    {"sector": "Construction", "nominal_cr": 2190400, "deflator": 153.08},
    {"sector": "Services & Trade", "nominal_cr": 4980200, "deflator": 140.67},
]

total_nominal = 0
total_real = 0
overall_deflator = 0.0

# TODO: 1. Iterate over sectors and calculate real_gva = (s["nominal_cr"] / s["deflator"]) * 100.0
# TODO: 2. Sum nominal and real amounts
# TODO: 3. Compute overall economy deflator = (total_nominal / total_real) * 100.0

# --- WRITE YOUR PYTHON CODE BELOW ---



print("═══════════════════════════════════════════════════")
print("  NATIONAL ACCOUNTS SECTORAL REAL GVA (2011-12 BASE) ")
print("═══════════════════════════════════════════════════")
print(f"Total Nominal GVA : ₹{total_nominal:,.0f} Crore")
print(f"Total Real GVA    : ₹{total_real:,.0f} Crore")
print(f"Overall Economy Implicit Deflator : {overall_deflator:.2f}")
`,
    solutionCode: `# National Accounts Division (NAD) GVA Deflation Lab
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
    solutionHint: "Real GVA = (Nominal GVA / Price Deflator) * 100. The overall deflator is (total_nominal / total_real) * 100.",
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
    instructions: "Write a script to compute equivalence class sizes across (district, age_bracket, gender) and check if k-anonymity (k >= 3) is satisfied.",
    initialCode: `# DPDP Act 2023 Microdata Privacy Lab: k-Anonymity Verification
# Problem: Count frequencies of quasi-identifier combinations and evaluate k-anonymity compliance.

microdata = [
    {"id": 101, "district": "2701", "age_bracket": "25-34", "gender": "F", "diagnosis": "Hypertension"},
    {"id": 102, "district": "2701", "age_bracket": "25-34", "gender": "F", "diagnosis": "Normal"},
    {"id": 103, "district": "2701", "age_bracket": "25-34", "gender": "F", "diagnosis": "Asthma"},
    {"id": 104, "district": "2702", "age_bracket": "45-54", "gender": "M", "diagnosis": "Diabetes"},
    {"id": 105, "district": "2702", "age_bracket": "45-54", "gender": "M", "diagnosis": "Normal"},
    {"id": 106, "district": "2702", "age_bracket": "45-54", "gender": "M", "diagnosis": "Hypertension"},
]

equivalence_classes = {}
k_value = 0
is_compliant = False

# TODO: 1. Loop through microdata and construct key: f"{rec['district']}_{rec['age_bracket']}_{rec['gender']}"
# TODO: 2. Count occurrences of each key in equivalence_classes dictionary
# TODO: 3. Calculate k_value = min(equivalence_classes.values()) if equivalence_classes else 0
# TODO: 4. Set is_compliant = k_value >= 3

# --- WRITE YOUR PYTHON CODE BELOW ---



print("═══════════════════════════════════════════════════")
print("  STATISTICAL DISCLOSURE CONTROL (SDC) AUDIT       ")
print("═══════════════════════════════════════════════════")
for eq_class, count in equivalence_classes.items():
    print(f"• Equivalence Class [{eq_class}]: {count} records")

print("───────────────────────────────────────────────────")
print(f"Achieved k-Anonymity Value : k = {k_value}")
print(f"DPDP Act Public Release Status : {'COMPLIANT (APPROVED)' if is_compliant else 'NON-COMPLIANT (REQUIRES SUPPRESSION)'}")
`,
    solutionCode: `# DPDP Act 2023 Microdata Privacy Lab: k-Anonymity Verification
microdata = [
    {"id": 101, "district": "2701", "age_bracket": "25-34", "gender": "F", "diagnosis": "Hypertension"},
    {"id": 102, "district": "2701", "age_bracket": "25-34", "gender": "F", "diagnosis": "Normal"},
    {"id": 103, "district": "2701", "age_bracket": "25-34", "gender": "F", "diagnosis": "Asthma"},
    {"id": 104, "district": "2702", "age_bracket": "45-54", "gender": "M", "diagnosis": "Diabetes"},
    {"id": 105, "district": "2702", "age_bracket": "45-54", "gender": "M", "diagnosis": "Normal"},
    {"id": 106, "district": "2702", "age_bracket": "45-54", "gender": "M", "diagnosis": "Hypertension"},
]

equivalence_classes = {}

for rec in microdata:
    key = f"{rec['district']}_{rec['age_bracket']}_{rec['gender']}"
    equivalence_classes[key] = equivalence_classes.get(key, 0) + 1

k_value = min(equivalence_classes.values()) if equivalence_classes else 0
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
    solutionHint: "Count group frequencies with a dictionary. k-anonymity requires every equivalence class count to be >= k.",
    sampleData: `Record_ID,District_Code,Age_Bracket,Gender,Health_Metric
101,2701,25-34,F,Hypertension
102,2701,25-34,F,Normal
103,2701,25-34,F,Asthma
104,2702,45-54,M,Diabetes
105,2702,45-54,M,Normal
106,2702,45-54,M,Hypertension`,
  },
  {
    id: "lab-wpi-jevons",
    title: "Wholesale Price Index (WPI) Jevons Geometric Mean Aggregation",
    domain: "Official Statistics & Price Indices",
    language: "python",
    difficulty: "Intermediate",
    instructions: "Compute the elementary price index for primary food articles using the Jevons Geometric Mean formula across mandi quotation centers.",
    initialCode: `# WPI Price Statistics Lab: Jevons Geometric Mean Elementary Index
# Formula: Jevons Index = (product(P_t / P_0)) ** (1 / N) * 100

import math

mandi_quotations = [
    {"center": "Khanna Mandi (Punjab)", "item": "Wheat Grade A", "base_price": 2015.0, "current_price": 2350.0},
    {"center": "Karnal Mandi (Haryana)", "item": "Wheat Grade A", "base_price": 2020.0, "current_price": 2380.0},
    {"center": "Bhopal Mandi (MP)", "item": "Wheat Grade A", "base_price": 1980.0, "current_price": 2290.0},
    {"center": "Kota Mandi (Rajasthan)", "item": "Wheat Grade A", "base_price": 2000.0, "current_price": 2340.0},
    {"center": "Hapur Mandi (UP)", "item": "Wheat Grade A", "base_price": 2050.0, "current_price": 2410.0},
]

jevons_index = 0.0
dutot_index = 0.0

# TODO: 1. Calculate price relatives (current_price / base_price) for each mandi center
# TODO: 2. Calculate Jevons Index = (product of all relatives) ** (1 / len(mandi_quotations)) * 100
# TODO: 3. Calculate Dutot Index = (sum(current_price) / sum(base_price)) * 100

# --- WRITE YOUR PYTHON CODE BELOW ---



print("═══════════════════════════════════════════════════")
print("   WPI ELEMENTARY PRICE INDEX COMPILATION (WHEAT)  ")
print("═══════════════════════════════════════════════════")
print(f"Total Mandi Quotation Centers : {len(mandi_quotations)}")
print(f"Jevons Geometric Mean Index   : {jevons_index:.2f}")
print(f"Dutot Arithmetic Mean Index   : {dutot_index:.2f}")
print(f"Formula Divergence            : {abs(dutot_index - jevons_index):.3f} pts")
`,
    solutionCode: `# WPI Price Statistics Lab: Jevons Geometric Mean Elementary Index
import math

mandi_quotations = [
    {"center": "Khanna Mandi (Punjab)", "item": "Wheat Grade A", "base_price": 2015.0, "current_price": 2350.0},
    {"center": "Karnal Mandi (Haryana)", "item": "Wheat Grade A", "base_price": 2020.0, "current_price": 2380.0},
    {"center": "Bhopal Mandi (MP)", "item": "Wheat Grade A", "base_price": 1980.0, "current_price": 2290.0},
    {"center": "Kota Mandi (Rajasthan)", "item": "Wheat Grade A", "base_price": 2000.0, "current_price": 2340.0},
    {"center": "Hapur Mandi (UP)", "item": "Wheat Grade A", "base_price": 2050.0, "current_price": 2410.0},
]

relatives = [q["current_price"] / q["base_price"] for q in mandi_quotations]
product_rel = math.prod(relatives)
n = len(mandi_quotations)

jevons_index = (product_rel ** (1.0 / n)) * 100.0

sum_current = sum(q["current_price"] for q in mandi_quotations)
sum_base = sum(q["base_price"] for q in mandi_quotations)
dutot_index = (sum_current / sum_base) * 100.0

print("═══════════════════════════════════════════════════")
print("   WPI ELEMENTARY PRICE INDEX COMPILATION (WHEAT)  ")
print("═══════════════════════════════════════════════════")
print(f"Total Mandi Quotation Centers : {len(mandi_quotations)}")
print(f"Jevons Geometric Mean Index   : {jevons_index:.2f}")
print(f"Dutot Arithmetic Mean Index   : {dutot_index:.2f}")
print(f"Formula Divergence            : {abs(dutot_index - jevons_index):.3f} pts")
`,
    solutionHint: "Calculate relatives = [p_t / p_0 for q in mandi_quotations], then jevons = (math.prod(relatives) ** (1/len(relatives))) * 100.",
    sampleData: `Center_Name,Item,Base_Price_Rs,Current_Price_Rs
Khanna Mandi,Wheat Grade A,2015.00,2350.00
Karnal Mandi,Wheat Grade A,2020.00,2380.00
Bhopal Mandi,Wheat Grade A,1980.00,2290.00
Kota Mandi,Wheat Grade A,2000.00,2340.00
Hapur Mandi,Wheat Grade A,2050.00,2410.00`,
  },
  {
    id: "lab-plfs-rates",
    title: "PLFS Labour Indicators: LFPR, WPR & Unemployment Rate",
    domain: "Survey Sampling & PLFS",
    language: "python",
    difficulty: "Basic",
    instructions: "Write a script to compute the Labour Force Participation Rate (LFPR), Worker Population Ratio (WPR), and Unemployment Rate (UR) for Principal Status from survey sample data.",
    initialCode: `# PLFS Labour Statistics Lab: Key Indicator Compilation
# Definitions (MoSPI Standards):
# Labour Force = Employed + Unemployed
# LFPR (%) = (Labour Force / Total Survey Population) * 100
# WPR (%)  = (Total Employed / Total Survey Population) * 100
# UR (%)   = (Total Unemployed / Labour Force) * 100

population_sample = {
    "total_population": 50000,
    "employed_principal_status": 24500,
    "unemployed_seeking_work": 1500,
    "out_of_labour_force": 24000
}

lfpr = 0.0
wpr = 0.0
ur = 0.0

# TODO: 1. Calculate labour_force = employed + unemployed
# TODO: 2. Calculate lfpr, wpr, and ur according to official formulas

# --- WRITE YOUR PYTHON CODE BELOW ---



print("═══════════════════════════════════════════════════")
print("     PLFS KEY LABOUR MARKET INDICATORS REPORT      ")
print("═══════════════════════════════════════════════════")
print(f"Labour Force Participation Rate (LFPR) : {lfpr:.2f}%")
print(f"Worker Population Ratio (WPR)          : {wpr:.2f}%")
print(f"Unemployment Rate (UR)                 : {ur:.2f}%")
`,
    solutionCode: `# PLFS Labour Statistics Lab: Key Indicator Compilation
population_sample = {
    "total_population": 50000,
    "employed_principal_status": 24500,
    "unemployed_seeking_work": 1500,
    "out_of_labour_force": 24000
}

tot = population_sample["total_population"]
emp = population_sample["employed_principal_status"]
unemp = population_sample["unemployed_seeking_work"]

labour_force = emp + unemp

lfpr = (labour_force / tot) * 100.0
wpr = (emp / tot) * 100.0
ur = (unemp / labour_force) * 100.0

print("═══════════════════════════════════════════════════")
print("     PLFS KEY LABOUR MARKET INDICATORS REPORT      ")
print("═══════════════════════════════════════════════════")
print(f"Labour Force Participation Rate (LFPR) : {lfpr:.2f}%")
print(f"Worker Population Ratio (WPR)          : {wpr:.2f}%")
print(f"Unemployment Rate (UR)                 : {ur:.2f}%")
`,
    solutionHint: "Labour Force is (emp + unemp). UR is (unemployed / labour_force) * 100.",
    sampleData: `Demographic_Category,Person_Count,Share_Pct
Employed (Principal Status),24500,49.0%
Unemployed (Actively Seeking),1500,3.0%
Out of Labour Force (Students/Elderly),24000,48.0%`,
  },
  {
    id: "lab-asi-sql",
    title: "Annual Survey of Industries (ASI) Factory Gross Value Added",
    domain: "Database Management & Big Data",
    language: "sql",
    difficulty: "Intermediate",
    instructions: "Write a SQL query over ASI_Factory_Registry to compute Total_Gross_Output, Total_Inputs, and Gross_Value_Added (Gross_Output - Total_Inputs) grouped by State_Code where Factory_Status = 'Operational'.",
    initialCode: `-- Official SQL Lab: Annual Survey of Industries (ASI)
-- Problem: Calculate Gross Value Added (GVA = Gross_Output - Total_Inputs) by State.
-- Table: ASI_Establishments_2026
-- Columns: State_Code, Gross_Output_Lakhs, Total_Inputs_Lakhs, Factory_Status

-- Requirements:
-- 1. SELECT State_Code, SUM(Gross_Output_Lakhs) as Total_Output, SUM(Total_Inputs_Lakhs) as Total_Inputs, (SUM(Gross_Output_Lakhs) - SUM(Total_Inputs_Lakhs)) as GVA_Lakhs
-- 2. FROM ASI_Establishments_2026
-- 3. WHERE Factory_Status = 'Operational'
-- 4. GROUP BY State_Code
-- 5. ORDER BY GVA_Lakhs DESC

-- --- WRITE YOUR SQL QUERY BELOW ---


`,
    solutionCode: `-- Official SQL Lab: Annual Survey of Industries (ASI)
SELECT 
    State_Code,
    SUM(Gross_Output_Lakhs) AS Total_Output,
    SUM(Total_Inputs_Lakhs) AS Total_Inputs,
    (SUM(Gross_Output_Lakhs) - SUM(Total_Inputs_Lakhs)) AS GVA_Lakhs
FROM 
    ASI_Establishments_2026
WHERE 
    Factory_Status = 'Operational'
GROUP BY 
    State_Code
ORDER BY 
    GVA_Lakhs DESC;`,
    solutionHint: "Use GROUP BY State_Code and calculate (SUM(Gross_Output_Lakhs) - SUM(Total_Inputs_Lakhs)) AS GVA_Lakhs.",
    sampleData: `Factory_ID,State_Code,NIC_2Digit,Gross_Output_Lakhs,Total_Inputs_Lakhs,Factory_Status
F1001,27 (MAH),10 (Food),4500.00,3100.00,Operational
F1002,24 (GUJ),20 (Chemicals),8200.00,5400.00,Operational
F1003,33 (TN),29 (Auto),6100.00,4200.00,Operational
F1004,29 (KTK),26 (Electronics),5300.00,3500.00,Operational
F1005,07 (DEL),18 (Printing),1200.00,800.00,Operational
F1006,27 (MAH),13 (Textiles),3400.00,2300.00,Operational`,
  },
  {
    id: "lab-sut-ras",
    title: "Supply-Use Tables (SUT) Matrix Balancing via RAS Algorithm",
    domain: "National Accounts & SDC Aggregates",
    language: "python",
    difficulty: "Advanced",
    instructions: "Write a script to perform 1 iteration of the RAS biproportional matrix balancing algorithm to adjust intermediate input cells to match updated row and column target totals.",
    initialCode: `# UN SNA 2008 National Accounts Lab: SUT Matrix Balancing (RAS)
# Problem: Balance a 2x2 Intermediate Consumption Matrix to target row sums and col sums.

import numpy as np

# Initial Intermediate Matrix A0
A = np.array([
    [100.0, 200.0],  # Sector 1 (Agriculture)
    [300.0, 400.0]   # Sector 2 (Industry)
])

target_row_sums = np.array([330.0, 770.0]) # Target Gross Intermediate Output
target_col_sums = np.array([420.0, 680.0]) # Target Intermediate Input Consumption

# TODO: 1. Row Scaling Step (r = target_row_sums / current_row_sums)
# TODO: 2. Multiply each row i of A by r[i]
# TODO: 3. Column Scaling Step (s = target_col_sums / current_col_sums)
# TODO: 4. Multiply each col j of A by s[j]

# --- WRITE YOUR PYTHON CODE BELOW ---



print("═══════════════════════════════════════════════════")
print("   SUT 2008 RAS BALANCED INTERMEDIATE MATRIX       ")
print("═══════════════════════════════════════════════════")
print("Balanced Matrix A1:")
print(A)
print(f"Resulting Row Sums : {A.sum(axis=1)}")
print(f"Resulting Col Sums : {A.sum(axis=0)}")
`,
    solutionCode: `# UN SNA 2008 National Accounts Lab: SUT Matrix Balancing (RAS)
import numpy as np

A = np.array([
    [100.0, 200.0],
    [300.0, 400.0]
])

target_row_sums = np.array([330.0, 770.0])
target_col_sums = np.array([420.0, 680.0])

# Row scaling
current_row_sums = A.sum(axis=1)
r = target_row_sums / current_row_sums
A = A * r[:, np.newaxis]

# Col scaling
current_col_sums = A.sum(axis=0)
s = target_col_sums / current_col_sums
A = A * s[np.newaxis, :]

print("═══════════════════════════════════════════════════")
print("   SUT 2008 RAS BALANCED INTERMEDIATE MATRIX       ")
print("═══════════════════════════════════════════════════")
print("Balanced Matrix A1:")
print(np.round(A, 2))
print(f"Resulting Row Sums : {np.round(A.sum(axis=1), 2)}")
print(f"Resulting Col Sums : {np.round(A.sum(axis=0), 2)}")
`,
    solutionHint: "Multiply A by (target_row / row_sums)[:, None] then by (target_col / col_sums)[None, :].",
    sampleData: `Sector,Industry_1,Industry_2,Target_Output
Sector_1 (Agri),100.00,200.00,330.00
Sector_2 (Ind),300.00,400.00,770.00
Target_Input,420.00,680.00,1100.00`,
  },
  {
    id: "lab-ufs-geospatial",
    title: "Urban Frame Survey (UFS) Geospatial Block Sampling",
    domain: "Geospatial Frame & Statistical Tools",
    language: "python",
    difficulty: "Intermediate",
    instructions: "Write a script to compute household density per hectare for Urban Frame Survey (UFS) blocks and classify blocks into Sampling Strata based on density thresholds.",
    initialCode: `# UFS Geospatial Division Lab: Block Density Stratification
# Problem: Classify urban blocks based on household density (households / area_hectares).
# Stratum A (High Density): Density >= 120 hh/ha
# Stratum B (Medium Density): 60 <= Density < 120 hh/ha
# Stratum C (Low Density): Density < 60 hh/ha

ufs_blocks = [
    {"town": "Pune", "block_id": "UFS-27-0101", "households": 280, "area_ha": 1.8},
    {"town": "Pune", "block_id": "UFS-27-0102", "households": 150, "area_ha": 2.1},
    {"town": "Pune", "block_id": "UFS-27-0103", "households": 85,  "area_ha": 2.5},
    {"town": "Pune", "block_id": "UFS-27-0104", "households": 340, "area_ha": 2.0},
]

stratified_summary = {"Stratum A (High)": 0, "Stratum B (Medium)": 0, "Stratum C (Low)": 0}

# TODO: 1. Loop through ufs_blocks and calculate density = b["households"] / b["area_ha"]
# TODO: 2. Assign stratum category according to thresholds
# TODO: 3. Count total blocks in stratified_summary

# --- WRITE YOUR PYTHON CODE BELOW ---



print("═══════════════════════════════════════════════════")
print("  URBAN FRAME SURVEY (UFS) STRATIFICATION REPORT   ")
print("═══════════════════════════════════════════════════")
for st, count in stratified_summary.items():
    print(f"• {st:25s}: {count} blocks")
`,
    solutionCode: `# UFS Geospatial Division Lab: Block Density Stratification
ufs_blocks = [
    {"town": "Pune", "block_id": "UFS-27-0101", "households": 280, "area_ha": 1.8},
    {"town": "Pune", "block_id": "UFS-27-0102", "households": 150, "area_ha": 2.1},
    {"town": "Pune", "block_id": "UFS-27-0103", "households": 85,  "area_ha": 2.5},
    {"town": "Pune", "block_id": "UFS-27-0104", "households": 340, "area_ha": 2.0},
]

stratified_summary = {"Stratum A (High)": 0, "Stratum B (Medium)": 0, "Stratum C (Low)": 0}

for b in ufs_blocks:
    density = b["households"] / b["area_ha"]
    if density >= 120:
        st = "Stratum A (High)"
    elif density >= 60:
        st = "Stratum B (Medium)"
    else:
        st = "Stratum C (Low)"
    stratified_summary[st] += 1
    print(f"Block {b['block_id']}: Density {density:.1f} hh/ha ➔ {st}")

print("═══════════════════════════════════════════════════")
print("  URBAN FRAME SURVEY (UFS) STRATIFICATION REPORT   ")
print("═══════════════════════════════════════════════════")
for st, count in stratified_summary.items():
    print(f"• {st:25s}: {count} blocks")
`,
    solutionHint: "Compute density = households / area_ha and check conditions for >= 120, >= 60, or < 60.",
    sampleData: `Town_Name,UFS_Block_ID,Households,Area_Hectares
Pune,UFS-27-0101,280,1.80
Pune,UFS-27-0102,150,2.10
Pune,UFS-27-0103,85,2.50
Pune,UFS-27-0104,340,2.00`,
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
  const [mobilePane, setMobilePane] = useState<"editor" | "output">("editor");
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
    setMobilePane("editor");
  }, [exercise, isOpen]);

  if (!isOpen) return null;

  async function handleRun() {
    setRunning(true);
    setResult(null);
    setActiveTab("terminal");
    setMobilePane("output");
    try {
      let res: ExecutionResult;
      if (selectedEx.language === "python") {
        res = await runPythonCode(code);
      } else {
        res = await runSqlQuery(code);
      }
      setResult(res);
      
      if (res.success) {
        // Map domains to competencies for demo purposes
        const compMapping: Record<string, string> = {
          "Official Statistics & Price Indices": "Price Statistics (CPI / WPI)",
          "Survey Sampling & PLFS": "Sampling Theory & PPS",
          "Database Management & Big Data": "SQL & Database Querying",
          "National Accounts & SDC Aggregates": "National Accounts & GVA",
          "Data Privacy & SDC Governance": "Data Privacy (DPDP Act)",
        };
        const competencyName = compMapping[selectedEx.domain] || "Python for Data Analysis";

        applyClosedLoopCompetencyUpdate({
          competencyName,
          scorePct: 100, // Lab success counts as full points
          evidence: `Virtual Lab Completed: ${selectedEx.title}`,
        });

        // Add to completed list
        const completed = JSON.parse(localStorage.getItem("statskill_completed_labs") || "[]");
        if (!completed.includes(selectedEx.id)) {
          completed.push(selectedEx.id);
          localStorage.setItem("statskill_completed_labs", JSON.stringify(completed));
        }
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
    setMobilePane("editor");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#1E2430] text-gray-100 rounded-2xl shadow-2xl border border-gray-700 w-full max-w-5xl h-[92vh] sm:h-[88vh] flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="bg-[#141923] px-3 sm:px-5 py-2.5 sm:py-3.5 border-b border-gray-800 flex items-center justify-between shrink-0 flex-wrap gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="flex gap-1.5 shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
            </div>
            <div className="h-4 w-px bg-gray-700 mx-0.5 hidden sm:block" />
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-[11px] font-bold font-mono text-[#FF7A00] shrink-0">
                {selectedEx.language.toUpperCase()}
              </span>
              <span className="text-xs text-gray-400">·</span>
              <span className="text-xs text-gray-300 font-medium truncate max-w-[160px] sm:max-w-md">
                {selectedEx.title}
              </span>
            </div>
          </div>

          {/* Mobile Pane Switcher (Code vs Output) */}
          <div className="flex lg:hidden bg-[#1E2430] p-0.5 rounded-lg border border-gray-700 text-[11px] font-bold">
            <button
              onClick={() => setMobilePane("editor")}
              className={`px-2.5 py-1 rounded transition-colors ${
                mobilePane === "editor"
                  ? "bg-[#0B3D66] text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              📝 Code
            </button>
            <button
              onClick={() => setMobilePane("output")}
              className={`px-2.5 py-1 rounded transition-colors ${
                mobilePane === "output"
                  ? "bg-[#0B3D66] text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              🖥️ Output
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Exercise Selector */}
            <select
              value={selectedEx.id}
              onChange={(e) => {
                const found = OFFICIAL_LAB_EXERCISES.find((x) => x.id === e.target.value);
                if (found) handleSwitchExercise(found);
              }}
              className="bg-[#1E2430] border border-gray-700 text-gray-300 text-[11px] sm:text-xs rounded-lg px-2 py-1 focus:outline-none max-w-[130px] sm:max-w-xs truncate cursor-pointer"
            >
              {OFFICIAL_LAB_EXERCISES.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.title} ({ex.language.toUpperCase()})
                </option>
              ))}
            </select>

            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer text-sm font-bold"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Middle Body */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 min-h-0 divide-y lg:divide-y-0 lg:divide-x divide-gray-800">
          {/* Left: Code Editor (shown always on lg:, and on mobile when mobilePane === 'editor') */}
          <div className={`flex flex-col h-full bg-[#161B22] ${mobilePane !== "editor" ? "hidden lg:flex" : "flex"}`}>
            <div className="px-3 sm:px-4 py-2 bg-[#12161E] border-b border-gray-800 flex items-center justify-between text-xs text-gray-400 flex-wrap gap-1.5">
              <div className="flex items-center gap-2">
                <span className="font-mono text-emerald-400 font-semibold text-xs">
                  main.{selectedEx.language === "python" ? "py" : "sql"}
                </span>
                <span className="text-[10px] text-gray-500 font-mono hidden sm:inline">(Ctrl+Enter to Run)</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCode(selectedEx.initialCode)}
                  className="hover:text-gray-200 text-[10px] sm:text-[11px] font-mono text-gray-400 hover:underline cursor-pointer"
                  title="Reset to starter challenge code"
                >
                  Reset ↺
                </button>
                <button
                  onClick={() => setCode(selectedEx.solutionCode)}
                  className="hover:text-amber-300 text-[10px] sm:text-[11px] font-mono text-amber-400/90 hover:underline cursor-pointer"
                  title="Load reference solution into editor"
                >
                  💡 Solution
                </button>
                <button
                  onClick={() => setCode("")}
                  className="hover:text-rose-300 text-[10px] sm:text-[11px] font-mono text-gray-500 hover:underline cursor-pointer"
                  title="Clear editor"
                >
                  Clear
                </button>
              </div>
            </div>
            <textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              placeholder="Write your Python/SQL code here..."
              className="flex-1 w-full p-3 sm:p-4 bg-transparent text-gray-100 font-mono text-xs leading-relaxed resize-none focus:outline-none selection:bg-[#0B3D66]"
            />
          </div>

          {/* Right: Tabbed Output Console & Inspector (shown always on lg:, and on mobile when mobilePane === 'output') */}
          <div className={`flex flex-col h-full bg-[#0F131A] ${mobilePane !== "output" ? "hidden lg:flex" : "flex"}`}>
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
                      Write your solution on the left, then click <strong className="text-[#FF7A00]">"▶ Run Code"</strong> or press <strong className="text-white">Ctrl+Enter</strong> to execute.
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
                  <div className="bg-blue-950/40 border border-blue-800/80 p-4 rounded-xl text-blue-200 text-xs leading-relaxed space-y-2">
                    <strong className="text-white block mb-1">📐 Statistical Theory &amp; Methodology:</strong>
                    <p>{selectedEx.solutionHint}</p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-300 font-bold">Reference Implementation:</span>
                      <button
                        onClick={() => {
                          setCode(selectedEx.solutionCode);
                          setActiveTab("terminal");
                        }}
                        className="px-2.5 py-1 rounded bg-[#FF7A00] hover:bg-[#e06a00] text-white text-[11px] font-bold cursor-pointer transition-colors"
                      >
                        Load into Editor ➔
                      </button>
                    </div>
                    <pre className="text-emerald-300 whitespace-pre-wrap bg-[#0A0D14] p-3.5 rounded-xl border border-gray-800 text-[11px] font-mono leading-relaxed overflow-x-auto">
                      {selectedEx.solutionCode}
                    </pre>
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
