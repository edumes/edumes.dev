export const profile = {
  name: 'Eduardo Santarosa',
  fullName: 'Eduardo Moreira Santarosa',
  handles: ['edumes', 'edumesz'],
  url: 'https://edumes.dev',
  address: { addressLocality: 'Americana', addressRegion: 'SP', addressCountry: 'BR' },
  email: 'dev.eduardosantarosa@gmail.com',
  github: 'https://github.com/edumes',
  // The site's own repository, where the open examples live (examples/).
  repo: 'https://github.com/edumes/edumes.dev',
  linkedin: 'https://www.linkedin.com/in/edumesz/'
};

// A link as people type it: no scheme, no www, no trailing slash.
export const bareUrl = (url: string) => url.replace(/^https:\/\/(www\.)?/, '').replace(/\/$/, '');

// Same glyph for a section in the header, its title and the command menu.
export const sectionIcons = { top: 'home', cases: 'layers', projects: 'folder-code', about: 'user', experience: 'briefcase-business', contact: 'send' } as const;
