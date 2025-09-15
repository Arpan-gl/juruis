from langchain_community.vectorstores import FAISS
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain.docstore.document import Document
import json
import os
import pickle
import sys
from typing import List, Dict, Any

def create_scheme_embeddings(scheme_data: List[Dict[str, Any]], output_path: str = "scheme_indices_eligibility_index") -> None:
    docs = []
    max_characters = 8000 * 4

    for scheme in scheme_data:
        scheme_name = scheme.get('scheme_name', '')
        details = scheme.get('details', '')
        eligibility = scheme.get('eligibility', '')
        content = f"{scheme_name}\n{details}\n{eligibility}"
        if len(content) > max_characters:
            print(f"Content too long for {scheme_name}, truncating to {max_characters} characters")
            content = content[:max_characters]

        docs.append(Document(page_content=content, metadata={"source": scheme_name}))

    # Use Gemini embeddings
    embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
    vectorstore = FAISS.from_documents(docs, embeddings)

    # Save FAISS index in a directory using LangChain's save_local
    vectorstore.save_local(output_path)
    print(f"FAISS index saved at {output_path}")


def _load_json_schemes(json_path: str) -> List[Dict[str, Any]]:
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    if not isinstance(data, list):
        raise ValueError("Expected the JSON file to contain a list of schemes.")
    return data


def _ensure_google_api_key() -> None:
    if not os.getenv("GOOGLE_API_KEY"):
        raise EnvironmentError(
            "GOOGLE_API_KEY environment variable is not set. Set it before running embeddings."
        )


def main(argv: List[str]) -> int:
    # Minimal CLI parsing to avoid adding dependencies
    input_path = None
    output_path = "scheme_indices_eligibility_index"

    # Accept patterns:
    # python embeddings.py --input path --output path
    # python embeddings.py path
    i = 0
    while i < len(argv):
        arg = argv[i]
        if arg == "--input" and i + 1 < len(argv):
            input_path = argv[i + 1]
            i += 2
            continue
        if arg == "--output" and i + 1 < len(argv):
            output_path = argv[i + 1]
            i += 2
            continue
        if not arg.startswith("-") and input_path is None:
            input_path = arg
            i += 1
            continue
        i += 1

    if not input_path:
        print("Usage: python embeddings.py --input /path/to/schemes.json [--output /path/to/index_dir]")
        return 2

    _ensure_google_api_key()

    print(f"Loading schemes from: {input_path}")
    schemes = _load_json_schemes(input_path)
    print(f"Loaded {len(schemes)} schemes. Creating embeddings...")
    create_scheme_embeddings(schemes, output_path)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
