# Why this file is written:
# This service interacts directly with the AWS S3 SDK (boto3) to manage files.
# It uploads files, generates public URLs, and deletes files from the bucket.
# It is lazily initialized so it won't crash the application if AWS keys are not configured
# but the app is running in local storage fallback mode.

import boto3
from botocore.exceptions import ClientError
from typing import Dict, Any

# Import configurations
from config import settings

class S3Service:
    """
    AWS S3 interaction service wrapper.
    """

    _s3_client = None

    @classmethod
    def _get_client(cls):
        """
        Lazily instantiates and returns a boto3 S3 Client instance.
        """
        if cls._s3_client is None:
            # We pass credentials explicitly from configuration settings.
            # If not configured, boto3 will attempt standard environment/IAM role lookup.
            cls._s3_client = boto3.client(
                "s3",
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                region_name=settings.AWS_REGION
            )
        return cls._s3_client

    @classmethod
    def upload_file(cls, file_obj: Any, filename: str, content_type: str) -> Dict[str, Any]:
        """
        Uploads a raw file stream to S3.
        
        Inputs:
            file_obj (file-like): Raw bytes stream of the uploaded file.
            filename (str): Sanitized unique S3 key name.
            content_type (str): MIME file type (e.g. image/png).
            
        Outputs:
            Dict[str, Any]: Storage dict with S3 key and URL.
        """
        client = cls._get_client()
        bucket = settings.AWS_BUCKET_NAME
        
        if not bucket:
            raise ValueError("AWS_BUCKET_NAME configuration is missing. Cannot upload to S3.")
            
        try:
            # Upload the file stream using extra args to preserve content-type (allows inline browser reading)
            client.upload_fileobj(
                file_obj,
                bucket,
                filename,
                ExtraArgs={
                    "ContentType": content_type
                }
            )
            
            # Formulate the public S3 URL
            file_url = f"https://{bucket}.s3.{settings.AWS_REGION}.amazonaws.com/{filename}"
            
            return {
                "s3_key": filename,
                "file_url": file_url
            }
        except ClientError as e:
            raise Exception(f"S3 Upload failed: {e.response['Error']['Message']}")

    @classmethod
    def delete_file(cls, s3_key: str) -> bool:
        """
        Deletes a file object from S3.
        
        Inputs:
            s3_key (str): The object key to delete.
            
        Outputs:
            bool: True if deletion succeeded, False on client error.
        """
        client = cls._get_client()
        bucket = settings.AWS_BUCKET_NAME
        
        if not bucket:
            return False
            
        try:
            client.delete_object(Bucket=bucket, Key=s3_key)
            return True
        except ClientError:
            return False
