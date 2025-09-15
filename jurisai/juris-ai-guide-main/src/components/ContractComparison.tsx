import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileUp, AlertTriangle, CheckCircle, ChevronDown, ChevronUp, ArrowLeftRight } from 'lucide-react';

// API response type
interface ComparisonResponse {
  comparison_result: string;
  status: string;
  differences?: DifferenceItem[];
  risks?: RiskItem[];
  favorable?: FavorableItem[];
}

// Extracted data types
interface DifferenceItem {
  feature: string;
  contractA: string;
  contractB: string;
}

interface RiskItem {
  contract: string;
  party: string;
  description: string;
}

interface FavorableItem {
  feature: string;
  contractA: string;
  contractB: string;
  whyFavorable: string;
}

const ContractComparison: React.FC = () => {
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [compareResult, setCompareResult] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [activeSection, setActiveSection] = useState<string>('differences');
  
  // Data states with empty defaults
  const [keyDifferences, setKeyDifferences] = useState<DifferenceItem[]>([]);
  const [riskFactors, setRiskFactors] = useState<RiskItem[]>([]);
  const [favorableItems, setFavorableItems] = useState<FavorableItem[]>([]);

  // Handle file upload for both contracts
  const handleFile1Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile1(e.target.files[0]);
      setError('');
    }
  };

  const handleFile2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile2(e.target.files[0]);
      setError('');
    }
  };

  // API call to compare contracts
  const compareContracts = async () => {
    if (!file1 || !file2) {
      setError('Please upload both contracts');
      return;
    }
  
    setIsLoading(true);
    setError('');
    setCompareResult(null);
  
    const formData = new FormData();
    formData.append('contract_a', file1);
    formData.append('contract_b', file2);
  
    try {
      const response = await fetch('http://localhost:3200/analyze-contracts', {
        method: 'POST',
        body: formData,
      });
  
      const data: ComparisonResponse = await response.json();
      console.log('API Response:', data); // Log the API response for debugging
      
      if (data.status === 'success') {
        setCompareResult(data.comparison_result);
        
        // Update state with response data or use empty arrays if undefined
        setKeyDifferences(data.differences || []);
        setRiskFactors(data.risks || []);
        setFavorableItems(data.favorable || []);
        setActiveSection('differences');
      } else {
        setError(data.comparison_result || 'Failed to analyze contracts');
      }
    } catch (err) {
      setError('An error occurred while comparing contracts');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle section visibility
  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? '' : section);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Contract Analyzer - Comparison</h1>
      
      {/* Upload section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Upload Contracts to Compare</h2>
        <p className="text-gray-600 mb-6">
          Upload two legal contracts to identify key differences, risk factors, and determine which contract is more favorable.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* First contract upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center">
            <FileUp className="w-12 h-12 text-blue-500 mb-4" />
            <p className="font-medium mb-4">Contract A</p>
            <label className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md cursor-pointer transition-colors">
              Browse Files
              <input 
                type="file" 
                className="hidden" 
                accept=".pdf,.docx,.txt" 
                onChange={handleFile1Change}
              />
            </label>
            {file1 && <p className="mt-3 text-sm text-gray-600">{file1.name}</p>}
            <p className="text-xs text-gray-500 mt-3">Supported formats: PDF, DOCX, TXT</p>
          </div>
          
          {/* Second contract upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center">
            <FileUp className="w-12 h-12 text-blue-500 mb-4" />
            <p className="font-medium mb-4">Contract B</p>
            <label className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md cursor-pointer transition-colors">
              Browse Files
              <input 
                type="file" 
                className="hidden" 
                accept=".pdf,.docx,.txt" 
                onChange={handleFile2Change}
              />
            </label>
            {file2 && <p className="mt-3 text-sm text-gray-600">{file2.name}</p>}
            <p className="text-xs text-gray-500 mt-3">Supported formats: PDF, DOCX, TXT</p>
          </div>
        </div>
        
        {error && (
          <div className="flex items-center mt-4 p-3 bg-red-50 text-red-700 rounded-md">
            <AlertTriangle className="w-5 h-5 mr-2" />
            <p>{error}</p>
          </div>
        )}
        
        <div className="mt-6 flex justify-center">
          <button 
            onClick={compareContracts}
            disabled={isLoading || !file1 || !file2}
            className={`flex items-center space-x-2 py-3 px-8 rounded-md font-medium ${
              isLoading || !file1 || !file2 
                ? 'bg-gray-300 cursor-not-allowed text-gray-500' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            <ArrowLeftRight className="w-5 h-5" />
            <span>{isLoading ? 'Comparing...' : 'Compare Contracts'}</span>
          </button>
        </div>
      </div>
      
      {/* Results section */}
      {compareResult && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Comparison Results</h2>
            <div className="flex space-x-4">
              <span className="flex items-center text-sm text-gray-500">
                <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                Analysis Complete
              </span>
            </div>
          </div>
          
          {/* Tab navigation */}
          <div className="flex border-b mb-6">
            <button 
              onClick={() => toggleSection('differences')}
              className={`py-3 px-5 -mb-px ${
                activeSection === 'differences'
                  ? 'border-b-2 border-blue-500 text-blue-500 font-medium'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Key Differences
            </button>
            <button 
              onClick={() => toggleSection('risks')}
              className={`py-3 px-5 -mb-px ${
                activeSection === 'risks'
                  ? 'border-b-2 border-blue-500 text-blue-500 font-medium'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Risk Factors
            </button>
            <button 
              onClick={() => toggleSection('favorable')}
              className={`py-3 px-5 -mb-px ${
                activeSection === 'favorable'
                  ? 'border-b-2 border-blue-500 text-blue-500 font-medium'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Favorable Terms
            </button>
          </div>
          
          {/* Key Differences Section */}
          {activeSection === 'differences' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-lg font-medium mb-4">1. Key Differences in Terms, Obligations, and Clauses</h3>
              {keyDifferences.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border py-3 px-4 text-left">Feature</th>
                        <th className="border py-3 px-4 text-left">Contract A</th>
                        <th className="border py-3 px-4 text-left">Contract B</th>
                      </tr>
                    </thead>
                    <tbody>
                      {keyDifferences.map((item, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                          <td className="border py-3 px-4 font-medium">{item.feature}</td>
                          <td className="border py-3 px-4">{item.contractA}</td>
                          <td className="border py-3 px-4">{item.contractB}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 italic">No key differences found.</p>
              )}
            </motion.div>
          )}
          
          {/* Risk Factors Section */}
          {activeSection === 'risks' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-lg font-medium mb-4">2. Risk Factors in One Contract That the Other Avoids</h3>
              {riskFactors.length > 0 ? (
                <div className="space-y-4">
                  {riskFactors.map((item, index) => (
                    <div key={index} className="p-4 border rounded-lg bg-gray-50">
                      <div className="flex items-center mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-bold mr-2 ${
                          item.contract === 'A' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          Contract {item.contract}
                        </span>
                        <span className="text-sm font-medium text-gray-700">For {item.party}</span>
                      </div>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No risk factors found.</p>
              )}
            </motion.div>
          )}
          
          {/* Favorable Terms Section */}
          {activeSection === 'favorable' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-lg font-medium mb-4">3. Which Contract is More Favorable to Which Party and Why</h3>
              
              {favorableItems.length > 0 ? (
                <>
                  <div className="mb-4">
                    <div className="p-4 border rounded-lg mb-4 bg-amber-50">
                      <h4 className="font-medium mb-2">Contract A is more favorable to ABC Corporation</h4>
                      <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
                        {favorableItems
                          .filter(item => item.whyFavorable.includes("ABC") || item.whyFavorable.includes("less expensive"))
                          .map((item, idx) => (
                            <li key={idx}>{item.feature}: {item.whyFavorable}</li>
                          ))}
                      </ul>
                    </div>
                    
                    <div className="p-4 border rounded-lg bg-blue-50">
                      <h4 className="font-medium mb-2">Contract B is more favorable to John Doe</h4>
                      <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
                        {favorableItems
                          .filter(item => item.whyFavorable.includes("John Doe") || item.whyFavorable.includes("income"))
                          .map((item, idx) => (
                            <li key={idx}>{item.feature}: {item.whyFavorable}</li>
                          ))}
                      </ul>
                    </div>
                  </div>
                  
                  <h4 className="font-medium mb-3">Summary Table</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border py-3 px-4 text-left">Feature</th>
                          <th className="border py-3 px-4 text-left">Contract A</th>
                          <th className="border py-3 px-4 text-left">Contract B</th>
                          <th className="border py-3 px-4 text-left">Why More Favorable</th>
                        </tr>
                      </thead>
                      <tbody>
                        {favorableItems.map((item, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="border py-3 px-4 font-medium">{item.feature}</td>
                            <td className="border py-3 px-4">{item.contractA}</td>
                            <td className="border py-3 px-4">{item.contractB}</td>
                            <td className="border py-3 px-4">{item.whyFavorable}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <p className="text-gray-500 italic">No favorable terms analysis found.</p>
              )}
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default ContractComparison;