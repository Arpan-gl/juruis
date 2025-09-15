
import React from 'react';
import { FileText, Globe, MessageSquare, Shield } from 'lucide-react';

const features = [
  {
    title: "Legal Document Analysis",
    description: "Upload contracts, agreements, or legal documents for AI-powered analysis and explanation in plain language.",
    icon: FileText
  },
  {
    title: "Conversational AI",
    description: "Ask questions in natural language and get clear, human-like explanations about complex legal topics.",
    icon: MessageSquare
  },
  {
    title: "Privacy & Security",
    description: "Your documents and conversations are handled with enterprise-grade security and privacy protection.",
    icon: Shield
  }
];

const Features = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-juris-primary mb-4">Key Features</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover how JurisAI makes legal understanding accessible with these powerful features.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="inline-flex items-center justify-center p-3 bg-juris-primary/10 rounded-lg mb-4">
                <feature.icon className="h-6 w-6 text-juris-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-juris-primary">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
