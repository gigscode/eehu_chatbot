import type { Metadata } from 'next'
import LegalPage from '@/app/components/LegalPage'

export const metadata: Metadata = {
  title: 'Privacy Policy | eehu!',
  description: 'Learn how eehu! collects and uses chat enquiries and lead details.',
}

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      label="eehu! / Privacy"
      intro="This notice explains what information eehu! handles when you visit our website, use the demo, or contact a business through an eehu! chat."
    >
      <section>
        <h2>Who is responsible for your information?</h2>
        <p>
          eehu! is operated by Olajide Igbalaye in Nigeria. For questions or requests about
          information collected on this website or demo, contact{' '}
          <a className="text-emerald-400 hover:text-emerald-300" href="mailto:ituwaafrica@gmail.com">
            ituwaafrica@gmail.com
          </a>.
        </p>
        <p>
          When a business uses eehu! on its own website, that business decides why it collects
          visitor information. The business is responsible for its own privacy notice and requests
          from its visitors. eehu! handles that information to provide the service and help the
          business manage enquiries.
        </p>
      </section>

      <section>
        <h2>What information is handled?</h2>
        <ul>
          <li>Messages you send through the chat and the chat session identifier.</li>
          <li>
            Details you choose to submit in the lead form, such as your name, phone number or email,
            and what you need help with.
          </li>
          <li>
            For business users, lead status, notes, next steps, follow-up dates, and deal values
            entered in the dashboard.
          </li>
          <li>
            Basic website usage and technical information used to keep the site working and
            understand its use.
          </li>
        </ul>
        <p>
          Please do not send passwords, payment card details, health information, or other sensitive
          information through the chat.
        </p>
      </section>

      <section>
        <h2>Why we use it</h2>
        <p>
          We use information to reply to chat messages, save and organise enquiries, help businesses
          follow up, operate and protect eehu!, understand website usage, and respond to support or
          privacy requests. We handle information on a lawful basis that applies to the specific
          use, such as providing a requested service, taking steps you ask us to take, consent where
          required, or our legitimate interests in operating and protecting the service.
        </p>
      </section>

      <section>
        <h2>Service providers and external services</h2>
        <p>
          eehu! uses service providers to operate the website, store information, measure usage, and
          produce chat replies. Chat messages may be processed by a provider for the purpose of
          generating a response. We do not publish provider names in this notice, but information
          may be handled by providers supporting these functions.
        </p>
        <p>
          If you choose to continue to an external messaging service, information included in the
          pre-filled message will be handled under that service&apos;s own privacy terms. We do not
          control how an external service uses information after you leave eehu!.
        </p>
        <p>
          Some service providers may process information outside Nigeria. Where this happens, we
          take steps required by applicable data protection law.
        </p>
      </section>

      <section>
        <h2>Browser storage and analytics</h2>
        <p>
          The website uses browser storage to remember whether you dismissed the install prompt and
          to cache files needed for the installable app. Production website analytics may collect
          basic usage information. You can manage browser storage through your browser settings.
        </p>
      </section>

      <section>
        <h2>How long we keep information</h2>
        <p>
          We keep lead and chat information while the relevant business continues to use eehu!. If
          you want information collected on this eehu! website or demo deleted, email us at{' '}
          <a className="text-emerald-400 hover:text-emerald-300" href="mailto:ituwaafrica@gmail.com">
            ituwaafrica@gmail.com
          </a>. We will delete it when we can, unless we need to keep some information to meet a
          legal obligation or protect the service.
        </p>
        <p>
          If your information was collected by a business using eehu!, contact that business first.
          We will help the business handle requests about information it controls.
        </p>
      </section>

      <section>
        <h2>Your choices and rights</h2>
        <p>
          Depending on the applicable law and circumstances, you may be able to ask to access,
          correct, or delete your information, object to or limit certain uses, or withdraw consent
          where processing is based on consent. Contact us or the business that collected your
          information. You may also raise a concern with the Nigeria Data Protection Commission.
        </p>
      </section>

      <section>
        <h2>Keeping information safe</h2>
        <p>
          We use reasonable measures to protect information, but no website or online storage
          system can be guaranteed completely secure. Please do not send information through chat
          that you would not want included in a business enquiry.
        </p>
      </section>

      <section>
        <h2>Children</h2>
        <p>
          eehu! is intended for adults aged 18 and over and is not designed for children. We do not
          knowingly collect children&apos;s personal information. If you believe a child has sent us
          information, contact us so we can review and remove it.
        </p>
      </section>

      <section>
        <h2>Changes to this notice</h2>
        <p>
          We may update this notice as eehu! changes. The date at the top shows when it was last
          updated. If a change materially affects how information is handled, we will take
          reasonable steps to bring it to your attention.
        </p>
      </section>
    </LegalPage>
  )
}
