"use client";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { FAQS } from "@/lib/mock-data";
import { usePublicFaqs } from "@/hooks/api/usePublicData";

export default function FAQ() {
  const { data, isLoading } = usePublicFaqs();
  const faqs = (data ?? []).length
    ? (data ?? []).map((f) => ({ q: f.question, a: f.answer }))
    : isLoading
      ? []
      : FAQS;
  return (
    <>
      <section className="gradient-navy grain-overlay text-white py-16">
        <div className="absolute inset-0 leaf-texture opacity-50" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight max-w-3xl">
            Everything you need to <span className="text-gradient-light">know.</span>
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="rounded-2xl border border-border bg-card px-5 data-[state=open]:shadow-md transition-shadow">
              <AccordionTrigger className="text-left font-serif text-base font-bold hover:no-underline">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </>
  );
}
