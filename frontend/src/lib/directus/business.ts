import type { Locale } from '@/config/i18n';

export interface BusinessContent {
  hero: {
    eyebrow: string;
    title: string;
    summary: string;
  };
  positioning: string;
  companyName: string;
  companyIntroduction: string[];
  productSystems: Array<{
    number: string;
    title: string;
    slug: string;
    description: string;
    focus: string[];
  }>;
  capabilities: Array<{ title: string; description: string }>;
  qualityProcess: string[];
  customerTypes: Array<{ title: string; description: string }>;
  applications: Array<{ title: string; description: string; direction: string }>;
  serviceProcess: Array<{ title: string; description: string }>;
  markets: Array<{ title: string; description: string }>;
  complianceNote: string;
}

const englishBusinessContent: BusinessContent = {
  hero: {
    eyebrow: 'Fuel & Lubricant Additive Technology',
    title: 'Additive technology for global industry.',
    summary:
      'Huanyu Kuntai Chem supplies fuel additives, lubricant additives and lubricant additive packages with formulation support, controlled production, customized packaging and global delivery.'
  },
  positioning: 'Global Fuel & Lubricant Additives Solutions Provider',
  companyName: "Xi'an Huanyu Kuntai Industrial Technology Co., Ltd.",
  companyIntroduction: [
    "Xi'an Huanyu Kuntai Industrial Technology Co., Ltd. is an industrial technology and international supply company serving global fuel, lubricant and specialty chemical markets.",
    'Through Huanyu Kuntai Chem, we specialize in fuel additives, lubricant additives and lubricant additive packages for importers, distributors, brand owners, lubricant manufacturers, blending plants and industrial customers.',
    'Since 2008, Huanyu Kuntai has developed capabilities in chemical manufacturing, formulation support, quality control, customized production and international delivery. Our goal is to be a reliable long-term Chinese additive partner for global customers.'
  ],
  productSystems: [
    {
      number: '01',
      title: 'Fuel Additives',
      slug: 'fuel-additives',
      description:
        'Gasoline and diesel additive solutions for fuel-system cleanliness, deposit control, combustion, stability, cold-flow performance, water treatment and lubricity.',
      focus: ['Gasoline fuel additives', 'Diesel fuel additives', 'Brand-ready and industrial supply']
    },
    {
      number: '02',
      title: 'Lubricant Additives',
      slug: 'lubricant-additives',
      description:
        'Functional components for lubricant manufacturing, blending and industrial lubrication, organized by additive function rather than retail format.',
      focus: ['Detergents and dispersants', 'Wear, oxidation and corrosion control', 'Rheology and fluid-performance modifiers']
    },
    {
      number: '03',
      title: 'Lubricant Additive Packages',
      slug: 'lubricant-additive-packages',
      description:
        'Application-oriented additive package solutions for automotive and industrial lubricant formulation systems.',
      focus: ['Engine and gear oils', 'Hydraulic, ATF and industrial oils', 'Metalworking fluids and grease applications']
    }
  ],
  capabilities: [
    {
      title: 'Formula development',
      description: 'Development support based on fuel type, lubricant system, operating conditions and customer market positioning.'
    },
    {
      title: 'Formula optimization',
      description: 'Product optimization around performance objectives, application environment and commercial requirements.'
    },
    {
      title: 'Compatibility & stability',
      description: 'Evaluation of additive compatibility with fuels, base oils and related systems, together with storage and transport stability.'
    },
    {
      title: 'Performance evaluation',
      description: 'Application-relevant evaluation and product selection according to the specific additive and intended use.'
    },
    {
      title: 'Sample development',
      description: 'Samples for customer testing, market evaluation and qualified customization projects.'
    },
    {
      title: 'OEM / ODM / Private Label',
      description: 'Formula selection, product positioning, bottle, label, carton and brand-specific packaging support.'
    },
    {
      title: 'Quality & batch control',
      description: 'Raw-material confirmation, process inspection, batch management, finished-product inspection and traceability.'
    },
    {
      title: 'Export & technical support',
      description: 'Product documentation, export files, logistics coordination and continued application communication.'
    }
  ],
  qualityProcess: [
    'Raw material confirmation',
    'Incoming inspection',
    'Formula & production preparation',
    'Blending / mixing',
    'Process inspection',
    'Filling or industrial packaging',
    'Batch & finished-product inspection',
    'Storage and export release'
  ],
  customerTypes: [
    { title: 'Importers & distributors', description: 'Structured product supply, technical documentation and repeat-order support.' },
    { title: 'Lubricant manufacturers', description: 'Functional additives, additive packages and formulation-oriented technical support.' },
    { title: 'Blending plants', description: 'Stable additive supply and application-matched product selection.' },
    { title: 'Automotive chemical brands', description: 'OEM, ODM and private-label development for market-ready product programs.' },
    { title: 'Industrial lubricant companies', description: 'Industrial additive components and application-specific package solutions.' },
    { title: 'Private-label brand owners', description: 'Product development, positioning, packaging customization and long-term production.' }
  ],
  applications: [
    { title: 'Passenger vehicles', description: 'Gasoline and diesel fuel treatment together with passenger-car engine-oil additive systems.', direction: 'Fuel additives · PCMO additive packages' },
    { title: 'Commercial vehicles', description: 'Diesel fuel treatment and heavy-duty lubricant solutions for demanding transport operation.', direction: 'Diesel additives · HDDO additive packages' },
    { title: 'Heavy-duty diesel engines', description: 'Fuel-system, combustion and heavy-duty engine-oil additive directions.', direction: 'Diesel additives · Heavy-duty engine oil' },
    { title: 'Construction machinery', description: 'Fuel, hydraulic, gear and industrial lubrication systems used in equipment operation.', direction: 'Diesel · Hydraulic · Gear oil' },
    { title: 'Agricultural engines', description: 'Additive directions for agricultural power systems without introducing unrelated machinery-parts business.', direction: 'Diesel fuel · Engine lubrication' },
    { title: 'Industrial machinery', description: 'Hydraulic oil, gear oil, compressor oil, turbine oil and related industrial lubrication.', direction: 'Functional additives · Industrial packages' },
    { title: 'Lubricant manufacturing', description: 'Single-component additives and package solutions for formulation and blending operations.', direction: 'Lubricant additives · Additive packages' },
    { title: 'Automotive aftermarket', description: 'Brand-ready fuel additive programs supported by private-label customization.', direction: 'Fuel additives · Private label' }
  ],
  serviceProcess: [
    { title: 'Requirement review', description: 'Confirm the product, application, market, performance objective and packaging direction.' },
    { title: 'Product or formula selection', description: 'Match a standard solution or define an OEM, ODM or private-label development route.' },
    { title: 'Sample & technical confirmation', description: 'Prepare samples and confirm the applicable product information before commercial production.' },
    { title: 'Commercial confirmation', description: 'Confirm quotation, verified MOQ, lead time, packaging, payment and transport arrangements.' },
    { title: 'Production & quality control', description: 'Execute production, batch, inspection, filling and packaging-control procedures.' },
    { title: 'Export & long-term supply', description: 'Provide applicable documents, coordinate logistics and support repeat orders and technical communication.' }
  ],
  markets: [
    { title: 'Southeast Asia', description: 'Fuel-quality variation, growing automotive and industrial lubricant demand, and private-label opportunities.' },
    { title: 'Middle East', description: 'High-temperature operation, diesel markets, commercial vehicles and industrial lubrication.' },
    { title: 'Africa', description: 'Diesel vehicles, industrial machinery, fuel treatment and foundational lubricant applications.' },
    { title: 'South America', description: 'Automotive aftermarket, lubricant brands and fuel-additive distribution.' },
    { title: 'Central Asia & CIS', description: 'Low-temperature diesel, cold-flow performance, heavy-duty and industrial applications.' },
    { title: 'Europe & other markets', description: 'Documentation, traceability and compliance support according to product and destination requirements.' }
  ],
  complianceNote:
    'Certifications, compliance documents, SDS, TDS and COA are provided according to product type, application and destination-market requirements. No certificate or performance claim applies universally unless verified for the specific product.'
};

export async function getBusinessContent(_locale: Locale): Promise<BusinessContent> {
  // This verified English fallback will move to Directus `pages` and structured capability collections.
  // Until localized CMS records exist, every locale receives the approved English source instead of invented translations.
  return englishBusinessContent;
}
