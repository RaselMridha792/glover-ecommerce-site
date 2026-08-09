export const site = {
  name: "Glover Boxing",
  brand: "Glover",
  legalName: "Glover Sports",
  tagline: "Protect Your Crown™",
  email: "info@weareglover.com",
  phone: "+1 (299) 2031-27-65",
  address: "15 Glover Street",
  hours: "Mon–Sat · 6am – 9pm",
  booking: "https://gloverboxing.as.me",
  instagram: "https://www.instagram.com/weareglover",
  facebook: "https://www.facebook.com/weareglover",
  freeShippingFrom: 150,
};

export const nav = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/shop", label: "Shop" },
  { href: "/services", label: "Services" },
  { href: "/ambassador", label: "Ambassador" },
  { href: "/contact", label: "Contact" },
];

export function money(value: number): string {
  return value % 1 === 0 ? `$${value}.00` : `$${value.toFixed(2)}`;
}
