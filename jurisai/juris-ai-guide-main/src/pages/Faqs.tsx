
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LegalDisclaimer from '@/components/LegalDisclaimer';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const Faqs = () => {
  const faqsList = [
    {
      question: "What is JurisAI?",
      answer: "JurisAI is an AI-powered platform that helps users understand legal documents and concepts in simple language. It can analyze contracts, explain regulations, and answer questions about various legal topics."
    },
    {
      question: "Is JurisAI a substitute for a lawyer?",
      answer: "No, JurisAI is not a substitute for professional legal advice. We provide information and explanations to help you better understand legal concepts, but for specific legal matters, you should always consult with a qualified attorney."
    },
    {
      question: "Which countries' legal systems does JurisAI cover?",
      answer: "JurisAI currently supports legal information for several major jurisdictions including the United States, United Kingdom, Canada, Australia, and the European Union. We're continuously expanding our coverage to include more countries."
    },
    {
      question: "How secure is my data on JurisAI?",
      answer: "We take data security very seriously. All documents uploaded to JurisAI are encrypted, and we follow industry-standard security protocols. We do not share your documents or conversations with third parties, and you can delete your data at any time."
    },
    {
      question: "Can I use JurisAI for my business?",
      answer: "Yes, JurisAI offers business plans that provide additional features such as team collaboration, increased document storage, and specialized knowledge bases relevant to different industries."
    },
    {
      question: "How accurate is JurisAI's information?",
      answer: "JurisAI strives for high accuracy in its information by training on verified legal documents and regular updates. However, laws and regulations change, and AI systems have limitations, which is why we always recommend consulting with legal professionals for critical matters."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">Frequently Asked Questions</h1>
          <p className="text-lg mb-8">
            Find answers to common questions about JurisAI and how it can help you with legal information.
          </p>
          
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {faqsList.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left font-medium">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
        <LegalDisclaimer />
      </main>
      <Footer />
    </div>
  );
};

export default Faqs;
