# Deployment Guide

## GitHub Actions + GitHub Pages (Recommended)

Your repo is configured for automatic deployment to GitHub Pages via GitHub Actions.

### Setup Steps

1. **Enable GitHub Pages**
   - Go to your repo: https://github.com/shevymeeker/traffic-stop
   - Click **Settings** → **Pages**
   - Under "Build and deployment" → "Source"
   - Select **GitHub Actions** (not "Deploy from a branch")

2. **Push to Main Branch**
   ```bash
   # Merge your branch to main or push directly to main
   git checkout main
   git merge claude/review-and-feedback-011EXbaRKBsfm7WJDfq7s5Gi
   git push origin main
   ```

3. **Wait for Deployment**
   - Go to **Actions** tab in your repo
   - Watch the "Deploy PWA to GitHub Pages" workflow run
   - Usually takes 1-2 minutes

4. **Access Your App**
   - Your app will be live at: `https://shevymeeker.github.io/traffic-stop/`
   - Can also trigger manual deployment from Actions tab → "Deploy PWA to GitHub Pages" → "Run workflow"

### Workflow Triggers

The deployment automatically runs when:
- ✅ Code is pushed to `main` or `master` branch
- ✅ Manually triggered from Actions tab

### File Structure

```
.github/
└── workflows/
    └── deploy.yml    # Deployment workflow
```

### Troubleshooting

**Workflow fails?**
- Check the Actions tab for error logs
- Ensure GitHub Pages is enabled in Settings
- Verify workflow has proper permissions

**404 on deployed site?**
- Check that base path in `vite.config.js` matches your repo name
- Currently set to `/traffic-stop/`
- Should match: `https://username.github.io/<repo-name>/`

**PWA not installing?**
- GitHub Pages serves over HTTPS ✓
- Check manifest is accessible at: `https://shevymeeker.github.io/traffic-stop/manifest.webmanifest`
- Clear browser cache and try again

## Alternative Deployment Options

### Netlify (Easiest)

1. Go to [netlify.com](https://netlify.com)
2. Drag and drop your `dist/` folder
3. Or connect your GitHub repo for auto-deployment

### Vercel

```bash
npx vercel
```

### Custom Server

```bash
npm run build
# Upload dist/ folder to your web server
# Point domain to the dist/ folder
```

## Environment Variables

No environment variables needed! The app works entirely client-side.

## Custom Domain

### For GitHub Pages:

1. Build and Settings → Pages → Custom domain
2. Enter your domain (e.g., `trafficstop.example.com`)
3. Add CNAME record in your DNS:
   ```
   CNAME -> shevymeeker.github.io
   ```
4. Update `base: '/'` in `vite.config.js` for custom domain

### For Netlify/Vercel:

Follow their custom domain instructions (very straightforward).

## Monitoring Deployments

- **GitHub Actions**: Check Actions tab for build logs
- **GitHub Pages**: Settings → Pages shows deployment status
- **Build Time**: ~1-2 minutes per deployment

## Update Deployment

Just push to main:
```bash
git push origin main
```

GitHub Actions handles the rest automatically!
