// ============================================================
//  TRIP DATA — edit this file to change the itinerary.
//  Everything on the site is generated from this.
// ============================================================

window.TRIP = {
  title: "Harry's Birthday Weekend",
  subtitle: "Bristol",
  // Used for the countdown. ISO format, local time.
  startsAt: "2026-11-06T15:00:00",

  // Where we're staying — shown on the map with a house icon.
  base: {
    name: "The Digs (TBC)",
    address: "Bristol city centre",
    lat: 51.4545,
    lng: -2.5879,
    notes: "Placeholder — swap for the real Airbnb/hotel.",
  },

  // One entry per day. Each event needs a lat/lng to show on the map.
  // Fields: time, title, place, address, lat, lng, notes, link (optional), tag (optional)
  days: [
    {
      label: "Friday",
      date: "2026-11-06",
      events: [
        {
          time: "15:00",
          title: "Arrive & check in",
          place: "The Digs (TBC)",
          address: "Bristol city centre",
          lat: 51.4545,
          lng: -2.5879,
          notes: "PLACEHOLDER — drop bags, first can.",
          tag: "travel",
        },
        {
          time: "19:00",
          title: "Dinner & drinks",
          place: "Wapping Wharf",
          address: "Wapping Wharf, Bristol BS1 6WP",
          lat: 51.4467,
          lng: -2.5977,
          notes: "PLACEHOLDER",
          tag: "food",
        },
      ],
    },
    {
      label: "Saturday",
      date: "2026-11-07",
      events: [
        {
          time: "11:00",
          title: "Morning walk",
          place: "Clifton Suspension Bridge",
          address: "Bridge Rd, Bristol BS8 3PA",
          lat: 51.4549,
          lng: -2.6278,
          notes: "PLACEHOLDER — hangover cure.",
          tag: "activity",
        },
        {
          time: "20:00",
          title: "Birthday night out 🎉",
          place: "Harbourside",
          address: "Harbourside, Bristol",
          lat: 51.4505,
          lng: -2.5988,
          notes: "PLACEHOLDER — the main event.",
          tag: "night",
        },
      ],
    },
    {
      label: "Sunday",
      date: "2026-11-08",
      events: [
        {
          time: "11:30",
          title: "Recovery brunch",
          place: "Gloucester Road",
          address: "Gloucester Rd, Bristol BS7",
          lat: 51.4710,
          lng: -2.5912,
          notes: "PLACEHOLDER",
          tag: "food",
        },
      ],
    },
  ],
};
