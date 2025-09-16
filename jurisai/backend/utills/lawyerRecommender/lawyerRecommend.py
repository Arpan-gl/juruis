import chromadb
from langchain.vectorstores.chroma import Chroma
from langchain_community.embeddings import SentenceTransformerEmbeddings
from langchain.docstore.document import Document
import json
import os

# --- Example Input---
'''lawyers_data = [
    {
        "id": "L001",
        "name": "Anjali Sharma",
        "professional_summary": "Seasoned litigator with a focus on corporate law and intellectual property disputes. Proven track record in high-stakes negotiations and contract law.",
        "expertise": ["Corporate Law", "Intellectual Property", "Contract Law"],
        "experience_years": 15,
        "achievements": "Won the 'Corporate Lawyer of the Year' award in 2022. Successfully defended three major patent infringement cases.",
        "reputation_score": 4.8
    },
'''

PERSIST_DIRECTORY = "./chroma_db"

EMBEDDING_MODEL = SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")

def get_chromadb_client():
    """Initialize ChromaDB client with proper persistence settings."""
    return chromadb.PersistentClient(path=PERSIST_DIRECTORY)

def create_or_load_lawyer_vector_db(lawyers):
    os.makedirs(PERSIST_DIRECTORY, exist_ok=True)
    
    client = get_chromadb_client()
    
    try:
        collection = client.get_collection(name="lawyer_profiles")
        print(f"✅ Loaded existing collection with {collection.count()} documents")
    except Exception:
        collection = client.create_collection(
            name="lawyer_profiles",
            metadata={"description": "Collection of lawyer profiles"}
        )
        print("🆕 Created new collection")

    existing_data = collection.get()
    existing_ids = set(existing_data['ids']) if existing_data['ids'] else set()
    print(f"📋 Found {len(existing_ids)} existing lawyer profiles")

    documents = []
    ids = []
    metadatas = []
    
    for lawyer in lawyers:
        if lawyer['id'] in existing_ids:
            print(f"⏭️  Skipping existing lawyer: {lawyer['name']} ({lawyer['id']})")
            continue

        combined_text = (
            f"Name: {lawyer['name']}. "
            f"Expertise: {', '.join(lawyer['expertise'])}. "
            f"Summary: {lawyer['professional_summary']} "
            f"Achievements: {lawyer['achievements']} "
            f"Experience: {lawyer['experience_years']} years."
        )

        metadata = {
            "id": lawyer["id"],
            "name": lawyer["name"],
            "experience_years": lawyer["experience_years"],
            "reputation_score": lawyer["reputation_score"],
            "professional_summary": lawyer["professional_summary"],
            "expertise_list": ", ".join(lawyer['expertise'])
        }

        documents.append(combined_text)
        ids.append(lawyer["id"])
        metadatas.append(metadata)

    if documents:
        print(f"Adding {len(documents)} new lawyer profiles...")
        collection.add(
            documents=documents,
            ids=ids,
            metadatas=metadatas
        )
        print("New profiles added successfully")
    else:
        print(" No new profiles to add")

    return Chroma(
        collection_name="lawyer_profiles",
        embedding_function=EMBEDDING_MODEL,
        client=client,
        persist_directory=PERSIST_DIRECTORY
    )


def recommend_lawyers(user_story: str, top_k=3, weights=(0.5, 0.3, 0.2)):
    print(f"Searching for lawyers matching: '{user_story}'")
    
    try:
        client = get_chromadb_client()
        
        try:
            collection = client.get_collection("lawyer_profiles")
            count = collection.count()
            print(f"📋 Found collection with {count} profiles")
            
            if count == 0:
                print("Collection is empty! Please run create_or_load_lawyer_vector_db first.")
                return []
                
        except Exception as e:
            print(f" Collection 'lawyer_profiles' not found: {e}")
            print("Please run create_or_load_lawyer_vector_db first to populate the database.")
            return []
        
        vector_db = Chroma(
            collection_name="lawyer_profiles",
            embedding_function=EMBEDDING_MODEL,
            client=client,
            persist_directory=PERSIST_DIRECTORY
        )

        retrieved_docs = vector_db.similarity_search_with_relevance_scores(user_story, k=top_k)
        print(f"📊 Retrieved {len(retrieved_docs)} similar profiles")

        if not retrieved_docs:
            print("⚠️  No similar lawyers found. Try adjusting your search query.")
            return []

        final_candidates = []
        for doc, similarity_score in retrieved_docs:
            metadata = doc.metadata
            
            # Normalize scores
            norm_experience = min(metadata['experience_years'] / 30.0, 1.0)
            norm_reputation = metadata['reputation_score'] / 5.0

            # Calculate weighted final score
            w_sim, w_exp, w_rep = weights
            final_score = (w_sim * similarity_score) + \
                          (w_exp * norm_experience) + \
                          (w_rep * norm_reputation)

            final_candidates.append({
                "name": metadata['name'],
                "score": final_score,
                "details": {
                    "similarity": round(similarity_score, 4),
                    "experience": metadata['experience_years'],
                    "reputation": metadata['reputation_score'],
                    "summary": metadata['professional_summary'],
                    "expertise": metadata['expertise_list']
                }
            })

        # Sort by final score
        final_candidates.sort(key=lambda x: x['score'], reverse=True)
        print(f" Ranked {len(final_candidates)} lawyer recommendations")
        
        return final_candidates
        
    except Exception as e:
        print(f" Error during recommendation: {e}")
        return []


if __name__ == "__main__":
    
    user_case_1 = "My business partner is trying to steal our company's new software design. I need to protect our intellectual property and review our partnership contract."
    print(f"🔍 Finding lawyers for case: '{user_case_1}'")
    recommendations_1 = recommend_lawyers(user_case_1)
    if recommendations_1:
        print("Top recommendations:")
        print(json.dumps(recommendations_1, indent=2))
    print("-" * 50)

    user_case_2 = "My spouse and I are separating and we can't agree on who gets to live with our children. I need legal help."
    print(f"🔍 Finding lawyers for case: '{user_case_2}'")
    recommendations_2 = recommend_lawyers(user_case_2, weights=(0.6, 0.2, 0.2))
    if recommendations_2:
        print("Top recommendations:")
        print(json.dumps(recommendations_2, indent=2))
    print("-" * 50)
    