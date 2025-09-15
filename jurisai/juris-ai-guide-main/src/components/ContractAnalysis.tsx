import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { motion } from 'framer-motion';
import { Tooltip } from '@/components/ui/tooltip';

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

interface ContractAnalysisProps {
  analysis: ClauseAnalysis[];
}

const ContractAnalysis = ({ analysis }: ContractAnalysisProps) => {
  const [activeTab, setActiveTab] = useState('table');
  const [selectedClause, setSelectedClause] = useState<number | null>(null);
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  // Reset selected clause when tab changes
  useEffect(() => {
    setSelectedClause(null);
    setExpandedRows([]);
  }, [activeTab]);
  
  const getRiskBadgeClass = (riskLevel: string) => {
    switch(riskLevel.toLowerCase()) {
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border border-green-300 dark:border-green-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border border-yellow-300 dark:border-yellow-700';
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border border-red-300 dark:border-red-700';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600';
    }
  };

  const getRiskColorClass = (riskLevel: string) => {
    switch(riskLevel.toLowerCase()) {
      case 'low':
        return 'text-green-600 dark:text-green-400';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'high':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };
  
  const toggleExpandRow = (index: number) => {
    setExpandedRows(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index) 
        : [...prev, index]
    );
  };
  
  const isRowExpanded = (index: number) => expandedRows.includes(index);
  
  return (
    <div className="space-y-6">
      {/* Stylish Tab Selector */}
      <div className="flex items-center p-1 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-inner">
        <button
          className={`py-2 px-6 rounded-lg transition-all duration-300 ease-in-out flex-1 ${
            activeTab === 'table' 
              ? 'bg-white dark:bg-gray-700 shadow-md transform scale-105' 
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('table')}
        >
          <div className="flex items-center justify-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span>Table View</span>
          </div>
        </button>
        <button
          className={`py-2 px-6 rounded-lg transition-all duration-300 ease-in-out flex-1 ${
            activeTab === 'document' 
              ? 'bg-white dark:bg-gray-700 shadow-md transform scale-105' 
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('document')}
        >
          <div className="flex items-center justify-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Document View</span>
          </div>
        </button>
      </div>
      
      {activeTab === 'table' ? (
        <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-lg">
          <Table>
            <TableCaption className="text-base font-medium pb-4">
              Contract Clause Analysis Results
            </TableCaption>
            <TableHeader className="bg-gray-50 dark:bg-gray-800">
              <TableRow className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <TableHead className="font-bold w-24">Clause Type</TableHead>
                <TableHead className="font-bold">Original Text</TableHead>
                <TableHead className="font-bold w-24">Risk Level</TableHead>
                <TableHead className="font-bold">Simplified Text</TableHead>
                <TableHead className="font-bold">Suggestion</TableHead>
                <TableHead className="font-bold w-16">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analysis.map((clause, index) => (
                <React.Fragment key={index}>
                  <TableRow 
                    onClick={() => setSelectedClause(selectedClause === index ? null : index)}
                    className={`cursor-pointer transition-colors duration-200 ${
                      selectedClause === index ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    } hover:bg-blue-50 dark:hover:bg-blue-900/10`}
                  >
                    <TableCell className="font-medium">{clause.clause_type}</TableCell>
                    <TableCell className={isRowExpanded(index) ? "" : "max-w-xs truncate"}>
                      {clause.original_text}
                    </TableCell>
                    <TableCell>
                      <span className={`${getRiskBadgeClass(clause.risk_level)} px-3 py-1 rounded-full text-xs font-semibold shadow-sm`}>
                        {clause.risk_level}
                      </span>
                    </TableCell>
                    <TableCell className={isRowExpanded(index) ? "" : "max-w-xs truncate"}>
                      {clause.simplified_summary}
                    </TableCell>
                    <TableCell className={isRowExpanded(index) ? "" : "max-w-xs truncate"}>
                      {clause.suggested_rewording}
                    </TableCell>
                    <TableCell>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpandRow(index);
                        }}
                        className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                      >
                        {isRowExpanded(index) ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        )}
                      </button>
                    </TableCell>
                  </TableRow>
                  {isRowExpanded(index) && (
                    <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                      <TableCell colSpan={6} className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-semibold mb-2">Improvement Advice:</h4>
                            <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded border">
                              {clause.improvement_advice}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Key Terms:</h4>
                            <div className="flex flex-wrap gap-2">
                              {clause.bert_insights.important_terms.map((term, i) => (
                                <span key={i} className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded">
                                  {term}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <motion.div 
          className="space-y-6" 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {analysis.map((clause, index) => (
            <motion.div 
              key={index} 
              className={`border rounded-lg shadow-sm overflow-hidden transition-all duration-300 ${
                selectedClause === index 
                  ? 'ring-2 ring-blue-400 dark:ring-blue-500 transform scale-102' 
                  : 'hover:shadow-md'
              }`}
              variants={itemVariants}
              onClick={() => setSelectedClause(selectedClause === index ? null : index)}
            >
              <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 px-4 py-3 border-b flex justify-between items-center">
                <h3 className="font-semibold flex items-center">
                  <span className={`h-2 w-2 rounded-full mr-2 ${getRiskColorClass(clause.risk_level)}`}></span>
                  {clause.clause_type}
                </h3>
                <span className={`${getRiskBadgeClass(clause.risk_level)} px-3 py-1 rounded-full text-xs font-semibold shadow-sm`}>
                  {clause.risk_level} Risk
                </span>
              </div>
              
              <div className="p-4">
                <div className="mb-4">
                  <p className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">{clause.original_text}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center text-gray-800 dark:text-gray-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        In Plain English:
                      </h4>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
                        {clause.simplified_summary}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center text-gray-800 dark:text-gray-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        Improvement Advice:
                      </h4>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
                        {clause.improvement_advice}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center text-gray-800 dark:text-gray-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Suggested Rewording:
                      </h4>
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
                        {clause.suggested_rewording}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center text-gray-800 dark:text-gray-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        Key Terms:
                      </h4>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {clause.bert_insights.important_terms.slice(0, 5).map((term, i) => (
                          <span 
                            key={i} 
                            className="text-xs px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-full border border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 shadow-sm"
                          >
                            {term}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {Object.keys(clause.bert_insights.term_alternatives).length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center text-gray-800 dark:text-gray-200">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                          </svg>
                          Alternative Terms:
                        </h4>
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
                          <dl className="space-y-2">
                            {Object.entries(clause.bert_insights.term_alternatives).map(([term, alternatives], i) => (
                              <div key={i}>
                                <dt className="font-medium text-sm text-gray-700 dark:text-gray-300">{term}:</dt>
                                <dd className="text-sm text-gray-600 dark:text-gray-400 pl-3">
                                  {alternatives.join(', ')}
                                </dd>
                              </div>
                            ))}
                          </dl>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default ContractAnalysis;  