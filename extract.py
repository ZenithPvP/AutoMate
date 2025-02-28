import fitz  # PyMuPDF
from supabase import create_client, Client

# Supabase credentials
SUPABASE_URL = "https://socrnumzdhcgdzutuezy.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvY3JudW16ZGhjZ2R6dXR1ZXp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5NDI5MDQsImV4cCI6MjA1NTUxODkwNH0.buHWVhRmNYXdZa-jSH4r3IM4xqFYqAt6oPGnI4Z_BjQ"

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