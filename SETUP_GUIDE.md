# Kentucky Legal Research Platform - Complete Setup Guide

## What We've Built

A full-stack legal research platform with:
- **121 structured case law entries** (extracted from your START HERE.html)
- **AI-powered scenario analysis** using Claude API
- **Admin panel** for adding/editing case law and KRS codes
- **Public interface** for citizens to get legal guidance
- **Full-text search** across cases and statutes
- **Scalable architecture** ready for all KRS codes

---

## Prerequisites

1. **Node.js 18+** installed
2. **GitHub account**
3. **Netlify account** (free tier works)
4. **Supabase account** (free tier works)
5. **Claude API key** from Anthropic

---

## Step 1: Get Your API Keys

### Claude API Key
1. Go to https://console.anthropic.com
2. Sign up / Log in
3. Go to "API Keys"
4. Create a new key
5. Copy it (starts with `sk-ant-api03-...`)
6. **Cost**: ~$0.03 per scenario analysis, $5 free credits to start

### Supabase Setup
1. Go to https://supabase.com
2. Create a new project
3. Wait for it to initialize (~2 minutes)
4. Go to **Settings → API**
5. Copy these values:
   - **Project URL** (`https://xxx.supabase.co`)
   - **anon public** key
   - **service_role** secret key (for admin operations)

---

## Step 2: Initialize Database

### Run the Schema
1. In Supabase dashboard, go to **SQL Editor**
2. Open the file: `supabase/schema.sql`
3. Copy entire contents
4. Paste into Supabase SQL Editor
5. Click "Run"
6. You should see: "Success. No rows returned"

### Seed Initial Data
1. Install Supabase client:
   ```bash
   npm install @supabase/supabase-js
   ```

2. Set environment variables and run seed script:
   ```bash
   SUPABASE_URL=https://xxx.supabase.co \
   SUPABASE_SERVICE_KEY=your-service-role-key \
   node scripts/seed-database.js
   ```

3. This will import all 121 cases into your database

---

## Step 3: Configure Environment Variables

### Create `.env` file (for local development)
```bash
# Claude API
CLAUDE_API_KEY=sk-ant-api03-...

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key

# Admin Authentication (set a strong password)
ADMIN_SECRET=your-secure-password-here
```

### Add to `.gitignore`
Make sure `.env` is in `.gitignore` (already done):
```
.env
.env.local
```

---

## Step 4: Install Dependencies

```bash
npm install
```

This installs:
- React + Vite (already in package.json)
- Supabase client
- Other dependencies

Update `package.json` to include:
```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "lucide-react": "^0.263.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.3",
    "autoprefixer": "^10.4.14",
    "postcss": "^8.4.27",
    "tailwindcss": "^3.3.3",
    "vite": "^4.4.5",
    "vite-plugin-pwa": "^0.16.4"
  }
}
```

---

## Step 5: Test Locally

```bash
# Start development server
npm run dev

# Start Netlify Dev (to test functions)
npx netlify dev
```

Visit `http://localhost:8888` (Netlify Dev) to test functions.

---

## Step 6: Deploy to Netlify

### Option A: Via GitHub (Recommended)

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Complete Kentucky Legal Research Platform"
   git push origin claude/review-repo-template-01Mw9pm4rk8FRfXj5e3WyrsP
   ```

2. **Connect to Netlify**:
   - Go to https://app.netlify.com
   - Click "Add new site" → "Import an existing project"
   - Connect to GitHub
   - Select your `civilrights` repository
   - Branch: `claude/review-repo-template-01Mw9pm4rk8FRfXj5e3WyrsP` (or main after merging)
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Click "Deploy"

3. **Add Environment Variables in Netlify**:
   - Go to Site settings → Environment variables
   - Add these:
     - `CLAUDE_API_KEY`
     - `SUPABASE_URL`
     - `SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_KEY`
     - `ADMIN_SECRET`

4. **Redeploy**:
   - Trigger a new deploy to pick up the environment variables

### Option B: Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Initialize
netlify init

# Deploy
netlify deploy --prod
```

---

## Step 7: Add Custom Domain (Optional)

1. In Netlify: **Domain settings** → **Add custom domain**
2. Follow DNS instructions
3. Netlify provides free HTTPS automatically

---

## Step 8: Access Admin Panel

### Set Admin Password
1. In your `.env` and Netlify environment variables, set:
   ```
   ADMIN_SECRET=your-secure-password
   ```

2. To access admin panel, use this token in localStorage:
   ```javascript
   // In browser console:
   localStorage.setItem('admin_token', 'your-secure-password');
   ```

3. Then navigate to `/admin` route (you'll need to create this route)

---

## Project Structure

```
civilrights/
├── data/
│   ├── extracted-cases.json          # Raw extracted data
│   └── case-law-structured.json      # Structured for database
│
├── scripts/
│   ├── extract-cases.js              # Extract from START HERE.html
│   ├── extract-cases-v2.js           # Improved extraction
│   ├── structure-cases.js            # Parse fields
│   └── seed-database.js              # Populate Supabase
│
├── supabase/
│   └── schema.sql                    # Database schema
│
├── netlify/
│   └── functions/
│       ├── analyze-scenario.js       # Claude AI integration
│       ├── add-case.js               # Admin: Add case law
│       └── add-krs.js                # Admin: Add KRS code
│
├── src/
│   ├── admin/
│   │   ├── AddCaseForm.jsx           # Form to add cases
│   │   └── AddKRSForm.jsx            # Form to add KRS
│   │
│   ├── components/
│   │   └── ScenarioSearch.jsx        # Public scenario search
│   │
│   └── TrafficStopSimulator.jsx      # Existing app
│
├── netlify.toml                       # Netlify config
└── SETUP_GUIDE.md                     # This file
```

---

## Usage

### For Public Users
1. Visit your deployed site
2. Go to "Scenario Search" mode
3. Type a scenario (e.g., "Officer asked to search my trunk")
4. Get AI-powered legal analysis + relevant cases + KRS codes

### For Admins
1. Set `admin_token` in localStorage
2. Navigate to admin panel
3. Add/edit case law and KRS codes
4. Data immediately available for searches

---

## Next Steps

### 1. Add More KRS Codes
Use the **KRS Scraper** (to be built):
```bash
node scripts/scrape-krs.js
```

Or manually add via admin panel.

### 2. Improve AI Prompts
Edit `netlify/functions/analyze-scenario.js` to refine how Claude analyzes scenarios.

### 3. Add Authentication
Replace simple token auth with proper authentication (e.g., Supabase Auth).

### 4. Analytics
Track what scenarios users search for in the `scenarios` table.

### 5. Mobile PWA
The app is already set up as a PWA - test installation on mobile.

---

## Cost Breakdown

### Netlify (Free Tier)
- ✅ 100GB bandwidth/month
- ✅ 300 build minutes/month
- ✅ 125K function calls/month
- **Cost**: $0

### Supabase (Free Tier)
- ✅ 500MB database
- ✅ 50,000 monthly active users
- ✅ Unlimited API requests
- **Cost**: $0

### Claude API (Pay-as-you-go)
- ~$0.03 per scenario analysis
- 100 searches = $3
- 1,000 searches = $30
- **Free**: $5 credits to start

### Total Monthly Cost
- **Light usage** (100-500 searches): $5-15
- **Medium usage** (1,000 searches): $30
- **Heavy usage** (5,000 searches): $150

---

## Troubleshooting

### "Rate limit exceeded"
- The app limits to 10 searches/hour per IP
- Increase in `netlify/functions/analyze-scenario.js`

### "Failed to analyze scenario"
- Check Claude API key in Netlify environment variables
- Check API key has credits

### "Database connection error"
- Verify Supabase URL and keys
- Check Supabase project is running

### Functions not working locally
- Use `netlify dev` instead of `npm run dev`
- Ensure `.env` file exists

---

## Support

- **Claude API**: https://docs.anthropic.com
- **Supabase**: https://supabase.com/docs
- **Netlify**: https://docs.netlify.com

---

## License

MIT - Use this to help people understand their rights!
