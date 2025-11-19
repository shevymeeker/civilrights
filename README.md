# Kentucky Traffic Stop Simulator

A Progressive Web App (PWA) for training on legal rights during traffic stops in Kentucky.

## Features

- **Learn Mode**: Study the legal framework, case law (Whren, Rodriguez, Mimms, Riley), and the "three sentences" script
- **Practice Mode**: Interactive scenarios to drill responses to common officer questions
- **Document Mode**: Structured form to record details immediately after a traffic stop
- **Offline Support**: Works without internet after first load (PWA)
- **Installable**: Add to home screen on mobile and desktop
- **Data Persistence**: Documentation automatically saves to localStorage

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Development

Development server runs at `http://localhost:5173`

## PWA Icons

The app works with the included SVG icon. To generate PNG icons for better PWA support:

1. Open `public/icon-placeholder.html` in a browser
2. Click the download buttons to generate all required icon files
3. Icons will download automatically - they're already properly sized and named

Or use an online tool like [https://realfavicongenerator.net/](https://realfavicongenerator.net/) with `public/icon.svg`

## Project Structure

```
traffic-stop/
├── public/
│   ├── icon.svg              # Base icon design
│   └── icon-placeholder.html # Icon generator tool
├── src/
│   ├── main.jsx              # App entry point
│   ├── App.jsx               # Root component
│   ├── TrafficStopSimulator.jsx  # Main app component
│   └── index.css             # Tailwind directives
├── vite.config.js            # Vite + PWA configuration
├── package.json
└── README.md
```

## Deployment

### GitHub Pages with Actions (Recommended) ⚡

Automated deployment is configured! See [DEPLOYMENT.md](./DEPLOYMENT.md) for full instructions.

**Quick Start:**
1. Enable GitHub Pages in repo Settings → Pages → Source: "GitHub Actions"
2. Push to `main` branch
3. Your app deploys automatically to: `https://shevymeeker.github.io/traffic-stop/`

### Alternative Options

**Netlify:** Drag & drop the `dist/` folder to [netlify.com](https://netlify.com)

**Vercel:** `npx vercel`

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## Technology Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Vite PWA Plugin** - Service worker and manifest generation

## Browser Requirements

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- iOS Safari 14+
- Chrome Mobile

## PWA Features

✓ **Service Worker** - Automatic caching for offline use
✓ **Web App Manifest** - Installable on home screen
✓ **localStorage** - Persistent documentation storage
✓ **Responsive** - Mobile and desktop optimized

## Legal Disclaimer

This tool is for educational purposes. It provides no physical protection. In any encounter, physical compliance with lawful orders is mandatory. Your remedy is in court, not on the roadside.

## Development Notes

- Documentation data saves to localStorage on every change
- Practice mode feedback uses modal instead of browser alerts
- Service worker only activates in production builds (`npm run build`)
- HTTPS required for PWA features (except on localhost)

## Contributing

Issues and pull requests welcome.

## License

MIT

## Resources

For detailed setup instructions, see [SETUP.md](./SETUP.md)
