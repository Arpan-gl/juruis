from flask import Flask, request, jsonify
import PyPDF2
from flask_cors import CORS
import google.generativeai as genai
import io
import json
import re

app = Flask(__name__)
CORS(app)

# Configure Gemini API
genai.configure(api_key="AIzaSyC9HiiKleUtD2IhWUAmixl1FNRFsc_aWr8")

# Function to send prompt to Gemini
def gemini_request(prompt):
    model = genai.GenerativeModel("gemini-2.0-flash")
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Error: {str(e)}"

# Function to extract text from a PDF file
def extract_text_from_pdf(file):
    reader = PyPDF2.PdfReader(file)
    text = "".join([page.extract_text() for page in reader.pages if page.extract_text()])
    return text

# Function to extract JSON from Gemini response that might include code blocks
def extract_json_from_response(response_text):
    # Check if response is wrapped in code blocks
    json_match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', response_text)
    
    if json_match:
        json_str = json_match.group(1)
    else:
        json_str = response_text
    
    try:
        return json.loads(json_str)
    except json.JSONDecodeError:
        # Return an empty structure if parsing fails
        return {
            "differences": [],
            "risks": [],
            "favorable": []
        }

# Route to analyze contracts
@app.route("/analyze-contracts", methods=["POST"])
def analyze_contracts():
    if 'contract_a' not in request.files or 'contract_b' not in request.files:
        return jsonify({"status": "error", "message": "Please upload both contract files."}), 400
    
    file_a = request.files['contract_a']
    file_b = request.files['contract_b']
    
    try:
        # Extract text from both files
        text_a = extract_text_from_pdf(io.BytesIO(file_a.read()))
        text_b = extract_text_from_pdf(io.BytesIO(file_b.read()))
        
        # Gemini prompt
        prompt = f"""
        You are a legal AI assistant analyzing two legal contracts. Your task is to return structured, JSON-formatted insights suitable for a React-based frontend UI.

        Compare the following contracts in detail and return:

        1. differences: A list of major differences between Contract A and Contract B with the following structure:
           [
             {{
               "feature": "Termination Notice",
               "contractA": "30 days",
               "contractB": "15 days"
             }}
           ]

        2. risks: A list of risk factors in each contract with the following structure:
           [
             {{
               "contract": "A",
               "party": "John Doe",
               "description": "Unlimited potential liability. Without a liability clause, John Doe could potentially be held responsible for all damages."
             }}
           ]

        3. favorable: A list showing which terms are more favorable to which party with the following structure:
           [
             {{
               "feature": "Payment",
               "contractA": "Lower ($12,000)",
               "contractB": "Higher ($15,000)",
               "whyFavorable": "Less expensive for ABC Corp.; More income for John Doe."
             }}
           ]

        Format your response ONLY as a valid JSON object with these three keys: differences, risks, favorable.
        Do not include any text outside the JSON structure, no markdown formatting, no explanation, just the JSON.
        
        Contract A: {text_a}
        
        Contract B: {text_b}
        """
        
        # Get Gemini output
        comparison_result = gemini_request(prompt)
        
        # Parse the JSON response - extract from code blocks if needed
        parsed_result = extract_json_from_response(comparison_result)
        
        # Return the structured data
        return jsonify({
            "status": "success",
            "comparison_result": "Contracts successfully analyzed",
            "differences": parsed_result.get("differences", []),
            "risks": parsed_result.get("risks", []),
            "favorable": parsed_result.get("favorable", [])
        })
            
    except Exception as e:
        return jsonify({"status": "error", "message": f"An error occurred: {str(e)}"}), 500

# Run the app on port 3200
if __name__ == "__main__":
    app.run(debug=True, port=3200)