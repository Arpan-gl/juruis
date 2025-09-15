import React from 'react';
import { FileText, Settings, User, Home, HelpCircle, LogOut, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import ContractComparison from '../components/ContractComparison'; // Import the component we created earlier

const ContractComparisonPage: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar Navigation */}
 
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-gray-200 py-4 px-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-blue-600">Contract Analyzer</h1>
            <button className="p-2 rounded-md hover:bg-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </header>
        
        {/* Page Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center">
            <Link to="/" className="flex items-center text-gray-500 hover:text-blue-600 mr-4">
              <ChevronLeft className="w-5 h-5" />
              <span className="ml-1">Back</span>
            </Link>
            <h1 className="text-xl font-semibold">Contract Comparison Tool</h1>
          </div>
          <p className="text-gray-600 mt-1">Compare two legal documents to identify differences, risks, and determine which is more favorable.</p>
        </div>
        
        {/* Main Content Area */}
        <main className="p-6">
          <ContractComparison />
        </main>
        
        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="md:flex md:items-center md:justify-between">
              <div className="text-sm text-gray-500">
                &copy; 2025 Contract Analyzer. All rights reserved.
              </div>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="#" className="text-sm text-gray-500 hover:text-gray-900">Privacy Policy</a>
                <a href="#" className="text-sm text-gray-500 hover:text-gray-900">Terms of Service</a>
                <a href="#" className="text-sm text-gray-500 hover:text-gray-900">Contact Support</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ContractComparisonPage;