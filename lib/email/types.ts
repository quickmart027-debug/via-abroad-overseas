export type EnquiryEmailData = {
  /** Database id of the saved enquiry — links the email to the admin record. */
  enquiryId: string;
  enquiryType: "general" | "consultation";
  fullName: string;
  phone: string;
  email: string;
  interestedCountry?: string;
  serviceRequired?: string;
  currentQualification?: string;
  interestedCourse?: string;
  message?: string;
  sourcePath?: string;
  submittedAt: string;
};
