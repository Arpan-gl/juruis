from flask import Flask, request, jsonify
from flask_cors import CORS
import PyPDF2
import google.generativeai as genai
from transformers import AutoTokenizer, AutoModelForMaskedLM, pipeline
import json
import re
import nltk
from nltk.tokenize import sent_tokenize, word_tokenize
import spacy

# Download NLTK resources
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt', quiet=True)

app = Flask(__name__)
CORS(app)

# 🔐 Load Gemini API key from env
genai.configure(api_key="AIzaSyC9HiiKleUtD2IhWUAmixl1FNRFsc_aWr8")

# ✅ Load Legal-BERT
bert_tokenizer = AutoTokenizer.from_pretrained("nlpaueb/legal-bert-base-uncased")
bert_model = AutoModelForMaskedLM.from_pretrained("nlpaueb/legal-bert-base-uncased")

# Load spaCy for legal entity recognition
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    # If model not found, download it
    import subprocess
    subprocess.run(["python", "-m", "spacy", "download", "en_core_web_sm"])
    nlp = spacy.load("en_core_web_sm")

# Create fill-mask pipeline for term predictions
fill_mask = pipeline(
    "fill-mask",
    model=bert_model,
    tokenizer=bert_tokenizer
)

# Define common legal terms dictionary for enhanced recognition
LEGAL_TERMS = {
    "high_risk": [
        "terminate", "termination", "breach", "damages", "penalty", "violation", 
        "liability", "indemnification", "indemnify", "warranty", "sue", "lawsuit",
        "claim", "arbitration", "dispute", "litigation", "court", "negligence",
        "material breach", "damages", "liquidated damages", "remedies", "injunction",
        "confidential", "proprietary", "intellectual property", "force majeure"
    ],
    "obligations": [
        "shall", "must", "will", "agrees to", "obligation", "required", "requirement",
        "comply", "compliance", "perform", "duty", "responsible", "responsibility"
    ],
    "limitations": [
        "limit", "limitation", "restrict", "restriction", "cap", "ceiling", "maximum",
        "minimum", "threshold", "not to exceed", "up to", "no more than"
    ],
    "timing": [
        "deadline", "due date", "term", "period", "duration", "expiration", "expire",
        "terminate", "renewal", "extension", "day", "month", "year", "notice period"
    ]
}

# 🧠 Gemini contract analysis
def gemini_analysis(contract_text):
    prompt = f"""
You are a legal AI assistant.

Analyze the following contract and return a clean JSON array where each object contains:

- "clause_type": (e.g., Arbitration, Indemnity, Confidentiality)
- "original_text": full clause
- "simplified_summary": a plain-English summary
- "risk_level": Low | Medium | High
- "suggested_rewording": recommended alternative
- "improvement_advice": (1–2 sentence tip to improve the clause)
- "risk_factor_score": numeric value: 1 for Low, 2 for Medium, 3 for High

Only respond with valid JSON.

Contract:
\"\"\"{contract_text}\"\"\"
"""
    try:
        model = genai.GenerativeModel("gemini-1.5-pro")
        response = model.generate_content(prompt)
        response_text = "".join([part.text for part in response.parts])
        return response_text
    except Exception as e:
        return f"Gemini Error: {str(e)}"

# Improved function to identify legal entities and terms
def extract_legal_entities(text):
    """Extract legal entities and important terms from the clause text."""
    important_terms = []
    
    # Use spaCy for named entity recognition
    doc = nlp(text)
    
    # Extract organizations, dates, money references, and percentages as important entities
    for ent in doc.ents:
        if ent.label_ in ['ORG', 'DATE', 'MONEY', 'PERCENT', 'LAW', 'GPE']:
            term = ent.text.strip()
            if term and len(term) > 1 and term not in important_terms:
                important_terms.append(term)
    
    # Find legal terms from our dictionary
    for category, terms in LEGAL_TERMS.items():
        for term in terms:
            if term.lower() in text.lower() and term not in important_terms:
                important_terms.append(term)
    
    # Find complex noun phrases that might be important terms
    for chunk in doc.noun_chunks:
        if len(chunk.text.split()) > 1 and len(chunk.text) > 5:  # multi-word terms
            term = chunk.text.strip()
            if term and term.lower() not in [t.lower() for t in important_terms]:
                important_terms.append(term)
    
    # Get unique important terms, limited to top 10
    return list(dict.fromkeys([t for t in important_terms if len(t.strip()) > 1]))[:10]

# ⚖ Enhanced Legal-BERT analysis with more accurate term extraction
def bert_analyze_clause(text):
    """Get deeper Legal-BERT insights for a given clause with improved term detection."""
    if not text or len(text.strip()) < 10:
        return {
            "bert_risk_level": "Medium",
            "important_terms": [],
            "term_alternatives": {}
        }
    
    # Extract important legal terms and entities
    important_terms = extract_legal_entities(text)
    
    # Generate term alternatives using BERT masked language model
    term_alternatives = {}
    
    # First, try key legal terms from our dictionary
    test_terms = []
    for terms in LEGAL_TERMS.values():
        for term in terms:
            if term.lower() in text.lower() and len(term) > 3:
                test_terms.append(term)
    
    # If no predefined terms found, use important terms we extracted
    if not test_terms and important_terms:
        test_terms = [term for term in important_terms if len(term.split()) == 1 and len(term) > 3][:5]
    
    # If still no terms, look for significant words
    if not test_terms:
        # Find nouns and verbs that might be important
        doc = nlp(text)
        for token in doc:
            if token.pos_ in ['NOUN', 'VERB'] and len(token.text) > 3:
                test_terms.append(token.text)
                if len(test_terms) >= 5:
                    break
    
    # Generate alternatives for each term
    for term in test_terms[:5]:  # Limit to 5 terms for efficiency
        try:
            # Create masked sentence
            if len(term.split()) == 1:  # Single word
                # Find the term in text with word boundaries
                pattern = r'\b' + re.escape(term) + r'\b'
                match = re.search(pattern, text, re.IGNORECASE)
                
                if match:
                    start, end = match.span()
                    masked_text = text[:start] + bert_tokenizer.mask_token + text[end:]
                    
                    # Use the fill-mask pipeline for more reliable predictions
                    results = fill_mask(masked_text)
                    
                    # Extract alternatives
                    alternatives = [result['token_str'] for result in results[:3]]
                    if alternatives:
                        term_alternatives[term] = alternatives
            else:  # Multi-word terms - handle the head word
                head_word = term.split()[-1]
                if len(head_word) > 3:
                    masked_version = term.replace(head_word, bert_tokenizer.mask_token)
                    if masked_version != term:  # Only if successful replacement
                        # Create a sample sentence with the masked term
                        sample = f"The contract states {masked_version}."
                        results = fill_mask(sample)
                        alternatives = [result['token_str'] for result in results[:3]]
                        if alternatives:
                            term_alternatives[term] = alternatives
        except Exception as e:
            continue  # Skip this term if there's an error
    
    # Run enhanced risk level assessment based on BERT
    risk_keywords = {
        'high': LEGAL_TERMS['high_risk'],
        'medium': LEGAL_TERMS['limitations'] + ['modify', 'change', 'adjust', 'conditional'],
        'low': ['notice', 'inform', 'standard', 'typical', 'customary']
    }
    
    # Count keywords by risk level
    risk_scores = {level: 0 for level in risk_keywords}
    
    # Assign weights to different risk categories
    for level, keywords in risk_keywords.items():
        for keyword in keywords:
            if re.search(r'\b' + re.escape(keyword.lower()) + r'\b', text.lower()):
                weight = 2 if level == 'high' else 1  # Give higher weight to high-risk terms
                risk_scores[level] += weight
    
    # Determine BERT's risk assessment
    max_risk = max(risk_scores.items(), key=lambda x: x[1])
    bert_risk_level = max_risk[0] if max_risk[1] > 0 else "medium"
    
    # Ensure we have at least some terms
    if not important_terms and test_terms:
        important_terms = test_terms
    
    # Ensure important_terms is never empty
    if not important_terms:
        # Extract key nouns and verbs as fallback
        doc = nlp(text)
        important_terms = [token.text for token in doc if token.pos_ in ['NOUN', 'VERB'] and len(token.text) > 3][:5]
    
    # Ensure term_alternatives is never empty
    if not term_alternatives and important_terms:
        for term in important_terms[:2]:
            term_alternatives[term] = ["alternative term", "replacement option"]
    
    return {
        "bert_risk_level": bert_risk_level.capitalize(),
        "important_terms": important_terms,
        "term_alternatives": term_alternatives
    }

# 📄 Extract text from PDF
def extract_text_from_pdf(pdf_file):
    try:
        reader = PyPDF2.PdfReader(pdf_file)
        return "".join([page.extract_text() or "" for page in reader.pages])
    except Exception as e:
        return f"PDF Error: {str(e)}"

# 🧼 Extract JSON from Gemini response
def clean_json_response(response_text):
    match = re.search(r"\[\s*{.*}\s*]", response_text, re.DOTALL)
    return match.group(0).strip() if match else response_text.strip()

# 🔄 Combine Gemini and BERT analyses
def combine_analyses(gemini_clause, bert_analysis):
    """Combine Gemini and BERT analyses for more accurate results."""
    
    # Convert risk levels to numeric scores for easier comparison
    risk_score_map = {"Low": 1, "Medium": 2, "High": 3}
    bert_risk_score_map = {"Low": 1, "Medium": 2, "High": 3}
    
    gemini_risk = gemini_clause.get("risk_level", "Medium")
    bert_risk = bert_analysis.get("bert_risk_level", "Medium")
    
    gemini_score = risk_score_map.get(gemini_risk, 2)
    bert_score = bert_risk_score_map.get(bert_risk, 2)
    
    # Calculate weighted average (giving more weight to Gemini for now)
    weighted_score = (gemini_score * 0.7) + (bert_score * 0.3)
    
    # Convert back to categorical risk level
    if weighted_score <= 1.5:
        combined_risk = "Low"
    elif weighted_score <= 2.5:
        combined_risk = "Medium"
    else:
        combined_risk = "High"
    
    # Extract important terms from BERT analysis
    important_terms = bert_analysis.get("important_terms", [])
    term_alternatives = bert_analysis.get("term_alternatives", {})
    
    # Enhance the improvement advice with BERT insights
    original_advice = gemini_clause.get("improvement_advice", "")
    enhanced_advice = original_advice
    
    # Always add term insights if available
    if important_terms:
        terms_str = ", ".join(important_terms[:3])
        if terms_str and not terms_str.isspace():
            enhanced_advice += f" Key legal terms to focus on: {terms_str}."
    
    # Add alternative wording suggestions
    if term_alternatives:
        # Choose the first term that has alternatives
        for term, alternatives in term_alternatives.items():
            if alternatives:
                alt_str = " or ".join(alternatives[:2])
                enhanced_advice += f" Consider replacing '{term}' with '{alt_str}' for clarity."
                break
    
    # Return combined analysis with guaranteed populated fields
    #return extracted text also

    return {
        "clause_type": gemini_clause.get("clause_type", "General"),
        "original_text": gemini_clause.get("original_text", ""),
        **gemini_clause,
        "risk_level": combined_risk,
        "risk_factor_score": round(weighted_score),
        "improvement_advice": enhanced_advice,
        "bert_insights": {
            "risk_level": bert_risk,
            "important_terms": important_terms if important_terms else ["No critical terms identified"],
            "term_alternatives": term_alternatives if term_alternatives else 
                                {important_terms[0] if important_terms else "clause": 
                                 ["alternative wording", "clearer language"]}
        }
    }

# Split contract into clauses
def split_into_clauses(contract_text):
    """Split contract text into logical clauses for better analysis."""
    # Simple splitting by section numbers and periods
    clause_patterns = [
        r'\n\d+\.\s+[A-Z].*?(?=\n\d+\.\s+[A-Z]|\Z)',  # Numbered sections
        r'\n[A-Z][A-Z\s]+\n.*?(?=\n[A-Z][A-Z\s]+\n|\Z)',  # ALL CAPS headers
        r'\n[A-Z][a-zA-Z\s]+\.\s+.*?(?=\n[A-Z][a-zA-Z\s]+\.|\Z)'  # Sentence headers
    ]
    
    clauses = []
    for pattern in clause_patterns:
        matches = re.findall(pattern, "\n" + contract_text, re.DOTALL)
        if matches:
            clauses.extend(matches)
    
    # If no structured clauses found, fall back to paragraph splitting
    if not clauses:
        paragraphs = re.split(r'\n\s*\n', contract_text)
        clauses = [p for p in paragraphs if len(p.strip()) > 100]  # Only substantial paragraphs
    
    # If still no good splits, use sentence tokenization as last resort
    if not clauses or all(len(clause) < 100 for clause in clauses):
        sentences = sent_tokenize(contract_text)
        
        # Group sentences into logical clauses (roughly 3-5 sentences per clause)
        grouped_clauses = []
        current_group = []
        
        for sentence in sentences:
            current_group.append(sentence)
            if len(' '.join(current_group)) > 300 or sentence.strip().endswith(':'):
                grouped_clauses.append(' '.join(current_group))
                current_group = []
        
        if current_group:  # Add the last group if it exists
            grouped_clauses.append(' '.join(current_group))
        
        clauses = grouped_clauses
    
    return clauses

# 🚀 Main route
@app.route("/analyze", methods=["POST"])
def analyze_contract():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    uploaded_file = request.files["file"]
    contract_text = extract_text_from_pdf(uploaded_file)

    if contract_text.startswith("PDF Error"):
        return jsonify({"error": contract_text}), 500

    # Optional: Split contract into clauses if Gemini doesn't do it well
    # clauses = split_into_clauses(contract_text)
    # if clauses and len(clauses) > 1:
    #     contract_text = "\n\n".join(clauses[:20])  # Limit to 20 clauses to manage API usage
    
    raw_gemini_response = gemini_analysis(contract_text)
    cleaned_json = clean_json_response(raw_gemini_response)

    try:
        gemini_data = json.loads(cleaned_json)
    except json.JSONDecodeError as e:
        return jsonify({
            "error": "Failed to parse Gemini response",
            "raw_response": raw_gemini_response,
            "message": str(e)
        }), 500

    # Enhanced analysis with both models
    enhanced_analysis = []
    for clause in gemini_data:
        original_text = clause.get("original_text", "")[:512]
        
        # Ensure text is meaningful
        if len(original_text.strip()) < 10:
            continue
            
        # Get BERT insights with improved term extraction
        bert_insights = bert_analyze_clause(original_text)
        
        # Combine analyses ensuring no empty fields
        enhanced_clause = combine_analyses(clause, bert_insights)
        enhanced_analysis.append(enhanced_clause)

    return jsonify({"analysis": enhanced_analysis , "extracted_text": contract_text})

if __name__ == "__main__":
    app.run(debug=True)
