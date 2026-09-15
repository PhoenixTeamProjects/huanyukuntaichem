import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Beaker,
  Boxes,
  CheckCircle2,
  ClipboardCheck,
  Factory,
  FlaskConical,
  Globe2,
  Headphones,
  PackageCheck,
  Settings2,
  ShieldCheck,
  Ship,
  Tags,
  Truck,
  UsersRound,
} from "lucide-react";
import HomeMotion from "@/components/HomeMotion";
import { getBusinessContent } from "@/lib/directus/business";
import { normalizeLocale } from "@/lib/i18n/messages";

const productImages = [
  "/images/home/fuel-additives-light.webp",
  "/images/home/lubricant-additives-light.webp",
  "/images/home/additive-packages-light.webp",
];
const featured = [
  "Detergent Additive",
  "Dispersant Additive",
  "Antioxidant Additive",
  "Viscosity Index Improver",
  "Friction Modifier",
  "Pour Point Depressant",
  "Metal Deactivator",
  "Additive Package",
];
const applications = [
  ["Automotive", "/images/home/refined/application-automotive.webp"],
  ["Commercial Vehicles", "/images/home/refined/application-commercial-vehicles.webp"],
  ["Heavy-duty Diesel", "/images/home/refined/application-heavy-duty.webp"],
  ["Construction Machinery", "/images/home/refined/application-construction.webp"],
  ["Industrial Machinery", "/images/home/refined/application-industrial-machinery.webp"],
  ["Lubricant Manufacturing", "/images/home/refined/application-lubricant-manufacturing.webp"],
  ["Marine / Power", "/images/home/refined/application-marine-power.webp"],
  ["Automotive Aftermarket", "/images/home/refined/application-aftermarket.webp"],
];
const capabilities = [
  [
    FlaskConical,
    "Product development",
    "Application-oriented formula selection and development.",
  ],
  [
    Beaker,
    "Formula customization",
    "Support for OEM, ODM and private-label programs.",
  ],
  [
    Headphones,
    "Technical support",
    "Formulation guidance and application support.",
  ],
  [
    ShieldCheck,
    "Quality control",
    "Raw-material, process and finished-product checks.",
  ],
  [
    PackageCheck,
    "Packaging solutions",
    "Multiple specifications, labels and packing options.",
  ],
  [
    Globe2,
    "Global supply",
    "Responsive documentation and international service.",
  ],
] as const;
const buyers = [
  "Importers & distributors",
  "Lubricant manufacturers",
  "Blending plants",
  "Automotive chemical brands",
  "Industrial companies",
  "Private-label brand owners",
];
const qualitySteps = [
  ["01", "Raw material inspection", "Verification of incoming materials"],
  ["02", "In-process control", "Monitoring key production parameters"],
  ["03", "Finished product testing", "Performance and compliance checks"],
  ["04", "Batch record management", "Complete documentation and traceability"],
  ["05", "Application support", "Test data and technical guidance"],
];
const inspection = [
  [
    "Incoming inspection",
    "Raw material verification",
    "/images/home/refined/who-we-serve.webp",
  ],
  [
    "Process monitoring",
    "Key parameter control",
    "/images/home/refined/oem-odm.webp",
  ],
  [
    "Finished product testing",
    "Performance verification",
    "/images/home/refined/quality-control.webp",
  ],
  [
    "Batch traceability",
    "Full documentation",
    "/images/home/refined/supply-chain.webp",
  ],
];
const faqs = [
  "What products do you offer?",
  "Can you provide customized formulations?",
  "What is the typical lead time?",
  "Do you offer samples?",
  "What are your payment terms?",
];

function SectionTitle({
  eyebrow,
  title,
  description,
  centered = false,
}: {
  eyebrow: string;
  title: string;
  description: string;
  centered?: boolean;
}) {
  return (
    <header className={`home-section-title${centered ? " centered" : ""}`}>
      <div className="eyebrow dark">{eyebrow}</div>
      <h2>{title}</h2>
      <p>{description}</p>
    </header>
  );
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale = normalizeLocale(localeParam);
  const business = await getBusinessContent(locale);
  return (
    <HomeMotion>
      <section className="reference-home-hero" data-hero>
        <div className="reference-home-media" data-hero-image>
          <Image
            src="/images/home/refined/hero-laboratory.webp"
            alt="Laboratory specialist evaluating a lubricant additive sample"
            fill
            priority
            sizes="100vw"
          />
        </div>
        <div className="container reference-home-content">
          <div className="eyebrow dark" data-hero-reveal>
            Fuel &amp; lubricant additive technology
          </div>
          <h1 data-hero-reveal>{business.hero.title}</h1>
          <p data-hero-reveal>{business.hero.summary}</p>
          <div className="actions" data-hero-reveal>
            <Link className="button" href={`/${locale}/products`}>
              Explore our products <ArrowRight size={18} />
            </Link>
            <Link className="button secondary" href={`/${locale}/contact`}>
              Contact our team
            </Link>
          </div>
        </div>
      </section>

      <section className="home-numbers">
        <div className="container home-number-grid">
          {[
            [UsersRound, "Since 2008", "Focused on additive technology"],
            [Boxes, "3", "Product systems"],
            [Tags, "OEM / Private label", "Support available"],
            [Globe2, "B2B", "Global supply"],
          ].map(([Icon, value, label]) => (
            <div key={String(value)}>
              <Icon size={28} />
              <span>
                <strong>{String(value)}</strong>
                <small>{String(label)}</small>
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="home-section home-products">
        <div className="container">
          <SectionTitle
            eyebrow="Our product systems"
            title="Three additive systems for diverse industry needs"
            description="From fuel performance to lubricant protection, we provide focused additive solutions for global industrial customers."
          />
          <div className="home-system-grid">
            {business.productSystems.map((system, index) => (
              <Link
                className="home-image-card"
                href={`/${locale}/products/category/${system.slug}`}
                key={system.slug}
              >
                <div className="media">
                  <Image
                    src={productImages[index]}
                    alt={`${system.title} technology`}
                    fill
                    sizes="(max-width:760px) 100vw, 33vw"
                  />
                </div>
                <div>
                  <h3>{system.title}</h3>
                  <p>{system.description}</p>
                  <b>
                    View products <ArrowRight size={15} />
                  </b>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section home-featured">
        <div className="container">
          <SectionTitle
            eyebrow="Featured products"
            title="Reliable additives for your formulations"
            description="A focused selection of additive technologies developed around practical formulation and performance needs."
          />
          <div className="home-product-grid">
            {featured.map((item, index) => (
              <article key={item}>
                <div className="media">
                  <Image
                    src={
                      index % 2 === 0
                        ? "/images/home/refined/featured-clear.webp"
                        : "/images/home/refined/featured-amber.webp"
                    }
                    alt="Lubricant additive sample"
                    fill
                    sizes="(max-width:760px) 50vw, 25vw"
                  />
                </div>
                <h3>{item}</h3>
                <p>Performance-oriented support for industrial formulations.</p>
                <Link href={`/${locale}/products`}>
                  Learn more <ArrowRight size={14} />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section home-applications">
        <div className="container">
          <SectionTitle
            eyebrow="Application coverage"
            title="Serving key industries worldwide"
            description="Our additive solutions support transport, off-road equipment, blending, industrial machinery and marine power."
          />
          <div className="home-application-grid">
            {applications.map(([item, image]) => (
              <article key={item}>
                <div className="media">
                  <Image
                    src={image}
                    alt={`${item} application`}
                    fill
                    sizes="(max-width:760px) 50vw, 25vw"
                  />
                </div>
                <h3>{item}</h3>
                <p>Application-focused additive solutions</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section home-major home-why">
        <div className="container home-split image-first">
          <div className="home-major-media">
            <Image
              src="/images/home/refined/why-choose-us.webp"
              alt="Additive research and formulation laboratory"
              fill
              loading="eager"
              sizes="(max-width:900px) 100vw, 55vw"
            />
          </div>
          <div className="home-split-copy">
            <div className="eyebrow dark">Why choose Huanyu Kuntai</div>
          <h2>Technical expertise. Reliable supply.</h2>
            <p>
              Focused additive experience, controlled quality and practical
              technical support for international customers.
            </p>
            <div className="home-feature-list">
              {[
                "Application-focused expertise",
                "Flexible cooperation",
                "Stable and reliable supply",
                "Responsive technical support",
              ].map((item) => (
                <div key={item}>
                  <CheckCircle2 size={22} />
                  <strong>{item}</strong>
                </div>
              ))}
            </div>
            <Link className="button" href={`/${locale}/about`}>
              Learn more <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      <section className="home-section home-capabilities">
        <div className="container">
          <SectionTitle
            eyebrow="Core capabilities"
            title="From selection to supply, built for B2B"
            description="Our capabilities cover the key stages from product development to global supply."
          />
          <div className="home-capability-grid">
            {capabilities.map(([Icon, title, description]) => (
              <article key={title}>
                <Icon size={28} />
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section home-major home-who">
        <div className="container home-split image-first">
          <div className="home-major-media">
            <Image
              src="/images/home/refined/who-we-serve.webp"
              alt="Industrial buyers reviewing chemical production"
              fill
              loading="eager"
              sizes="(max-width:900px) 100vw, 46vw"
            />
          </div>
          <div className="home-split-copy">
            <div className="eyebrow dark">Who we serve</div>
            <h2>Partnering with global industrial buyers</h2>
            <p>
              Professional customers supported through flexible,
              application-focused cooperation.
            </p>
            <div className="home-buyer-grid">
              {buyers.map((item) => (
                <article key={item}>
                  <h3>{item}</h3>
                  <p>Reliable supply and professional support</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="home-section home-major home-quality">
        <div className="container home-split image-first">
          <div className="home-major-media">
            <Image
              src="/images/home/refined/quality-control.webp"
              alt="Laboratory quality control testing"
              fill
              loading="eager"
              sizes="(max-width:900px) 100vw, 52vw"
            />
          </div>
          <div className="home-split-copy">
            <div className="eyebrow dark">Quality control</div>
            <h2>Consistent quality. Total traceability.</h2>
            <p>
              Strict quality control throughout the process, from incoming
              materials to finished products.
            </p>
            <div className="home-quality-list">
              {qualitySteps.map(([n, title, text]) => (
                <div key={n}>
                  <strong>{n}</strong>
                  <span>
                    <b>{title}</b>
                    <small>{text}</small>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="home-section home-major home-supply">
        <div className="container home-split text-first">
          <div className="home-split-copy">
            <div className="eyebrow dark">Supply chain</div>
            <h2>From raw materials to global delivery</h2>
            <p>
              Qualified sourcing, coordinated production and controlled
              logistics support stable international supply.
            </p>
            <div className="home-feature-list detailed">
              {[
                [ShieldCheck, "Qualified sourcing"],
                [Factory, "Production coordination"],
                [Boxes, "Packaging & warehousing"],
                [Truck, "Global delivery"],
              ].map(([Icon, title]) => (
                <div key={String(title)}>
                  <Icon size={24} />
                  <span>
                    <strong>{String(title)}</strong>
                    <small>Controlled execution and clear communication</small>
                  </span>
                </div>
              ))}
            </div>
            <Link className="button" href={`/${locale}/service`}>
              Explore our supply chain <ArrowRight size={17} />
            </Link>
          </div>
          <div className="home-major-media">
            <Image
              src="/images/home/refined/supply-chain.webp"
              alt="Chemical additives warehouse and logistics"
              fill
              loading="eager"
              sizes="(max-width:900px) 100vw, 60vw"
            />
          </div>
        </div>
      </section>

      <section className="home-section home-inspection">
        <div className="container">
          <SectionTitle
            eyebrow="Inspection & traceability"
            title="Transparent processes you can trust"
            description="Inspection and documentation support consistent quality and traceability from incoming materials to final products."
          />
          <div className="home-inspection-grid">
            {inspection.map(([title, text, image]) => (
              <article key={title}>
                <div className="media">
                  <Image
                    src={image}
                    alt={title}
                    fill
                    sizes="(max-width:760px) 50vw, 25vw"
                  />
                </div>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section home-export">
        <Image
          src="/images/home/refined/export-capability-v2.webp"
          alt="International port and export logistics"
          fill
          loading="eager"
          sizes="100vw"
        />
        <div className="home-export-shade" />
        <div className="container home-export-copy">
          <div>
            <div className="eyebrow">Export capability</div>
            <h2>Global supply. Local support.</h2>
            <p>
              Ocean freight, rail and truck transportation support reliable
              delivery to your destination.
            </p>
          </div>
          <div className="home-export-list">
            {[
              [Ship, "International logistics"],
              [ClipboardCheck, "Export documentation"],
              [Globe2, "Multiple trade terms"],
              [Headphones, "Responsive communication"],
            ].map(([Icon, title]) => (
              <div key={String(title)}>
                <Icon size={25} />
                <span>
                  <strong>{String(title)}</strong>
                  <small>Professional and timely support</small>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section home-major home-oem">
        <div className="container home-split text-first">
          <div className="home-split-copy">
            <div className="eyebrow dark">OEM / ODM / customization</div>
            <h2>From concept to your market</h2>
            <p>
              Flexible manufacturing, formulation and packaging support for
              qualified private-label and project requirements.
            </p>
            <div className="home-feature-list detailed">
              {[
                "OEM production",
                "R&D development",
                "Private-label support",
                "Technical consultation",
              ].map((item) => (
                <div key={item}>
                  <Settings2 size={23} />
                  <span>
                    <strong>{item}</strong>
                    <small>
                      Structured support from requirement to delivery
                    </small>
                  </span>
                </div>
              ))}
            </div>
            <Link className="button" href={`/${locale}/contact`}>
              Discuss your project <ArrowRight size={17} />
            </Link>
          </div>
          <div className="home-major-media">
            <Image
              src="/images/home/refined/oem-odm.webp"
              alt="OEM additive filling and packaging production"
              fill
              loading="eager"
              sizes="(max-width:900px) 100vw, 55vw"
            />
          </div>
        </div>
      </section>

      <section className="home-section home-cooperation">
        <div className="container">
          <SectionTitle
            eyebrow="Cooperation scenarios"
            title="Flexible cooperation for your business"
            description="Choose a cooperation model that matches your product, market and supply requirements."
          />
          <div className="home-cooperation-grid">
            {[
              [
                "Standard products",
                "Stable supply from a focused range",
                "/images/home/refined/cooperation-standard.webp",
              ],
              [
                "Customized solution",
                "Developed around your requirements",
                "/images/home/refined/cooperation-custom.webp",
              ],
              [
                "Private label / Project supply",
                "Your brand, supported by our expertise",
                "/images/home/refined/cooperation-private-label.webp",
              ],
            ].map(([title, text, image]) => (
              <article key={title}>
                <div className="media">
                  <Image
                    src={image}
                    alt={title}
                    fill
                    sizes="(max-width:760px) 100vw, 33vw"
                  />
                </div>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                  <Link href={`/${locale}/contact`}>
                    Learn more <ArrowRight size={14} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section home-faq">
        <div className="container home-faq-layout">
          <div>
            <div className="eyebrow dark">Frequently asked questions</div>
            <h2>Quick answers for your inquiry</h2>
            <p>
              Common questions about our products, services, quality and
              cooperation.
            </p>
            <Link className="button secondary" href={`/${locale}/contact`}>
              Ask our team
            </Link>
          </div>
          <div className="home-accordion">
            {faqs.map((item, index) => (
              <details key={item} open={index === 0}>
                <summary>
                  {item}
                  <span>+</span>
                </summary>
                <p>
                  Exact details are confirmed according to the product,
                  application and destination market.
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section home-knowledge">
        <div className="container">
          <SectionTitle
            eyebrow="Knowledge center"
            title="Insights on additive technology"
            description="Practical perspectives on additive selection, formulation and industrial application."
          />
          <div className="home-article-grid">
            {[
              [
                "The role of lubricant additives in modern engines",
                "/images/home/lubricant-additives-light.webp",
              ],
              [
                "How to choose the right additive package",
                "/images/home/refined/quality-control.webp",
              ],
              [
                "Trends in fuel and lubricant technology",
                "/images/home/refined/export-capability.webp",
              ],
            ].map(([title, image], index) => (
              <article key={title}>
                <div className="media">
                  <Image
                    src={image}
                    alt={title}
                    fill
                    sizes="(max-width:760px) 100vw, 33vw"
                  />
                </div>
                <div>
                  <small>Industry insight · 0{index + 1}</small>
                  <h3>{title}</h3>
                  <p>
                    Technical context for informed formulation and purchasing
                    decisions.
                  </p>
                  <Link href={`/${locale}/news`}>
                    Read more <ArrowRight size={14} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-final">
        <Image
          src="/images/home/refined/export-capability.webp"
          alt="Reliable additive supply for global industry"
          fill
          loading="eager"
          sizes="100vw"
        />
        <div className="home-final-shade" />
        <div className="container">
          <div className="eyebrow">
            Let’s build a cleaner, more efficient future
          </div>
          <h2>Discuss your additive requirements with our team.</h2>
          <p>
            Tell us about your formulation, application and market requirements.
          </p>
          <div className="actions">
            <Link className="button" href={`/${locale}/contact`}>
              Send an inquiry <ArrowRight size={17} />
            </Link>
            <Link
              className="button secondary light"
              href={`/${locale}/products`}
            >
              Explore products
            </Link>
          </div>
        </div>
      </section>
    </HomeMotion>
  );
}
