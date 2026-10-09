(function () {
  const trip = window.TRIP;
  const dayColors = ["--day-0", "--day-1", "--day-2", "--day-3"].map((v) =>
    getComputedStyle(document.documentElement).getPropertyValue(v).trim()
  );
  const colorFor = (i) => dayColors[i % dayColors.length];

  const esc = (s = "") =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const mapsUrl = (e) => `https://www.google.com/maps/search/?api=1&query=${e.lat},${e.lng}`;
  const dirUrl = (e) => `https://www.google.com/maps/dir/?api=1&destination=${e.lat},${e.lng}`;

  const fmtDate = (iso) =>
    new Date(iso + "T12:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });

  // ---------- Header ----------
  document.getElementById("title").textContent = trip.title;
  document.getElementById("subtitle").textContent = trip.subtitle;

  function tickCountdown() {
    const el = document.getElementById("countdown");
    const start = new Date(trip.startsAt);
    const diff = start - new Date();
    if (isNaN(diff)) return (el.textContent = "");
    if (diff <= 0) return (el.textContent = "It's happening. Pace yourselves. 🍻");
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
      all.push({ ...ev, dayIndex: di, num: ei + 1, id: `d${di}e${ei}` });
    });
  });

  // ---------- Map ----------
  const map = L.map("map", { zoomControl: true, scrollWheelZoom: true });
  L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: "abcd",
    maxZoom: 20,
  }).addTo(map);

  const pinIcon = (label, color, extra = "") =>
    L.divIcon({
      className: "",
      html: `<div class="pin ${extra}" style="--c:${color}"><span>${label}</span></div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -30],
    });

  const popupHtml = (e) => `
    <b>${esc(e.title)}</b>
    <div class="muted">${e.time ? esc(e.time) + " · " : ""}${esc(e.place || "")}</div>
    <div style="margin-top:6px"><a href="${dirUrl(e)}" target="_blank" rel="noopener">Directions →</a></div>`;

  const markers = {};
  const routes = [];

  if (trip.base && trip.base.lat) {
    L.marker([trip.base.lat, trip.base.lng], { icon: pinIcon("🏠", "#fff", "home"), zIndexOffset: 1000 })
      .addTo(map)
      .bindPopup(`<b>${esc(trip.base.name)}</b><div class="muted">${esc(trip.base.address || "")}</div>
        <div style="margin-top:6px"><a href="${dirUrl(trip.base)}" target="_blank" rel="noopener">Directions →</a></div>`);
  }

  all.forEach((e) => {
    if (typeof e.lat !== "number" || typeof e.lng !== "number") return;
    const m = L.marker([e.lat, e.lng], { icon: pinIcon(e.num, colorFor(e.dayIndex)) }).bindPopup(popupHtml(e));
    m.on("click", () => select(e.id, { fromMap: true }));
    markers[e.id] = m;
  });

  trip.days.forEach((day, di) => {
    const pts = all.filter((e) => e.dayIndex === di && markers[e.id]).map((e) => [e.lat, e.lng]);
    routes[di] = L.polyline(pts, { color: colorFor(di), weight: 3, opacity: 0.7, dashArray: "6 8" });
  });

  // ---------- Tabs ----------
  let currentDay = "all";
  const tabsEl = document.getElementById("tabs");
  const tabDefs = [{ key: "all", label: "All days" }].concat(
    trip.days.map((d, i) => ({ key: i, label: d.label, sub: fmtDate(d.date), color: colorFor(i) }))
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

  function renderList() {
    const days = currentDay === "all" ? trip.days.map((_, i) => i) : [currentDay];
    listEl.innerHTML = days
      .map((di) => {
        const day = trip.days[di];
        const color = colorFor(di);
        const cards = all
          .filter((e) => e.dayIndex === di)
          .map(
            (e) => `
          <article class="card" tabindex="0" data-id="${e.id}" style="--c:${color}">
            <div class="num">${e.num}</div>
            <div>
              <div class="card-top">
                ${e.time ? `<span class="time">${esc(e.time)}</span>` : ""}
                <h3>${esc(e.title)}</h3>
              </div>
              ${e.place ? `<p class="place">📍 ${esc(e.place)}</p>` : ""}
              ${e.address ? `<p class="addr">${esc(e.address)}</p>` : ""}
              ${e.notes ? `<p class="notes">${esc(e.notes)}</p>` : ""}
              <div class="actions">
                ${markers[e.id] ? `<a class="btn" href="${dirUrl(e)}" target="_blank" rel="noopener">Directions</a>
                <a class="btn" href="${mapsUrl(e)}" target="_blank" rel="noopener">Google Maps</a>` : ""}
                ${e.link ? `<a class="btn" href="${esc(e.link)}" target="_blank" rel="noopener">Website</a>` : ""}
              </div>
            </div>
          </article>`
          )
          .join("");
        return `<div class="day-head"><h2 style="color:${color}">${esc(day.label)}</h2><span>${fmtDate(day.date)}</span></div>${cards}`;
      })
      .join("");
  }

  listEl.addEventListener("click", (ev) => {
    if (ev.target.closest("a")) return;
    const card = ev.target.closest(".card");
    if (card) select(card.dataset.id);
  });
  listEl.addEventListener("keydown", (ev) => {
    const card = ev.target.closest(".card");
    if (card && (ev.key === "Enter" || ev.key === " ")) {
      ev.preventDefault();
      select(card.dataset.id);
    }
  });

  // ---------- Behaviour ----------
  function showDay(key) {
    currentDay = key;
    tabsEl.querySelectorAll(".tab").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.key === String(key))));

    Object.values(markers).forEach((m) => m.remove());
    routes.forEach((r) => r.remove());

    const visible = all.filter((e) => markers[e.id] && (key === "all" || e.dayIndex === key));
    visible.forEach((e) => markers[e.id].addTo(map));
    (key === "all" ? routes : [routes[key]]).forEach((r) => r && r.addTo(map));

    const pts = visible.map((e) => [e.lat, e.lng]);
    if (trip.base && trip.base.lat) pts.push([trip.base.lat, trip.base.lng]);
    if (pts.length) map.fitBounds(pts, { padding: [40, 40], maxZoom: 15 });
    else map.setView([51.4545, -2.5879], 13);

    renderList();
  }

  function select(id, { fromMap = false } = {}) {
    const e = all.find((x) => x.id === id);
    if (!e) return;
    if (currentDay !== "all" && currentDay !== e.dayIndex) showDay(e.dayIndex);

    listEl.querySelectorAll(".card").forEach((c) => c.classList.toggle("active", c.dataset.id === id));
    const card = listEl.querySelector(`[data-id="${id}"]`);
    if (card && fromMap) card.scrollIntoView({ behavior: "smooth", block: "center" });

    const m = markers[id];
    if (m && !fromMap) {
      map.flyTo(m.getLatLng(), Math.max(map.getZoom(), 15), { duration: 0.6 });
      m.openPopup();
      if (window.innerWidth < 900) document.getElementById("map").scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  // Default to today's tab during the trip, otherwise "All days".
  const today = new Date().toISOString().slice(0, 10);
  const todayIdx = trip.days.findIndex((d) => d.date === today);
  showDay(todayIdx >= 0 ? todayIdx : "all");
})();
