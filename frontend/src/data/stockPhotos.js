// Our "corporate excellence" stock photos.
// The image files live in frontend/public/stock/ (anything in "public" is
// served as-is, so "/stock/handshake.jpg" works as an image address).
//
// All photos are from Unsplash (https://unsplash.com/license): free to use,
// no permission or payment needed. "source" is each photo's original page.
//
// Rule for the jokes: make fun of corporate culture, never of the people.

const stockPhotos = {
  handshake: {
    src: "/stock/handshake.jpg",
    alt: "Two people in suits shaking hands",
    title: "Strategic Partnership Formalized",
    caption: "A handshake so powerful it could not fit in the frame. Nobody remembers what the deal was.",
    source: "https://unsplash.com/photos/bGczI5fXbmo",
  },
  whiteboardTeam: {
    src: "/stock/whiteboard-team.jpg",
    alt: "A man presenting at a flip chart to three colleagues",
    title: "Cross-Functional Ideation Session",
    caption: "The word “PLAN” has been written down and boxed. The plan itself remains unknown.",
    source: "https://unsplash.com/photos/rgKX4o2xSqI",
  },
  whiteboardMan: {
    src: "/stock/whiteboard-man.jpg",
    alt: "A man pointing at sticky notes on a whiteboard",
    title: "Agile Transformation, Phase 7",
    caption: "Twenty sticky notes. Zero tasks completed. Velocity: inspirational.",
    source: "https://unsplash.com/photos/4wSnhAT8d9g",
  },
  highFive: {
    src: "/stock/high-five.jpg",
    alt: "Two coworkers high-fiving at a desk with a laptop",
    title: "Quarterly Objectives: Achieved",
    caption: "They just found out the 2-hour meeting could have been an email.",
    source: "https://unsplash.com/photos/V1MU7K8aPwU",
  },
  sternSuit: {
    src: "/stock/stern-suit.jpg",
    alt: "A serious man in a suit, lit in green, hands folded on a desk",
    title: "Chief Synergy Officer",
    caption: "Would like to “hop on a quick call.” It will not be quick.",
    source: "https://unsplash.com/photos/Rsz_WiamsMQ",
  },
  charts: {
    src: "/stock/charts.jpg",
    alt: "A presenter pointing at a flip chart next to a screen of sales charts",
    title: "Data-Driven Decision Making",
    caption: "The line goes up, then down, then up. The decision was made before the meeting.",
    source: "https://unsplash.com/photos/Nd7SpexkoNA",
  },
  emptyRoom: {
    src: "/stock/empty-room.jpg",
    alt: "A large, completely empty office with rows of desks",
    title: "Optional Team-Building Event",
    caption: "Friday, 4:59 PM. Turnout exceeded expectations.",
    source: "https://unsplash.com/photos/bV5dFLEYecM",
  },
  thumbsUp: {
    src: "/stock/thumbs-up.jpg",
    alt: "A smiling man in a shirt and tie giving a thumbs up",
    title: "Employee Engagement Initiative",
    caption: "Has just learned the pizza party replaces this year's raises. Thrilled. Truly.",
    source: "https://unsplash.com/photos/1LFDnEb3-DY",
  },
  teamTable: {
    src: "/stock/team-table.jpg",
    alt: "Four coworkers around a table with a small potted plant in the middle",
    title: "Synergy Alignment Workshop",
    caption: "The plant was invited to add value. So far it has contributed the most.",
    source: "https://unsplash.com/photos/fm4B1xWEIsU",
  },
};

export default stockPhotos;
