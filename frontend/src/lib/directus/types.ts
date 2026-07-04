export type LocalizedText = string | null;

export interface SiteSettings {
  siteName: LocalizedText;
  tagline: LocalizedText;
  email: string | null;
  phone: string | null;
  address: LocalizedText;
}

export interface ProductCategory {
  id: string;
  slug: string;
  parent: string | null;
  name: LocalizedText;
  description: LocalizedText;
}

export interface Product {
  id: string;
  slug: string;
  category: string | null;
  name: LocalizedText;
  summary: LocalizedText;
  description: LocalizedText;
  image: string | null;
  imageAlt: LocalizedText;
}

export interface NewsArticle {
  id: string;
  slug: string;
  category: string | null;
  title: LocalizedText;
  excerpt: LocalizedText;
  content: LocalizedText;
  image: string | null;
  imageAlt: LocalizedText;
  publishedAt: string | null;
}

export interface InquiryPayload {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  message: string;
  sourcePath?: string;
  productSlug?: string;
  locale?: string;
}
