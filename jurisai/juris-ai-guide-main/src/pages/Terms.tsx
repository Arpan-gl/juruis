
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LegalDisclaimer from '@/components/LegalDisclaimer';

const Terms = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">Terms of Service</h1>
          <div className="prose max-w-none">
            <p className="text-lg mb-4">
              Welcome to JurisAI. By using our service, you agree to the following terms and conditions.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">1. Acceptance of Terms</h2>
            <p className="mb-4">
              By accessing or using JurisAI, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the service.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">2. Description of Service</h2>
            <p className="mb-4">
              JurisAI provides AI-powered legal information and document analysis. The service is designed to help users understand legal concepts and documents but does not constitute legal advice.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">3. User Responsibilities</h2>
            <p className="mb-4">
              Users are responsible for all actions taken with their account and must provide accurate information. Users must not use JurisAI for any illegal or unauthorized purpose.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">4. Disclaimer of Legal Advice</h2>
            <p className="mb-4">
              JurisAI is not a law firm and does not provide legal advice. Information provided by JurisAI is for educational and informational purposes only and does not constitute legal advice.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">5. Privacy and Data</h2>
            <p className="mb-4">
              Your use of JurisAI is subject to our Privacy Policy, which governs how we collect, use, and store your data. Please review our Privacy Policy to understand our practices.
            </p>
          </div>
        </div>
        <LegalDisclaimer />
      </main>
      <Footer />
    </div>
  );
};

export default Terms;
