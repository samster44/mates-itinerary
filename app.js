(function () {
  const trip = window.TRIP;
  const base = trip.base;
  const dayColors = ["--day-0", "--day-1", "--day-2", "--day-3", "--day-4"].map((v) =>
    getComputedStyle(document.documentElement).getPropertyValue(v).trim()
  );
  const colorFor = (i) => dayColors[i % dayColors.length];

  const esc = (s = "") =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const hasCoords = (e) => typeof e.lat === "number" && typeof e.lng === "number";
  const dest = (e) => (e.address ? encodeURIComponent(e.address) : hasCoords(e) ? `${e.lat},${e.lng}` : null);
  const dirUrl = (e) => (dest(e) ? `https://www.google.com/maps/dir/?api=1&destination=${dest(e)}` : null);
  const mapsUrl = (e) => e.maps || (dest(e) ? `https://www.google.com/maps/search/?api=1&query=${dest(e)}` : null);

  const fmtDate = (iso) =>
    new Date(iso + "T12:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });

  // ---------- Header ----------
  document.getElementById("eyebrow").textContent = trip.eyebrow;
  document.getElementById("title").textContent = trip.title;
  document.getElementById("intro").textContent = trip.intro || "";
  document.getElementById("chips").innerHTML =
    `<a class="chip" href="${mapsUrl(base)}" target="_blank" rel="noopener">🏠 ${esc(base.address)}</a>` +
    (trip.costs || []).map((c) => `<span class="chip">${esc(c.label)} <b>${esc(c.amount)}</b></span>`).join("");

  function tickCountdown() {
    const el = document.getElementById("countdown");
    const now = new Date();
    const start = new Date(trip.startsAt);
    const end = new Date(trip.endsAt || trip.startsAt);
    if (now >= end) return (el.textContent = "That's a wrap. Happy birthday Harold 👑");
    if (now >= start) return (el.textContent = "🔴 It's happening. Pace yourselves.");
    const diff = start - now;
    const d = Math.floor(diff / 864e5);
    const h = Math.floor((diff % 864e5) / 36e5);
    const m = Math.floor((diff % 36e5) / 6e4);
    el.textContent = `${d}d ${h}h ${m}m to go`;
  }
  tickCountdown();
  setInterval(tickCountdown, 30000);

  // ---------- Flatten events ----------
  const all = [];
  trip.days.forEach((day, di) => {
    day.events.forEach((ev, ei) => {
      const e = { ...ev, dayIndex: di, id: `d${di}e${ei}` };
      if (e.atBase) Object.assign(e, { place: e.place || base.name, address: base.address, lat: base.lat, lng: base.lng });
      all.push(e);
    });
  });
  // Number only the events that get their own pin (not the house).
  trip.days.forEach((_, di) => {
    let n = 0;
    all.filter((e) => e.dayIndex === di && hasCoords(e) && !e.atBase).forEach((e) => (e.num = ++n));
  });

  // ---------- Map ----------
  const map = L.map("map", { zoomControl: true, scrollWheelZoom: true });
  // Standard OSM tiles (no API key); darkened in CSS to match the theme.
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  }).addTo(map);

  const pinIcon = (label, color, extra = "") =>
    L.divIcon({
      className: "",
      html: `<div class="pin ${extra}" style="--c:${color}"><span>${label}</span></div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -30],
    });

  const dirLink = (e) => (dirUrl(e) ? `<div style="margin-top:6px"><a href="${dirUrl(e)}" target="_blank" rel="noopener">Directions →</a></div>` : "");
  const popupHtml = (e) => `
    <b>${esc(e.emoji || "")} ${esc(e.title)}</b>
    <div class="muted">${esc(trip.days[e.dayIndex].label)} ${esc(e.time || "")}${e.place ? " · " + esc(e.place) : ""}</div>
    ${dirLink(e)}`;

  const homeMarker = L.marker([base.lat, base.lng], { icon: pinIcon("🏠", "#fff", "home"), zIndexOffset: 1000 })
    .addTo(map)
    .bindPopup(`<b>${esc(base.name)}</b><div class="muted">${esc(base.address)}</div>${dirLink(base)}`);

  const markers = {};
  all.forEach((e) => {
    if (!hasCoords(e) || e.atBase) return;
    const m = L.marker([e.lat, e.lng], { icon: pinIcon(e.num, colorFor(e.dayIndex)) }).bindPopup(popupHtml(e));
    m.on("click", () => select(e.id, { fromMap: true }));
    markers[e.id] = m;
  });

  const routes = trip.days.map((_, di) => {
    const pts = all.filter((e) => e.dayIndex === di && hasCoords(e)).map((e) => [e.lat, e.lng]);
    return L.polyline(pts, { color: colorFor(di), weight: 3, opacity: 0.7, dashArray: "6 8" });
  });

  // ---------- Tabs ----------
  let currentDay = "all";
  const tabsEl = document.getElementById("tabs");
  const tabDefs = [{ key: "all", label: "All days" }].concat(
    trip.days.map((d, i) => ({ key: i, label: d.label, sub: fmtDate(d.date).replace(/^\w+ /, ""), color: colorFor(i) }))
  );
  tabsEl.innerHTML = tabDefs
    .map(
      (t) => `<button class="tab" role="tab" data-key="${t.key}" style="--c:${t.color || "var(--muted)"}">
        ${t.color ? '<span class="dot"></span>' : ""}${esc(t.label)}${t.sub ? ` <small>${esc(t.sub)}</small>` : ""}
      </button>`
    )
    .join("");
  tabsEl.addEventListener("click", (ev) => {
    const btn = ev.target.closest(".tab");
    if (!btn) return;
    const k = btn.dataset.key;
    showDay(k === "all" ? "all" : Number(k));
  });

  // ---------- List ----------
  const listEl = document.getElementById("list");

  function badge(e) {
    if (e.atBase) return '<div class="num home-num">🏠</div>';
    if (e.num) return `<div class="num">${e.num}</div>`;
    return '<div class="num none"></div>';
  }

  function card(e, color) {
    const dir = dirUrl(e);
    const gm = mapsUrl(e);
    return `
      <article class="card" tabindex="0" data-id="${e.id}" style="--c:${color}">
        ${badge(e)}
        <div>
          <div class="card-top">
            ${e.time ? `<span class="time">${esc(e.time)}</span>` : ""}
            ${e.cost ? `<span class="cost">${esc(e.cost)}</span>` : ""}
          </div>
          <h3>${e.emoji ? `<span class="emoji">${esc(e.emoji)}</span> ` : ""}${esc(e.title)}</h3>
          ${e.place && !e.atBase ? `<p class="place">📍 ${esc(e.place)}</p>` : ""}
          ${e.atBase ? `<p class="addr">At the house</p>` : ""}
          ${e.notes ? `<p class="notes">${esc(e.notes)}</p>` : ""}
          ${!e.atBase && (dir || gm) ? `<div class="actions">
            ${dir ? `<a class="btn" href="${dir}" target="_blank" rel="noopener">Directions</a>` : ""}
            ${gm ? `<a class="btn" href="${esc(gm)}" target="_blank" rel="noopener">Google Maps</a>` : ""}
          </div>` : ""}
        </div>
      </article>`;
  }

  function renderList() {
    const days = currentDay === "all" ? trip.days.map((_, i) => i) : [currentDay];
    listEl.innerHTML = days
      .map((di) => {
        const day = trip.days[di];
        const color = colorFor(di);
        const cards = all.filter((e) => e.dayIndex === di).map((e) => card(e, color)).join("");
        return `<div class="day-head"><h2 style="color:${color}">${esc(day.label)}${day.sub ? ` <em>${esc(day.sub)}</em>` : ""}</h2><span>${fmtDate(day.date)}</span></div>${cards}`;
      })
      .join("");
  }

  listEl.addEventListener("click", (ev) => {
    if (ev.target.closest("a")) return;
    const c = ev.target.closest(".card");
    if (c) select(c.dataset.id);
  });
  listEl.addEventListener("keydown", (ev) => {
    const c = ev.target.closest(".card");
    if (c && (ev.key === "Enter" || ev.key === " ")) {
      ev.preventDefault();
      select(c.dataset.id);
    }
  });

  // ---------- Behaviour ----------
  function showDay(key) {
    currentDay = key;
    tabsEl.querySelectorAll(".tab").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.key === String(key))));
    const sel = tabsEl.querySelector('[aria-selected="true"]');
    if (sel) tabsEl.scrollTo({ left: sel.offsetLeft - 16, behavior: "smooth" });

    Object.values(markers).forEach((m) => m.remove());
    routes.forEach((r) => r.remove());

    const visible = all.filter((e) => markers[e.id] && (key === "all" || e.dayIndex === key));
    visible.forEach((e) => markers[e.id].addTo(map));
    (key === "all" ? routes : [routes[key]]).forEach((r) => r && r.addTo(map));

    const pts = visible.map((e) => [e.lat, e.lng]).concat([[base.lat, base.lng]]);
    if (pts.length > 1) map.fitBounds(pts, { padding: [40, 40], maxZoom: 15 });
    else map.setView([base.lat, base.lng], 14);

    renderList();
  }

  function select(id, { fromMap = false } = {}) {
    const e = all.find((x) => x.id === id);
    if (!e) return;
    if (currentDay !== "all" && currentDay !== e.dayIndex) showDay(e.dayIndex);

    listEl.querySelectorAll(".card").forEach((c) => c.classList.toggle("active", c.dataset.id === id));
    const el = listEl.querySelector(`[data-id="${id}"]`);
    if (el && fromMap) el.scrollIntoView({ behavior: "smooth", block: "center" });

    const m = e.atBase ? homeMarker : markers[id];
    if (m && !fromMap) {
      map.flyTo(m.getLatLng(), Math.max(map.getZoom(), 15), { duration: 0.6 });
      m.openPopup();
      if (window.innerWidth < 900) document.getElementById("map").scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  // Default to today's tab during the trip, otherwise "All days".
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const todayIdx = trip.days.findIndex((d) => d.date === today);
  showDay(todayIdx >= 0 ? todayIdx : "all");
})();
