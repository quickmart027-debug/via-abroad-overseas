import type { Metadata } from "next";
import { PageHero } from "@/components/sections/page-hero";
import { Container } from "@/components/ui/container";
import { business, emailHref } from "@/lib/config";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description: "Terms and Conditions for VIA ABROAD OVERSEAS.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <>
      <PageHero title="Terms and Conditions" breadcrumb={[{ label: "Terms and Conditions" }]} />
      <section className="bg-surface py-16 md:py-24">
        <Container className="prose prose-slate max-w-3xl prose-headings:font-display prose-headings:text-navy-900 prose-a:text-gold-700">
          <p className="text-sm text-ink-faint">Last updated: this policy is pending final legal review before launch.</p>

          <h2>Acceptance of Terms</h2>
          <p>
            By using this website, you agree to these Terms and Conditions.
            If you do not agree, please discontinue use of the site.
          </p>

          <h2>Nature of Our Services</h2>
          <p>
            VIA ABROAD OVERSEAS provides study abroad counselling, university
            admissions guidance, visa application support, career
            counselling, and related advisory services. We do not represent
            any government immigration authority, and we are not a
            university or degree-granting institution.
          </p>

          <h2>No Guaranteed Outcomes</h2>
          <p>
            We do not and cannot guarantee admission to any university,
            approval of any visa or immigration application, or receipt of
            any scholarship. Final decisions rest solely with the relevant
            university, government authority, or funding body. Our role is
            to provide guidance and support to help you present the
            strongest possible application.
          </p>

          <h2>Accuracy of Information</h2>
          <p>
            While we strive to keep information on this website accurate
            and current, university requirements, visa policies, and
            program details change over time. You should always verify
            current requirements with official sources and your assigned
            counsellor before making decisions.
          </p>

          <h2>User Conduct</h2>
          <p>
            You agree to provide accurate information when submitting
            enquiry or consultation forms and not to misuse this website,
            including attempting to interfere with its normal operation or
            security.
          </p>

          <h2>Intellectual Property</h2>
          <p>
            All content on this website, including text, graphics, and
            branding, is the property of VIA ABROAD OVERSEAS unless
            otherwise noted, and may not be reproduced without permission.
          </p>

          <h2>Limitation of Liability</h2>
          <p>
            VIA ABROAD OVERSEAS shall not be liable for any indirect,
            incidental, or consequential damages arising from your use of
            this website or our advisory services, to the fullest extent
            permitted by applicable law.
          </p>

          <h2>Changes to These Terms</h2>
          <p>
            We may update these Terms and Conditions from time to time. The
            updated version will be posted on this page.
          </p>

          <h2>Contact Us</h2>
          <p>
            For questions about these Terms, please contact us at{" "}
            <a href={emailHref}>{business.email}</a>.
          </p>

          <p className="text-sm text-ink-faint">
            This document is a template pending review by qualified legal
            counsel before production launch and does not constitute legal
            advice.
          </p>
        </Container>
      </section>
    </>
  );
}
