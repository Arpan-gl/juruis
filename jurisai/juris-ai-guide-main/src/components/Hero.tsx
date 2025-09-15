
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Hero = () => {

const navigate = useNavigate();
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-juris-primary to-juris-accent text-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Legal guidance made simple with AI
            </h1>
            <p className="text-lg md:text-xl mb-8 text-gray-100 max-w-lg">
              Your AI legal assistant that explains complex laws, analyzes documents, and answers your legal questions in plain language.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={()=>{navigate("/contract-analyzer")}} size="lg" className="bg-white text-juris-primary hover:bg-juris-accent-100 font-bold">
                Analyze Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button> 
              <Button onClick={()=>{navigate("/join")}} size="lg" className="bg-white text-juris-primary hover:bg-gray-100 font-bold">
                Join Now
              </Button>
            </div>
            <p className="mt-6 text-sm text-gray-300">
              Not a substitute for professional legal advice. Always consult with a qualified attorney for legal matters.
            </p>
          </div>
          <div className="md:w-1/2 md:pl-10">
            <div className="bg-white rounded-lg shadow-xl overflow-hidden">
              <div className="bg-juris-secondary px-4 py-3 flex items-center">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="mx-auto text-white text-sm font-medium">JurisAI Chat</div>
              </div>
              <div className="p-6 bg-gray-50">
                <div className="flex flex-col gap-4">
                  <div className="bg-juris-light/30 rounded-lg p-4 max-w-[80%]">
                    <p className="text-gray-700">I need to understand my rental contract. What should I look for in the termination clause?</p>
                  </div>
                  <div className="bg-juris-secondary/20 rounded-lg p-4 ml-auto max-w-[80%]">
                    <p className="text-gray-800">
                      In a rental contract, the termination clause typically covers these key elements:
                      <br /><br />
                      1. Notice period required (usually 30-60 days)<br />
                      2. Acceptable methods of notice delivery<br />
                      3. Conditions for early termination<br />
                      4. Associated fees or penalties<br />
                      5. Requirements for returning the property
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
