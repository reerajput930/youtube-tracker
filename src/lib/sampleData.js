// Sample data used by "Load sample data". Matches section 14 of the build
// spec exactly: 7 named September 2026 videos, 45 generated older videos
// (27 Long / 18 Short, none in the Aug 24-30 week, at least one each in the
// Aug 10-16 and Aug 17-23 weeks), and the 5 sample collabs.

const OLDER_TITLES_LONG = [
  "Building a REST API from scratch",
  "What I learned shipping my first SaaS",
  "Refactoring a messy React component",
  "A weekend with Rust",
  "How I plan my coding videos",
  "Debugging a production incident live",
  "Setting up a CI pipeline in 20 minutes",
  "Why I switched to Vite",
  "Reading other people's code",
  "Building a Chrome extension",
  "My favorite VS Code extensions",
  "Writing tests that actually help",
  "A calmer way to learn a new stack",
  "Building a CLI tool in Node",
  "What junior devs get wrong about Git",
  "Deploying a side project for $0",
  "Pair programming with an AI agent",
  "The database migration that broke prod",
  "Building a design system from scratch",
  "How I read technical docs",
  "A slower, more careful way to code",
  "Turning a bug report into a fix",
  "What I'd tell my younger self about code",
  "Building an internal tool for my team",
  "The interview question I always ask",
  "Why small PRs are worth it",
  "A tour of my terminal setup",
];

const OLDER_TITLES_SHORT = [
  "One VS Code trick you're missing",
  "The Git command I use daily",
  "A faster way to write tests",
  "This keyboard shortcut saves me hours",
  "Stop doing this in your PRs",
  "The bug that taught me the most",
  "One line that fixed everything",
  "A tiny CSS trick worth knowing",
  "Why your build is slow",
  "The terminal alias I can't live without",
  "One rule for naming variables",
  "A 30 second debugging tip",
  "The commit message habit that helps",
  "One thing I changed about my workflow",
  "A quick way to read a stack trace",
  "The extension every dev should install",
  "One question to ask before you code",
  "A fast way to review a PR",
];

function buildOlderVideos() {
  const dates = [
    ["2026-01-05", "short"],
    ["2026-01-07", "long"],
    ["2026-01-12", "long"],
    ["2026-01-14", "short"],
    ["2026-01-19", "long"],
    ["2026-01-21", "long"],
    ["2026-01-26", "short"],
    ["2026-01-28", "long"],
    ["2026-02-02", "long"],
    ["2026-02-04", "short"],
    ["2026-02-09", "long"],
    ["2026-02-11", "long"],
    ["2026-02-16", "short"],
    ["2026-02-18", "long"],
    ["2026-02-23", "long"],
    ["2026-02-25", "short"],
    ["2026-03-02", "long"],
    ["2026-03-04", "long"],
    ["2026-03-09", "short"],
    ["2026-03-11", "long"],
    ["2026-03-16", "long"],
    ["2026-03-18", "short"],
    ["2026-03-23", "long"],
    ["2026-03-25", "long"],
    ["2026-03-30", "short"],
    ["2026-04-06", "long"],
    ["2026-04-13", "long"],
    ["2026-04-20", "short"],
    ["2026-04-27", "long"],
    ["2026-05-04", "long"],
    ["2026-05-11", "short"],
    ["2026-05-18", "long"],
    ["2026-05-25", "long"],
    ["2026-06-01", "short"],
    ["2026-06-08", "long"],
    ["2026-06-15", "long"],
    ["2026-06-22", "short"],
    ["2026-06-29", "long"],
    ["2026-07-06", "long"],
    ["2026-07-13", "short"],
    ["2026-07-20", "long"],
    ["2026-07-27", "short"],
    ["2026-08-03", "short"],
    ["2026-08-10", "short"],
    ["2026-08-17", "short"],
  ];

  let longIdx = 0;
  let shortIdx = 0;
  return dates.map(([date, type], i) => {
    const title =
      type === "long"
        ? OLDER_TITLES_LONG[longIdx++ % OLDER_TITLES_LONG.length]
        : OLDER_TITLES_SHORT[shortIdx++ % OLDER_TITLES_SHORT.length];
    const lengthSec =
      type === "long" ? 480 + ((i * 97) % 900) : 22 + ((i * 7) % 40);
    return {
      id: `v_old_${i}`,
      title,
      date,
      type,
      lengthSec,
      platform: "youtube",
      collabId: null,
      url: "",
      source: "manual",
      youtubeId: null,
      createdAt: `${date}T12:00:00Z`,
    };
  });
}

const SEPTEMBER_VIDEOS = [
  {
    id: "v_sep_28",
    title: "I built a portfolio site with AI in 10 minutes",
    date: "2026-09-28",
    type: "long",
    lengthSec: 760,
    platform: "youtube",
    collabId: null,
  },
  {
    id: "v_sep_24",
    title: "3 AI tools I open every morning",
    date: "2026-09-24",
    type: "short",
    lengthSec: 45,
    platform: "youtube",
    collabId: null,
  },
  {
    id: "v_sep_20",
    title: "Testing a design tool made for devs",
    date: "2026-09-20",
    type: "long",
    lengthSec: 555,
    platform: "youtube",
    collabId: "c_pixelforge",
  },
  {
    id: "v_sep_15",
    title: "Git basics in 60 seconds",
    date: "2026-09-15",
    type: "short",
    lengthSec: 58,
    platform: "youtube",
    collabId: null,
  },
  {
    id: "v_sep_10",
    title: "Prompting tips that actually help",
    date: "2026-09-10",
    type: "long",
    lengthSec: 842,
    platform: "youtube",
    collabId: null,
  },
  {
    id: "v_sep_07",
    title: "My desk setup for coding videos",
    date: "2026-09-07",
    type: "short",
    lengthSec: 39,
    platform: "youtube",
    collabId: null,
  },
  {
    id: "v_sep_03",
    title: "Build a to-do app with an AI agent",
    date: "2026-09-03",
    type: "long",
    lengthSec: 1100,
    platform: "youtube",
    collabId: "c_codecraft",
  },
].map((v) => ({
  ...v,
  url: "",
  source: "manual",
  youtubeId: null,
  createdAt: `${v.date}T18:20:00Z`,
}));

export function buildSampleVideos() {
  return [...buildOlderVideos(), ...SEPTEMBER_VIDEOS];
}

export function buildSampleCollabs() {
  return [
    {
      id: "c_lumen",
      brand: "Lumen Keyboards",
      contactName: "",
      contactEmail: "",
      status: "pitched",
      statusDate: "2026-09-26",
      dueDate: null,
      amount: null,
      currency: "USD",
      paymentNote: "",
      paidDate: null,
      deliverables: [
        {
          id: "d1",
          type: "long",
          label: "Long video",
          dueDate: null,
          videoId: null,
        },
      ],
      notes: "",
    },
    {
      id: "c_northwind",
      brand: "Northwind Monitors",
      contactName: "",
      contactEmail: "",
      status: "agreed",
      statusDate: "2026-09-20",
      dueDate: "2026-10-03",
      amount: 150,
      currency: "USD",
      paymentNote: "",
      paidDate: null,
      deliverables: [
        {
          id: "d1",
          type: "short",
          label: "Short",
          dueDate: "2026-10-03",
          videoId: null,
        },
      ],
      notes: "",
    },
    {
      id: "c_codecraft",
      brand: "CodeCraft Academy",
      contactName: "",
      contactEmail: "",
      status: "filming",
      statusDate: "2026-09-26",
      dueDate: "2026-10-15",
      amount: 400,
      currency: "USD",
      paymentNote: "Paid when all 3 videos are posted.",
      paidDate: null,
      deliverables: [
        {
          id: "d1",
          type: "long",
          label: "Long video",
          dueDate: "2026-10-15",
          videoId: "v_sep_03",
        },
        {
          id: "d2",
          type: "short",
          label: "Short #1",
          dueDate: "2026-10-15",
          videoId: null,
        },
        {
          id: "d3",
          type: "short",
          label: "Short #2",
          dueDate: "2026-10-15",
          videoId: null,
        },
      ],
      notes: "",
    },
    {
      id: "c_pixelforge",
      brand: "Pixel Forge",
      contactName: "",
      contactEmail: "",
      status: "posted",
      statusDate: "2026-09-20",
      dueDate: null,
      amount: 250,
      currency: "USD",
      paymentNote: "",
      paidDate: null,
      deliverables: [
        {
          id: "d1",
          type: "long",
          label: "Long video",
          dueDate: "2026-09-20",
          videoId: "v_sep_20",
        },
      ],
      notes: "",
    },
    {
      id: "c_stacknote",
      brand: "StackNote",
      contactName: "",
      contactEmail: "",
      status: "paid",
      statusDate: "2026-08-30",
      dueDate: null,
      amount: 180,
      currency: "USD",
      paymentNote: "",
      paidDate: "2026-08-30",
      deliverables: [
        {
          id: "d1",
          type: "short",
          label: "Short #1",
          dueDate: null,
          videoId: "v_old_43",
        },
        {
          id: "d2",
          type: "short",
          label: "Short #2",
          dueDate: null,
          videoId: "v_old_44",
        },
      ],
      notes: "",
    },
  ];
}

export function applySampleCollabIdsToVideos(videos) {
  // link StackNote's two older Shorts (Aug 10 and Aug 17) to their collab
  return videos.map((v) => {
    if (v.id === "v_old_43" || v.id === "v_old_44") {
      return { ...v, collabId: "c_stacknote" };
    }
    return v;
  });
}

export function loadSampleDataset() {
  return {
    videos: applySampleCollabIdsToVideos(buildSampleVideos()),
    collabs: buildSampleCollabs(),
    settings: { monthlyGoal: 8, mood: "fired-up", channelName: "Coding with Ree" },
  };
}
