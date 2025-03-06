import fitz  # PyMuPDF
import os
from dotenv import load_dotenv
from supabase import create_client, Client


load_dotenv()

#extracts all the data from a pdf
# Supabase credentials
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

def extract_text_from_pdf(pdf_path):
    """Extract text from a PDF file"""
    doc = fitz.open(pdf_path)
    text = ""
    for page in doc:
        text += page.get_text("text") + "\n"
    return text

def upload_to_supabase(content):
    """Upload extracted text to Supabase"""
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    data = {"content": content}
    response = supabase.table("pdf_data").insert(data).execute()
    return response

def main(pdf_path):
    extracted_text = extract_text_from_pdf(pdf_path)
    upload_to_supabase(extracted_text)
    print("Upload successful")

if __name__ == "__main__":
    pdf_path = "honda_accord_2016_manual.pdf"  
    main(pdf_path)