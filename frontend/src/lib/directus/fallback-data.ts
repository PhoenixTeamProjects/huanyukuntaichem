import type { Locale } from '@/config/i18n';
import type { NewsArticle, Product, ProductCategory, SiteSettings } from './types';

export const fallbackSettings: SiteSettings = {
  siteName: 'HUANYU KUNTAI CHEM',
  tagline: 'Additive Technology for Global Industry',
  email: null,
  phone: '18182602513',
  address: 'China'
};

const category = (
  id: string,
  name: string,
  description: string,
  parent: string | null = null
): ProductCategory => ({ id, slug: id, parent, name, description });

export const fallbackCategories: ProductCategory[] = [
  category('fuel-additives', 'Fuel Additives', 'Gasoline and diesel additive systems for fuel performance, cleanliness and stability.'),
  category('gasoline-fuel-additives', 'Gasoline Fuel Additives', 'Gasoline-system cleaning, deposit control, octane, combustion, stability and water-treatment solutions.', 'fuel-additives'),
  category('diesel-fuel-additives', 'Diesel Fuel Additives', 'Diesel-system cleaning, cetane, combustion, cold-flow, stability, water-treatment and lubricity solutions.', 'fuel-additives'),
  category('lubricant-additives', 'Lubricant Additives', 'Functional single-component additives for lubricant manufacturing, blending and industrial use.'),
  category('detergents', 'Detergents', 'Additives for acid neutralization, high-temperature deposit control and system cleanliness.', 'lubricant-additives'),
  category('dispersants', 'Dispersants', 'Additives for contaminant dispersion, sludge control and deposit management.', 'lubricant-additives'),
  category('anti-wear-additives', 'Anti-Wear Additives', 'Components designed to improve anti-wear protection in lubricant systems.', 'lubricant-additives'),
  category('extreme-pressure-additives', 'Extreme Pressure Additives', 'Components for high-load, gear-oil and metalworking conditions.', 'lubricant-additives'),
  category('antioxidants', 'Antioxidants', 'Components that delay oxidation and support high-temperature stability.', 'lubricant-additives'),
  category('friction-modifiers', 'Friction Modifiers', 'Components used to optimize friction, wear and efficiency characteristics.', 'lubricant-additives'),
  category('corrosion-inhibitors', 'Corrosion Inhibitors', 'Components that help reduce metal-corrosion risk.', 'lubricant-additives'),
  category('rust-inhibitors', 'Rust Inhibitors', 'Components that improve rust protection on metal surfaces.', 'lubricant-additives'),
  category('pour-point-depressants', 'Pour Point Depressants', 'Components used to improve low-temperature lubricant flow.', 'lubricant-additives'),
  category('viscosity-index-improvers', 'Viscosity Index Improvers', 'Components that support viscosity-temperature performance and viscosity retention.', 'lubricant-additives'),
  category('anti-foam-additives', 'Anti-Foam Additives', 'Components that control foam formation and stability.', 'lubricant-additives'),
  category('demulsifiers', 'Demulsifiers', 'Components used to improve oil-water separation.', 'lubricant-additives'),
  category('emulsifiers', 'Emulsifiers', 'Components for industrial fluids that require stable emulsification.', 'lubricant-additives'),
  category('tackifiers', 'Tackifiers', 'Components that improve lubricant adhesion and retention.', 'lubricant-additives'),
  category('other-functional-lubricant-additives', 'Other Functional Additives', 'A controlled extension category for verified functional lubricant-additive products.', 'lubricant-additives'),
  category('lubricant-additive-packages', 'Lubricant Additive Packages', 'Application-oriented package solutions for automotive and industrial lubricant formulations.'),
  category('passenger-car-motor-oil-packages', 'Passenger Car Motor Oil Packages', 'Package direction for passenger-car gasoline engine oils.', 'lubricant-additive-packages'),
  category('heavy-duty-diesel-engine-oil-packages', 'Heavy-Duty Diesel Engine Oil Packages', 'Package direction for heavy-duty diesel engine lubricants.', 'lubricant-additive-packages'),
  category('motorcycle-oil-packages', 'Motorcycle Oil Packages', 'Package direction for motorcycle engine oils.', 'lubricant-additive-packages'),
  category('gear-oil-packages', 'Gear Oil Packages', 'Package direction for automotive and industrial gear oils.', 'lubricant-additive-packages'),
  category('hydraulic-oil-packages', 'Hydraulic Oil Packages', 'Package direction for industrial hydraulic oils.', 'lubricant-additive-packages'),
  category('atf-packages', 'ATF Additive Packages', 'Package direction for automatic transmission fluid systems.', 'lubricant-additive-packages'),
  category('compressor-oil-packages', 'Compressor Oil Packages', 'Package direction for compressor lubrication systems.', 'lubricant-additive-packages'),
  category('turbine-oil-packages', 'Turbine Oil Packages', 'Package direction for turbine lubrication systems.', 'lubricant-additive-packages'),
  category('industrial-oil-packages', 'Industrial Oil Packages', 'Package direction for multiple industrial lubricant applications.', 'lubricant-additive-packages'),
  category('metalworking-fluid-packages', 'Metalworking Fluid Packages', 'Package direction for cutting and metalworking fluids.', 'lubricant-additive-packages'),
  category('grease-additive-solutions', 'Grease Additive Solutions', 'Additive direction for grease formulations and related functional requirements.', 'lubricant-additive-packages')
];

const product = (
  slug: string,
  categoryId: string,
  name: string,
  summary: string,
  highlights: string[],
  applications: string[] = []
): Product => ({
  id: `product-${slug}`,
  slug,
  category: categoryId,
  name,
  summary,
  description:
    'This product family is supplied through technical confirmation. Exact grade, dosage, specification, packaging and compliance documents are shown only after the applicable product data has been verified.',
  image: null,
  imageAlt: null,
  highlights,
  applications
});

export const fallbackProducts: Product[] = [
  product('gasoline-fuel-additives', 'gasoline-fuel-additives', 'Gasoline Fuel Additives', 'A structured portfolio for gasoline fuel-system cleanliness, deposit control, combustion, octane, stability and moisture management.', ['Fuel system and injector cleaners', 'Gasoline detergent and deposit-control additives', 'Octane booster and combustion improver', 'Fuel stabilizer and moisture-removal directions'], ['Passenger vehicles', 'Automotive aftermarket', 'Private-label fuel-treatment programs']),
  product('diesel-fuel-additives', 'diesel-fuel-additives', 'Diesel Fuel Additives', 'Diesel additive solutions covering cleaning, cetane, combustion, cold-flow, stability, water management and lubricity.', ['Diesel fuel-system and injector cleaners', 'Cetane booster and combustion improver', 'Anti-gel, cold-flow improver and pour-point depressant', 'Fuel stabilizer, water remover and lubricity improver'], ['Commercial vehicles', 'Heavy-duty diesel engines', 'Construction and agricultural power systems']),
  product('detergents', 'detergents', 'Lubricant Detergents', 'Detergent components for neutralization, deposit control and lubricant-system cleanliness.', ['Calcium sulfonate detergents', 'Magnesium sulfonate detergents', 'Salicylate detergents', 'Phenate detergents']),
  product('dispersants', 'dispersants', 'Lubricant Dispersants', 'Dispersant components for contaminant suspension, sludge control and deposit management.', ['Ashless dispersants', 'Polyisobutylene succinimide dispersants', 'Borated dispersants']),
  product('anti-wear-additives', 'anti-wear-additives', 'Anti-Wear Additives', 'Functional additives that support anti-wear protection in automotive and industrial lubricant systems.', ['ZDDP anti-wear additives', 'Phosphorus-based anti-wear additives', 'Ashless anti-wear additives']),
  product('extreme-pressure-additives', 'extreme-pressure-additives', 'Extreme Pressure Additives', 'Functional components for high-load, gear-oil and metalworking conditions.', ['Sulfurized EP additives', 'Phosphorus EP additives', 'Sulfur-phosphorus EP additives']),
  product('antioxidants', 'antioxidants', 'Lubricant Antioxidants', 'Antioxidant components for oxidation control and high-temperature stability.', ['Amine antioxidants', 'Phenolic antioxidants', 'High-temperature antioxidant directions']),
  product('friction-modifiers', 'friction-modifiers', 'Friction Modifiers', 'Functional components used to optimize friction behavior, wear and efficiency.', ['Organic friction modifiers', 'Molybdenum friction modifiers', 'Ester friction modifiers']),
  product('corrosion-inhibitors', 'corrosion-inhibitors', 'Corrosion Inhibitors', 'Components selected to reduce metal-corrosion risk in applicable lubricant systems.', ['Application-matched corrosion control', 'Compatibility evaluation', 'Technical selection support']),
  product('rust-inhibitors', 'rust-inhibitors', 'Rust Inhibitors', 'Components selected to improve rust protection on metal surfaces.', ['Metal-surface protection', 'Application-matched selection', 'Formulation-support direction']),
  product('pour-point-depressants', 'pour-point-depressants', 'Pour Point Depressants', 'Components used to improve lubricant low-temperature flow behavior.', ['PMA pour point depressants', 'Alkyl naphthalene pour point depressants', 'Base-oil compatibility evaluation']),
  product('viscosity-index-improvers', 'viscosity-index-improvers', 'Viscosity Index Improvers', 'Components that support viscosity-temperature performance and viscosity retention.', ['OCP viscosity index improvers', 'PMA viscosity index improvers', 'High-shear-stability VI improver directions']),
  product('anti-foam-additives', 'anti-foam-additives', 'Anti-Foam Additives', 'Components for controlling foam formation and stability.', ['Silicone anti-foam agents', 'Non-silicone anti-foam agents', 'System compatibility evaluation']),
  product('demulsifiers', 'demulsifiers', 'Demulsifiers', 'Functional components used to improve oil-water separation in applicable systems.', ['Oil-water separation support', 'Industrial lubricant applications', 'Compatibility-led selection']),
  product('emulsifiers', 'emulsifiers', 'Emulsifiers', 'Functional components for industrial fluids that require stable emulsification.', ['Stable emulsion support', 'Industrial fluid applications', 'Formulation-led selection']),
  product('tackifiers', 'tackifiers', 'Tackifiers', 'Components used to improve lubricant adhesion and retention.', ['Adhesion improvement', 'Retention support', 'Grease and industrial lubricant direction']),
  product('other-functional-lubricant-additives', 'other-functional-lubricant-additives', 'Other Functional Lubricant Additives', 'A controlled category reserved for verified functional components outside the principal families.', ['Only verified products are published', 'Technical data required before release', 'No generic catch-all claims']),
  product('passenger-car-motor-oil-packages', 'passenger-car-motor-oil-packages', 'Passenger Car Motor Oil Additive Packages', 'Application-oriented additive-package direction for passenger-car gasoline engine oils.', ['Formulation and performance positioning', 'Sample and compatibility support', 'Verified grades and dosage only'], ['Passenger-car engine oils']),
  product('heavy-duty-diesel-engine-oil-packages', 'heavy-duty-diesel-engine-oil-packages', 'Heavy-Duty Diesel Engine Oil Additive Packages', 'Application-oriented package direction for heavy-duty diesel engine lubricants.', ['Heavy-duty application focus', 'Formulation support', 'Verified specifications only'], ['Commercial vehicles', 'Construction machinery', 'Heavy-duty diesel engines']),
  product('motorcycle-oil-packages', 'motorcycle-oil-packages', 'Motorcycle Oil Additive Packages', 'Application-oriented package direction for motorcycle engine oils.', ['Application matching', 'Formula support', 'Technical confirmation before supply'], ['Motorcycle engine oils']),
  product('gear-oil-packages', 'gear-oil-packages', 'Gear Oil Additive Packages', 'Application-oriented package direction for automotive and industrial gear oils.', ['Automotive gear-oil direction', 'Industrial gear-oil direction', 'Performance confirmation before supply'], ['Automotive gear oils', 'Industrial gear oils']),
  product('hydraulic-oil-packages', 'hydraulic-oil-packages', 'Hydraulic Oil Additive Packages', 'Application-oriented package direction for industrial hydraulic oils.', ['Industrial hydraulic systems', 'Formula and stability support', 'Verified technical data only'], ['Industrial machinery', 'Construction equipment']),
  product('atf-packages', 'atf-packages', 'ATF Additive Packages', 'Application-oriented additive-package direction for automatic transmission fluid systems.', ['ATF formulation direction', 'Compatibility support', 'Verified application data only'], ['Automatic transmission fluids']),
  product('compressor-oil-packages', 'compressor-oil-packages', 'Compressor Oil Additive Packages', 'Application-oriented package direction for compressor lubrication systems.', ['Industrial compressor systems', 'Formula selection support', 'Application-specific confirmation'], ['Compressor oils']),
  product('turbine-oil-packages', 'turbine-oil-packages', 'Turbine Oil Additive Packages', 'Application-oriented package direction for turbine lubrication systems.', ['Turbine lubricant direction', 'Technical selection support', 'Verified product documentation'], ['Turbine oils']),
  product('industrial-oil-packages', 'industrial-oil-packages', 'Industrial Oil Additive Packages', 'Package solutions organized around verified industrial lubricant applications.', ['Industrial application matching', 'Formula optimization support', 'Stable supply planning'], ['Industrial machinery', 'Lubricant manufacturing']),
  product('metalworking-fluid-packages', 'metalworking-fluid-packages', 'Metalworking Fluid Additive Packages', 'Application-oriented package direction for cutting and metalworking fluids.', ['Metalworking application direction', 'Emulsion and performance support', 'Technical confirmation before supply'], ['Cutting fluids', 'Metalworking fluids']),
  product('grease-additive-solutions', 'grease-additive-solutions', 'Grease Additive Solutions', 'Functional additive directions for grease formulations and related application requirements.', ['Functional component selection', 'Formulation support', 'Application-specific documentation'], ['Lubricating grease formulations'])
];

const news = (slug: string, category: string, title: string, excerpt: string, content: string, image: string): NewsArticle => ({
  id: `news-${slug}`,
  slug,
  category,
  title,
  excerpt,
  content,
  image,
  imageAlt: title,
  publishedAt: '2026-09-01'
});

export const fallbackNews: NewsArticle[] = [
  news('choosing-the-right-additive-direction', 'Lubricant formulation', 'How to choose the right additive direction for your application', 'Effective selection starts with the base fluid, equipment duty, operating environment and target performance—not with a generic product list.', 'The first step in additive selection is to define the complete application context. Base fluid chemistry, equipment type, operating temperature, load and service interval can all change the appropriate technical direction.\n\nA useful inquiry should therefore include the intended fluid system, current formulation information where available, target performance and any market or documentation requirements. Final product, dosage and compatibility recommendations require technical confirmation against the actual formulation.', '/images/home/lubricant-additives.webp'),
  news('fuel-additives-cleaner-combustion', 'Fuel additives', 'How fuel additives support cleaner combustion', 'A practical overview of deposit control, combustion quality and system cleanliness.', 'Fuel-additive programs can address several different requirements, including injector cleanliness, deposit control, ignition quality, stability and moisture management. These functions should not be treated as interchangeable.\n\nSelection begins with the fuel type, vehicle or equipment, operating pattern and the specific performance issue being addressed. Product claims and dosage must be confirmed for the chosen additive and intended market.', '/images/home/fuel-additives.webp'),
  news('lubricant-additive-direction', 'Lubricant formulation', 'Choosing the right lubricant additive direction', 'Start with the base oil, application duty and required performance balance.', 'Lubricant formulations depend on the interaction between base oil, viscosity system and functional additives. A component that performs well in one system may require a different dosage or compatibility review in another.\n\nDefine the application, base oil, viscosity target, operating conditions and desired performance before selecting a detergent, dispersant, anti-wear agent, antioxidant or other functional component.', '/images/home/lubricant-additives.webp'),
  news('additive-package-formulation', 'Additive packages', 'What an additive package does in a formulation', 'How coordinated components simplify application-oriented formulation development.', 'An additive package combines several functional components around an intended lubricant application. It can simplify sourcing and formulation work, but it does not remove the need to confirm the base oil, treat rate and performance direction.\n\nPackage selection should be based on the lubricant type, target market, available test information and the actual production route.', '/images/home/additive-packages.webp'),
  news('tds-sds-coa-guide', 'Quality & documentation', 'Understanding TDS, SDS and COA documentation', 'The role of product, safety and batch documents in a verified B2B supply route.', 'A Technical Data Sheet describes verified product characteristics and application information. A Safety Data Sheet communicates handling and safety information. A Certificate of Analysis reports applicable information for a specific batch.\n\nDocument availability and content depend on the confirmed product and supply arrangement. Documents should be matched to the actual grade rather than treated as interchangeable marketing material.', '/images/home/refined/quality-control.webp'),
  news('heavy-duty-diesel-additives', 'Fuel additives', 'Additive selection for heavy-duty diesel applications', 'Operating duty, fuel quality and climate all influence the technical direction.', 'Heavy-duty diesel equipment can operate under sustained load, variable fuel quality and wide temperature ranges. Cleaning, cetane, lubricity, stability and cold-flow requirements must therefore be evaluated separately.\n\nThe operating environment, storage cycle, fuel specification and equipment use should be reviewed before a diesel additive direction is confirmed.', '/images/home/refined/application-heavy-duty.webp'),
  news('batch-control-export-delivery', 'Quality & documentation', 'From batch control to export delivery', 'Why inspection, traceability, packaging and documents should remain connected.', 'Reliable export supply depends on more than finished-product testing. Raw-material review, process monitoring, batch identification, packing confirmation and document coordination form one connected route.\n\nKeeping these records aligned helps the supplier and customer identify the supplied batch, packaging arrangement and applicable technical information.', '/images/home/refined/supply-chain.webp'),
  news('pour-point-depressants-low-temperature-flow', 'Lubricant formulation', 'Low-temperature flow and pour point depressants', 'What formulators should review when balancing base oil behavior and cold-flow targets.', 'Pour point depressants modify wax-related low-temperature behavior, but their response varies with base-oil composition and formulation structure. A generic treat rate cannot represent every system.\n\nBase oil, viscosity grade, test target and compatibility with the wider additive system should be confirmed through formulation work and appropriate testing.', '/images/home/refined/application-industrial-machinery.webp'),
  news('batch-traceability-additive-supply', 'Quality systems', 'Why batch traceability matters in additive supply', 'Connecting inspection, production and shipment information supports a more controlled supply route.', 'Batch traceability connects incoming materials, process records, finished-product checks, packaging and release information. It provides a practical record of what was produced and supplied.\n\nThe exact test data and documents available depend on the product and commercial arrangement, so requirements should be confirmed before the order is finalized.', '/images/home/refined/quality-control.webp'),
  news('export-delivery-coordination', 'Global supply', 'Coordinating packaging, documents and export delivery', 'Export supply works best when product, packaging and destination requirements are reviewed together.', 'Packaging type, label information, marks, shipment method and destination documentation can affect the production and delivery plan. Early confirmation reduces avoidable changes later in the order.\n\nCustomers should share destination, expected volume, packaging preference and required documents during the inquiry stage.', '/images/home/refined/export-capability-v2.webp')
];

export function localizeFallback<T>(items: T[], _locale: Locale): T[] {
  return items;
}
