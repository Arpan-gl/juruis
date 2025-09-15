import os
import sys
import argparse
from typing import List

from langchain_community.vectorstores import FAISS
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain.schema.runnable import RunnablePassthrough

# Hardcoded Gemini API key fallback (used if env var is missing)
GEMINI_API_KEY_FALLBACK = "AIzaSyADhyKjaPuA9lC5owgQ-bzjD5mMUXqezH0"


def _ensure_google_api_key() -> None:
    if not os.getenv("GOOGLE_API_KEY"):
        if GEMINI_API_KEY_FALLBACK:
            os.environ["GOOGLE_API_KEY"] = GEMINI_API_KEY_FALLBACK
        else:
            raise EnvironmentError("GOOGLE_API_KEY is not set")


def format_docs(docs) -> str:
    parts: List[str] = []
    for d in docs:
        src = d.metadata.get("source", "") if hasattr(d, "metadata") else ""
        parts.append(f"Source: {src}\n{d.page_content}")
    return "\n\n".join(parts)


def build_chain(index_path: str, model_name: str):
    embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
    vectorstore = FAISS.load_local(index_path, embeddings, allow_dangerous_deserialization=True)
    retriever = vectorstore.as_retriever(search_kwargs={"k": 4})

    llm = ChatGoogleGenerativeAI(model=model_name, temperature=0.3)

    template = (
        "You are a helpful legal schemes assistant.\n"
        "Use the provided context to answer the question. If the answer isn't in the context, say you don't know.\n\n"
        "Context:\n{context}\n\n"
        "Question: {question}\n\n"
        "Answer:"
    )
    prompt = PromptTemplate.from_template(template)

    chain = {
        "context": retriever | format_docs,
        "question": RunnablePassthrough(),
    } | prompt | llm | StrOutputParser()

    return chain


GUIDED_QUESTIONS = [
    {"key": "category", "question": "Your category (SC/ST/OBC/General)?"},
    {"key": "gender", "question": "Your gender (Male/Female/Other)?"},
    {"key": "education_level", "question": "Highest education completed (Class 10/12/Undergrad/Postgrad)?"},
    {"key": "current_study", "question": "What are you currently studying or plan to study?"},
    {"key": "income", "question": "Family annual income (in INR lakhs)?"},
    {"key": "state", "question": "Your state/UT (optional, press Enter to skip)?"},
    {"key": "abroad", "question": "Interested in overseas studies? (yes/no)"},
]


def build_guided_prompt() -> PromptTemplate:
    template = (
        "You are a helpful assistant recommending suitable government schemes (scholarships/benefits).\n"
        "Given the user profile and retrieved scheme snippets, list the top 5 most relevant schemes.\n"
        "For each, output: 1) Scheme Name, 2) Why it matches, 3) Key eligibility, 4) Benefit summary.\n"
        "If unsure, say so.\n\n"
        "User Profile:\n{profile}\n\n"
        "Context (retrieved snippets):\n{context}\n\n"
        "Recommendations:"
    )
    return PromptTemplate.from_template(template)


def run_guided(index_path: str, model_name: str, answers: dict | None = None) -> None:
    embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
    vectorstore = FAISS.load_local(index_path, embeddings, allow_dangerous_deserialization=True)
    retriever = vectorstore.as_retriever(search_kwargs={"k": 8})
    llm = ChatGoogleGenerativeAI(model=model_name, temperature=0.2)

    provided = answers or {}
    if not answers:
        print("Let's collect a few details to recommend schemes. Press Enter to skip optional ones.\n")
        for q in GUIDED_QUESTIONS:
            val = input(f"{q['question']} ").strip()
            provided[q["key"]] = val

    profile_lines: List[str] = []
    for q in GUIDED_QUESTIONS:
        key = q["key"]
        val = provided.get(key, "")
        if val:
            profile_lines.append(f"{key}: {val}")
    profile = "\n".join(profile_lines)

    # Construct retrieval query from profile
    query_parts: List[str] = [
        provided.get("category", ""),
        provided.get("gender", ""),
        provided.get("education_level", ""),
        provided.get("current_study", ""),
        f"income {provided.get('income', '')} lakhs" if provided.get("income") else "",
        provided.get("state", ""),
        ("overseas" if str(provided.get("abroad", "")).lower().startswith("y") else ""),
        "eligibility benefits scholarship scheme",
    ]
    query = " ".join([p for p in query_parts if p]).strip()
    if not query:
        query = "recommend scholarship schemes eligibility benefits"

    retrieved_docs = retriever.get_relevant_documents(query)
    context = format_docs(retrieved_docs)

    prompt = build_guided_prompt()
    chain = prompt | llm | StrOutputParser()
    result = chain.invoke({"profile": profile, "context": context})
    print("\nRecommended Schemes:\n")
    print(result)


def main(argv: list) -> int:
    parser = argparse.ArgumentParser(description="RAG chatbot over schemes index (LangChain + Gemini)")
    parser.add_argument(
        "--index",
        default=os.path.join(os.path.dirname(__file__), "scheme_indices_eligibility_index"),
        help="Path to FAISS index directory",
    )
    parser.add_argument(
        "--model",
        default="gemini-1.5-flash",
        help="Gemini model name (e.g., gemini-1.5-flash, gemini-1.5-pro)",
    )
    parser.add_argument(
        "--question",
        help="Optional single question to ask. If omitted, enters interactive mode.",
    )
    parser.add_argument(
        "--guided",
        action="store_true",
        help="Start guided Q&A flow to recommend schemes",
    )
    parser.add_argument(
        "--answers",
        help="Optional JSON object with answers for non-interactive guided mode",
    )
    args = parser.parse_args(argv)

    _ensure_google_api_key()

    if args.guided:
        answers = None
        if args.answers:
            try:
                import json
                answers = json.loads(args.answers)
            except Exception:
                print("Could not parse --answers JSON. Falling back to interactive mode.")
        run_guided(args.index, args.model, answers)
        return 0

    chain = build_chain(args.index, args.model)

    if args.question:
        answer = chain.invoke(args.question)
        print(answer)
        return 0

    print("Loaded RAG chatbot. Type your questions (Ctrl+C to exit).\n")
    try:
        while True:
            q = input("You: ").strip()
            if not q:
                continue
            answer = chain.invoke(q)
            print(f"\nAssistant: {answer}\n")
    except KeyboardInterrupt:
        print("\nBye!")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))


