import type { Metadata } from "next";
import { PageHero } from "@/components/sections/page-hero";
import { Container } from "@/components/ui/container";
import { business, emailHref } from "@/lib/config";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for VIA ABROAD OVERSEAS.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <>
      <PageHero title="Privacy Policy" breadcrumb={[{ label: "Privacy Policy" }]} />
      <section className="bg-surface py-16 md:py-24">
        <Container className="prose prose-slate max-w-3xl prose-headings:font-display prose-headings:text-navy-900 prose-a:text-gold-700">
          <p className="text-sm text-ink-faint">Last updated: this policy is pending final legal review before launch.</p>

          <h2>Introduction</h2>
          <p>
            VIA ABROAD OVERSEAS (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) respects your privacy. This
            policy explains what information we collect through this
            website, why we collect it, and how it is handled.
          </p>

          <h2>Information We Collect</h2>
          <p>When you submit a contact or consultation form, we collect:</p>
          <ul>
            <li>Full name</li>
            <li>Phone number</li>
            <li>Email address</li>
            <li>Interested study destination and service</li>
            <li>Current qualification and interested course, where provided</li>
            <li>Any message you choose to include</li>
          </ul>
          <p>
            We also automatically capture the page you submitted the form
            from and, where available, campaign attribution information
            (UTM parameters) to understand which channels bring students to
            us.
          </p>

          <h2>Why We Collect It</h2>
          <p>
            We use this information solely to respond to your enquiry,
            provide the counselling services you requested, and communicate
            with you about your study abroad plans.
          </p>

          <h2>How Enquiries Are Processed</h2>
          <p>
            Enquiry information is stored securely in our database and is
            only accessible to authorized VIA ABROAD OVERSEAS staff members
            through an authenticated admin system. A copy of your enquiry
            is also sent by email to our team so a counsellor can follow up
            promptly.
          </p>

          <h2>Service Providers</h2>
          <p>
            We use the following categories of third-party service
            providers to operate this website and process enquiries:
            secure database and authentication hosting, transactional
            email delivery, bot-protection/anti-spam verification, and
            privacy-conscious website analytics. These providers process
            data only as necessary to provide their service to us.
          </p>

          <h2>Data Retention</h2>
          <p>
            We retain enquiry records for as long as reasonably necessary
            to respond to your enquiry and maintain records of our
            counselling relationship, after which records may be archived
            or deleted in line with our internal data handling practices.
          </p>

          <h2>Your Rights</h2>
          <p>
            You may contact us at any time to ask what information we hold
            about you, to request a correction, or to request deletion of
            your enquiry information, subject to any legal or legitimate
            business record-keeping requirements.
          </p>

          <h2>Contact Us</h2>
          <p>
            For privacy-related requests, please contact us at{" "}
            <a href={emailHref}>{business.email}</a>.
          </p>

          <p className="text-sm text-ink-faint">
            This policy is a template pending review by qualified legal
            counsel before production launch and does not constitute legal
            advice.
          </p>
        </Container>
      </section>
    </>
  );
}
