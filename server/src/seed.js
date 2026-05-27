require("dotenv").config();

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const { connectDatabase } = require("./db");
const User = require("./models/User");
const Property = require("./models/Property");
const Notification = require("./models/Notification");
const Enquiry = require("./models/Enquiry");

const unsplash = (id, w = 900, h = 600) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

async function seedIfEmpty() {
  const userCount = await User.countDocuments();
  const propCount = await Property.countDocuments();
  if (userCount > 0 && propCount > 0) {
    console.log(`[seed] skipped (${userCount} users, ${propCount} properties already)`);
    return;
  }
  await seedAll();
}

async function seedAll() {
  await User.deleteMany({});
  await Property.deleteMany({});
  await Notification.deleteMany({});
  await Enquiry.deleteMany({});

  const hash = (plain) => bcrypt.hash(plain, 10);

  const [admin, builder, buyer, nri] = await Promise.all([
    User.create({
      role: "admin",
      name: "Aditi Menon",
      email: "admin@1crore.in",
      passwordHash: await hash("admin@123"),
      phone: "+91 90000 00000"
    }),
    User.create({
      role: "builder",
      name: "Rajesh Reddy",
      email: "builder@1crore.in",
      passwordHash: await hash("builder@123"),
      phone: "+91 98765 43210",
      company: "Skyline Crest Developers",
      rera: "TG-RERA-2024-A-0041",
      gstin: "36ABCDE1234F1Z5",
      city: "Hyderabad",
      verified: true
    }),
    User.create({
      role: "buyer",
      name: "Rahul Sharma",
      email: "buyer@1crore.in",
      passwordHash: await hash("buyer@123"),
      phone: "+91 99887 76655",
      category: "apartment",
      city: "Bengaluru",
      budgetMin: 8_000_000,
      budgetMax: 25_000_000,
      preferences: ["Gated Community", "East Facing", "3 BHK"]
    }),
    User.create({
      role: "nri",
      name: "Anika Iyer",
      email: "nri@1crore.in",
      passwordHash: await hash("nri@123"),
      phone: "+1 408 555 0182",
      country: "United States",
      preferredCity: "Hyderabad",
      investmentRange: "₹2 Cr – ₹5 Cr"
    })
  ]);

  const seedProperties = [
    {
      title: "Premium Sky Tower Apartment",
      category: "apartment",
      bhk: "3 BHK",
      city: "Bengaluru",
      location: "Whitefield, Bengaluru",
      price: 19500000,
      pricePerSqft: 11800,
      areaSqft: 1655,
      imageUrl: unsplash("photo-1545324418-cc1a3fa10c00"),
      gallery: [
        unsplash("photo-1545324418-cc1a3fa10c00"),
        unsplash("photo-1505691938895-1758d7feb511"),
        unsplash("photo-1560448204-e02f11c3d0e2"),
        unsplash("photo-1502672260266-1c1ef2d93688")
      ],
      facing: "East",
      possession: "Ready to Move",
      rera: "PRM/KA/RERA/1251/446/PR/210105/003910",
      amenities: ["Clubhouse", "Swimming Pool", "Gym", "Kids Play", "24x7 Security", "Power Backup"],
      highlights: ["Premium specs", "Vaastu compliant", "Skyline view", "Smart home ready"],
      description:
        "An elegant 3 BHK in Whitefield with panoramic city views, premium fittings, and a curated amenity deck designed for modern families.",
      status: "available",
      views: 1248,
      brochureDownloads: 86,
      visitRequests: 24
    },
    {
      title: "Hitech City Luxury Villa",
      category: "villa",
      bhk: "4 BHK",
      city: "Hyderabad",
      location: "Kondapur, Hyderabad",
      price: 38500000,
      pricePerSqft: 9500,
      areaSqft: 4050,
      imageUrl: unsplash("photo-1613490493576-7fde63acd811"),
      gallery: [
        unsplash("photo-1613490493576-7fde63acd811"),
        unsplash("photo-1600585154340-be6161a56a0c"),
        unsplash("photo-1600596542815-ffad4c1539a9"),
        unsplash("photo-1600585154526-990dced4db0d")
      ],
      facing: "North-East",
      possession: "Dec 2026",
      rera: "P02400003940",
      amenities: ["Private Pool", "Home Theatre", "Garden", "EV Charging", "Smart Locks"],
      highlights: ["Independent plot", "Italian marble", "Triple-height living"],
      description:
        "A meticulously designed 4 BHK luxury villa in the heart of Kondapur, blending modern minimalism with warm material palettes.",
      status: "available",
      views: 940,
      brochureDownloads: 52,
      visitRequests: 16
    },
    {
      title: "Marina Drive Sea View Apartment",
      category: "apartment",
      bhk: "2 BHK",
      city: "Mumbai",
      location: "Worli, Mumbai",
      price: 32500000,
      pricePerSqft: 28900,
      areaSqft: 1125,
      imageUrl: unsplash("photo-1493809842364-78817add7ffb"),
      gallery: [unsplash("photo-1493809842364-78817add7ffb"), unsplash("photo-1502672023488-70e25813eb80")],
      facing: "West",
      possession: "Ready to Move",
      rera: "P51800019987",
      amenities: ["Sea-view Deck", "Concierge", "Spa", "Infinity Pool"],
      highlights: ["Unobstructed sea view", "Italian kitchen"],
      description:
        "An iconic 2 BHK on Worli Sea-Face with floor-to-ceiling glass and a private balcony overlooking the Arabian Sea.",
      status: "available",
      views: 1820,
      brochureDownloads: 102,
      visitRequests: 38
    },
    {
      title: "Andheri Luxury Villa",
      category: "villa",
      bhk: "5 BHK",
      city: "Mumbai",
      location: "Andheri West, Mumbai",
      price: 78500000,
      pricePerSqft: 26500,
      areaSqft: 2960,
      imageUrl: unsplash("photo-1600585154084-4e5fe7c39198"),
      gallery: [unsplash("photo-1600585154084-4e5fe7c39198"), unsplash("photo-1600607687939-ce8a6c25118c")],
      facing: "South",
      possession: "Mar 2026",
      amenities: ["Rooftop Lounge", "Lift", "Private Garden"],
      highlights: ["Designer interiors", "Smart-home automation"],
      description:
        "Boutique villa with private rooftop and curated lighting design in the heart of Andheri West.",
      status: "available",
      views: 540,
      brochureDownloads: 21,
      visitRequests: 9
    },
    {
      title: "Banjara Hills Independent House",
      category: "independent",
      bhk: "4 BHK",
      city: "Hyderabad",
      location: "Banjara Hills, Hyderabad",
      price: 65000000,
      pricePerSqft: 11200,
      areaSqft: 5800,
      imageUrl: unsplash("photo-1568605114967-8130f3a36994"),
      gallery: [unsplash("photo-1568605114967-8130f3a36994"), unsplash("photo-1593604572577-1c6c44fa2f3f")],
      facing: "East",
      possession: "Ready to Move",
      amenities: ["Lawn", "Servant Quarter", "Backup Generator"],
      highlights: ["Premium locality", "G+2 structure"],
      description: "Spacious 4 BHK independent house with elegant Indo-modern interiors.",
      status: "available",
      views: 320,
      brochureDownloads: 12,
      visitRequests: 5
    },
    {
      title: "Commercial Office Space Hitech",
      category: "commercial",
      city: "Hyderabad",
      location: "Madhapur, Hitech City, Hyderabad",
      price: 19500000,
      pricePerSqft: 9800,
      areaSqft: 1980,
      imageUrl: unsplash("photo-1486406146926-c627a92ad1ab"),
      gallery: [unsplash("photo-1486406146926-c627a92ad1ab"), unsplash("photo-1497366754035-f200968a6e72")],
      facing: "East",
      possession: "Ready to Move",
      rera: "P02400003940",
      amenities: ["High-speed Lifts", "100% Power Backup", "EV Charging", "F&B Court"],
      highlights: ["Grade A specifications", "LEED Gold pre-certified"],
      description:
        "Premium Grade-A office space in Hitech City with double-glazed glass, raised flooring, and elite tenant mix.",
      status: "available",
      views: 2470,
      brochureDownloads: 145,
      visitRequests: 41
    },
    {
      title: "Indiranagar Independent House",
      category: "independent",
      bhk: "3 BHK",
      city: "Bengaluru",
      location: "Indiranagar, Bengaluru",
      price: 28500000,
      pricePerSqft: 15200,
      areaSqft: 1875,
      imageUrl: unsplash("photo-1564013799919-ab600027ffc6"),
      gallery: [unsplash("photo-1564013799919-ab600027ffc6"), unsplash("photo-1572120360610-d971b9d7767c")],
      facing: "North",
      possession: "Ready to Move",
      amenities: ["Terrace Garden", "Modular Kitchen"],
      highlights: ["Vibrant locality", "Tree-lined street"],
      description: "Compact and elegant 3 BHK in one of Bengaluru's most beloved neighborhoods.",
      status: "available",
      views: 612,
      brochureDownloads: 34,
      visitRequests: 14
    },
    {
      title: "Whitefield 2 BHK Apartment",
      category: "apartment",
      bhk: "2 BHK",
      city: "Bengaluru",
      location: "Whitefield, Bengaluru",
      price: 9900000,
      pricePerSqft: 8400,
      areaSqft: 1180,
      imageUrl: unsplash("photo-1502005229762-cf1b2da7c5d6"),
      gallery: [unsplash("photo-1502005229762-cf1b2da7c5d6"), unsplash("photo-1564540583246-934409427776")],
      facing: "East",
      possession: "Ready to Move",
      amenities: ["Park", "Children's Play", "CCTV Surveillance"],
      highlights: ["Affordable luxury", "Walk to metro"],
      description: "A bright 2 BHK in Whitefield perfect for first-time home buyers.",
      status: "available",
      views: 1105,
      brochureDownloads: 65,
      visitRequests: 18
    },
    {
      title: "Sarjapur Open Plot",
      category: "plot",
      city: "Bengaluru",
      location: "Sarjapur Road, Bengaluru",
      price: 7500000,
      pricePerSqft: 3750,
      areaSqft: 2000,
      imageUrl: unsplash("photo-1500382017468-9049fed747ef"),
      gallery: [unsplash("photo-1500382017468-9049fed747ef")],
      facing: "East",
      possession: "Clear Title",
      amenities: ["Gated Layout", "Underground drainage", "Compound wall"],
      highlights: ["BMRDA approved", "Corner plot"],
      description:
        "Premium open plot in a fast-developing IT corridor — clear title, instant registration.",
      status: "available",
      views: 433,
      brochureDownloads: 18,
      visitRequests: 7
    }
  ];

  const props = await Property.insertMany(
    seedProperties.map((p) => ({
      ...p,
      builderId: builder._id,
      builderName: builder.company
    }))
  );

  // Sample enquiries so the admin inbox isn't empty on first boot.
  const enquiriesSeed = [
    { propertyIndex: 0, name: "Aarav Mehta", email: "aarav@gmail.com", phone: "+91 98765 11122", message: "I'd like to schedule a site visit this weekend.", source: "property" },
    { propertyIndex: 2, name: "Riya Khanna", email: "riya@outlook.com", phone: "+91 97654 33221", message: "Is the listed price negotiable for outright purchase?", source: "property" },
    { propertyIndex: 1, name: "Mehul Jain", email: "mehul.j@yahoo.com", phone: "+44 7700 900111", message: "I'm an NRI buyer — can you share the brochure and EMI options?", source: "brochure" },
    { name: "Sara Pinto", email: "sara@iridium.com", phone: "+91 98800 12345", message: "Partnership enquiry — please reach out.", source: "contact" }
  ];
  await Enquiry.insertMany(
    enquiriesSeed.map((e) => ({
      propertyId: e.propertyIndex != null ? props[e.propertyIndex]._id : undefined,
      propertyTitle: e.propertyIndex != null ? props[e.propertyIndex].title : undefined,
      name: e.name,
      email: e.email,
      phone: e.phone,
      message: e.message,
      source: e.source
    }))
  );

  // Welcome notifications for the demo accounts.
  const welcomes = [
    { userId: admin._id, title: "Welcome back, Aditi", body: "4 new enquiries since you last visited.", icon: "sparkles", link: "/dashboard/admin#enquiries", type: "welcome" },
    { userId: builder._id, title: "Skyline Crest analytics are live", body: "Your portfolio drew 4,968 views this month.", icon: "building", link: "/dashboard/builder", type: "property_milestone" },
    { userId: buyer._id, title: "Welcome to 1 Crore Property", body: "Bookmark properties to see them in your wishlist.", icon: "sparkles", link: "/dashboard/buyer", type: "welcome" },
    { userId: nri._id, title: "NRI Terminal unlocked", body: "Complete KYC to enable repatriation workflows.", icon: "sparkles", link: "/dashboard/nri#kyc", type: "welcome" },
    { userId: builder._id, title: "Site visit confirmed", body: "Aarav Mehta confirmed a visit on Saturday at 11:30 AM.", icon: "check", link: "/dashboard/builder#leads", type: "enquiry_received" }
  ];
  await Notification.insertMany(welcomes);

  console.log(`[seed] created ${4} users + ${seedProperties.length} properties + ${enquiriesSeed.length} enquiries + ${welcomes.length} notifications`);
}

module.exports = { seedAll, seedIfEmpty };

// Allow `npm run seed` to re-seed from scratch.
if (require.main === module) {
  (async () => {
    await connectDatabase();
    await seedAll();
    await mongoose.disconnect();
    process.exit(0);
  })().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
