# Why this file is written:
# This service handles authentication operations: hashing passwords securely (using bcrypt)
# and generating JWT access tokens for authenticated user sessions.
# It encapsulates critical security procedures away from API routes.

from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
import bcrypt
from typing import Union, Any

# Import configurations (which will be created in backend/config.py)
from config import settings

class AuthService:
    """
    Service containing static helper methods for security, password encryption, 
    and JWT token creation/verification.
    """

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """
        Verify if a raw password matches its stored hash.
        
        Inputs:
            plain_password (str): Raw input from user login.
            hashed_password (str): Hashed password string from database.
            
        Outputs:
            bool: True if password matches, False otherwise.
        """
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8") if isinstance(hashed_password, str) else hashed_password
        )

    @staticmethod
    def get_password_hash(password: str) -> str:
        """
        Hash a raw password using bcrypt algorithm.
        
        Inputs:
            password (str): Raw user password to secure.
            
        Outputs:
            str: Hashed secure string to save in database.
        """
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

    @staticmethod
    def create_access_token(data: dict, expires_delta: Union[timedelta, None] = None) -> str:
        """
        Generate a JWT access token containing secure payloads.
        
        Inputs:
            data (dict): Data dictionary to encrypt in the token (e.g., {"sub": email}).
            expires_delta (timedelta, optional): Custom token lifetime.
            
        Outputs:
            str: Encrypted JWT string.
            
        Flow:
            1. Copy user payload data.
            2. Determine expiration date (defaulting to config value if not provided).
            3. Encode the data payload using HMAC-SHA256 (HS256) signature and return token.
        """
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.now(timezone.utc) + expires_delta
        else:
            expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        
        # Add expiration timestamp claim (exp)
        to_encode.update({"exp": expire})
        
        # Generate encrypted token using settings key & algorithm
        encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
        return encoded_jwt

    @staticmethod
    def decode_access_token(token: str) -> Union[dict, None]:
        """
        Decrypt and verify a JWT access token.
        
        Inputs:
            token (str): Raw JWT token string from HTTP header.
            
        Outputs:
            dict: Decoded payload dictionary if token is valid, None if invalid or expired.
        """
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            return payload
        except JWTError:
            return None
