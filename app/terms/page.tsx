import Link from "next/link";
import Header from "@/components/light-header";
import Footer from "@/components/footer";

const sections = [
  {
    title: "1. Acceptance of these terms",
    paragraphs: [
      "These Terms and Conditions apply to your use of Afm Cart, operated through afmcart.in. By browsing the site or placing an order, you agree to these terms. If you do not agree, please do not use the site.",
    ],
  },
  {
    title: "2. Products, prices, and availability",
    paragraphs: [
      "We aim to keep product descriptions, photographs, prices, and stock information accurate. Colours and appearance may vary by screen. Products are subject to availability, and we may correct an error or update a listing before accepting an order.",
      "Prices are shown in Indian rupees. Delivery charges, when applicable, are shown in the order total before you place the order.",
    ],
  },
  {
    title: "3. Orders and payment",
    paragraphs: [
      "When you submit checkout, we save an order request and show an order number. We may contact you to confirm availability, delivery details, or other information. An order is accepted when Afm Cart confirms it.",
      "Online payment availability and payment instructions will be shown at checkout when offered. Do not send payment details through public messages. WhatsApp follow-up, if enabled, is optional and does not replace the saved order record.",
    ],
  },
  {
    title: "4. Delivery and order tracking",
    paragraphs: [
      "Please provide a complete delivery address, reachable mobile number, and correct pincode. Pincode lookup helps fill in a postal area; please review the suggested town, district, and state before submitting.",
      "You can look up an order using the mobile number and pincode supplied at checkout. Delivery estimates are approximate and may be affected by courier or other circumstances outside our control.",
    ],
  },
  {
    title: "5. Cancellations, returns, and issues",
    paragraphs: [
      "For a cancellation, return, refund, damaged item, or incorrect order, contact us as soon as possible with your order number. Requests are handled under applicable law and any product-specific terms communicated by Afm Cart.",
    ],
  },
  {
    title: "6. Intellectual property",
    paragraphs: [
      "Unless content is supplied by you or otherwise identified, Afm Cart and its licensors own the website’s text, branding, graphics, and other materials. You may view and use the site for personal shopping. You may not republish, sell, sublicense, or commercially reuse site materials without written permission.",
    ],
  },
  {
    title: "7. Acceptable use",
    paragraphs: [
      "Do not use the site unlawfully, interfere with its operation, submit false order details, scrape or harvest site data, upload malicious content, or attempt to access systems or accounts without authorization.",
    ],
  },
  {
    title: "8. Website availability and liability",
    paragraphs: [
      "We may update, suspend, or discontinue parts of the site to maintain or improve the service. To the extent allowed by applicable law, Afm Cart is not liable for indirect or consequential loss arising from site use. Nothing in these terms limits rights or remedies that cannot legally be excluded.",
    ],
  },
  {
    title: "9. Governing law",
    paragraphs: [
      "These terms are governed by the laws of India. Subject to applicable law, courts of competent jurisdiction in Kerala, including Malappuram, may hear disputes relating to these terms or the site.",
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Header />
      <main className="mx-auto max-w-4xl px-5 pb-20 pt-32 sm:px-8">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-green-800">Afm Cart · Legal</p>
        <h1 className="mt-3 text-4xl font-black text-slate-950 sm:text-5xl">Terms and Conditions</h1>
        <p className="mt-3 text-sm text-slate-500">Last updated: November 6, 2026</p>
        <p className="mt-6 max-w-3xl text-base leading-7 text-slate-600">These terms explain the basic rules for using afmcart.in and placing an order with Afm Cart.</p>

        <div className="mt-10 divide-y divide-slate-200 border-y border-slate-200">
          {sections.map((section) => (
            <section key={section.title} className="py-6">
              <h2 className="text-lg font-extrabold text-slate-950">{section.title}</h2>
              {section.paragraphs.map((paragraph) => <p key={paragraph} className="mt-3 text-sm leading-7 text-slate-600">{paragraph}</p>)}
            </section>
          ))}
          <section className="py-6">
            <h2 className="text-lg font-extrabold text-slate-950">10. Contact us</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">Questions about these terms? Contact Afm Cart:</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              <li>Email: <a className="font-semibold text-green-800 hover:underline" href="mailto:afmcarts@gmail.com">afmcarts@gmail.com</a></li>
              <li>Phone: <a className="font-semibold text-green-800 hover:underline" href="tel:+919207104571">+91 92071 04571</a></li>
              <li>Address: Valiyora, Vengara, Malappuram, Kerala</li>
            </ul>
          </section>
        </div>
        <p className="mt-8 text-sm text-slate-500">For details about information used to process orders and tracking requests, read our <Link href="/privacy" className="font-semibold text-green-800 hover:underline">Privacy Policy</Link>.</p>
      </main>
      <Footer />
    </div>
  );
}
