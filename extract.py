import fitz  # PyMuPDF
import os
from dotenv import load_dotenv
from supabase import create_client, Client
import re

load_dotenv()

# Supabase credentials
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def parse_pdf_filename(filename: str):
    """
    Parses a PDF filename in the format:
    make_model[_variant]_year_type.pdf
    and returns a dictionary with its components.
    """
    # Remove extension
    name = filename.lower().replace(".pdf", "")
    
    # Regex to extract components
    match = re.match(r"([a-z]+)_([a-z0-9]+)(?:_([a-z0-9]+))?_([0-9]{4})_([a-z]+)", name)
    
    if not match:
        raise ValueError(f"Filename '{filename}' does not match expected format.")
    
    make, model, variant, year, doc_type = match.groups()
    
    return {
        "make": make,
        "model": model,
        "variant": variant if variant else None,
        "year": int(year),
        "type": doc_type
    }

def extract_text_from_pdf(pdf_path):
    """Extract text from a PDF file"""
    try:
        doc = fitz.open(pdf_path)
        text = ""
        for page in doc:
            text += page.get_text("text") + "\n"
        return text
    except Exception as e:
        print(f"[ERROR] Failed to extract text from {pdf_path}: {e}")
        return None

def upload_to_supabase(content, pdf_name):
    """Upload extracted text to Supabase"""
    try:
        data = {
            "content": content,
            "pdf_name": pdf_name,
        }
        response = supabase.table("pdf_data").insert(data).execute()
        return response
    except Exception as e:
        print(f"[ERROR] Failed to upload {pdf_name} to Supabase: {e}")
        return None

def main(folder_path):
    for file in os.listdir(folder_path):
        if file.endswith(".pdf"):
            full_path = os.path.join(folder_path, file)
            print(f"Processing: {file}")
            text = extract_text_from_pdf(full_path)
            if text:
                try:
                    metadata = parse_pdf_filename(file)
                    data = {
                        "content": text,
                        "pdf_name": file,
                        "make": metadata["make"],
                        "model": metadata["model"],
                        "variant": metadata["variant"],
                        "year": metadata["year"],
                        "type": metadata["type"]
                    }
                    upload_response = supabase.table("pdf_data").insert(data).execute()
                    if upload_response:
                        print(f"[SUCCESS] Uploaded: {file}")
                    else:
                        print(f"[FAIL] Could not upload: {file}")
                except ValueError as ve:
                    print(f"[ERROR] Metadata parse failed: {ve}")
            else:
                print(f"[SKIPPED] No text extracted: {file}")


if __name__ == "__main__":
    pdf_folder = "pdf_batch"
    main(pdf_folder)
