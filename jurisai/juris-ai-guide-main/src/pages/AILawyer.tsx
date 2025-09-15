import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LegalDisclaimer from '@/components/LegalDisclaimer';
import ChatInterface from '@/components/ChatInterface';

const AILawyer = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">AI Legal Assistant</h1>
          <p className="text-lg mb-8">
            Chat with our AI legal assistant to get answers to your contract-related legal questions.
            The assistant will respond like a legal expert, providing clear and concise information.
          </p>
          <ChatInterface />
        </div>
        <LegalDisclaimer />
      </main>
      <Footer />
    </div>
  );
};

export default AILawyer;
