# Why this file is written:
# This service is responsible for reading uploaded files (specifically PDFs and DOCX files)
# and extracting their text content. The extracted text is then chunked and sent to the
# vector database (Qdrant) so it can be queried by the RAG model.

import os
from typing import List
import pypdf
from docx import Document as DocxDocument

class DocumentService:
    """
    Service containing methods for extracting text from different file types (PDF, DOCX).
    """

    @staticmethod
    def extract_text_from_pdf(file_path: str) -> str:
        """
        Extracts raw text content from a PDF file using the `pypdf` library.
        
        Inputs:
            file_path (str): The absolute local filesystem path to the PDF file.
            
        Outputs:
            str: Extracted text content from all pages merged together.
            
        Flow:
            1. Open the PDF file using PdfReader.
            2. Iterate through each page and extract text.
            3. Join and return clean extracted text.
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"PDF file not found at path: {file_path}")
            
        text = []
        reader = pypdf.PdfReader(file_path)
        for page_num, page in enumerate(reader.pages):
            page_text = page.extract_text()
            if page_text:
                text.append(page_text)
                
        return "\n".join(text)

    @staticmethod
    def extract_text_from_docx(file_path: str) -> str:
        """
        Extracts raw text content from a Microsoft Word DOCX file using `python-docx`.
        
        Inputs:
            file_path (str): The absolute local filesystem path to the DOCX file.
            
        Outputs:
            str: Extracted text paragraphs joined by newlines.
            
        Flow:
            1. Load the document.
            2. Iterate through paragraphs and append text.
            3. Join paragraphs with newlines and return.
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"DOCX file not found at path: {file_path}")
            
        doc = DocxDocument(file_path)
        full_text = []
        for para in doc.paragraphs:
            if para.text.strip():
                full_text.append(para.text)
                
        return "\n".join(full_text)

    @classmethod
    def extract_text(cls, file_path: str) -> str:
        """
        Unified utility function to extract text based on the file extension.
        
        Inputs:
            file_path (str): Local path of the file.
            
        Outputs:
            str: Raw parsed text content.
        """
        _, ext = os.path.splitext(file_path.lower())
        if ext == ".pdf":
            return cls.extract_text_from_pdf(file_path)
        elif ext in [".docx", ".doc"]:
            return cls.extract_text_from_docx(file_path)
        else:
            raise ValueError(f"Unsupported file type for text extraction: {ext}")
