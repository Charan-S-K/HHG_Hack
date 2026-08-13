const prefixes = [
  'Async', 'Unstoppable', 'DeFi', 'Kernel', 'Zero-Knowledge',
  'Decentralized', 'Cyber', 'Mainnet', 'Bytecode', 'Chaotic',
  'Reactive', 'Immutable', 'Polymorphic', 'Serverless', 'Stateful',
  'Distributed', 'Algorithmic', 'Sudo', 'Cryptographic', 'Quantum'
];

const middles = [
  'Fenny', 'Coconut', 'Baga', 'Anjuna', 'Vagator', 'Calangute',
  'Monsoon', 'Shack', 'Curry', 'Masala', 'Palm', 'Sunset',
  'Breeze', 'Tavern', 'Cashew', 'Mandovi', 'Zuari', 'Dunes'
];

const suffixes = [
  'Warlock', 'Architect', 'Wizard', 'Ninja', 'Crusader',
  'Evangelist', 'Hacker', 'Breaker', 'Gladiator', 'Overlord',
  'Nomad', 'Slayer', 'Commander', 'Artisan', 'Wrangler'
];

/**
 * Generates a deterministic, fun builder title based on the user's name and stack/role.
 * @param {string} name 
 * @param {string} role 
 * @returns {string}
 */
export function generateBuilderTitle(name = '', role = '') {
  const nameVal = name ? name.trim() : 'Anonymous';
  const roleVal = role ? role.trim() : 'Hacker';
  const seedStr = `${nameVal.toLowerCase()}-${roleVal.toLowerCase()}`;
  
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = seedStr.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);

  const prefix = prefixes[hash % prefixes.length];
  const middle = middles[(hash + 3) % middles.length];
  const suffix = suffixes[(hash + 7) % suffixes.length];

  return `${prefix} ${middle} ${suffix}`;
}
