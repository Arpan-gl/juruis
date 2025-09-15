
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LegalDisclaimer from '@/components/LegalDisclaimer';
import { Check } from 'lucide-react';

const Features = () => {
  const featuresList = [
    {
      title: "Legal Document Analysis",
      description: "Upload contracts, agreements, or legal documents to receive AI-powered analysis and summaries."
    },
    {
      title: "Multi-jurisdictional Support",
      description: "Get information about laws and regulations from multiple countries and legal systems."
    },
    {
      title: "Plain Language Explanations",
      description: "Complex legal concepts explained in easy-to-understand language without the jargon."
    },
    {
      title: "Voice Interaction",
      description: "Speak your questions and receive audio responses for accessibility and convenience."
    },
    {
      title: "Document History",
      description: "Access your previously analyzed documents and conversations securely."
    },
    {
      title: "Custom Legal Topics",
      description: "Specialized knowledge in loans, contracts, property law, and regulatory compliance."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">JurisAI Features</h1>
          <p className="text-lg mb-8">
            Our platform offers a wide range of features designed to make legal information accessible to everyone.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuresList.map((feature, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start mb-4">
                  <div className="bg-juris-primary rounded-full p-1 mr-3">
                    <Check className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-bold text-xl">{feature.title}</h3>
                </div>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
        <LegalDisclaimer />
      </main>
      <Footer />
    </div>
  );
};

export default Features;
