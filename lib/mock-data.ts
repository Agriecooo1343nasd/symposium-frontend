// Mock data for NAS 2026 platform

export const EVENT = {
  name: "3rd National Agroecology Symposium",
  shortName: "NAS 2026",
  theme: "Cultivating Rwanda's Agroecological Future — Together",
  startDate: new Date("2026-08-13T09:00:00+02:00"),
  endDate: new Date("2026-08-14T17:30:00+02:00"),
  venue: "Kigali Marriott Hotel, Kigali, Rwanda",
  organizer: "Rwanda Agroecology Network",
  exchangeRate: 1465, // USD → RWF
};

export type SubTheme =
  | "Soil Health"
  | "Food Systems"
  | "Policy & Governance"
  | "Climate Resilience"
  | "Farmer Innovation";

export const SUB_THEMES: SubTheme[] = [
  "Soil Health",
  "Food Systems",
  "Policy & Governance",
  "Climate Resilience",
  "Farmer Innovation",
];

export const SUB_THEME_COLORS: Record<SubTheme, string> = {
  "Soil Health": "bg-amber-100 text-amber-900 border-amber-300",
  "Food Systems": "bg-emerald-100 text-emerald-900 border-emerald-300",
  "Policy & Governance": "bg-blue-100 text-blue-900 border-blue-300",
  "Climate Resilience": "bg-sky-100 text-sky-900 border-sky-300",
  "Farmer Innovation": "bg-rose-100 text-rose-900 border-rose-300",
};

export type TicketCategory = {
  id: string;
  name: string;
  usd: number;
  description: string;
  features: string[];
  popular?: boolean;
  note?: string;
};

export const TICKET_CATEGORIES: TicketCategory[] = [
  { id: "intl", name: "International Delegate", usd: 250, description: "Full 2-day access for international delegates.", features: ["Both event days", "All sessions & workshops", "Networking lunches", "Conference materials", "Welcome reception"] },
  { id: "ngo", name: "NGO / CSO / Private Sector", usd: 150, description: "For regional NGO, CSO and private sector reps.", features: ["Both event days", "All sessions & workshops", "Networking lunches", "Conference materials"], popular: true },
  { id: "academic", name: "Academic / Researcher", usd: 120, description: "For university faculty and researchers.", features: ["Both event days", "All sessions & workshops", "Research networking session", "Conference materials"] },
  { id: "student", name: "Student", usd: 25, description: "Discounted student pass.", features: ["Both event days", "All sessions", "Student mixer"], note: "Requires valid student ID" },
  { id: "farmer", name: "Farmer / Farmer Org.", usd: 40, description: "For practicing farmers and farmer cooperatives.", features: ["Both event days", "Field visit included", "Farmer-led workshops"], note: "Requires organization letter" },
  { id: "virtual", name: "Virtual Attendee", usd: 20, description: "Online access only.", features: ["Live stream all plenaries", "Selected workshops", "Digital materials"] },
  {
    id: "media",
    name: "Media / Press",
    usd: 0,
    description: "Accredited journalists and content creators covering NAS 2026 — no registration fee.",
    features: ["Press briefing access", "Media workspace", "Interview coordination", "Event photography zones"],
    note: "Requires press credentials & outlet verification",
  },
];

export type Speaker = {
  id: string;
  name: string;
  title: string;
  org: string;
  country: string;
  flag: string;
  bio: string;
  photo: string;
  featured?: boolean;
  sessions: string[];
};

export const SPEAKERS: Speaker[] = [
  { id: "s1", name: "Dr. Mukeshimana Solange", title: "Director General", org: "Rwanda Agriculture Board (RAB)", country: "Rwanda", flag: "🇷🇼", bio: "Leading researcher in sustainable hillside agriculture with over 20 years guiding Rwanda's national agroecology agenda.", photo: "https://i.pravatar.cc/400?img=47", featured: true, sessions: ["ss1", "ss2"] },
  { id: "s2", name: "Hon. Geraldine Mukeshimana", title: "Minister of Agriculture", org: "MINAGRI Rwanda", country: "Rwanda", flag: "🇷🇼", bio: "Spearheading Rwanda's Vision 2050 agricultural transformation with strong focus on agroecology.", photo: "https://i.pravatar.cc/400?img=44", featured: true, sessions: ["ss1"] },
  { id: "s3", name: "Dr. Kwame Asante", title: "Principal Scientist", org: "Alliance of Bioversity International & CIAT", country: "Ghana", flag: "🇬🇭", bio: "Pan-African expert on biodiversity-rich farming systems and seed sovereignty.", photo: "https://i.pravatar.cc/400?img=11", featured: true, sessions: ["ss7"] },
  { id: "s4", name: "Prof. Esther Wanjiru", title: "Professor of Soil Science", org: "University of Nairobi", country: "Kenya", flag: "🇰🇪", bio: "Pioneering research on regenerative soil practices across East Africa's smallholder systems.", photo: "https://i.pravatar.cc/400?img=45", featured: true, sessions: ["ss5"] },
  { id: "s5", name: "Jean-Baptiste Habimana", title: "Farmer Leader", org: "Imbaraga Farmers Federation", country: "Rwanda", flag: "🇷🇼", bio: "Champion of farmer-led innovation networks reaching 30,000+ smallholders in Northern Province.", photo: "https://i.pravatar.cc/400?img=12", featured: true, sessions: ["ss4"] },
  { id: "s6", name: "Dr. Amara Diallo", title: "Country Director", org: "SNV Netherlands Development Org.", country: "Senegal", flag: "🇸🇳", bio: "Driving inclusive agribusiness across the Sahel with two decades in agricultural development.", photo: "https://i.pravatar.cc/400?img=48", featured: true, sessions: ["ss8"] },
  { id: "s7", name: "Dr. Pius Tumusiime", title: "Senior Researcher", org: "IITA Uganda", country: "Uganda", flag: "🇺🇬", bio: "Cassava and banana systems specialist, leading climate-resilient cropping research.", photo: "https://i.pravatar.cc/400?img=13", sessions: ["ss7"] },
  { id: "s8", name: "Lisa Ndayishimiye", title: "Program Manager", org: "GIZ Rwanda", country: "Rwanda", flag: "🇷🇼", bio: "Manages flagship sustainable land use programmes across Rwanda's districts.", photo: "https://i.pravatar.cc/400?img=49", sessions: ["ss11"] },
  { id: "s9", name: "Dr. Ngozi Eze", title: "Policy Advisor", org: "African Union — Department of Rural Economy", country: "Nigeria", flag: "🇳🇬", bio: "Architect of the AU's continental agroecology policy framework.", photo: "https://i.pravatar.cc/400?img=20", sessions: ["ss3"] },
  { id: "s10", name: "Theogene Rutagwenda", title: "Country Lead", org: "WFP Rwanda", country: "Rwanda", flag: "🇷🇼", bio: "Linking smallholder agroecology with school feeding markets and resilient food systems.", photo: "https://i.pravatar.cc/400?img=14", sessions: ["ss8"] },
  { id: "s11", name: "Dr. Chiamaka Okonkwo", title: "Senior Economist", org: "CGIAR Initiative on Agroecology", country: "Nigeria", flag: "🇳🇬", bio: "Quantifying socio-economic returns of agroecological transitions in East Africa.", photo: "https://i.pravatar.cc/400?img=21", sessions: ["ss7"] },
  { id: "s12", name: "Ferdinand Habimana", title: "Founder", org: "Green Pastures Cooperative", country: "Rwanda", flag: "🇷🇼", bio: "Cooperative founder turning 1,200 smallholders toward organic certification.", photo: "https://i.pravatar.cc/400?img=15", sessions: ["ss10"] },
];

/** Public = listed on /programme for everyone. Subscribers = paid delegates & portal roles only. */
export type SessionVisibility = "public" | "subscribers";

export type Session = {
  id: string;
  day: 1 | 2;
  start: string;
  end: string;
  title: string;
  type: "Plenary" | "Panel" | "Workshop" | "Field Visit" | "Keynote";
  room: string;
  subTheme: SubTheme;
  speakers: string[];
  description: string;
  longDescription?: string;
  learningObjectives?: string[];
  prerequisites?: string;
  capacity?: number;
  visibility?: SessionVisibility;
};

export const SESSIONS: Session[] = [
  { id: "ss1", day: 1, start: "09:00", end: "09:45", title: "Opening Ceremony & Ministerial Address", type: "Keynote", room: "Grand Ballroom", subTheme: "Policy & Governance", speakers: ["s2", "s1"], description: "Official opening of NAS 2026 with welcome remarks from MINAGRI and partner organizations.", longDescription: "The opening ceremony brings together Rwanda's Minister of Agriculture, the Director-General of RAB, and representatives from the African Union and CGIAR to launch the 3rd National Agroecology Symposium. Expect a formal welcome, the unveiling of the 2026 symposium scorecard against the previous Kigali commitments, and a framing address that sets the stage for two days of dialogue.", learningObjectives: ["Understand the national policy context", "Hear flagship commitments for 2026–2028", "Be welcomed into the symposium community"], capacity: 500 },
  { id: "ss2", day: 1, start: "10:00", end: "11:30", title: "Scaling Agroecological Practices in Rwanda's Hillside Farming Systems", type: "Plenary", room: "Grand Ballroom", subTheme: "Soil Health", speakers: ["s1", "s4"], description: "How Rwanda's terraced landscapes are transforming through regenerative practices.", longDescription: "Rwanda's mountainous terrain demands a unique approach to soil management. This plenary unpacks five years of evidence from Northern and Western Province pilots, exploring what scales, what stalls, and what farmer-led adaptation looks like at district level. Expect data, on-the-ground stories from cooperative leaders, and a forward look at the 2027 national rollout plan.", learningObjectives: ["Map proven hillside practices to district contexts", "Identify financing pathways for scaling", "Connect with implementing partners"], capacity: 500},
  { id: "ss3", day: 1, start: "11:45", end: "13:00", title: "Policy Frameworks for Food Systems Transformation", type: "Panel", room: "Imbabazi Hall", subTheme: "Policy & Governance", speakers: ["s9", "s2", "s6"], description: "African Union and national policy levers driving agroecological transitions.", longDescription: "A frank panel between continental policy architects, national ministries, and implementing NGOs. We'll discuss what's working in the AU's continental framework, where national budgets and policies diverge, and how civil society can move the needle.", learningObjectives: ["Decode the AU agroecology framework", "Compare national policy approaches", "Build cross-border advocacy alliances"], capacity: 250 },
  { id: "ss4", day: 1, start: "14:00", end: "15:30", title: "Farmer-Led Innovation: Voices from the Field", type: "Panel", room: "Ubumuntu Hall", subTheme: "Farmer Innovation", speakers: ["s5", "s12"], description: "Smallholder champions share what's working — and what isn't.", longDescription: "An unfiltered conversation with five farmer leaders from across Rwanda and the region. They'll share what's actually scaling in their fields, the support systems they need from research and policy, and the innovations they wish the rest of the world would notice.", learningObjectives: ["Hear directly from farmer innovators", "Identify barriers research can address", "Discover partnership opportunities"], capacity: 200},
  { id: "ss5", day: 1, start: "15:45", end: "17:00", title: "Soil Health Workshop: From Lab to Field", type: "Workshop", room: "Workshop Room A", subTheme: "Soil Health", speakers: ["s4"], description: "Hands-on session on soil testing and amendment strategies for smallholders.", longDescription: "A practical, hands-on workshop. Bring a soil sample if you have one. You'll work through rapid field testing methods, interpret results, and leave with a one-page amendment guide tailored to common East African soil profiles.", learningObjectives: ["Run a basic soil health test", "Interpret pH, organic matter, and nutrient indicators", "Build an amendment plan"], prerequisites: "Basic agronomy background recommended", capacity: 40 },
  { id: "ss6", day: 1, start: "17:15", end: "18:00", title: "Day 1 Recap & Welcome Reception", type: "Plenary", room: "Garden Terrace", subTheme: "Food Systems", speakers: ["s1"], description: "Networking reception with traditional Rwandan music and cuisine.", longDescription: "Unwind with peers over Rwandan cuisine and live traditional music. A brief recap from the day's chairs, then open networking on the Marriott's garden terrace.", capacity: 500 },
  { id: "ss7", day: 2, start: "09:00", end: "10:30", title: "Climate Resilience in East African Agriculture", type: "Plenary", room: "Grand Ballroom", subTheme: "Climate Resilience", speakers: ["s7", "s11"], description: "Evidence on climate adaptation pathways for smallholder systems.", longDescription: "Drawing on a region-wide longitudinal study, this plenary presents what's working in climate adaptation across smallholder East Africa — and what isn't. Honest evidence, including failure cases.", learningObjectives: ["Understand regional climate trajectories", "Compare adaptation strategies", "Identify investment-ready interventions"], capacity: 500 },
  { id: "ss8", day: 2, start: "10:45", end: "12:15", title: "Inclusive Markets & Agroecology", type: "Panel", room: "Imbabazi Hall", subTheme: "Food Systems", speakers: ["s6", "s10"], description: "Linking agroecological producers to formal markets — including school feeding.", longDescription: "How do agroecological producers cross the chasm to formal markets? This panel features school-feeding buyers, cooperatives, and aggregators who've made it work — and those who've tried and learned.", learningObjectives: ["Map market entry pathways", "Understand procurement requirements", "Connect with off-takers"], capacity: 250 },
  { id: "ss9", day: 2, start: "12:30", end: "14:00", title: "Field Visit: Bugesera Agroecology Demo Farm", type: "Field Visit", room: "Bus Departure — Lobby", subTheme: "Farmer Innovation", speakers: ["s5"], description: "Live demonstration of integrated agroecological practices. Limited to 60 attendees.", longDescription: "A guided 90-minute visit to the Bugesera demonstration site — Rwanda's flagship integrated agroecology farm. See intercropping, agroforestry, biochar production, and water harvesting in action. Lunch served on-site.", learningObjectives: ["See integrated practices in action", "Speak directly with practitioner farmers", "Take home a replication checklist"], prerequisites: "Comfortable shoes; sun protection. Bus leaves promptly at 12:30.", capacity: 60 },
  { id: "ss10", day: 2, start: "14:15", end: "15:30", title: "Cooperative Models Workshop", type: "Workshop", room: "Workshop Room B", subTheme: "Farmer Innovation", speakers: ["s12", "s5"], description: "Building viable agroecological cooperatives — financing, governance, certification.", longDescription: "An interactive workshop on building durable agroecological cooperatives. Cover governance models, financing structures, and certification pathways. Templates and worksheets included.", learningObjectives: ["Choose a cooperative governance model", "Map financing options", "Plan a certification roadmap"], capacity: 50 },
  { id: "ss11", day: 2, start: "15:45", end: "17:00", title: "Partnerships for Scale: Donors, Government, Farmers", type: "Panel", room: "Imbabazi Hall", subTheme: "Policy & Governance", speakers: ["s8", "s9", "s6"], description: "Frank conversation between funders, government, and farmer leaders.", longDescription: "A three-way conversation between donors, government decision-makers, and farmer leaders about what real partnership looks like — and where it consistently breaks down.", capacity: 250 },
  { id: "ss12", day: 2, start: "17:00", end: "17:30", title: "Closing Ceremony & Kigali Call to Action", type: "Keynote", room: "Grand Ballroom", subTheme: "Policy & Governance", speakers: ["s2", "s1"], description: "Adoption of the Kigali Call to Action and next steps for the 4th NAS.", longDescription: "Formal adoption of the Kigali Call to Action, recognition of contributors, and announcement of the host city for the 4th NAS in 2028.", capacity: 500 },
];

export type Sponsor = {
  id: string;
  name: string;
  tier: "Platinum" | "Gold" | "Silver";
  blurb: string;
  website: string;
};

export const SPONSORS: Sponsor[] = [
  { id: "sp1", name: "GIZ Rwanda", tier: "Platinum", blurb: "German cooperation for sustainable land use in Rwanda.", website: "#" },
  { id: "sp2", name: "CGIAR", tier: "Platinum", blurb: "Global agricultural research partnership.", website: "#" },
  { id: "sp3", name: "SNV", tier: "Platinum", blurb: "Inclusive agribusiness across the global south.", website: "#" },
  { id: "sp4", name: "WFP", tier: "Gold", blurb: "World Food Programme — Rwanda country office.", website: "#" },
  { id: "sp5", name: "IFOAM", tier: "Gold", blurb: "Organics International — global advocacy.", website: "#" },
  { id: "sp6", name: "Alliance Bioversity", tier: "Gold", blurb: "Biodiversity for resilient food systems.", website: "#" },
  { id: "sp7", name: "IITA", tier: "Gold", blurb: "International Institute of Tropical Agriculture.", website: "#" },
  { id: "sp8", name: "RAB", tier: "Silver", blurb: "Rwanda Agriculture Board.", website: "#" },
  { id: "sp9", name: "MINAGRI", tier: "Silver", blurb: "Ministry of Agriculture, Rwanda.", website: "#" },
  { id: "sp10", name: "Imbaraga", tier: "Silver", blurb: "Farmer federation of Rwanda.", website: "#" },
  { id: "sp11", name: "AGRA", tier: "Silver", blurb: "Alliance for a Green Revolution in Africa.", website: "#" },
  { id: "sp12", name: "FAO Rwanda", tier: "Silver", blurb: "UN Food and Agriculture Organization.", website: "#" },
];

export type NewsPost = {
  slug: string;
  title: string;
  date: string;
  author: string;
  excerpt: string;
  body: string;
  image: string;
};

export const NEWS: NewsPost[] = [
  { slug: "registration-now-open", title: "Registration for NAS 2026 is officially open", date: "2026-04-12", author: "NAS Secretariat", excerpt: "Early-bird registration for the 3rd National Agroecology Symposium is now live. Secure your spot before the venue fills.", body: "We are delighted to announce that registration for the 3rd National Agroecology Symposium (NAS 2026) is officially open as of today. Over 300 delegates from across Rwanda, East Africa, and the wider continent are expected to convene in Kigali on 13–14 August 2026. Early-bird pricing runs until 30 June 2026, after which standard rates apply. We have negotiated preferred accommodation rates at the Marriott and several partner hotels — links will be sent with each confirmation email. The full delegate handbook, dietary intake form, and visa-support request flow are live inside the attendee dashboard the moment your payment clears.", image: "https://picsum.photos/seed/news1/1200/700" },
  { slug: "kigali-call-to-action", title: "What to expect from the Kigali Call to Action", date: "2026-03-28", author: "Dr. Solange Mukeshimana", excerpt: "A preview of the policy commitments delegates will deliberate at the closing ceremony.", body: "The closing ceremony of NAS 2026 will feature the adoption of the Kigali Call to Action, a policy document four months in the making. It synthesizes the symposium's working-group deliberations into seven concrete commitments — covering soil health investment, farmer-led research funding, cross-border seed sovereignty, school-feeding linkages, agroforestry targets, monitoring & evaluation standards, and a 2028 roadmap. The draft will be circulated to all registered delegates two weeks ahead of the event for written feedback.", image: "https://picsum.photos/seed/news2/1200/700" },
  { slug: "abstract-submissions-trends", title: "Early abstract submissions show strong farmer-led research trend", date: "2026-03-15", author: "Programme Committee", excerpt: "Of the first 120 submissions, 38% feature farmer co-researchers — a record for the symposium.", body: "Analysis of the first wave of abstract submissions shows a clear shift toward participatory research. 38% of the 120 submissions received by 1 March list farmers as co-researchers — up from 19% at the 2nd NAS. The Programme Committee is also seeing more cross-border collaborations, with 22% of abstracts featuring co-authors from more than one country.", image: "https://picsum.photos/seed/news3/1200/700" },
  { slug: "youth-scholarships", title: "30 youth scholarships available for student delegates", date: "2026-02-05", author: "NAS Secretariat", excerpt: "Applications are open for 30 fully-funded student delegate passes targeting agriculture students across Rwanda.", body: "In partnership with the Rwanda Youth in Agribusiness Forum, we are offering 30 fully-funded student delegate scholarships. Awardees receive a full conference pass, two nights' accommodation, and a travel stipend. Eligibility: enrolled undergraduate or postgraduate in an agriculture-adjacent programme at a Rwandan institution. Apply through the secretariat by 30 April 2026.", image: "https://picsum.photos/seed/news5/1200/700" },
  { slug: "venue-logistics", title: "Venue logistics & accessibility at the Kigali Marriott", date: "2026-01-22", author: "Logistics Team", excerpt: "Everything you need to know about getting to and around the symposium venue.", body: "The Kigali Marriott Hotel is fully wheelchair accessible. Shuttle services run from Kigali International Airport every 30 minutes during arrival days. Sign language interpretation is available on request — flag this in your accessibility intake form at least 14 days ahead.", image: "https://picsum.photos/seed/news4/1200/700" },
];

export const FAQS = [
  { q: "When and where is NAS 2026?", a: "NAS 2026 takes place on 13–14 August 2026 at the Kigali Marriott Hotel in Kigali, Rwanda." },
  { q: "What's included in the registration fee?", a: "All tickets include access to both event days, all plenary sessions and workshops in your category, networking lunches, and a printed delegate pack. Specific inclusions vary by ticket type." },
  { q: "What payment methods are accepted?", a: "We accept MTN Mobile Money, Airtel Money, Visa/Mastercard, and bank transfer. All payments are processed securely via PCI-DSS compliant gateways." },
  { q: "Is there a refund policy?", a: "Cancellations made before 1 July 2026 receive a full refund minus a 10% processing fee. After that date, registrations are non-refundable but transferable to another attendee." },
  { q: "Will sessions be available online?", a: "Yes — the Virtual Attendee ticket gives access to all live-streamed plenary sessions and selected workshops, with recordings available post-event." },
  { q: "Can I get a visa support letter?", a: "International delegates can request a visa support letter from their attendee dashboard once registration is confirmed. We recommend applying for your visa at least 6 weeks in advance." },
  { q: "What language will sessions be in?", a: "Primary language is English. Plenary sessions will offer simultaneous interpretation in Kinyarwanda and French." },
  { q: "Is accommodation included?", a: "Accommodation is not included. We have negotiated preferred rates at the Marriott and several partner hotels — details are sent with your confirmation email." },
  { q: "How do I become a speaker or exhibitor?", a: "Sign in to your attendee dashboard and use the 'Apply to speak' or 'Apply to exhibit' flows. Applications are reviewed by the Programme Committee within 10 working days." },
];

// ============================================================
// Auth + role data
// ============================================================
export type Role =
  | "attendee"
  | "admin"
  | "registration_desk"
  | "moderator"
  | "exhibitor"
  | "speaker";

export type ParticipationKind = "exhibitor" | "sponsor" | "both";

export type MockSession = {
  email: string;
  name: string;
  role: Role;
  category: string;
  ticketId: string;
  avatar?: string;
  /** Exhibitor portal: booth-only vs sponsor package */
  participation?: ParticipationKind;
  /** Group registration (FR-2.3) */
  groupId?: string;
  isGroupRepresentative?: boolean;
};

export const DEMO_USER: MockSession = {
  email: "alice@example.rw",
  name: "Alice Uwimana",
  role: "attendee",
  category: "International Delegate",
  ticketId: "NAS26-INTL-00428",
};

// ============================================================
// Networking — incoming + outgoing requests
// ============================================================
export type ConnectionRequest = {
  id: string;
  fromSpeakerId: string;
  message: string;
  date: string;
  status: "pending" | "accepted" | "declined";
};

export const INCOMING_REQUESTS: ConnectionRequest[] = [
  { id: "cr1", fromSpeakerId: "s6", message: "Hi Alice — I'd love to compare notes on inclusive market models for cooperatives. Free for coffee on Day 1?", date: "2026-08-01", status: "pending" },
  { id: "cr2", fromSpeakerId: "s11", message: "Saw your bio — we have overlap on M&E. Mind if I share our framework before the symposium?", date: "2026-07-29", status: "pending" },
  { id: "cr3", fromSpeakerId: "s4", message: "Looking forward to your soil-health perspective in the workshop. Could we connect briefly afterward?", date: "2026-07-25", status: "accepted" },
  { id: "cr4", fromSpeakerId: "s8", message: "Hello — GIZ would love a 1:1 to discuss potential partnership.", date: "2026-07-20", status: "declined" },
];

// ============================================================
// Exhibitors — separate from sponsors, used in exhibitor portal
// ============================================================
export type Exhibitor = {
  id: string;
  name: string;
  booth: string;
  category: string;
  description: string;
  contact: string;
  leads: number;
};

export const EXHIBITORS: Exhibitor[] = [
  { id: "ex1", name: "AgriTools Rwanda", booth: "A-12", category: "Equipment", description: "Smallholder-scale tools and irrigation kits.", contact: "info@agritools.rw", leads: 0 },
  { id: "ex2", name: "SeedSov East Africa", booth: "B-04", category: "Seeds", description: "Open-pollinated and farmer-saved seed varieties.", contact: "hello@seedsov.org", leads: 0 },
  { id: "ex3", name: "BioComposters Ltd.", booth: "B-09", category: "Inputs", description: "Locally manufactured biochar and compost solutions.", contact: "team@biocomposters.rw", leads: 0 },
  { id: "ex4", name: "FarmTech Africa", booth: "C-02", category: "Digital", description: "Farmer-facing climate and market data apps.", contact: "support@farmtech.africa", leads: 0 },
];

// ============================================================
// Abstracts — for admin/speaker portal
// ============================================================
export type Abstract = {
  id: string;
  title: string;
  authors: string;
  track: SubTheme;
  status: "submitted" | "under-review" | "accepted" | "rejected";
  submittedAt: string;
};

export const ABSTRACTS: Abstract[] = [
  { id: "ab1", title: "Biochar in Rwandan banana systems: a 3-year yield study", authors: "Habimana J-B., Wanjiru E.", track: "Soil Health", status: "accepted", submittedAt: "2026-03-12" },
  { id: "ab2", title: "Participatory M&E for agroecological transitions", authors: "Okonkwo C., Asante K.", track: "Policy & Governance", status: "under-review", submittedAt: "2026-04-02" },
  { id: "ab3", title: "Market access pathways for women-led cooperatives", authors: "Diallo A.", track: "Food Systems", status: "submitted", submittedAt: "2026-04-21" },
  { id: "ab4", title: "Climate-smart cassava varieties under irregular rainfall", authors: "Tumusiime P.", track: "Climate Resilience", status: "accepted", submittedAt: "2026-03-18" },
  { id: "ab5", title: "Farmer-research collaboratives: a co-design playbook", authors: "Habimana F.", track: "Farmer Innovation", status: "rejected", submittedAt: "2026-02-28" },
];

// ============================================================
// Registrations — for admin portal
// ============================================================
export type Registration = {
  id: string;
  name: string;
  email: string;
  country: string;
  category: string;
  amountUsd: number;
  status: "paid" | "pending" | "comp";
  createdAt: string;
};

export const REGISTRATIONS: Registration[] = [
  { id: "r1", name: "Alice Uwimana", email: "alice@example.rw", country: "Rwanda", category: "International Delegate", amountUsd: 250, status: "paid", createdAt: "2026-04-12" },
  { id: "r2", name: "John Okello", email: "j.okello@example.ug", country: "Uganda", category: "NGO / CSO / Private Sector", amountUsd: 150, status: "paid", createdAt: "2026-04-13" },
  { id: "r3", name: "Maria Bonomi", email: "m.bonomi@university.it", country: "Italy", category: "Academic / Researcher", amountUsd: 120, status: "paid", createdAt: "2026-04-15" },
  { id: "r4", name: "Patrick Niyonzima", email: "patrick@coop.rw", country: "Rwanda", category: "Farmer / Farmer Org.", amountUsd: 40, status: "paid", createdAt: "2026-04-17" },
  { id: "r5", name: "Sarah Mwangi", email: "sarah.m@example.ke", country: "Kenya", category: "Student", amountUsd: 25, status: "pending", createdAt: "2026-04-20" },
  { id: "r6", name: "Marcus Weber", email: "weber@giz.de", country: "Germany", category: "International Delegate", amountUsd: 250, status: "paid", createdAt: "2026-04-21" },
  { id: "r7", name: "Aisha Diop", email: "aisha@example.sn", country: "Senegal", category: "NGO / CSO / Private Sector", amountUsd: 150, status: "comp", createdAt: "2026-04-22" },
];

// ============================================================
// Speaker / Exhibitor applications (pending admin review)
// ============================================================
export type Application = {
  id: string;
  name: string;
  email: string;
  org: string;
  kind: "speaker" | "exhibitor";
  topic: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
};

export const APPLICATIONS: Application[] = [
  { id: "ap1", name: "Dr. Pauline Nkurunziza", email: "pauline@uni.rw", org: "University of Rwanda", kind: "speaker", topic: "Indigenous seed banking practices", status: "pending", submittedAt: "2026-04-10" },
  { id: "ap2", name: "GreenHarvest Co.", email: "contact@greenharvest.rw", org: "GreenHarvest Co.", kind: "exhibitor", topic: "Organic input distribution", status: "pending", submittedAt: "2026-04-12" },
  { id: "ap3", name: "Dr. Samuel Adeyemi", email: "s.adeyemi@iita.org", org: "IITA Nigeria", kind: "speaker", topic: "Climate-smart yam systems", status: "approved", submittedAt: "2026-03-30" },
];

// ICS helpers
export function buildEventICS() {
  const fmt = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//NAS 2026//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:nas2026-${Date.now()}@nas2026.rw`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(EVENT.startDate)}`,
    `DTEND:${fmt(EVENT.endDate)}`,
    `SUMMARY:${EVENT.name}`,
    `LOCATION:${EVENT.venue}`,
    `DESCRIPTION:${EVENT.theme}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

// ============================================================
// Notifications (attendee inbox)
// ============================================================
export type Notification = {
  id: string;
  type: "session" | "connection" | "system" | "announcement";
  title: string;
  body: string;
  time: string;
  unread: boolean;
  href?: string;
};
export const NOTIFICATIONS: Notification[] = [
  { id: "n1", type: "announcement", title: "Programme update", body: "The Bugesera Field Visit start time has shifted to 12:15. Buses depart from the main lobby.", time: "2h ago", unread: true, href: "/programme" },
  { id: "n2", type: "connection", title: "New connection request", body: "Dr. Amara Diallo wants to connect with you.", time: "5h ago", unread: true, href: "/dashboard/networking" },
  { id: "n3", type: "session", title: "Reminder: Soil Health Workshop", body: "Starts in 30 minutes in Workshop Room A.", time: "1d ago", unread: false, href: "/dashboard/schedule" },
  { id: "n4", type: "system", title: "Your ticket is ready", body: "Your e-ticket and QR have been issued. Save it offline before travel.", time: "3d ago", unread: false, href: "/dashboard/ticket" },
  { id: "n5", type: "announcement", title: "Pre-read updated", body: "The Agroecology Evidence Base PDF has been refreshed (v1.2).", time: "1w ago", unread: false, href: "/dashboard/materials" },
];

// ============================================================
// Finance (admin)
// ============================================================
export type Transaction = {
  id: string; attendee: string; amountUsd: number; method: "MoMo MTN" | "Airtel Money" | "Card" | "Bank Transfer";
  status: "completed" | "pending" | "failed" | "refunded"; ref: string; at: string;
};
export const TRANSACTIONS: Transaction[] = [
  { id: "t1", attendee: "Alice Uwimana", amountUsd: 250, method: "Card", status: "completed", ref: "VS-91021", at: "2026-04-12 10:21" },
  { id: "t2", attendee: "John Okello", amountUsd: 150, method: "MoMo MTN", status: "completed", ref: "MTN-4421", at: "2026-04-13 14:02" },
  { id: "t3", attendee: "Maria Bonomi", amountUsd: 120, method: "Card", status: "completed", ref: "VS-91402", at: "2026-04-15 08:45" },
  { id: "t4", attendee: "Patrick Niyonzima", amountUsd: 40, method: "Airtel Money", status: "completed", ref: "AIR-2210", at: "2026-04-17 18:30" },
  { id: "t5", attendee: "Sarah Mwangi", amountUsd: 25, method: "Bank Transfer", status: "pending", ref: "BT-77013", at: "2026-04-20 09:12" },
  { id: "t6", attendee: "Marcus Weber", amountUsd: 250, method: "Card", status: "completed", ref: "VS-91855", at: "2026-04-21 16:00" },
  { id: "t7", attendee: "Linda Ouma", amountUsd: 150, method: "Bank Transfer", status: "pending", ref: "BT-77108", at: "2026-04-22 11:45" },
  { id: "t8", attendee: "Tobias Bauer", amountUsd: 120, method: "Card", status: "refunded", ref: "VS-91612", at: "2026-04-19 13:21" },
];

export const DAILY_REGS: Array<{ day: string; regs: number; goal: number }> = [
  { day: "Apr 12", regs: 14, goal: 20 }, { day: "Apr 13", regs: 22, goal: 20 }, { day: "Apr 14", regs: 18, goal: 20 },
  { day: "Apr 15", regs: 30, goal: 25 }, { day: "Apr 16", regs: 26, goal: 25 }, { day: "Apr 17", regs: 34, goal: 30 },
  { day: "Apr 18", regs: 28, goal: 30 }, { day: "Apr 19", regs: 41, goal: 35 }, { day: "Apr 20", regs: 38, goal: 35 },
  { day: "Apr 21", regs: 47, goal: 40 }, { day: "Apr 22", regs: 52, goal: 40 },
];

// ============================================================
// Check-ins (admin + live)
// ============================================================
export type CheckIn = { id: string; name: string; category: string; at: string };
export const CHECKINS: CheckIn[] = [
  { id: "c1", name: "Alice Uwimana", category: "International Delegate", at: "08:42" },
  { id: "c2", name: "John Okello", category: "NGO / CSO / Private Sector", at: "08:47" },
  { id: "c3", name: "Patrick Niyonzima", category: "Farmer / Farmer Org.", at: "08:55" },
  { id: "c4", name: "Maria Bonomi", category: "Academic / Researcher", at: "09:01" },
  { id: "c5", name: "Marcus Weber", category: "International Delegate", at: "09:08" },
  { id: "c6", name: "Aisha Diop", category: "NGO / CSO / Private Sector", at: "09:14" },
];
export const HOURLY_CHECKINS = [
  { hour: "07:00", n: 4 }, { hour: "08:00", n: 32 }, { hour: "09:00", n: 78 },
  { hour: "10:00", n: 41 }, { hour: "11:00", n: 19 }, { hour: "12:00", n: 8 },
];

// ============================================================
// Admin users + roles
// ============================================================
export type AdminUser = { id: string; name: string; email: string; role: string; lastLogin: string; active: boolean };
export const ADMIN_USERS: AdminUser[] = [
  { id: "u1", name: "Solange Mukeshimana", email: "solange@nas2026.rw", role: "Super Admin", lastLogin: "Today, 09:12", active: true },
  { id: "u2", name: "Eric Habineza", email: "finance@nas2026.rw", role: "Finance Officer", lastLogin: "Today, 08:40", active: true },
  { id: "u3", name: "Jean-Paul Bizimana", email: "programme@nas2026.rw", role: "Programme Committee", lastLogin: "Yesterday, 17:55", active: true },
  { id: "u4", name: "Claire Ingabire", email: "desk@nas2026.rw", role: "Registration Desk", lastLogin: "3 days ago", active: true },
  { id: "u5", name: "Thierry Niyonsenga", email: "exhibitors@nas2026.rw", role: "Exhibitor Manager", lastLogin: "1 week ago", active: false },
];
export const ADMIN_ROLES = [
  { name: "Super Admin", perms: ["All modules", "User management", "Settings"] },
  { name: "Finance Officer", perms: ["Finance", "Registrations (read)", "Reports"] },
  { name: "Programme Committee", perms: ["Programme", "Speakers", "Abstracts"] },
  { name: "Registration Desk", perms: ["Check-in", "Registrations (read)"] },
  { name: "Exhibitor Manager", perms: ["Exhibitors", "Sponsorship applications"] },
  { name: "Speaker Coordinator", perms: ["Speakers", "Sessions", "Communications"] },
];
export const AUDIT_LOG = [
  { id: "al1", who: "Eric Habineza", action: "Confirmed bank transfer", target: "Reg #r5 — Sarah Mwangi", at: "Today, 10:22" },
  { id: "al2", who: "Solange M.", action: "Approved application", target: "App #ap3 — Dr. Samuel Adeyemi", at: "Today, 09:48" },
  { id: "al3", who: "Jean-Paul B.", action: "Edited session", target: "Soil Health Workshop", at: "Yesterday, 16:30" },
  { id: "al4", who: "Claire I.", action: "Checked in attendee", target: "Alice Uwimana", at: "Yesterday, 08:42" },
  { id: "al5", who: "Solange M.", action: "Invited user", target: "thierry@nas2026.rw", at: "2 days ago" },
];

// ============================================================
// Exhibitor materials, staff, analytics
// ============================================================
export type ExhibitorTier = "Platinum" | "Gold" | "Silver";
export const EXHIBITOR_ME = {
  ...EXHIBITORS[0],
  tier: "Gold" as ExhibitorTier,
  tierQuota: { brochures: 3, staffPasses: 4, leadCapture: true },
};
export const EXHIBITOR_BROCHURES = [
  { id: "br1", name: "AgriTools Product Catalog 2026.pdf", size: "4.1 MB", uploaded: "2026-06-12", downloads: 42 },
  { id: "br2", name: "Irrigation Kit Setup Guide.pdf", size: "1.8 MB", uploaded: "2026-06-14", downloads: 18 },
];
export const EXHIBITOR_STAFF = [
  { id: "st1", name: "Eric Mukamana", email: "eric@agritools.rw", role: "Booth Lead", status: "Confirmed" as const },
  { id: "st2", name: "Liliane Niwemugeni", email: "liliane@agritools.rw", role: "Sales", status: "Confirmed" as const },
  { id: "st3", name: "Innocent Habiyaremye", email: "innocent@agritools.rw", role: "Technical Demo", status: "Invited" as const },
];
export const EXHIBITOR_DAILY_VIEWS = [
  { day: "Mon", views: 22 }, { day: "Tue", views: 31 }, { day: "Wed", views: 28 },
  { day: "Thu", views: 45 }, { day: "Fri", views: 52 }, { day: "Sat", views: 38 }, { day: "Sun", views: 41 },
];
export const EXHIBITOR_LEADS_BY_DAY = [
  { day: "Day 1 AM", leads: 6 }, { day: "Day 1 PM", leads: 11 }, { day: "Day 2 AM", leads: 8 }, { day: "Day 2 PM", leads: 3 },
];

// ============================================================
// Speaker portal extras
// ============================================================
export const SPEAKER_CHECKLIST = [
  { label: "Profile complete", done: true },
  { label: "Headshot uploaded", done: true },
  { label: "Bio approved by chair", done: true },
  { label: "Presentation file uploaded", done: false },
  { label: "AV requirements confirmed", done: false },
  { label: "Session details accepted", done: true },
];

// ============================================================
// Exhibitor messages
// ============================================================
export const EXHIBITOR_MESSAGES = [
  { id: "em1", from: "Programme Committee", subject: "Booth setup window confirmed", date: "Today", body: "Hello — your setup window is 12 Aug, 14:00–18:00. Please bring a copy of your equipment manifest." },
  { id: "em2", from: "NAS Secretariat", subject: "Exhibitor briefing — 11 Aug", date: "2 days ago", body: "All exhibitor leads are invited to a 30-minute online briefing on 11 August, 16:00 CAT. Joining link to follow." },
  { id: "em3", from: "Logistics Team", subject: "Power and internet specs", date: "1 week ago", body: "Each booth comes with 2 power outlets (220V) and dedicated 50 Mbps wifi. Bring multi-plugs if you need more outlets." },
];

// ============================================================
// Rooms (admin programme)
// ============================================================
export const ROOMS = [
  { id: "rm1", name: "Grand Ballroom", capacity: 500, floor: "Ground", av: "Full AV + simultaneous interpretation" },
  { id: "rm2", name: "Imbabazi Hall", capacity: 250, floor: "Ground", av: "Full AV" },
  { id: "rm3", name: "Ubumuntu Hall", capacity: 200, floor: "1st", av: "Full AV" },
  { id: "rm4", name: "Workshop Room A", capacity: 40, floor: "1st", av: "Projector + flip charts" },
  { id: "rm5", name: "Workshop Room B", capacity: 50, floor: "1st", av: "Projector + flip charts" },
  { id: "rm6", name: "Garden Terrace", capacity: 500, floor: "Ground", av: "Audio system" },
];

// ============================================================
// Communications log
// ============================================================
export const EMAIL_CAMPAIGNS = [
  { id: "ec1", subject: "Welcome to NAS 2026 — your e-ticket is inside", segment: "All Attendees", sent: "2026-04-22", recipients: 312, openRate: "68%" },
  { id: "ec2", subject: "Early-bird pricing ends in 48 hours", segment: "All Subscribers", sent: "2026-06-28", recipients: 1840, openRate: "54%" },
  { id: "ec3", subject: "Programme just dropped — see what's new", segment: "All Attendees", sent: "2026-07-10", recipients: 318, openRate: "72%" },
];
export const AUTOMATED_TEMPLATES = [
  { id: "tpl1", label: "Registration Confirmation", enabled: true },
  { id: "tpl2", label: "Payment Failed Reminder", enabled: true },
  { id: "tpl3", label: "Abstract Decision Notification", enabled: true },
  { id: "tpl4", label: "Session Reminder (24h before)", enabled: true },
  { id: "tpl5", label: "Certificate Available", enabled: false },
];
