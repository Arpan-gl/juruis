from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_community.document_loaders import PyMuPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_core.documents import Document
import regex as re
import os
import json
import requests
from uuid import uuid4
from langchain_huggingface import HuggingFaceEmbeddings
from urllib.parse import urlparse
import tempfile
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass
import logging


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

try:
    from rank_bm25 import BM25Okapi
except ImportError:
    print("Error: rank_bm25 not installed. Run: pip install rank-bm25")
    exit(1)

@dataclass
class RiskHighlight:
    text: str
    start_pos: int
    end_pos: int
    risk_type: str
    severity: str
    score: float

@dataclass
class ClauseAnalysis:
    clause_id: str
    clause_text: str
    section: str
    risk_score: float
    risk_highlights: List[RiskHighlight]
    risk_category: str
    suggestions: Optional[str] = None

class EnhancedContractAnalyzer:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash-exp", 
            api_key=api_key,
            temperature=0.3
        )
        self.embedder = HuggingFaceEmbeddings(
            model_name='sentence-transformers/all-MiniLM-L6-v2'
        )
        
        # Enhanced risk patterns with severity levels
        self.risk_patterns = {
            "CRITICAL": {
                "unlimited liability": 1.0,
                "personal guarantee": 0.95,
                "liquidated damages": 0.9,
                "immediate termination": 0.9,
                "forfeit": 0.85,
                "irrevocable": 0.85,
            },
            "HIGH": {
                "indemnify": 0.8,
                "hold harmless": 0.8,
                "penalty": 0.75,
                "breach": 0.7,
                "default": 0.7,
                "void": 0.75,
                "terminate": 0.7,
                "non-compete": 0.8,
            },
            "MEDIUM": {
                "exclusive": 0.6,
                "confidential": 0.5,
                "assignment": 0.6,
                "modification": 0.5,
                "governing law": 0.5,
                "jurisdiction": 0.5,
            },
            "LOW": {
                "notice": 0.3,
                "amendment": 0.3,
                "entire agreement": 0.2,
                "severability": 0.2,
            }
        }
        
        # Legal clause patterns for better parsing
        self.clause_patterns = [
            r'(?=(?:\n|^)\s*\d+\.\d+\.?\s+)',  # 1.1, 2.1, etc.
            r'(?=(?:\n|^)\s*\d+\.\s+)',       # 1., 2., etc.
            r'(?=(?:\n|^)\s*\([a-z]\)\s+)',   # (a), (b), etc.
            r'(?=(?:\n|^)\s*[A-Z][A-Z\s]+:\s+)',  # SECTION HEADERS:
            r'(?=(?:\n|^)\s*Section\s+\d+)',   # Section 1, Section 2
            r'(?=(?:\n|^)\s*Article\s+\d+)',   # Article 1, Article 2
        ]

    def save_url_to_pdf(self, url: str) -> Optional[str]:
        """Enhanced URL to PDF conversion with multiple fallback methods"""
        try:
            # Validate URL
            parsed = urlparse(url)
            if not parsed.scheme:
                url = 'https://' + url
            
            temp_file = tempfile.NamedTemporaryFile(suffix='.pdf', delete=False)
            temp_path = temp_file.name
            temp_file.close()
            
            # Method 1: Try pdfkit
            try:
                import pdfkit
                options = {
                    'page-size': 'A4',
                    'margin-top': '0.75in',
                    'margin-right': '0.75in',
                    'margin-bottom': '0.75in',
                    'margin-left': '0.75in',
                    'encoding': "UTF-8",
                    'no-outline': None
                }
                pdfkit.from_url(url, temp_path, options=options)
                logger.info(f"Successfully converted URL to PDF using pdfkit: {temp_path}")
                return temp_path
            except Exception as e:
                logger.warning(f"pdfkit failed: {e}")
            
            
            
            
            # Method 3: Fallback - save as HTML and inform user
            try:
                response = requests.get(url, timeout=30)
                response.raise_for_status()
                
                html_file = temp_path.replace('.pdf', '.html')
                with open(html_file, 'w', encoding='utf-8') as f:
                    f.write(response.text)
                
                logger.info(f"Saved as HTML (PDF conversion failed): {html_file}")
                return html_file
            except Exception as e:
                logger.error(f"All URL conversion methods failed: {e}")
                return None
                
        except Exception as e:
            logger.error(f"Error in URL processing: {e}")
            return None

    def process_document(self, file_path: str) -> List[Document]:
        """Enhanced document processing with better error handling"""
        try:
            if not os.path.exists(file_path):
                raise FileNotFoundError(f"File not found: {file_path}")
            
            # Handle different file types
            if file_path.lower().endswith('.html'):
                return self._process_html(file_path)
            else:
                return self._process_pdf(file_path)
                
        except Exception as e:
            logger.error(f"Error processing document: {e}")
            return []

    def _process_html(self, file_path: str) -> List[Document]:
        """Process HTML files"""
        try:
            from bs4 import BeautifulSoup
            
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            soup = BeautifulSoup(content, 'html.parser')
            text = soup.get_text()
            
            # Create a document object
            doc = Document(page_content=text, metadata={'source': file_path})
            
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=1500, 
                chunk_overlap=300,
                separators=["\n\n", "\n", ". ", " ", ""]
            )
            return text_splitter.split_documents([doc])
            
        except Exception as e:
            logger.error(f"Error processing HTML: {e}")
            return []

    def _process_pdf(self, file_path: str) -> List[Document]:
        """Enhanced PDF processing"""
        try:
            loader = PyMuPDFLoader(file_path)
            documents = loader.load()
            
            if not documents:
                raise ValueError("No content extracted from PDF")
            
            # Enhanced text splitter for legal documents
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=1500, 
                chunk_overlap=300,
                separators=[
                    "\n\n", 
                    "\n", 
                    ". ", 
                    "? ", 
                    "! ", 
                    " ", 
                    ""
                ]
            )
            return text_splitter.split_documents(documents)
            
        except Exception as e:
            logger.error(f"Error processing PDF: {e}")
            return []

    def enhanced_clause_splitting(self, text: str) -> List[str]:
        """Improved clause splitting using multiple patterns"""
        if not text or not text.strip():
            return []
        
        # Normalize text
        text = re.sub(r'\s+', ' ', text.strip())
        
        # Try each pattern
        for pattern in self.clause_patterns:
            try:
                clauses = re.split(pattern, text)
                if len(clauses) > 1:
                    valid_clauses = []
                    for clause in clauses:
                        if clause and clause.strip() and len(clause.strip()) > 50:
                            valid_clauses.append(clause.strip())
                    if valid_clauses:
                        return valid_clauses
            except Exception as e:
                logger.warning(f"Pattern failed: {pattern}, Error: {e}")
        
        # Fallback to sentence-based splitting
        sentences = re.split(r'(?<=[.!?])\s+', text)
        return [s.strip() for s in sentences if s.strip() and len(s.strip()) > 30]

    def detect_section(self, clause: str) -> str:
        """Enhanced section detection"""
        if not clause:
            return "General"
        
        clause_lower = clause.lower()
        
        section_keywords = {
            "Termination": ["terminate", "termination", "end", "expire", "dissolution", "cancel"],
            "Liability": ["liability", "liable", "damages", "loss", "harm", "responsible"],
            "Indemnification": ["indemnify", "indemnification", "hold harmless", "protect"],
            "Payment": ["payment", "pay", "invoice", "fee", "amount", "cost", "price"],
            "Confidentiality": ["confidential", "non-disclosure", "proprietary", "secret", "private"],
            "Intellectual Property": ["intellectual property", "copyright", "trademark", "patent", "ip"],
            "Governing Law": ["governing law", "jurisdiction", "court", "legal", "dispute"],
            "Force Majeure": ["force majeure", "act of god", "unforeseeable", "extraordinary"],
            "Warranty": ["warranty", "warrant", "guarantee", "representation"],
            "Performance": ["performance", "obligation", "duty", "comply", "fulfill"],
            "Compliance": ["comply", "compliance", "regulation", "law", "legal requirement"],
        }
        
        for section, keywords in section_keywords.items():
            if any(keyword in clause_lower for keyword in keywords):
                return section
        
        return "General"

    def analyze_risks(self, clause: str) -> Tuple[float, List[RiskHighlight], str]:
        """Enhanced risk analysis with highlighting"""
        if not clause:
            return 0.3, [], "LOW"
        
        clause_lower = clause.lower()
        risk_highlights = []
        max_score = 0.3
        risk_category = "LOW"
        
        # Check each risk pattern
        for severity, patterns in self.risk_patterns.items():
            for pattern, score in patterns.items():
                if pattern in clause_lower:
                    # Find all occurrences
                    start = 0
                    while True:
                        pos = clause_lower.find(pattern, start)
                        if pos == -1:
                            break
                        
                        # Find the actual case in original text
                        original_start = pos
                        original_end = pos + len(pattern)
                        original_text = clause[original_start:original_end]
                        
                        risk_highlights.append(RiskHighlight(
                            text=original_text,
                            start_pos=original_start,
                            end_pos=original_end,
                            risk_type=pattern,
                            severity=severity,
                            score=score
                        ))
                        
                        max_score = max(max_score, score)
                        start = pos + 1
        
        # Determine overall risk category
        if max_score >= 0.85:
            risk_category = "CRITICAL"
        elif max_score >= 0.7:
            risk_category = "HIGH"
        elif max_score >= 0.5:
            risk_category = "MEDIUM"
        
        return max_score, risk_highlights, risk_category

    def build_clause_objects(self, texts: List[Document]) -> List[ClauseAnalysis]:
        """Build enhanced clause objects with risk analysis"""
        all_clauses = []
        
        for doc in texts:
            normalized = re.sub(r'\s+', ' ', doc.page_content.strip())
            clauses = self.enhanced_clause_splitting(normalized)
            
            for idx, clause in enumerate(clauses):
                if clause and len(clause) > 50:
                    risk_score, risk_highlights, risk_category = self.analyze_risks(clause)
                    section = self.detect_section(clause)
                    
                    clause_analysis = ClauseAnalysis(
                        clause_id=str(uuid4()),
                        clause_text=clause,
                        section=section,
                        risk_score=risk_score,
                        risk_highlights=risk_highlights,
                        risk_category=risk_category
                    )
                    all_clauses.append(clause_analysis)
        
        return all_clauses

    def generate_embeddings(self, clause_objects: List[ClauseAnalysis]) -> List[ClauseAnalysis]:
        """Generate embeddings for clauses"""
        try:
            for clause in clause_objects:
                try:
                    embedding = self.embedder.embed_query(clause.clause_text)
                    setattr(clause, 'embedding', embedding)
                except Exception as e:
                    logger.error(f"Error generating embedding for clause {clause.clause_id}: {e}")
                    setattr(clause, 'embedding', None)
            return clause_objects
        except Exception as e:
            logger.error(f"Error in generate_embeddings: {e}")
            return clause_objects

    def build_vectorstore(self, clause_objects: List[ClauseAnalysis], persist_directory="./chroma_store") -> Optional[Chroma]:
        """Build vector store from clauses"""
        try:
            valid_clauses = [c for c in clause_objects if hasattr(c, 'embedding') and c.embedding is not None]
            
            if not valid_clauses:
                raise ValueError("No valid clauses with embeddings found")
            
            docs = [
                Document(
                    page_content=clause.clause_text,
                    metadata={
                        "id": clause.clause_id,
                        "section": clause.section,
                        "risk_score": clause.risk_score,
                        "risk_category": clause.risk_category,
                        "risk_highlights": len(clause.risk_highlights)
                    }
                )
                for clause in valid_clauses
            ]

            vectorstore = Chroma.from_documents(
                documents=docs,
                embedding=self.embedder,
                persist_directory=persist_directory
            )
            return vectorstore
        except Exception as e:
            logger.error(f"Error building vectorstore: {e}")
            return None

    def build_bm25_index(self, clause_objects: List[ClauseAnalysis]) -> Tuple[Optional[BM25Okapi], List[List[str]], List[ClauseAnalysis]]:
        """Build BM25 index"""
        try:
            valid_clauses = [c for c in clause_objects if c.clause_text]
            if not valid_clauses:
                raise ValueError("No valid clauses found for BM25 index")
            
            tokenized_clauses = [clause.clause_text.lower().split() for clause in valid_clauses]
            bm25 = BM25Okapi(tokenized_clauses)
            return bm25, tokenized_clauses, valid_clauses
        except Exception as e:
            logger.error(f"Error building BM25 index: {e}")
            return None, [], []

    def hybrid_search(self, query: str, vectorstore: Optional[Chroma], bm25: Optional[BM25Okapi], 
                     tokenized_clauses: List[List[str]], clause_objects: List[ClauseAnalysis], 
                     top_k: int = 10) -> List[Tuple[str, Dict]]:
        """Enhanced hybrid search with risk prioritization"""
        try:
            combined = []
            seen = set()
            
            # Semantic search
            if vectorstore:
                try:
                    sem_results = vectorstore.similarity_search(query, k=top_k * 2)
                    for res in sem_results:
                        if res.metadata["id"] not in seen:
                            # Add semantic score
                            metadata = res.metadata.copy()
                            metadata["search_type"] = "semantic"
                            combined.append((res.page_content, metadata))
                            seen.add(res.metadata["id"])
                except Exception as e:
                    logger.error(f"Error in semantic search: {e}")

            # BM25 search
            if bm25 and tokenized_clauses and clause_objects:
                try:
                    scores = bm25.get_scores(query.lower().split())
                    bm25_results = sorted(
                        zip(scores, clause_objects),
                        key=lambda x: x[0],
                        reverse=True
                    )[:top_k * 2]

                    for score, clause in bm25_results:
                        if clause.clause_id not in seen:
                            metadata = {
                                "id": clause.clause_id,
                                "section": clause.section,
                                "risk_score": clause.risk_score,
                                "risk_category": clause.risk_category,
                                "bm25_score": score,
                                "search_type": "keyword"
                            }
                            combined.append((clause.clause_text, metadata))
                            seen.add(clause.clause_id)
                except Exception as e:
                    logger.error(f"Error in BM25 search: {e}")

            # Sort by risk score (higher risk first) and limit results
            combined.sort(key=lambda x: x[1].get("risk_score", 0), reverse=True)
            return combined[:top_k]
            
        except Exception as e:
            logger.error(f"Error in hybrid_search: {e}")
            return []

    def generate_comprehensive_analysis(self, results: List[Tuple[str, Dict]], 
                                      query: str, all_clauses: List[ClauseAnalysis]) -> str:
        """Generate comprehensive contract analysis using LLM"""
        try:
            # Prepare context
            high_risk_clauses = [c for c in all_clauses if c.risk_score >= 0.7]
            critical_clauses = [c for c in all_clauses if c.risk_category == "CRITICAL"]
            
            # Format search results with risk scores
            search_context = ""
            for i, (clause_text, metadata) in enumerate(results[:5], 1):
                risk_score = metadata.get('risk_score', 0)
                section = metadata.get('section', 'Unknown')
                search_context += f"\n[{i}] RISK SCORE: {risk_score:.2f} | SECTION: {section}\n{clause_text[:200]}...\n"
            
            # Format high-risk clauses with highlights
            risk_context = ""
            for i, clause in enumerate(high_risk_clauses[:5], 1):
                highlights = [f"'{h.text}' ({h.score:.2f})" for h in clause.risk_highlights[:3]]
                risk_context += f"\n[{i}] SCORE: {clause.risk_score:.2f} | CATEGORY: {clause.risk_category}\n"
                risk_context += f"SECTION: {clause.section}\n"
                risk_context += f"RISKS: {', '.join(highlights) if highlights else 'General risks'}\n"
                risk_context += f"TEXT: {clause.clause_text[:150]}...\n"
            
            prompt = f"""
            You are a contract risk analyst. Provide a CONCISE, STRUCTURED analysis.
            
            QUERY: "{query}"
            
            DOCUMENT STATS:
            • Total Clauses: {len(all_clauses)}
            • High-Risk (≥0.7): {len(high_risk_clauses)}
            • Critical Risk (≥0.85): {len(critical_clauses)}
            
            RELEVANT CLAUSES:
            {search_context}
            
            TOP RISK CLAUSES:
            {risk_context}
            
            Provide analysis in this EXACT format:
            
            🎯 DIRECT ANSWER
            [2-3 sentences directly answering the query]
            
            ⚠️  RISK BREAKDOWN
            Overall Risk Level: [HIGH/MEDIUM/LOW]
            
            Critical Issues (Score ≥0.85):
            • [Risk description] - Score: X.XX
            • [Risk description] - Score: X.XX
            
            High Risks (Score 0.70-0.84):
            • [Risk description] - Score: X.XX
            • [Risk description] - Score: X.XX
            
            🔧 NEGOTIATION PRIORITIES
            1. [Most important clause to change] - Current Risk: X.XX
               → Suggested change: [Brief alternative]
            
            2. [Second priority] - Current Risk: X.XX
               → Suggested change: [Brief alternative]
            
            3. [Third priority] - Current Risk: X.XX
               → Suggested change: [Brief alternative]
            
            🚩 RED FLAGS
            • [Deal-breaker issue 1]
            • [Deal-breaker issue 2]
            
            Keep responses concise. Focus on actionable insights with specific risk scores.
            """
            
            response = self.llm.invoke(prompt)
            return response.content
            
        except Exception as e:
            logger.error(f"Error generating comprehensive analysis: {e}")
            return f"Error generating analysis: {e}"

    def format_output(self, clause: ClauseAnalysis) -> str:
        """Format clause output with risk highlighting"""
        output = f"\n{'='*60}\n"
        output += f"CLAUSE ANALYSIS\n"
        output += f"{'='*60}\n"
        output += f"Section: {clause.section}\n"
        output += f"Risk Level: {clause.risk_category} (Score: {clause.risk_score:.2f})\n"
        output += f"Risk Elements Found: {len(clause.risk_highlights)}\n\n"
        
        # Highlight risky text
        highlighted_text = clause.clause_text
        if clause.risk_highlights:
            # Sort highlights by position (reverse order for proper replacement)
            sorted_highlights = sorted(clause.risk_highlights, key=lambda x: x.start_pos, reverse=True)
            
            output += "RISK HIGHLIGHTS:\n"
            for highlight in clause.risk_highlights:
                output += f"  • '{highlight.text}' - {highlight.severity} ({highlight.score:.2f})\n"
            
            output += f"\nCLAUSE TEXT (*** = Risk Element):\n"
            for highlight in sorted_highlights:
                highlighted_text = (
                    highlighted_text[:highlight.start_pos] + 
                    f"***{highlighted_text[highlight.start_pos:highlight.end_pos]}***" +
                    highlighted_text[highlight.end_pos:]
                )
        else:
            output += f"CLAUSE TEXT:\n"
        
        output += f"{highlighted_text}\n"
        
        if clause.suggestions:
            output += f"\nSUGGESTIONS:\n{clause.suggestions}\n"
        
        return output

    def process_contract(self, input_path: str, query: str = None) -> str:
        """Main processing function"""
        try:
            logger.info("Starting contract analysis...")
            
            # Handle URL input
            if input_path.startswith(('http://', 'https://')):
                logger.info("Converting URL to document...")
                file_path = self.save_url_to_pdf(input_path)
                if not file_path:
                    return "Error: Could not process URL"
            else:
                file_path = input_path
            
            # Process document
            logger.info("Processing document...")
            texts = self.process_document(file_path)
            if not texts:
                return "Error: No text extracted from document"
            
            # Build clause objects
            logger.info("Analyzing clauses...")
            clause_objects = self.build_clause_objects(texts)
            if not clause_objects:
                return "Error: No clauses found"
            
            # Generate embeddings
            logger.info("Generating embeddings...")
            clause_objects = self.generate_embeddings(clause_objects)
            
            # Build search indices
            logger.info("Building search indices...")
            vectorstore = self.build_vectorstore(clause_objects)
            bm25, tokenized_clauses, valid_clauses = self.build_bm25_index(clause_objects)
            
            # If query provided, perform search and analysis
            if query:
                logger.info(f"Searching for: {query}")
                results = self.hybrid_search(query, vectorstore, bm25, tokenized_clauses, valid_clauses)
                
                if results:
                    analysis = self.generate_comprehensive_analysis(results, query, clause_objects)
                    return analysis
                else:
                    return "No relevant clauses found for your query."
            
            # Otherwise, return general risk analysis
            high_risk_clauses = [c for c in clause_objects if c.risk_score >= 0.7]
            
            output = f"CONTRACT RISK ANALYSIS COMPLETE\n{'='*50}\n"
            output += f"Total Clauses Analyzed: {len(clause_objects)}\n"
            output += f"High-Risk Clauses Found: {len(high_risk_clauses)}\n\n"
            
            if high_risk_clauses:
                output += "HIGH-RISK CLAUSES REQUIRING ATTENTION:\n\n"
                for i, clause in enumerate(high_risk_clauses[:5], 1):
                    output += f"{i}. {self.format_output(clause)}\n"
            
            return output
            
        except Exception as e:
            logger.error(f"Error in process_contract: {e}")
            return f"Error processing contract: {e}"


def main():
    """Enhanced main function"""
    print("Enhanced Contract Analyzer")
    print("=" * 50)
    
    # Initialize analyzer
    api_key = os.getenv('GEMINI_API_KEY')  # Replace with your API key
    analyzer = EnhancedContractAnalyzer(api_key)
    
    # Get input
    print("\nInput Options:")
    print("1. Local PDF file path")
    print("2. URL to convert to PDF")
    print("3. HTML file path")
    
    input_path = input("\nEnter file path or URL: ").strip()
    if not input_path:
        print("No input provided. Exiting.")
        return
    
    query = input("\nEnter your analysis query (optional, press Enter to skip): ").strip()
    
    # Process contract
    result = analyzer.process_contract(input_path, query if query else None)
    print("\n" + "=" * 80)
    print("ANALYSIS RESULTS")
    print("=" * 80)
    print(result)


if __name__ == "__main__":
    main()