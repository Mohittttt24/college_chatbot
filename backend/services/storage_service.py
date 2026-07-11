# Why this file is written:
# This service abstracts the storage system of the application.
# It acts as a wrapper. If configured (via environment variables), it uploads documents to AWS S3.
# Otherwise, it falls back to saving files on the local filesystem (useful for local development).
# This prevents the backend from crashing if AWS credentials are not set up.

import os
import shutil
from fastapi import UploadFile
from typing import Dict, Any

# Import configs and the direct S3 service
from config import settings
from services.s3_service import S3Service

class StorageService:
    """
    Unified Storage interface to save and delete files either locally or via AWS S3.
    """

    def __init__(self):
        """
        Set up the local uploads directory if local storage is active.
        """
        self.use_s3 = settings.USE_S3_STORAGE
        self.local_upload_dir = settings.LOCAL_UPLOAD_DIR
        
        # Ensure the local upload folder exists if we aren't using S3
        if not self.use_s3 and not os.path.exists(self.local_upload_dir):
            os.makedirs(self.local_upload_dir, exist_ok=True)

    def save_file(self, file: UploadFile, custom_filename: str) -> Dict[str, Any]:
        """
        Saves an uploaded file to the configured storage medium (S3 or local).
        
        Inputs:
            file (UploadFile): The raw file stream uploaded via FastAPI.
            custom_filename (str): A sanitized, unique filename to prevent collisions.
            
        Outputs:
            Dict[str, Any]: A dictionary containing:
                - "s3_key" (str): Storage identifier (S3 key or local file path).
                - "file_url" (str): Public or local URL to download/view the file.
        """
        if self.use_s3:
            # Delegate directly to the boto3 S3 service
            return S3Service.upload_file(file.file, custom_filename, file.content_type)
        else:
            # Save file to local disk
            local_path = os.path.join(self.local_upload_dir, custom_filename)
            
            # Write bytes from the stream to local file
            with open(local_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
                
            # Create a mock local file url (accessible via static routing)
            file_url = f"/static/uploads/{custom_filename}"
            
            return {
                "s3_key": local_path,
                "file_url": file_url
            }

    def delete_file(self, s3_key: str) -> bool:
        """
        Deletes a stored file from the storage medium.
        
        Inputs:
            s3_key (str): The S3 key or local file path to remove.
            
        Outputs:
            bool: True if deletion was successful, False otherwise.
        """
        if self.use_s3:
            return S3Service.delete_file(s3_key)
        else:
            # Delete local file from disk
            if os.path.exists(s3_key):
                try:
                    os.remove(s3_key)
                    return True
                except Exception:
                    return False
            return False
