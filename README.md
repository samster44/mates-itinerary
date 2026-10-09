# Harry's Bristol Weekend 🍻

A tiny static site with the weekend itinerary and a map of every stop.

- **Edit the plan:** everything lives in [`data.js`](data.js) — days, times, places, lat/lng, notes.
- **Run locally:** open `index.html`, or `python3 -m http.server` and visit http://localhost:8000.
- **Host it (free):** GitHub → repo **Settings → Pages** → *Deploy from a branch* → pick the branch and `/ (root)`. Share the URL it gives you.

Map: Leaflet + OpenStreetMap/CARTO tiles. No build step, no API keys.
