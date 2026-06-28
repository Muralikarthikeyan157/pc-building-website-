# Product Images

Real hardware photos are loaded from **Pexels** and **Wikimedia Commons** CDN URLs.

- All 714+ products automatically receive category-matched photos via `js/images.js`
- Images use `object-fit: contain` so components display fully without cropping
- An SVG fallback appears if a CDN image fails to load

**Note:** An internet connection is required for photos to display (CDN URLs).

To cache images locally for offline use, run:
```
node js/download-images.js
```
(Uses `js/image-sources.txt` with rate-limited downloads)
