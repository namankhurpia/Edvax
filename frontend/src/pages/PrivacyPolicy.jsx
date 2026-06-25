import LegalPage, { LegalSection } from './LegalPage.jsx'

export default function PrivacyPolicy() {
  return (
    <LegalPage title="Privacy Policy" updated="June 2026">
      <p>
        This Privacy Policy explains how EDVAX (the "Platform"), operated by Palash Khurpia
        ("we", "us", "our"), collects, uses, stores and protects your personal information when
        you use our website and purchase our courses. We are committed to handling your data
        responsibly and in accordance with applicable Indian law, including the Information
        Technology Act, 2000 and the Digital Personal Data Protection Act, 2023.
      </p>

      <LegalSection heading="Information we collect">
        <p>When you purchase a course or contact us, we may collect:</p>
        <ul className="ml-5 list-disc space-y-1">
          <li>Your name, email address, phone number and billing address.</li>
          <li>Details of the course(s) you purchase and your transaction history.</li>
          <li>Limited technical information such as your IP address and browser type.</li>
        </ul>
        <p>
          We do <strong>not</strong> collect or store your card numbers, UPI PIN, bank account
          credentials or any sensitive payment authentication data. All such information is
          handled directly by our payment gateway (see below).
        </p>
      </LegalSection>

      <LegalSection heading="Payments and Razorpay">
        <p>
          Payments on EDVAX are processed securely through <strong>Razorpay</strong>. When you make
          a payment, the information required to process it is collected and handled by Razorpay
          under its own privacy policy and PCI-DSS compliant systems. We receive only a
          confirmation of payment and limited transaction references (such as the order and payment
          IDs) needed to grant your course access and issue your receipt. Your use of Razorpay's
          services is subject to Razorpay's terms and privacy policy, available on their website.
        </p>
      </LegalSection>

      <LegalSection heading="How we use your information">
        <ul className="ml-5 list-disc space-y-1">
          <li>To process your purchase and deliver your course recording link.</li>
          <li>To send your payment receipt and important service communications.</li>
          <li>To provide customer support and respond to your queries.</li>
          <li>To comply with legal, accounting and tax obligations.</li>
        </ul>
        <p>
          We do not sell, rent or trade your personal information to third parties for marketing
          purposes.
        </p>
      </LegalSection>

      <LegalSection heading="Sharing of information">
        <p>
          We share personal information only as necessary: with our payment gateway (Razorpay) to
          process transactions, with email/communication service providers to deliver receipts and
          course links, and where required by law, regulation or a valid legal request.
        </p>
      </LegalSection>

      <LegalSection heading="Data retention and security">
        <p>
          We retain your purchase and contact details for as long as necessary to provide the
          service and to meet legal and tax record-keeping requirements, after which they are
          deleted or anonymised. We apply reasonable technical and organisational measures to
          protect your data, though no method of transmission or storage is completely secure.
        </p>
      </LegalSection>

      <LegalSection heading="Your rights">
        <p>
          Subject to applicable law, you may request access to, correction of, or deletion of your
          personal data, and you may withdraw consent to non-essential processing. To exercise any
          of these rights, contact us at{' '}
          <a href="mailto:edvax.info@gmail.com" className="text-gold-dark hover:underline">edvax.info@gmail.com</a>.
        </p>
      </LegalSection>

      <LegalSection heading="Cookies">
        <p>
          Our website uses only the cookies necessary for core functionality, such as keeping an
          administrator signed in. We do not use third-party advertising cookies.
        </p>
      </LegalSection>

      <LegalSection heading="Contact and grievances">
        <p>
          For any privacy question or grievance, contact: Palash Khurpia, EDVAX —{' '}
          <a href="mailto:edvax.info@gmail.com" className="text-gold-dark hover:underline">edvax.info@gmail.com</a>,
          phone <a href="tel:+919826804435" className="text-gold-dark hover:underline">+91 98268 04435</a>.
          We will respond to your request within a reasonable time.
        </p>
      </LegalSection>

      <p className="text-sm text-ink-muted">
        We may update this Privacy Policy from time to time. Material changes will be reflected by
        updating the "Last updated" date above.
      </p>
    </LegalPage>
  )
}
