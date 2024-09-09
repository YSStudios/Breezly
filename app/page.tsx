import { Container } from "@/components/Container";
import { Hero } from "@/components/Hero";
import { SectionTitle } from "@/components/SectionTitle";
import { Benefits } from "@/components/Benefits";
import { benefitOne, benefitTwo } from "@/components/data";
import { Testimonials } from "@/components/Testimonials";
import { Faq } from "@/components/Faq";
import { Cta } from "@/components/Cta";
import { getServerSession } from "next-auth/next";

export default async function HomePage() {
  const session = await getServerSession();

  return (
    <>
      <Container>
        <Hero />
        <SectionTitle
          preTitle="Breezly"
          title=" Why should you use this landing page"
        >
          Nextly is a free landing page & marketing website template for startups
          and indie projects. Its built with Next.js & TailwindCSS. And its
          completely open-source.
        </SectionTitle>
        <Benefits data={benefitOne} />
        <Benefits imgPos="right" data={benefitTwo} />
        <SectionTitle preTitle="FAQ" title="Frequently Asked Questions">
          Answer your customers possible questions here, it will increase the
          conversion rate as well as support or chat requests.
        </SectionTitle>
        <Faq />
        <Cta />
      </Container>
    </>
  );
}
