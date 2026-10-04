import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/motion/reveal";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { FaqJsonLd } from "@/components/seo/faq-jsonld";

const faq = [
  {
    question: "How do I choose the right country?",
    answer:
      "The right country depends on your course, budget, career goals, and personal preferences. Your counsellor will walk through these with you before recommending options.",
  },
  {
    question: "How do I choose a university?",
    answer:
      "We compare universities on curriculum fit, cost, location, and outcomes relevant to your goals — not rankings alone. You make the final decision with full information.",
  },
  {
    question: "What documents are required?",
    answer:
      "Requirements vary by country, university, and course. Your counsellor will give you a checklist specific to your applications once your shortlist is finalised.",
  },
  {
    question: "Do you help with visas?",
    answer:
      "Yes. We provide guidance on documentation, financial proof, and interview preparation. We cannot guarantee visa approval — that decision rests solely with the relevant government authority.",
  },
  {
    question: "Can you help with scholarships?",
    answer:
      "Yes. We help you identify relevant university and external scholarship opportunities. Scholarships are awarded at the discretion of the awarding institution, and we cannot guarantee an outcome.",
  },
  {
    question: "How much does studying abroad cost?",
    answer:
      "Costs vary significantly by country, university, and course, and change over time. Your counsellor will walk through a realistic estimate for your specific options during your consultation.",
  },
  {
    question: "Do you provide pre-departure assistance?",
    answer:
      "Yes. We provide practical pre-departure guidance to help you prepare before you travel.",
  },
  {
    question: "How do I book counselling?",
    answer:
      "Use the \"Book Free Consultation\" button anywhere on the site, or call or WhatsApp us directly. Your first consultation is free.",
  },
];

export function FaqSection() {
  return (
    <section className="bg-surface py-20 md:py-28">
      <FaqJsonLd faq={faq} />
      <Container className="max-w-3xl">
        <Reveal className="text-center">
          <h2 className="text-balance font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-semibold text-navy-900">
            Questions? We&rsquo;ve got answers.
          </h2>
        </Reveal>

        <Reveal delay={0.06}>
          <Accordion type="single" collapsible className="mt-10">
            {faq.map((item) => (
              <AccordionItem key={item.question} value={item.question}>
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent>{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </Container>
    </section>
  );
}
