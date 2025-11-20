# Kentucky Legal Research Platform

An AI-powered legal research platform for Kentucky law featuring 178 case law entries, 280 KRS codes, and intelligent scenario analysis powered by Claude AI.

## 🎯 What This Is

A comprehensive legal research tool that helps citizens, law students, and legal professionals understand Kentucky law through:
- **AI-Powered Scenario Analysis** - Describe any legal scenario and get relevant case law and statutes
- **178 Structured Case Law Entries** - Supreme Court and Kentucky cases with parsed holdings, facts, and issues
- **280 KRS Code Entries** - Kentucky Revised Statutes across all major chapters
- **Full-Text Search** - PostgreSQL-powered search across all legal content
- **Admin Panel** - Easy interface to add more cases and statutes

## 📊 Database Coverage

### Case Law (178 entries)
- **Arrest Law** (89 cases) - Payton, Welsh, Terry, etc.
- **Search Warrants** (80 cases) - 4th Amendment precedents
- **Computer/Electronic Crime** (9 cases)
- U.S. Supreme Court, Kentucky Supreme Court, and Circuit cases

### KRS Codes (280 entries)
- **Section 2**: General Provisions
- **Section 3**: Special Law Enforcement Problems
- **Section 4**: Unified Juvenile Code
- **Section 5**: Traffic Regulations
- **Section 6**: Drugs
- **Section 7**: Miscellaneous Non-Penal Code Offenses
- **Section 8**: Kentucky Penal Code
- And more...

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables (see SETUP_GUIDE.md)
cp .env.example .env
# Edit .env with your API keys

# Seed database with all case law and KRS codes
SUPABASE_URL=xxx SUPABASE_SERVICE_KEY=xxx node scripts/seed-complete-database.js

# Start development server (with functions)
npx netlify dev

# Build for production
npm run build
```

## 🏗️ Architecture

```
Frontend (React) → Netlify Functions → Claude API + Supabase PostgreSQL
```

- **Frontend**: React + Tailwind CSS
- **Backend**: Netlify Serverless Functions
- **Database**: Supabase (PostgreSQL with full-text search)
- **AI**: Claude Sonnet 4 API for scenario analysis
- **Deployment**: GitHub + Netlify

## 💡 Features

### For Citizens
- **Scenario Search**: Describe any legal situation and get AI-powered analysis with relevant case law and statutes
- **Know Your Rights**: Understand constitutional protections and Kentucky law
- **Case Law Library**: Browse landmark cases with structured summaries
- **KRS Code Database**: Search and read Kentucky statutes

### For Legal Professionals
- **Comprehensive Database**: 178 cases + 280 statutes ready to search
- **Admin Panel**: Add new cases and KRS codes through structured forms
- **Full-Text Search**: PostgreSQL search with relevance ranking
- **Tagging System**: Auto-tagging for quick filtering (arrest, search, drugs, etc.)

### For Researchers
- **Structured Data**: JSON exports of all case law and statutes
- **Analytics**: Track what scenarios users search for
- **API-Ready**: All functions accessible via REST API

## 📁 Project Structure

```
civilrights/
├── data/
│   ├── case-law-complete.json       # 178 structured cases
│   ├── krs-codes-complete.json      # 280 KRS codes
│   └── all-entries-unfiltered.json  # Raw extraction
│
├── scripts/
│   ├── extract-all-unfiltered.js    # Extract from START HERE.html
│   ├── structure-all-comprehensive.js # Parse and structure
│   └── seed-complete-database.js    # Import to Supabase
│
├── supabase/
│   └── schema.sql                   # Complete database schema
│
├── netlify/functions/
│   ├── analyze-scenario.js          # Claude AI integration
│   ├── add-case.js                  # Admin: Add case law
│   └── add-krs.js                   # Admin: Add KRS code
│
├── src/
│   ├── admin/
│   │   ├── AddCaseForm.jsx          # Form to add cases
│   │   └── AddKRSForm.jsx           # Form to add KRS
│   │
│   ├── components/
│   │   └── ScenarioSearch.jsx       # Public AI scenario search
│   │
│   └── TrafficStopSimulator.jsx     # Original traffic stop trainer
│
├── SETUP_GUIDE.md                   # Complete deployment guide
├── PROJECT_SUMMARY.md               # Architecture overview
└── README.md                        # This file
```

## 🔧 Technology Stack

- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Supabase** - PostgreSQL database with auth
- **Netlify Functions** - Serverless backend
- **Claude API** - AI-powered legal analysis
- **Lucide React** - Icons

## 📚 Documentation

- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Step-by-step deployment instructions
- **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - Architecture and feature overview
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Netlify deployment guide

## 💰 Cost Estimate

- **Netlify**: FREE (free tier)
- **Supabase**: FREE (free tier, 500MB database)
- **Claude API**: ~$0.03 per scenario search
  - 100 searches/month = $3
  - 1,000 searches/month = $30

**Total first month**: ~$5-10 (using free tier + credits)

## 🔒 Security

- ✅ Rate limiting (10 requests/hour per IP)
- ✅ Admin authentication
- ✅ Row-level security in Supabase
- ✅ API keys hidden in environment variables
- ✅ HTTPS automatic via Netlify

## ⚖️ Legal Disclaimer

This platform provides legal education and information, NOT legal advice.
- In any police encounter, physical compliance is mandatory
- Your remedy is in court, not on the roadside
- Consult a licensed attorney for specific legal guidance

## 🤝 Contributing

Issues and pull requests welcome. Help us expand the database with more case law and KRS codes!

## 📄 License

MIT - Use this to help people understand the law

## 🙏 Credits

- Case Law & KRS Codes: Extracted and structured from original legal research
- AI: Anthropic Claude (Sonnet 4)
- Database: Supabase (PostgreSQL)
- Hosting: Netlify
- Icons: Lucide React

---

**Built to democratize legal knowledge and help people understand their rights under Kentucky law.**
