/*
  FoundIS starting data.
  Edit this file to change what a fresh browser starts with.
  Saved records (student accounts, claims, lost reports, staff edits) live in each
  visitor's browser localStorage, not here. After editing, bump STORE_KEY in js/app.js
  (e.g. "foundis-osa-v3" to "foundis-osa-v4") so browsers with old saved data reload this file.
*/
window.FOUNDIS_DATA = {
  // OSA staff sign-in
  staff: {
    username: "osa-staff",
    password: "OSA-DEMO",
    name: "OSA Staff",
  },

  // category list shown in filters and forms
  categories: ["Electronics", "IDs", "Accessories", "Bags", "Keys", "Clothing", "Other"],

  // default found items; every id must be unique; status: "available" | "pending" | "claimed" | "archived"
  items: [
    {
      id: "FI-1001",
      image: "assets/images/items/fi-1001.jpg",
      title: "Wireless earbuds case",
      category: "Electronics",
      emoji: "🎧",
      location: "CIT Building",
      daysAgo: 1, // turned over this many days before the site is first opened
      status: "available",
      description:
        "A wireless earbuds charging case was turned over to OSA.",
      notes: "Ask claimant about brand, case markings, and earbuds.",
    },
    {
      id: "FI-1002",
      image: "", // no public photo (IDs stay hidden)
      title: "Student ID card",
      category: "IDs",
      emoji: "🪪",
      location: "Main Library",
      daysAgo: 2, // turned over this many days before the site is first opened
      status: "available",
      description:
        "A student identification card was found near the library entrance. Identifying details are hidden.",
      notes:
        "Verify the name and ID number privately. Never publish an image of the ID.",
    },
    {
      id: "FI-1003",
      image: "assets/images/items/fi-1003.jpg",
      title: "Black compact umbrella",
      category: "Accessories",
      emoji: "☂️",
      location: "COE Building",
      daysAgo: 3, // turned over this many days before the site is first opened
      status: "available",
      description:
        "A compact black umbrella was turned over after being found in the COE building.",
      notes: "Ask about handle and distinguishing features.",
    },
    {
      id: "FI-1004",
      image: "assets/images/items/fi-1004.jpg",
      title: "Canvas tote bag",
      category: "Bags",
      emoji: "👜",
      location: "University Cafeteria",
      daysAgo: 4, // turned over this many days before the site is first opened
      status: "available",
      description:
        "A canvas tote bag found in the cafeteria is being held by OSA. Contents are not listed publicly.",
      notes:
        "Ask claimant to describe contents before opening or releasing.",
    },
    {
      id: "FI-1005",
      image: "assets/images/items/fi-1005.jpg",
      title: "Set of keys",
      category: "Keys",
      emoji: "🔑",
      location: "COS Building",
      daysAgo: 5, // turned over this many days before the site is first opened
      status: "available",
      description: "A small set of keys was found in the COS building.",
      notes: "Verify number and type of keys and any attached keychain.",
    },
    {
      id: "FI-1006",
      image: "assets/images/items/fi-1006.jpg",
      title: "Reusable water bottle",
      category: "Other",
      emoji: "🧴",
      location: "Gymnasium",
      daysAgo: 6, // turned over this many days before the site is first opened
      status: "available",
      description: "A reusable water bottle was found at the gymnasium.",
      notes: "Ask claimant for color, brand, and markings.",
    },
    {
      id: "FI-1007",
      image: "assets/images/items/fi-1007.jpg",
      title: "Hooded jacket",
      category: "Clothing",
      emoji: "🧥",
      location: "CIE Building",
      daysAgo: 7, // turned over this many days before the site is first opened
      status: "available",
      description:
        "A hooded jacket was turned over to OSA from the CIE building.",
      notes: "Ask about size and details inside pockets.",
    },
    {
      id: "FI-1008",
      image: "assets/images/items/fi-1008.jpg",
      title: "Scientific calculator",
      category: "Electronics",
      emoji: "🧮",
      location: "IRTC",
      daysAgo: 8, // turned over this many days before the site is first opened
      status: "available",
      description:
        "A scientific calculator found at IRTC is available for ownership verification.",
      notes: "Ask for model and identifiable markings.",
    },
    {
      id: "FI-1009",
      image: "assets/images/items/fi-1009.jpg",
      title: "Prescription eyeglasses",
      category: "Accessories",
      emoji: "👓",
      location: "College of Science",
      daysAgo: 12, // turned over this many days before the site is first opened
      status: "available",
      description:
        "A pair of prescription eyeglasses with a dark frame was turned over.",
      notes: "Ask about frame color, case, and lens details.",
    },
    {
      id: "FI-1010",
      image: "assets/images/items/fi-1010.jpg",
      title: "TUP lanyard with USB drive",
      category: "Electronics",
      emoji: "💾",
      location: "Engineering Lobby",
      daysAgo: 14, // turned over this many days before the site is first opened
      status: "available",
      description:
        "A TUP maroon lanyard attached to a small USB flash drive was found.",
      notes: "Do not plug in the USB. Ask claimant to describe the drive.",
    },
  ],
};
