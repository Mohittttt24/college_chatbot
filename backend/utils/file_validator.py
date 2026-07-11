# Why this file is written:
# This utility file handles file validation. Before uploading any document to S3/local storage,
# we validate that its type is allowed (PDF, DOCX, JPG, JPEG, PNG) and its size does not exceed
# our configured limit (e.g. 10MB), preventing security exploits and server storage abuse.

from fastapi import UploadFile, HTTPException, status

# Configuration limits
MAX_FILE_SIZE_MB = 10
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

ALLOWED_EXTENSIONS = {"pdf", "docx", "jpg", "jpeg", "png"}
ALLOWED_CONTENT_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg",
    "image/png"
}

class FileValidator:
    """
    Utility class containing methods to validate file properties before ingestion.
    """

    @staticmethod
    def validate_file(file: UploadFile) -> bool:
        """
        Validates the type, size, and content of an uploaded file.
        Raises an HTTPException if validation fails.
        
        Inputs:
            file (UploadFile): The raw file stream uploaded by the client.
            
        Outputs:
            bool: True if the file passes all checks, raises HTTPException otherwise.
        """
        # 1. Check for empty files
        if not file.filename:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Filename is missing or empty."
            )
            
        # 2. Check file extension
        ext = file.filename.split(".")[-1].lower() if "." in file.filename else ""
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file extension: .{ext}. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
            )
            
        # 3. Check content type
        if file.content_type not in ALLOWED_CONTENT_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file content type: {file.content_type}."
            )

        # 4. Check file size
        # Seek to the end of the file to determine size, then seek back to start
        file.file.seek(0, 2)
        size = file.file.tell()
        file.file.seek(0)
        
        if size == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The uploaded file is empty (0 bytes)."
            )
            
        if size > MAX_FILE_SIZE_BYTES:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File is too large ({size / (1024*1024):.2f} MB). Maximum size allowed is {MAX_FILE_SIZE_MB} MB."
            )
            
        return True
