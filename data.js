// ============================================================
//  TRIP DATA — edit this file to change the itinerary.
//  Everything on the site is generated from this.
// ============================================================
//
//  Event fields:
//    time     "Morning" / "Afternoon" / "Eve" (or a clock time)
//    title    what we're doing
//    emoji    shown next to the title
//    notes    the chat
//    place    venue name (optional)
//    address  street address (optional — used for directions if no lat/lng)
//    lat,lng  puts a numbered pin on the map
//    maps     Google Maps link for the venue (optional)
//    atBase   true = happening at the house (uses the 🏠 pin)
//    cost     e.g. "~£40" (optional)

window.TRIP = {
  eyebrow: "Spice Lords AGM 🌶️",
  title: "Mr Harold's Bristol Birthday 👑",
  intro:
    "On paper a full member turnout for the Bristol birthday celebrations of Mr Harold. Can we all give ourselves a clap 👏 thanks.",
  startsAt: "2026-10-08T18:00:00",
  endsAt: "2026-10-12T12:00:00",

  base: {
    name: "AGM Base",
    address: "3 Sidmouth Gardens, Bristol BS3 5HE",
    // Approximate — BS3 5H_ area, Bedminster/Windmill Hill. Directions use the address.
    lat: 51.4342,
    lng: -2.5875,
  },

  costs: [
    { label: "Go karting", amount: "~£40" },
    { label: "Comedy", amount: "~£15" },
  ],

  days: [
    {
      label: "Thursday",
      date: "2026-10-08",
      events: [
        {
          time: "Eve",
          title: "Early arrivals",
          emoji: "🥡",
          notes: "For the few who are arriving — decide on the day. Think range, beers, cook/takeaway. Big sleeps.",
          atBase: true,
        },
      ],
    },
    {
      label: "Friday",
      date: "2026-10-09",
      events: [
        {
          time: "Morning",
          title: "More arrivals + golf",
          emoji: "⛳",
          notes: "Venue TBC.",
        },
        {
          time: "Afternoon",
          title: "Pub lunch, then the big shop",
          emoji: "🛒",
          notes: "Weekend supplies.",
        },
        {
          time: "Eve",
          title: "Curry out, sandwiched by pints",
          emoji: "🍛",
          notes: "Let the stragglers arrive and join 🍺",
          maps: "https://maps.app.goo.gl/bWzv7rUfgMJEtpbp8",
        },
      ],
    },
    {
      label: "Saturday",
      sub: "for the boys",
      date: "2026-10-10",
      events: [
        {
          time: "Morning",
          title: "Continental breakfast",
          emoji: "🌍",
          atBase: true,
        },
        {
          time: "Morning",
          title: "Go karting",
          emoji: "🏎️",
          notes: "Primary objective: beat Ollie.",
          maps: "https://maps.app.goo.gl/6mf9vg25TffcEqLc6",
          cost: "~£40",
        },
        {
          time: "Afternoon",
          title: "Back to base",
          emoji: "🚿",
          notes: "Finish beating Ollie, showers, lunch etc.",
          atBase: true,
        },
        {
          time: "Afternoon",
          title: "Pub crawl begins",
          emoji: "🍻",
          notes: "Separate planning meeting required 📋",
        },
        {
          time: "Eve",
          title: "Comedy — jugs and heckles",
          emoji: "🤡",
          notes: "The crawl takes us here. Then see where the night takes us 🕺🎰🦖",
          maps: "https://maps.app.goo.gl/fwt5FTXAPACSTspk6",
          cost: "~£15",
        },
      ],
    },
    {
      label: "Sunday",
      date: "2026-10-11",
      events: [
        {
          time: "Morning",
          title: "Full Engo",
          emoji: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
          notes: "Wake up whenever.",
          atBase: true,
        },
        {
          time: "Afternoon",
          title: "Walk in the Mendips",
          emoji: "🧘‍♂️",
          notes: "Depending on state of body and mind. Some might start to peel.",
        },
        {
          time: "Afternoon",
          title: "Carvery somewhere",
          emoji: "🥩",
          notes: "🥕 Venue TBC.",
        },
        {
          time: "Eve",
          title: "Movie night",
          emoji: "📽️",
          notes: "Cinema or on the telly. Popcorn 🍿, recovery bifta (available all weekend) 🚬",
          atBase: true,
        },
      ],
    },
    {
      label: "Monday",
      date: "2026-10-12",
      events: [
        {
          time: "Morning",
          title: "Right, the rest of you fuck off",
          emoji: "👋",
          atBase: true,
        },
      ],
    },
  ],
};
