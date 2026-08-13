export const FORMATS = {
  PFP: {
    id: 'pfp',
    name: 'PFP Frame',
    description: 'HH Goa 2026 circular frame overlay for Twitter, LinkedIn & Discord profile photos',
    width: 1024,
    height: 1024,
    aspectRatio: 1, // 1:1
    clipShape: 'circle', // 'circle' or 'square'
    photoScale: 1.0,
  },
  BUILDER_CARD: {
    id: 'builder-card',
    name: 'Builder ID Card',
    description: 'Official HH Goa 2026 hacker pass with custom fields & verified badge',
    width: 800,
    height: 1200,
    aspectRatio: 2 / 3, // 2:3 vertical layout
    clipShape: 'rect',
    photoScale: 1.0,
  }
};
