import LegalPage, { LegalSection } from './LegalPage.jsx'

export default function RefundPolicy() {
  return (
    <LegalPage title="Refund &amp; Cancellation Policy" updated="June 2026">
      <p>
        This Refund &amp; Cancellation Policy applies to all course purchases made on EDVAX
        (the "Platform"), operated by Palash Khurpia ("we", "us", "our"). By completing a
        purchase, you confirm that you have read, understood and agreed to this policy.
      </p>

      <LegalSection heading="All sales are final — no refunds">
        <p>
          EDVAX courses are delivered as digital content, specifically recorded online (Zoom)
          training sessions, the access link to which is delivered to you immediately after a
          successful payment. Because the content is digital and is made available to you the
          moment your payment is confirmed, <strong>all purchases are final and non-refundable.</strong>
        </p>
        <p>
          We do not offer refunds, returns, exchanges, cancellations or credits once a purchase
          has been completed — including, without limitation, in cases of change of mind, lack of
          time to view the recording, duplicate purchase, or partial consumption of the content.
        </p>
      </LegalSection>

      <LegalSection heading="No cancellation after purchase">
        <p>
          Orders cannot be cancelled once payment has been processed. As access to the course
          recording is granted automatically and immediately upon payment, there is no cancellation
          window.
        </p>
      </LegalSection>

      <LegalSection heading="Payment failures and duplicate charges">
        <p>
          If your payment was deducted but you did not receive access (for example, a failed or
          interrupted transaction that was later captured), or if you were charged more than once
          for the same order in error, please write to us within 7 days. Where our records and the
          payment gateway (Razorpay) confirm a genuine erroneous or duplicate charge for which no
          access was provided, we will return the affected amount to your original payment method.
          This is the only circumstance in which a return of funds is considered.
        </p>
      </LegalSection>

      <LegalSection heading="How to reach us">
        <p>
          For any payment-related query, please contact us at{' '}
          <a href="mailto:edvax.info@gmail.com" className="text-gold-dark hover:underline">edvax.info@gmail.com</a>.
          Kindly include your name, registered email, the course name, and the Razorpay Payment ID
          from your receipt so we can assist you quickly.
        </p>
      </LegalSection>

      <p className="text-sm text-ink-muted">
        We may update this policy from time to time. The version in effect at the time of your
        purchase governs that purchase.
      </p>
    </LegalPage>
  )
}
