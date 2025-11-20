# Adding Content to Kentucky Legal Research Platform

This guide explains how to add more case law, KRS codes, and federal statutes to your platform.

## Quick Reference

| Content Type | Method | Command |
|-------------|--------|---------|
| Case Law | Admin Panel | Use `/admin` route in React app |
| Case Law | Bulk JSON/CSV | `node scripts/bulk-import-cases.js file.json` |
| Case Law | API Scraping | `node scripts/scrape-case-law.js --query "search"` |
| KRS Codes | Admin Panel | Use `/admin` route in React app |
| KRS Codes | Bulk JSON | `node scripts/bulk-import-krs.js file.json` |
| Federal Statutes | Bulk JSON | `node scripts/bulk-import-federal-statutes.js file.json` |

---

## Adding Case Law

### Method 1: Admin Panel (One at a Time)

1. Navigate to `/admin` in your React app
2. Use the **Add Case** form
3. Fill in all fields:
   - **Case Name**: "Miranda v. Arizona"
   - **Citation**: "384 U.S. 436"
   - **Year**: 1966
   - **Court**: U.S. Supreme Court
   - **Facts**: Background of the case
   - **Issue**: Legal question presented
   - **Holding**: Court's decision
   - **Discussion**: Full reasoning
   - **Category**: CRIMINAL PROCEDURE
   - **Tags**: comma-separated (e.g., "miranda, 5th-amendment")
   - **Related KRS**: comma-separated codes
   - **Importance**: 1-5 (5 = landmark case)

4. Click **Add Case**

### Method 2: Bulk Import from JSON

**Create a JSON file** (`cases.json`):

```json
[
  {
    "case_name": "United States v. Jones",
    "citation": "565 U.S. 400",
    "year": 2012,
    "court": "U.S. Supreme Court",
    "facts": "Police attached GPS tracking device to suspect's vehicle without warrant and tracked movements for 28 days.",
    "issue": "Whether attaching a GPS device to a vehicle and tracking its movements constitutes a search under the 4th Amendment?",
    "holding": "Yes. The Government's physical intrusion on the vehicle for the purpose of obtaining information constitutes a search.",
    "discussion": "The Court held that the Government's installation of a GPS device on a target's vehicle, and its use of that device to monitor the vehicle's movements, constitutes a 'search.' Justice Scalia noted this was a physical intrusion on a constitutionally protected area.",
    "full_text": "[Full opinion text if available]",
    "category": "SEARCH AND SEIZURE",
    "tags": ["gps", "tracking", "4th-amendment", "surveillance", "trespass"],
    "related_krs": ["431.015"],
    "importance": 5
  },
  {
    "case_name": "Riley v. California",
    "citation": "573 U.S. 373",
    "year": 2014,
    "court": "U.S. Supreme Court",
    "facts": "Police arrested Riley and searched his cell phone without a warrant, finding evidence of gang affiliation.",
    "issue": "Whether police may search digital information on a cell phone seized from an individual who has been arrested?",
    "holding": "No. Police generally may not, without a warrant, search digital information on a cell phone seized from an individual who has been arrested.",
    "discussion": "Chief Justice Roberts wrote that modern cell phones contain vast quantities of personal information and searching them implicates substantial privacy concerns that are not addressed by the same rationales supporting the search incident to arrest exception.",
    "category": "SEARCH AND SEIZURE",
    "tags": ["cell-phone", "digital-privacy", "search-incident-to-arrest", "4th-amendment"],
    "related_krs": [],
    "importance": 5
  }
]
```

**Import the file**:

```bash
SUPABASE_URL=https://xxx.supabase.co \
SUPABASE_SERVICE_KEY=your_service_key \
node scripts/bulk-import-cases.js cases.json
```

### Method 3: Bulk Import from CSV

**Create a CSV file** (`cases.csv`):

```csv
case_name,citation,year,court,facts,issue,holding,discussion,category,tags,related_krs,importance
"United States v. Jones","565 U.S. 400",2012,"U.S. Supreme Court","GPS tracking for 28 days","Is GPS tracking a search?","Yes, physical intrusion constitutes a search","The Court held...","SEARCH AND SEIZURE","gps,tracking,4th-amendment","431.015",5
```

**Import the file**:

```bash
SUPABASE_URL=xxx SUPABASE_SERVICE_KEY=xxx node scripts/bulk-import-cases.js cases.csv
```

### Method 4: Scrape from CourtListener API

**Get a free API key** from [courtlistener.com/api/rest-info](https://www.courtlistener.com/api/rest-info/)

**Search and download cases**:

```bash
COURTLISTENER_API_KEY=your_key node scripts/scrape-case-law.js --query "kentucky search warrant"
```

This saves cases to `scraped-cases.json` for review.

**Review and import**:

```bash
# Review the file first
cat scraped-cases.json

# Import if satisfied
SUPABASE_URL=xxx SUPABASE_SERVICE_KEY=xxx node scripts/bulk-import-cases.js scraped-cases.json
```

---

## Adding KRS Codes

### Method 1: Admin Panel

1. Navigate to `/admin` in your React app
2. Use the **Add KRS Code** form
3. Fill in fields:
   - **KRS Code**: "431.015"
   - **Title**: "Unlawful arrest prohibited"
   - **Chapter**: "ARREST"
   - **Full Text**: Complete statute text
   - **Category**: comma-separated
   - **Tags**: comma-separated

### Method 2: Bulk Import from JSON

**Create a JSON file** (`krs-codes.json`):

```json
[
  {
    "code": "218A.010",
    "title": "Definitions for KRS Chapter 218A",
    "chapter": "CONTROLLED SUBSTANCES",
    "full_text": "As used in this chapter, unless the context requires otherwise: (1) 'Administer' means the direct application of a controlled substance...",
    "category": ["Drugs", "Definitions"],
    "tags": ["drugs", "controlled-substances", "definitions"],
    "related_krs": ["218A.020", "218A.030"]
  }
]
```

**Import the file**:

```bash
# You'll need to create bulk-import-krs.js similar to bulk-import-cases.js
# Or use the seed script for reference
node scripts/bulk-import-krs.js krs-codes.json
```

---

## Adding Federal Statutes (USC Codes)

### Step 1: Run Database Migration

**In Supabase SQL Editor**, run the migration:

```sql
-- Copy and paste contents of supabase/add-federal-statutes.sql
```

This creates the `federal_statutes` table and includes 4 seed statutes:
- **42 USC 1983** - Civil rights lawsuits
- **18 USC 242** - Criminal civil rights violations
- **18 USC 241** - Conspiracy against rights
- **18 USC 2340A** - Torture

### Step 2: Bulk Import Additional Federal Statutes

**Create a JSON file** (`federal-statutes.json`):

```json
[
  {
    "code": "42 USC 1985",
    "title_number": 42,
    "section": "1985",
    "title_name": "The Public Health and Welfare",
    "heading": "Conspiracy to interfere with civil rights",
    "full_text": "If two or more persons in any State or Territory conspire or go in disguise on the highway or on the premises of another, for the purpose of depriving, either directly or indirectly, any person or class of persons of the equal protection of the laws...",
    "summary": "Provides civil remedy for conspiracies to interfere with civil rights",
    "category": ["Civil Rights", "Conspiracy"],
    "tags": ["civil-rights", "conspiracy", "equal-protection"],
    "related_krs": ["431.005"],
    "related_usc": ["42 USC 1983", "18 USC 241"]
  },
  {
    "code": "42 USC 1988",
    "title_number": 42,
    "section": "1988",
    "title_name": "The Public Health and Welfare",
    "heading": "Proceedings in vindication of civil rights",
    "full_text": "In any action or proceeding to enforce a provision of sections 1981, 1981a, 1982, 1983, 1985, and 1986 of this title...the court, in its discretion, may allow the prevailing party, other than the United States, a reasonable attorney's fee as part of the costs...",
    "summary": "Allows attorney fees in civil rights cases",
    "category": ["Civil Rights", "Attorney Fees"],
    "tags": ["attorney-fees", "civil-rights", "costs"],
    "related_usc": ["42 USC 1983", "42 USC 1985"]
  }
]
```

**Import the file**:

```bash
SUPABASE_URL=xxx SUPABASE_SERVICE_KEY=xxx node scripts/bulk-import-federal-statutes.js federal-statutes.json
```

### Step 3: Download USC Text

**Sources for federal statute text**:

1. **Official U.S. Code** (uscode.house.gov)
   - Most authoritative
   - Harder to copy/paste

2. **Cornell Legal Information Institute** (law.cornell.edu/uscode)
   - Easy to browse and copy
   - Well-formatted
   - Recommended for most users

3. **GovInfo** (govinfo.gov)
   - Official source
   - Downloadable formats

**Example workflow**:
1. Go to [law.cornell.edu/uscode](https://www.law.cornell.edu/uscode)
2. Navigate to Title 42 → Chapter 21 → Subchapter I → § 1985
3. Copy the text
4. Paste into your JSON file
5. Add metadata (summary, tags, related codes)
6. Import with bulk-import script

---

## Common Federal Statutes to Add

### Civil Rights Statutes

- **42 USC 1981** - Equal rights under the law
- **42 USC 1982** - Property rights
- **42 USC 1985** - Conspiracy to interfere with civil rights
- **42 USC 1986** - Action for neglect to prevent conspiracy
- **42 USC 1988** - Attorney fees
- **42 USC 2000d** - Prohibition on discrimination (Title VI)

### Criminal Civil Rights Statutes

- **18 USC 241** - Conspiracy against rights (already seeded)
- **18 USC 242** - Deprivation of rights under color of law (already seeded)
- **18 USC 245** - Federally protected activities
- **18 USC 249** - Hate crimes

### Privacy & Surveillance

- **18 USC 2510-2522** - Wiretap Act
- **18 USC 2701-2712** - Stored Communications Act
- **50 USC 1801-1885c** - Foreign Intelligence Surveillance Act (FISA)

---

## Data Quality Guidelines

### For Case Law

- **Always include**:
  - Case name and citation
  - At least the holding (what the court decided)
  - Category (search/seizure, arrest, etc.)

- **Best practice**:
  - Include Facts, Issue, Holding, and Discussion (FIHD format)
  - Add relevant tags for searchability
  - Link related KRS codes
  - Set appropriate importance level

- **Importance Levels**:
  - **5** - Landmark Supreme Court case (Miranda, Terry, Mapp)
  - **4** - Important Supreme Court case
  - **3** - Circuit court or state supreme court
  - **2** - State appellate court
  - **1** - Trial court or narrow application

### For KRS Codes

- **Always include**:
  - Full KRS code number
  - Complete statute text
  - Chapter/section organization

- **Best practice**:
  - Add plain-language summaries
  - Tag with relevant topics
  - Link related KRS codes
  - Include effective/amended dates if known

### For Federal Statutes

- **Always include**:
  - Full USC citation (e.g., "42 USC 1983")
  - Title number and section
  - Complete statute text
  - Heading/title

- **Best practice**:
  - Write plain-language summary
  - Tag with relevant topics
  - Cross-reference related USC codes
  - Cross-reference related KRS codes
  - Include effective/amended dates if known

---

## Integration with AI Search

All content you add automatically integrates with the AI scenario search:

1. **Full-text search** - PostgreSQL searches across all fields
2. **AI context** - Claude receives top matches for analysis
3. **Cross-referencing** - Related codes automatically linked
4. **Tagging** - Auto-categorization based on tags

The `analyze-scenario.js` function searches:
- Case law (top 10 matches)
- KRS codes (top 5 matches)
- Federal statutes (top 5 matches)

And provides all three types to Claude for comprehensive legal analysis.

---

## Troubleshooting

### Import Errors

If bulk import fails, check `data/import-errors.json` (or `data/federal-import-errors.json`).

**Common issues**:

1. **Missing required fields**
   - Case law: Must have `full_title` or `case_name`
   - KRS: Must have `code`, `title`, `full_text`
   - Federal: Must have `code`, `heading`, `full_text`

2. **Array format**
   - Tags and related codes can be:
     - Array: `["tag1", "tag2"]`
     - String: `"tag1, tag2"`
   - Both formats are automatically handled

3. **Duplicate codes**
   - KRS and federal statutes have unique constraints on `code`
   - Delete existing entry first or update the code

### Database Connection

If Supabase connection fails:

```bash
# Verify environment variables
echo $SUPABASE_URL
echo $SUPABASE_SERVICE_KEY

# Test connection
node -e "import('@supabase/supabase-js').then(({createClient}) => console.log(createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)))"
```

---

## Next Steps

After adding content:

1. **Test search** - Use the admin panel or public UI to search
2. **Verify AI** - Run scenario searches to ensure new content appears
3. **Monitor analytics** - Check `scenarios` table for popular searches
4. **Expand coverage** - Add more cases in underrepresented areas

Your platform is designed to grow. Keep adding cases, statutes, and federal laws to build a comprehensive Kentucky legal resource.
