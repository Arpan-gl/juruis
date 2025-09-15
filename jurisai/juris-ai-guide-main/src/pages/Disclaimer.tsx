
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Disclaimer = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">Legal Disclaimer</h1>
          <div className="prose max-w-none bg-yellow-50 p-6 rounded-lg border border-yellow-200">
            <p className="text-lg mb-4 font-semibold text-yellow-800">
              IMPORTANT: Please read this disclaimer carefully before using JurisAI.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">Not Legal Advice</h2>
            <p className="mb-4">
              JurisAI is not a law firm and is not a substitute for an attorney or law firm. JurisAI cannot provide legal advice, 
              representation, or counsel. Your use of JurisAI does not create an attorney-client relationship. The information provided 
              by JurisAI is for educational and informational purposes only.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">No Guarantee of Accuracy</h2>
            <p className="mb-4">
              While we strive to provide accurate and up-to-date information, JurisAI makes no warranties or representations regarding 
              the accuracy, completeness, or reliability of the information provided. Laws and regulations change frequently, and interpretations 
              may vary.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">Consult a Professional</h2>
            <p className="mb-4">
              For specific legal matters, you should always consult with a qualified attorney who is familiar with the relevant laws in your 
              jurisdiction. Legal issues are complex and fact-specific, and professional advice is necessary for your particular situation.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">No Liability</h2>
            <p className="mb-4">
              JurisAI, its owners, employees, affiliates, and partners are not responsible for any actions taken or decisions made based on 
              information provided by JurisAI. By using JurisAI, you agree to hold JurisAI harmless from any claims, losses, or damages arising 
              from your use of the service.
            </p>
            
            <div className="bg-yellow-100 p-4 rounded-lg mt-8">
              <p className="font-bold">By using JurisAI, you acknowledge that you have read, understood, and agree to this disclaimer.</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Disclaimer;
