  import React, { useState } from 'react';
  import axios from '../axios';
  import Header from '@/components/Header';
  import Footer from '@/components/Footer';
  import LegalDisclaimer from '@/components/LegalDisclaimer';
  import ContractUploader from '@/components/ContractUploader';
  import ContractChatbot from '@/components/ContractChatbot';

  import ContractAnalysis from '@/components/ContractAnalysis';

  interface BertInsights {
    important_terms: string[];
    risk_level: string;
    term_alternatives: Record<string, string[]>;
  }

  interface ClauseAnalysis {
    clause_type: string;
    original_text: string;
    simplified_summary: string;
    suggested_rewording: string;
    risk_level: string;
    risk_factor_score: number;
    improvement_advice: string;
    bert_insights: BertInsights;
  }

  const ContractAnalyzer = () => {
    const [analysis, setAnalysis] = useState<ClauseAnalysis[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [extractedText, setExtractedText] = useState<string | null>(null);


    const handleUploadContract = async (file: File) => {
      setLoading(true);
      setError(null);
      
      try {
        // Create form data to send the file
        const formData = new FormData();
        // Change 'contract' to 'file' to match the Flask backend expectation
        formData.append('file', file);
        
        for (const [key, value] of formData.entries()) {
          console.log(`FormData -> ${key}:`, value);
        }
        
        // Send the file to the API endpoint using axios
        const response = await axios.post('/analyze', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        console.log('API response:', response);
        if (response.data && response.data.analysis) {
          setExtractedText(response.data.extracted_text || null);
        }
        
        // Extract the analysis data from the response
        if (response.data && response.data.analysis) {
          setAnalysis(response.data.analysis);
        } else {
          throw new Error('Invalid response format from API');
        }
      } catch (err) {
        console.error('Contract analysis failed:', err);
        setError(
          err instanceof Error 
            ? err.message 
            : 'Failed to analyze contract. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-6">Contract Analyzer</h1>
            <p className="text-lg mb-8">
              Upload your legal contract to get an AI-powered analysis, highlighting risky terms
              and providing plain English summaries.
            </p>
            
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                <span className="ml-3">Analyzing your contract...</span>
              </div>
            ) : error ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
                <button 
                  className="mt-4 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
                  onClick={() => setError(null)}
                >
                  Try Again
                </button>
              </div>
            ) : !analysis ? (
              <ContractUploader onUpload={handleUploadContract} />
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Analysis Results</h2>
                  <button 
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded flex items-center"
                    onClick={() => setAnalysis(null)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    New Analysis
                  </button>
                </div>
                <ContractAnalysis analysis={analysis} />
{extractedText && <ContractChatbot extractedText={extractedText} />}

              </div>
            )}
          </div>
          
          <LegalDisclaimer />
        </main>
        <Footer />
      </div>
    );
  };

  export default ContractAnalyzer;