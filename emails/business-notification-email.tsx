import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { EnquiryEmailData } from "@/lib/email/types";
import { siteUrl } from "@/lib/config";

/** The business is in Hyderabad, so show submission time in IST, not raw UTC. */
function formatSubmittedAt(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return `${date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  })} IST`;
}

export function BusinessNotificationEmail({ data }: { data: EnquiryEmailData }) {
  const adminUrl = `${siteUrl}/admin/enquiries/${data.enquiryId}`;
  const rows: [string, string | undefined][] = [
    ["Enquiry Type", data.enquiryType === "consultation" ? "Free Consultation" : "General Enquiry"],
    ["Name", data.fullName],
    ["Phone", data.phone],
    ["Email", data.email],
    ["Interested Country", data.interestedCountry],
    ["Service Required", data.serviceRequired],
    ["Current Qualification", data.currentQualification],
    ["Interested Course", data.interestedCourse],
    ["Submitted From", data.sourcePath],
    ["Submitted At", formatSubmittedAt(data.submittedAt)],
    ["Reference", data.enquiryId],
  ];

  return (
    <Html>
      <Head />
      <Preview>New {data.enquiryType === "consultation" ? "consultation request" : "enquiry"} from {data.fullName}</Preview>
      <Body style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#f7f8fa", padding: "32px 0" }}>
        <Container style={{ backgroundColor: "#ffffff", borderRadius: 12, padding: 32, maxWidth: 560 }}>
          <Heading style={{ color: "#0b1f3a", fontSize: 20, marginBottom: 4 }}>
            New {data.enquiryType === "consultation" ? "Consultation Request" : "Enquiry"}
          </Heading>
          <Text style={{ color: "#545b6a", fontSize: 14, marginTop: 0 }}>
            VIA ABROAD OVERSEAS website submission
          </Text>
          <Hr style={{ borderColor: "#e4e7ec" }} />
          <Section>
            {rows
              .filter(([, value]) => Boolean(value))
              .map(([label, value]) => (
                <Text key={label} style={{ fontSize: 14, margin: "6px 0", color: "#101828" }}>
                  <strong>{label}:</strong> {value}
                </Text>
              ))}
            {data.message && (
              <>
                <Text style={{ fontSize: 14, margin: "12px 0 4px", color: "#101828" }}>
                  <strong>Message:</strong>
                </Text>
                <Text style={{ fontSize: 14, color: "#101828", whiteSpace: "pre-wrap" }}>
                  {data.message}
                </Text>
              </>
            )}
          </Section>
          <Hr style={{ borderColor: "#e4e7ec" }} />
          <Text style={{ fontSize: 14, margin: "6px 0" }}>
            <Link href={adminUrl} style={{ color: "#0b1f3a", textDecoration: "underline" }}>
              Open this enquiry in the admin dashboard
            </Link>
          </Text>
          <Text style={{ fontSize: 12, color: "#7d8494" }}>
            This enquiry has already been saved to the admin dashboard —
            this email is a notification copy only. Reply to this email to
            respond to the student directly.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default BusinessNotificationEmail;
