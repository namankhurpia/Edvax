import LegalPage, { LegalSection } from './LegalPage.jsx'

export default function Terms() {
  return (
    <LegalPage title="Terms &amp; Conditions" updated="June 2026">
      <p>
        These Terms &amp; Conditions ("Terms") govern your use of EDVAX (the "Platform"), operated
        by Palash Khurpia ("we", "us", "our"), and your purchase of any course offered on it. By
        accessing the Platform or making a purchase, you agree to these Terms.
      </p>

      <LegalSection heading="About our courses">
        <p>
          EDVAX provides educational content in the areas of taxation and law, delivered primarily
          as recorded online (Zoom) training sessions. Course content is for general educational and
          informational purposes only and does not constitute legal, tax, financial or professional
          advice. You should seek independent professional advice for your specific situation.
        </p>
      </LegalSection>

      <LegalSection heading="Purchases and access">
        <p>
          To purchase a course you provide your name, email, phone and address and pay the listed
          price in Indian Rupees via our payment gateway, Razorpay (UPI and other supported methods).
          On successful payment, a link to the course recording is sent to the email you provide.
          This access is for your personal, individual use only.
        </p>
      </LegalSection>

      <LegalSection heading="Acceptable use">
        <ul className="ml-5 list-disc space-y-1">
          <li>You may not share, resell, distribute, record or publicly post the course recording or its link.</li>
          <li>You may not reproduce or republish our content without our written permission.</li>
          <li>Access links are tied to your purchase and may be revoked if these Terms are breached.</li>
        </ul>
      </LegalSection>

      <LegalSection heading="Pricing">
        <p>
          All prices are in INR and inclusive of applicable taxes unless stated otherwise. We may
          change course prices at any time, but changes do not affect purchases already completed.
        </p>
      </LegalSection>

      <LegalSection heading="Refunds">
        <p>
          All purchases are final and non-refundable, save for the limited erroneous/duplicate-charge
          situations described in our{' '}
          <a href="/refund-policy" className="text-gold-dark hover:underline">Refund &amp; Cancellation Policy</a>.
        </p>
      </LegalSection>

      <LegalSection heading="Intellectual property">
        <p>
          All course content, recordings, text, graphics and branding on the Platform are owned by
          EDVAX / Palash Khurpia and are protected by applicable intellectual property laws. No rights
          are transferred to you other than a limited, personal, non-transferable right to view the
          content you have purchased.
        </p>
      </LegalSection>

      <LegalSection heading="Limitation of liability">
        <p>
          To the maximum extent permitted by law, we are not liable for any indirect or consequential
          loss arising from your use of the Platform or reliance on its content. Our total liability
          for any claim relating to a course shall not exceed the amount you paid for that course.
        </p>
      </LegalSection>

      <LegalSection heading="Governing law">
        <p>
          These Terms are governed by the laws of India, and the courts of India shall have
          jurisdiction over any dispute arising from them.
        </p>
      </LegalSection>

      <LegalSection heading="Contact">
        <p>
          Questions about these Terms? Email{' '}
          <a href="mailto:edvax.info@gmail.com" className="text-gold-dark hover:underline">edvax.info@gmail.com</a>{' '}
          or call <a href="tel:+919826804435" className="text-gold-dark hover:underline">+91 98268 04435</a>.
        </p>
      </LegalSection>
    </LegalPage>
  )
}
