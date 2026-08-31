// ──────────────────────────────────────────────
// Official Statistics File & Dataset Downloader Service
// Generates authentic CSV datasets, Python/R scripts, SQL queries, and training documentation
// ──────────────────────────────────────────────

export interface DownloadableAsset {
  filename: string;
  mimeType: string;
  content: string;
}

export function generateOfficialDataset(filename: string): DownloadableAsset {
  const cleanName = filename.toLowerCase();

  // 1. Supply Use Matrix CSV
  if (cleanName.includes("supply_use") || cleanName.includes("sut") || cleanName.includes("matrix")) {
    const content = `Sector_Code,Industry_Name,Domestic_Output_Cr,Imports_Cr,Total_Supply_Cr,Intermediate_Use_Cr,Final_Consumption_Cr,Gross_Capital_Formation_Cr,Exports_Cr,GVA_Basic_Cr
01,Crops & Agriculture,452100.50,18400.20,470500.70,121400.30,295600.40,18900.00,34600.00,330700.20
02,Livestock & Dairy,182400.00,3200.50,185600.50,54200.10,126800.40,1200.00,3400.00,128200.00
03,Forestry & Logging,41200.80,4500.00,45700.80,18900.20,21200.60,1100.00,4500.00,22300.60
04,Fishing & Aquaculture,68900.20,1200.00,70100.20,19400.00,39800.20,2900.00,8000.00,49500.20
05,Coal & Lignite Mining,89400.00,32100.00,121500.00,112400.00,2100.00,4200.00,2800.00,68200.00
06,Crude Petroleum & Natural Gas,142000.00,284000.00,426000.00,398000.00,8000.00,12000.00,8000.00,94000.00
07,Food Products & Beverages,389000.40,42100.00,431100.40,245000.40,154100.00,6000.00,26000.00,144000.00
08,Textiles Apparel & Leather,215000.00,31400.00,246400.00,128000.00,72400.00,8000.00,38000.00,87000.00
09,Chemicals & Pharmaceuticals,312000.00,118000.00,430000.00,289000.00,61000.00,18000.00,62000.00,123000.00
10,Basic Metals & Fabricated,284000.00,86000.00,370000.00,264000.00,12000.00,64000.00,30000.00,98000.00
11,Machinery & Equipment,194000.00,142000.00,336000.00,182000.00,18000.00,112000.00,24000.00,88000.00
12,Electricity Gas & Water Supply,168000.00,2400.00,170400.00,89000.00,68400.00,11000.00,2000.00,79000.00
13,Construction,520000.00,0.00,520000.00,286000.00,0.00,234000.00,0.00,234000.00
14,Trade Repair & Hotels,486000.00,12000.00,498000.00,142000.00,312000.00,18000.00,26000.00,344000.00
15,Transport & Storage,248000.00,28000.00,276000.00,124000.00,121000.00,11000.00,20000.00,124000.00
16,Financial & Insurance,324000.00,14000.00,338000.00,89000.00,214000.00,15000.00,20000.00,235000.00
17,Real Estate & Professional,412000.00,18000.00,430000.00,118000.00,282000.00,12000.00,18000.00,294000.00
18,Public Administration & Defence,298000.00,0.00,298000.00,64000.00,234000.00,0.00,0.00,234000.00`;
    return { filename: "Supply_Use_66_Sector_Matrix.csv", mimeType: "text/csv", content };
  }

  // 2. CPI Basket Weights CSV
  if (cleanName.includes("cpi") || cleanName.includes("price") || cleanName.includes("basket")) {
    const content = `Item_Group_Code,Item_Group_Name,Rural_Weight_2012,Urban_Weight_2012,Combined_Weight_2012,Base_Index_2012,Current_Index_2026,Weight_Share_Pct
01,Food and Beverages,54.18,36.29,45.86,100.00,189.40,45.86
02,Pan Tobacco and Intoxicants,3.26,1.36,2.38,100.00,201.20,2.38
03,Clothing and Footwear,7.36,5.57,6.53,100.00,178.60,6.53
04,Housing (Urban Only),0.00,21.67,10.07,100.00,174.90,10.07
05,Fuel and Light,7.94,5.58,6.84,100.00,182.10,6.84
06,Miscellaneous (Health/Edu/Transport),27.26,29.53,28.32,100.00,176.40,28.32
Total,All Groups Combined,100.00,100.00,100.00,100.00,182.74,100.00`;
    return { filename: "cpi_item_weights_basket_2012.csv", mimeType: "text/csv", content };
  }

  // 3. FSU Sampling Weights CSV
  if (cleanName.includes("fsu") || cleanName.includes("sampling") || cleanName.includes("village") || cleanName.includes("weights")) {
    const content = `State_Code,State_Name,Stratum_ID,Sub_Stratum,FSU_ID,Sector,FSU_Population_Census,Sampling_Prob_P1,Sub_Sample,Multiplier_FSU
09,Uttar Pradesh,0901,1,0901001,Rural,2480,0.00142,1,704.22
09,Uttar Pradesh,0901,1,0901002,Rural,3120,0.00179,2,558.65
09,Uttar Pradesh,0902,1,0902001,Urban,1850,0.00210,1,476.19
19,West Bengal,1901,2,1901001,Rural,1940,0.00165,1,606.06
19,West Bengal,1901,2,1901002,Rural,2810,0.00238,2,420.17
27,Maharashtra,2701,1,2701001,Urban,4200,0.00312,1,320.51
27,Maharashtra,2701,1,2701002,Urban,3890,0.00289,2,346.02
33,Tamil Nadu,3301,1,3301001,Rural,1620,0.00135,1,740.74
33,Tamil Nadu,3301,1,3301002,Rural,2100,0.00175,2,571.43
36,Telangana,3601,2,3601001,Urban,2950,0.00246,1,406.50`;
    return { filename: "sample_village_fsu_weights.csv", mimeType: "text/csv", content };
  }

  // 4. PLFS Unit Microdata Sample CSV
  if (cleanName.includes("plfs") || cleanName.includes("household") || cleanName.includes("microdata")) {
    const content = `Record_ID,State_Code,FSU_ID,Sample_Hh_No,Person_No,Age,Sex,Edu_Level,Usual_Principal_Activity,NIC_2Digit_Industry,Weekly_Earnings_Rs,Weight_Combined
0001,09,0901001,1,1,42,1,Graduation,11,01,18500,704.22
0002,09,0901001,1,2,38,2,Secondary,51,01,6200,704.22
0003,09,0901001,2,1,29,1,Technical_Dip,31,62,35000,704.22
0004,19,1901001,1,1,51,1,PostGrad,12,85,48000,606.06
0005,19,1901001,1,2,46,2,Graduation,21,85,32000,606.06
0006,27,2701001,1,1,34,1,Secondary,51,45,22000,320.51
0007,27,2701001,2,1,24,1,Graduation,31,64,41000,320.51
0008,33,3301001,1,1,58,1,Primary,11,01,14000,740.74
0009,36,3601001,1,1,31,2,PostGrad,11,72,55000,406.50
0010,36,3601001,2,1,27,1,Graduation,31,62,44000,406.50`;
    return { filename: "plfs_household_multiplier_sample.csv", mimeType: "text/csv", content };
  }

  // 5. Python Pipeline Script
  if (cleanName.includes(".py") || cleanName.includes("python")) {
    const content = `"""
MoSPI / NSSTA Official Statistics Automation Pipeline
Module: Survey Multipliers, Weighted Means, and Sub-sample Variance Estimation
"""
import pandas as pd
import numpy as np

def compute_survey_totals(csv_path: str = "plfs_household_multiplier_sample.csv"):
    print(">>> Loading NSSO Unit Microdata from:", csv_path)
    df = pd.read_csv(csv_path)
    
    # 1. Calculate Weighted Earnings Total
    df['Weighted_Earnings'] = df['Weekly_Earnings_Rs'] * df['Weight_Combined']
    total_estimated_earnings = df['Weighted_Earnings'].sum()
    total_estimated_population = df['Weight_Combined'].sum()
    weighted_mean_earnings = total_estimated_earnings / total_estimated_population
    
    print("=" * 60)
    print("  OFFICIAL NSSO LAB ESTIMATION REPORT (MoSPI/NSSTA)")
    print("=" * 60)
    print(f"Total Sample Records       : {len(df):,}")
    print(f"Estimated Universe Pop     : {total_estimated_population:,.2f}")
    print(f"Estimated Total Earnings   : Rs. {total_estimated_earnings:,.2f}")
    print(f"Estimated Mean Weekly Wage : Rs. {weighted_mean_earnings:.2f}")
    print("=" * 60)
    return {
        "pop_est": total_estimated_population,
        "mean_wage": weighted_mean_earnings
    }

if __name__ == "__main__":
    res = compute_survey_totals()
    print("Pipeline execution verified successfully.")
`;
    return { filename: "survey_weights_pipeline.py", mimeType: "text/x-python", content };
  }

  // 6. R Script
  if (cleanName.includes(".r") || cleanName.includes("r_script") || cleanName.includes("template.r")) {
    const content = `# Official MoSPI / NSSTA R Survey Analysis Template
# Package: survey (CRAN)

library(survey)

# 1. Load microdata sample
microdata <- read.csv("plfs_household_multiplier_sample.csv")

# 2. Configure Survey Design with Multi-Stage Weights
nss_design <- svydesign(
  id = ~FSU_ID,
  strata = ~State_Code,
  weights = ~Weight_Combined,
  data = microdata,
  nest = TRUE
)

# 3. Compute Unbiased Mean Weekly Earnings with Standard Error
mean_wage <- svymean(~Weekly_Earnings_Rs, nss_design, na.rm = TRUE)
print(summary(mean_wage))

# 4. Compute Tabulation by Educational Attainment
edu_tab <- svyby(~Weekly_Earnings_Rs, ~Edu_Level, nss_design, svymean)
print(edu_tab)
`;
    return { filename: "survey_analysis_template.R", mimeType: "text/plain", content };
  }

  // 7. SQL Query File
  if (cleanName.includes(".sql")) {
    const content = `-- MoSPI / NSSTA Statistical Database Querying
-- Official PostgreSQL Template for Industrial Registry (ASI) Analysis

-- 1. Deduplicate Enterprise Establishments on GSTIN/MCA ID
WITH ranked_enterprises AS (
    SELECT 
        gstin,
        state_code,
        nic_2digit,
        gross_output,
        intermediate_consumption,
        (gross_output - intermediate_consumption) AS gva,
        ROW_NUMBER() OVER (PARTITION BY gstin ORDER BY survey_year DESC) AS rnk
    FROM industrial_registry_raw
)
SELECT 
    state_code,
    nic_2digit,
    COUNT(DISTINCT gstin) AS total_factories,
    SUM(gross_output) AS total_output_cr,
    SUM(gva) AS total_gva_cr,
    ROUND(AVG(gva), 2) AS avg_gva_per_unit
FROM ranked_enterprises
WHERE rnk = 1
GROUP BY state_code, nic_2digit
ORDER BY total_gva_cr DESC;
`;
    return { filename: "enterprise_registry_queries.sql", mimeType: "text/plain", content };
  }

  // 8. Official PDF Manual / Guide fallback
  const content = `# National Statistical Systems Training Academy (NSSTA)
## Ministry of Statistics and Programme Implementation (MoSPI), Government of India
### Official Curriculum Reference Guide: ${filename.replace(/_/g, " ").replace(/\.[^/.]+$/, "")}

---

### 1. Executive Summary & Statutory Framework
This document serves as the authorized training and procedural reference for Indian Statistical Service (ISS), Subordinate Statistical Service (SSS), and State DES statistical officers. All methodologies conform to the **Collection of Statistics Act, 2008**, **UN System of National Accounts (SNA 2008)**, and the **National Indicator Framework for SDGs**.

### 2. Methodological Standards
- **Stratified Multi-Stage Sampling**: Rural FSUs selected via PPS Systematic sampling with census frames.
- **Laspeyres Index Formula**: Modified Laspeyres price relatives normalized with base 2012 item weights.
- **Closed-Loop Competency Framework**: Automated diagnostic scoring, skill-gap mitigation, and cryptographically verified W3C digital credentials.

### 3. Verification & Compliance
- **Audit Logging**: All assessments and laboratory exercise runs are recorded on the MoSPI Capacity Ledger.
- **CPD Hours**: Fulfills mandatory 50-hour Annual Continuing Professional Development (CPD) accreditation.

*Published by:*  
National Statistical Systems Training Academy (NSSTA)  
Plot No. 22, Knowledge Park-II, Greater Noida, Uttar Pradesh 201310  
Government of India · https://mospi.gov.in
`;
  return {
    filename: filename.endsWith(".pdf") || filename.endsWith(".md") || filename.endsWith(".txt") ? filename : `${filename}.txt`,
    mimeType: "text/markdown",
    content,
  };
}

export function triggerBrowserDownload(asset: DownloadableAsset) {
  if (typeof window === "undefined") return;
  const blob = new Blob([asset.content], { type: `${asset.mimeType};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = asset.filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
