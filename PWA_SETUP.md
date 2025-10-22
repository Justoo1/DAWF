# PWA Setup for DAWF (DevOps Africa Welfare Fund)

## Overview
The DAWF application is now configured as a Progressive Web App (PWA), allowing users to install it on their devices and use it with offline capabilities.

## Features Enabled

### ✅ Installability
- Users can install the app on their desktop or mobile devices
- App appears in the app drawer/home screen
- Launches in standalone mode without browser UI

### ✅ Offline Support
- Service worker caches essential assets
- App continues to work with limited connectivity
- Automatic updates when online

### ✅ App-like Experience
- Full-screen mode on mobile devices
- Custom splash screen with DAWF logo
- Theme color matching app design (#22c55e - green)

## Installation Instructions

### For Desktop (Chrome, Edge, Brave)
1. Visit the DAWF website
2. Look for the install icon (⊕) in the address bar
3. Click "Install" when prompted
4. The app will open in a new window
5. Access it from your desktop or start menu

### For Mobile (Android)
1. Open the DAWF website in Chrome
2. Tap the menu (⋮) in the top right
3. Select "Add to Home Screen" or "Install App"
4. Confirm the installation
5. Launch from your home screen

### For Mobile (iOS/Safari)
1. Open the DAWF website in Safari
2. Tap the Share button (□↑)
3. Scroll down and tap "Add to Home Screen"
4. Name the app and tap "Add"
5. Launch from your home screen

## Configuration Files

### 1. Manifest File (`public/manifest.json`)
- Defines app name, icons, colors, and display mode
- Provides metadata for installation

### 2. Service Worker (Auto-generated)
- `public/sw.js` - Main service worker
- `public/workbox-*.js` - Workbox runtime for caching strategies
- Auto-generated during build, excluded from git

### 3. Icons
Located in `public/icons/` and `public/assets/images/`:
- Multiple sizes (72x72 to 512x512) for different devices
- Source: Company logo (green circular design)

## Development

### Running in Development Mode
```bash
npm run dev
```
**Note:** PWA features are disabled in development mode for better debugging experience.

### Building for Production
```bash
npm run build
```
Service worker and workbox files are automatically generated during build.

### Starting Production Server
```bash
npm start
```
Access at http://localhost:3000 to test PWA features.

## PWA Configuration

### Next.js Config (`next.config.ts`)
```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});
```

### Key Settings:
- **dest**: Output directory for service worker
- **register**: Auto-register service worker
- **skipWaiting**: Update to new version immediately
- **disable**: Disabled in development for easier debugging

## Customization

### Changing Theme Color
Edit in `app/layout.tsx`:
```typescript
export const viewport: Viewport = {
  themeColor: "#22c55e", // Change this color
};
```

### Updating App Icons
1. Replace images in `public/icons/`
2. Ensure all sizes are provided (72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512)
3. Update `public/manifest.json` if paths change

### Modifying App Name
Edit in `public/manifest.json`:
```json
{
  "name": "Your Full App Name",
  "short_name": "Short Name"
}
```

## Verifying PWA Installation

### Using Chrome DevTools
1. Open DevTools (F12)
2. Go to "Application" tab
3. Check:
   - **Manifest**: Verify all fields are correct
   - **Service Workers**: Should show as activated
   - **Cache Storage**: Should populate on first visit

### Using Lighthouse
1. Open DevTools (F12)
2. Go to "Lighthouse" tab
3. Select "Progressive Web App" category
4. Run audit
5. Aim for score > 90

## Troubleshooting

### Service Worker Not Registering
- Clear browser cache
- Ensure HTTPS is enabled (required for PWA)
- Check console for errors
- Rebuild the application

### Icons Not Showing
- Verify icon paths in `manifest.json`
- Check that all icon files exist
- Clear cache and reinstall

### App Not Installable
- Ensure manifest.json is accessible
- Verify HTTPS connection
- Check that service worker is registered
- Ensure minimum PWA criteria are met

## Production Deployment

### Requirements
- HTTPS enabled (required for service workers)
- All icon sizes present
- Valid manifest.json
- Service worker registered and active

### Recommended
- Test installation on multiple devices
- Run Lighthouse audit
- Monitor service worker updates
- Test offline functionality

## Caching Strategy

The PWA uses Workbox for intelligent caching:
- **Network First**: API calls (always try network, fallback to cache)
- **Cache First**: Static assets (images, fonts, CSS, JS)
- **Stale While Revalidate**: Dynamic content

## Updates

When you deploy a new version:
1. Service worker detects changes
2. New version downloads in background
3. Updates activate on next app launch
4. Users see fresh content automatically

## Resources

- [Next.js PWA Documentation](https://github.com/shadowwalker/next-pwa)
- [PWA Best Practices](https://web.dev/progressive-web-apps/)
- [Workbox Documentation](https://developers.google.com/web/tools/workbox)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)

## Support

For issues or questions about PWA functionality:
1. Check browser console for errors
2. Verify service worker status in DevTools
3. Review this documentation
4. Check Next.js and next-pwa GitHub issues

---

**Last Updated**: October 2025
**PWA Version**: 1.0.0
