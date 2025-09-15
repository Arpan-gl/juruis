
import React from 'react';
import { Check, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const steps = [
  {
    number: "01",
    title: "Choose a Legal Topic",
    description: "Select from categories like contracts, loans, property, or compliance to focus your conversation."
  },
  {
    number: "02",
    title: "Ask Questions or Upload Documents",
    description: "Type your legal questions in plain language or upload documents for AI analysis."
  },
  {
    number: "03",
    title: "Get Clear Explanations",
    description: "Receive easy-to-understand explanations and insights about your legal questions or documents."
  },
];

const HowItWorks = () => {
  const Navigate = useNavigate();

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-juris-primary mb-4">How JurisAI Works</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our AI-powered platform makes it easy to understand legal concepts in just a few simple steps.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="bg-white rounded-lg p-6 h-full shadow-sm border border-gray-200">
                <div className="text-juris-secondary font-bold text-lg mb-2">{step.number}</div>
                <h3 className="text-xl font-semibold mb-3 text-juris-primary">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2">
                  <ChevronRight className="h-8 w-8 text-juris-secondary" />
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="bg-juris-primary rounded-lg p-8 text-white">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h3 className="text-2xl font-bold mb-2">Ready to simplify legal understanding?</h3>
              <p className="text-gray-200">Start using JurisAI today and get answers to your legal questions.</p>
            </div>
            <button onClick={() => Navigate("/contract-analyzer")} className="bg-white text-juris-primary font-semibold py-3 px-6 rounded-md hover:bg-gray-100 transition-colors">
              Try JurisAI Now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
