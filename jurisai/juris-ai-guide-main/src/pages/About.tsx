
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LegalDisclaimer from '@/components/LegalDisclaimer';

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">How JurisAI Works</h1>
          <div className="prose max-w-none">
            <p className="text-lg mb-4">
              JurisAI uses advanced artificial intelligence to help you understand legal documents and concepts in plain language. 
              Our system is designed to make legal information accessible to everyone, regardless of their background in law.
            </p>
            <h2 className="text-2xl font-bold mt-8 mb-4">Our Technology</h2>
            <p className="mb-4">
              We leverage state-of-the-art natural language processing models that have been specifically trained on legal documents, 
              statutes, and case law from multiple jurisdictions. This allows our AI to provide accurate, context-aware information
              about legal matters.
            </p>
            <h2 className="text-2xl font-bold mt-8 mb-4">How to Use JurisAI</h2>
            <ol className="list-decimal pl-5 space-y-2 mb-6">
              <li>Create an account or start with our guest mode</li>
              <li>Type your legal question or upload a document for analysis</li>
              <li>Receive clear, plain-language explanations of complex legal concepts</li>
              <li>Ask follow-up questions to deepen your understanding</li>
            </ol>
          </div>
        </div>
        <LegalDisclaimer />
      </main>
      <Footer />
    </div>
  );
};

export default About;
