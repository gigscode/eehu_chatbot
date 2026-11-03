import type { Metadata } from 'next'
import LegalPage from '@/app/components/LegalPage'

export const metadata: Metadata = {
  title: 'Terms of Use | eehu!',
  description: 'Terms for using the eehu! website, chat, and lead management service.',
}

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Use"
      label="eehu! / Terms"
      intro="These terms cover your use of the eehu! website, demo, chat, and lead management tools. Please do not use eehu! if you do not agree to them."
    >
      <section>
        <h2>Who may use eehu!</h2>
        <p>
          eehu! is for people aged 18 and over, especially businesses that need to manage website
          enquiries. By using eehu!, you confirm that you are at least 18 and have authority to
          accept these terms for yourself or your business.
        </p>
      </section>

      <section>
        <h2>Testing service</h2>
        <p>
          eehu! is currently in a testing stage. The service is available without payment for now.
          Features may change, be unavailable, or be removed as we improve the product. We do not
          promise uninterrupted service, a particular result, or a specific number of leads or
          sales.
        </p>
        <p>
          If pricing or paid plans are introduced, we will provide the applicable terms before
          charging you.
        </p>
      </section>

      <section>
        <h2>Your responsibilities</h2>
        <p>If you use eehu! for your business, you are responsible for:</p>
        <ul>
          <li>Providing accurate information about your business and services.</li>
          <li>
            Telling your website visitors how their information will be collected and used, and
            getting any permission required by law.
          </li>
          <li>
            Using lead details only for appropriate business purposes and handling requests from
            your visitors.
          </li>
          <li>
            Keeping dashboard access details private and telling us promptly if you suspect
            unauthorised access.
          </li>
        </ul>
        <p>
          Do not use eehu! to send unlawful, harmful, misleading, or abusive content, or to collect
          information you have no right to collect. Do not submit passwords, payment card details,
          health information, or other sensitive information through the chat.
        </p>
      </section>

      <section>
        <h2>Information and privacy</h2>
        <p>
          Our <a className="text-emerald-400 hover:text-emerald-300" href="/privacy">Privacy Policy</a>
          {' '}explains how information is handled on the eehu! website and demo. When a business
          uses eehu! to collect visitor information, that business remains responsible for its
          notices, permissions, and requests from those visitors.
        </p>
      </section>

      <section>
        <h2>Our service and materials</h2>
        <p>
          eehu!, its software, branding, and materials belong to eehu! or its licensors. We give
          you permission to use the service for your business while these terms apply. You may not
          copy, resell, or interfere with the service except where the law allows.
        </p>
        <p>
          You keep responsibility for the business information and content you submit. You allow us
          to use it only as needed to provide and support eehu!.
        </p>
      </section>

      <section>
        <h2>External services</h2>
        <p>
          eehu! may link to or hand you over to external services, including messaging services.
          Those services have their own terms and privacy practices. We are not responsible for
          services we do not operate.
        </p>
      </section>

      <section>
        <h2>Suspension or ending use</h2>
        <p>
          We may limit or suspend access if needed to protect the service, comply with law, or
          address a serious breach of these terms. You can stop using eehu! at any time. To ask us
          to delete information collected directly through the eehu! website or demo, email{' '}
          <a className="text-emerald-400 hover:text-emerald-300" href="mailto:ituwaafrica@gmail.com">
            ituwaafrica@gmail.com
          </a>.
        </p>
      </section>

      <section>
        <h2>Disclaimers and liability</h2>
        <p>
          eehu! is provided during testing on an “as available” basis. To the extent allowed by
          law, we do not make guarantees about uninterrupted operation, accuracy of chat replies,
          or business outcomes. Nothing in these terms removes a right or responsibility that
          cannot legally be excluded.
        </p>
      </section>

      <section>
        <h2>Law and changes</h2>
        <p>
          These terms are governed by the laws of Nigeria, subject to any mandatory rights that
          apply to you. We may update the terms as the service changes. Continued use after an
          update means you accept the updated terms where the law allows.
        </p>
      </section>
    </LegalPage>
  )
}
