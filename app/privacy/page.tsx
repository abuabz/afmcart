import Link from "next/link";
import Header from "@/components/light-header";
import Footer from "@/components/footer";

const sections = [
  {
    title: "1. Information we collect",
    paragraphs: [
      "When you place an order, we collect the details needed to process and deliver it, such as your name, mobile number, email if provided, delivery address, pincode, and the products and quantities ordered.",
      "If you contact us through the contact form, your submitted message and the contact details you choose to provide are passed to WhatsApp to open a conversation with our store. Guest order tracking uses the mobile number and pincode entered on the tracking page.",
    ],
  },
  {
    title: "2. How we use information",
    paragraphs: [
      "We use order and contact information to receive and manage orders, arrange delivery, respond to questions, provide order status, prevent misuse, and meet legal or accounting obligations.",
      "The store may use your pincode to look up the associated postal area so you can complete your delivery address. The lookup is performed through a postal-code service and does not send your name, phone number, or order details.",
    ],
  },
  {
    title: "3. Sharing information",
    paragraphs: [
      "We do not sell your personal information. We share only what is needed with service providers that support the store, such as hosting, database, delivery, and postal lookup providers, or when required by law.",
      "If you choose a WhatsApp contact or follow-up option, the information included in that action is shared with WhatsApp under its own privacy terms.",
    ],
  },
  {
    title: "4. Browser storage and cookies",
    paragraphs: [
      "The shopping cart is saved in your browser so it remains available as you navigate the store. Essential cookies may be used for administrative sign-in and site operation. Clearing browser storage or cookies may remove saved cart contents or sign you out.",
    ],
  },
  {
    title: "5. Order lookup and data security",
    paragraphs: [
      "Guest tracking requires both the mobile number and pincode supplied with an order. The tracking page displays order status and a limited item summary, not the full delivery address.",
      "We use reasonable measures to protect information, but no internet transmission or storage system can be guaranteed completely secure. Please do not share your order details or tracking information publicly.",
    ],
  },
  {
    title: "6. Retention and your choices",
    paragraphs: [
      "We keep order records for as long as needed to fulfill orders, provide support, resolve disputes, and satisfy legal obligations. You may contact us to request access, correction, or deletion where applicable; some records may need to be retained by law.",
    ],
  },
  {
    title: "7. Children’s privacy",
    paragraphs: [
      "Our products may be intended for children, but orders should be placed by a parent, guardian, or other adult. We do not knowingly seek personal information directly from children.",
    ],
  },
  {
    title: "8. Changes to this policy",
    paragraphs: [
      "We may update this policy when our practices or legal requirements change. The latest version and its update date will be posted on this page.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Header />
      <main className="mx-auto max-w-4xl px-5 pb-20 pt-32 sm:px-8">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-green-800">Afm Cart · Legal</p>
        <h1 className="mt-3 text-4xl font-black text-slate-950 sm:text-5xl">Privacy Policy</h1>
        <p className="mt-3 text-sm text-slate-500">Last updated: November 6, 2026</p>
        <p className="mt-6 max-w-3xl text-base leading-7 text-slate-600">This policy describes how Afm Cart handles information when you browse the store, place an order, contact us, or check an order’s status.</p>

        <div className="mt-10 divide-y divide-slate-200 border-y border-slate-200">
          {sections.map((section) => (
            <section key={section.title} className="py-6">
              <h2 className="text-lg font-extrabold text-slate-950">{section.title}</h2>
              {section.paragraphs.map((paragraph) => <p key={paragraph} className="mt-3 text-sm leading-7 text-slate-600">{paragraph}</p>)}
            </section>
          ))}
          <section className="py-6">
            <h2 className="text-lg font-extrabold text-slate-950">9. Contact us</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">For privacy questions or requests, contact Afm Cart:</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              <li>Email: <a className="font-semibold text-green-800 hover:underline" href="mailto:afmcarts@gmail.com">afmcarts@gmail.com</a></li>
              <li>Phone: <a className="font-semibold text-green-800 hover:underline" href="tel:+919207104571">+91 92071 04571</a></li>
              <li>Address: Valiyora, Vengara, Malappuram, Kerala</li>
            </ul>
          </section>
        </div>
        <p className="mt-8 text-sm text-slate-500">For store rules and order terms, read our <Link href="/terms" className="font-semibold text-green-800 hover:underline">Terms and Conditions</Link>.</p>
      </main>
      <Footer />
    </div>
  );
}
