
import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Is JurisAI a substitute for legal advice from an attorney?",
    answer: "No, JurisAI is not a substitute for professional legal advice. It's designed to help you understand legal concepts and documents, but for specific legal matters, you should always consult with a qualified attorney."
  },
  {
    question: "How accurate is the information provided by JurisAI?",
    answer: "JurisAI is trained on a wide range of legal documents and resources, but legal interpretations can vary. The information provided should be used as a general guide only and may not reflect recent legal changes or jurisdiction-specific nuances."
  },
  {
    question: "How secure are the documents I upload for analysis?",
    answer: "We take security seriously. All documents are encrypted during transmission and storage. They are only used for the specific analysis you request and are not shared with third parties. You can delete your documents at any time."
  },
  {
    question: "Which countries and legal systems does JurisAI support?",
    answer: "JurisAI currently supports legal information for several major jurisdictions including the US, UK, Canada, Australia, and the EU. We're continuously expanding our coverage to include more countries and legal systems."
  },
  {
    question: "Can JurisAI help with specialized legal fields?",
    answer: "JurisAI is primarily focused on common legal topics such as contracts, property law, loans, and general compliance. For highly specialized legal fields or complex cases, consultation with a specialized attorney is recommended."
  }
];

const FAQ = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-juris-primary mb-4">Frequently Asked Questions</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about JurisAI and how it can help you navigate legal matters.
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left font-semibold text-juris-primary">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">Still have questions? We're here to help.</p>
            <button className="bg-juris-primary hover:bg-juris-accent text-white font-medium py-2 px-6 rounded transition-colors">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
