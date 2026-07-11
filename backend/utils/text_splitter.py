# Why this file is written:
# This utility file handles document chunking (splitting large text documents into smaller blocks).
# Chunking is a crucial step in RAG: if we embed the entire document at once, we lose detail.
# By splitting text into small overlapping paragraphs (e.g. 500 characters with 50 characters overlap),
# we can retrieve precise sentences that answer the user's question, preserving contextual accuracy.

from typing import List
from langchain_text_splitters import RecursiveCharacterTextSplitter

class TextSplitter:
    """
    Utility class wrapper around LangChain's RecursiveCharacterTextSplitter.
    """

    @staticmethod
    def split_text(text: str, chunk_size: int = 500, chunk_overlap: int = 50) -> List[str]:
        """
        Splits a raw text string into a list of smaller character chunks.
        It splits on paragraphs, newlines, and sentences recursively to keep semantic blocks intact.
        
        Inputs:
            text (str): The raw extracted text from a PDF/DOCX file.
            chunk_size (int): Max character count per chunk.
            chunk_overlap (int): Number of overlapping characters between adjacent chunks.
            
        Outputs:
            List[str]: List of text chunks.
        """
        if not text.strip():
            return []
            
        # RecursiveCharacterTextSplitter splits by list of delimiters: ["\n\n", "\n", " ", ""]
        # trying to keep paragraphs and sentences together as much as possible.
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            length_function=len
        )
        
        return splitter.split_text(text)
