export default {
  '@context': 'http://schema.org/',
  '@type': 'WebApplication',
  name: 'Glif Safe',
  description: 'A Filecoin multisig wallet.',
  url: 'https://safe.glif.io',
  knowsAbout: [
    {
      '@type': 'SoftwareApplication',
      name: 'Filecoin',
      url: 'https://filecoin.io',
      applicationCategory: 'Blockchain network',
      operatingSystem: 'All'
    },
    {
      '@type': 'Corporation',
      name: 'Ledger SAS',
      url: 'https://www.ledger.com/'
    }
  ],
  parentOrganization: {
    '@type': 'Organization',
    name: 'Glif',
    description: '.',
    url: 'https://www.glif.io'
  }
}
