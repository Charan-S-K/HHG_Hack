/**
 * HH Goa 2026 — Builder Title Generator
 * Produces varied, non-repetitive, event-specific builder titles.
 * No API key, no network requests — fully deterministic and offline.
 */

const PREFIXES = [
  'Full-Stack', 'Frontend', 'Backend', 'Mobile', 'AI/ML', 'DevOps',
  'Blockchain', 'Systems', 'Cloud', 'Platform', 'Product', 'Growth',
  'Security', 'Data', 'Infra', 'Protocol', 'Open-Source', 'Deep-Tech',
  'Web3', 'Edge', 'Embedded', 'Research', 'Founding', 'Core',
  'Senior', 'Lead', 'Staff', 'Principal', 'Indie', 'Solo',
];

const ARCHETYPES = [
  'Engineer', 'Builder', 'Hacker', 'Maker', 'Architect',
  'Developer', 'Founder', 'Tinkerer', 'Creator', 'Operator',
  'Researcher', 'Craftsperson', 'Optimizer', 'Wizard', 'Pioneer',
  'Deployer', 'Shipper', 'Breaker', 'Solver', 'Networker',
];

const SUFFIXES = [
  '@ HH Goa \'26', '— Goa Edition', '· HH 2026', '/ Hackathon',
  '@ the Beach', '· Builder Pass', '— Goa Batch', '/ Day Zero',
  '@ HHG Summit', '· Open to Collab', '— Ship It Mode', '/ Ideathon',
  '@ Coastal Sprint', '· Goa Cohort', '— Beta Tester', '/ Pitch Ready',
  '@ Sprint Week', '· Code & Chai', '— Go-Live Mode', '/ Demo Day',
];

/**
 * Simple deterministic hash from a string
 * @param {string} str
 * @returns {number}
 */
function hashString(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Generates a varied builder title seeded by the user's name.
 * Same name → same title (stable). Different names → different titles.
 * @param {string} name - The user's name input
 * @returns {string} A formatted builder title
 */
export function generateBuilderTitle(name) {
  const seed = name && name.trim().length > 0
    ? hashString(name.trim().toLowerCase())
    : hashString(String(Date.now()));

  const prefix = PREFIXES[seed % PREFIXES.length];
  const archetype = ARCHETYPES[Math.floor(seed / PREFIXES.length) % ARCHETYPES.length];
  const suffix = SUFFIXES[Math.floor(seed / (PREFIXES.length * ARCHETYPES.length)) % SUFFIXES.length];

  return `${prefix} ${archetype} ${suffix}`;
}

/**
 * Returns all available prefixes for the UI dropdown
 */
export function getBuilderPrefixes() {
  return PREFIXES;
}

/**
 * Returns all available archetypes for the UI dropdown
 */
export function getBuilderArchetypes() {
  return ARCHETYPES;
}
