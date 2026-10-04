import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Text,
} from "@react-email/components";
import { business } from "@/lib/config";

/**
 * Deliberately addresses the recipient neutrally: this email goes to an
 * address typed into a public form, so it must not echo any submitted
 * content back (otherwise it could be used to relay text to third parties).
 */
export function StudentConfirmationEmail() {
  return (
    <Html>
      <Head />
      <Preview>We received your enquiry — {business.name}</Preview>
      <Body style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#f7f8fa", padding: "32px 0" }}>
        <Container style={{ backgroundColor: "#ffffff", borderRadius: 12, padding: 32, maxWidth: 560 }}>
          <Heading style={{ color: "#0b1f3a", fontSize: 20 }}>
            Thank you for your enquiry
          </Heading>
          <Text style={{ fontSize: 15, color: "#101828", lineHeight: 1.6 }}>
            We&rsquo;ve received your enquiry at {business.name}. One of our
            counsellors will review your details and reach out to you soon.
          </Text>
          <Text style={{ fontSize: 15, color: "#101828", lineHeight: 1.6 }}>
            In the meantime, if you have an urgent question, feel free to
            reach us directly:
          </Text>
          <Text style={{ fontSize: 14, color: "#101828", margin: "4px 0" }}>
            Phone: {business.phoneDisplay}
          </Text>
          <Text style={{ fontSize: 14, color: "#101828", margin: "4px 0" }}>
            Email: {business.email}
          </Text>
          <Hr style={{ borderColor: "#e4e7ec", marginTop: 24 }} />
          <Text style={{ fontSize: 12, color: "#7d8494" }}>
            {business.name} · {business.address.line1}, {business.address.line2},{" "}
            {business.address.locality}, {business.address.city} - {business.address.postalCode}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default StudentConfirmationEmail;
