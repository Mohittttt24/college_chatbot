# Why this file is written:
# This file defines API dependencies injected into routes using FastAPI's Depends() syntax.
# It handles database session management (opening/closing connections per request),
# parses incoming OAuth2 Bearer JWT tokens, and validates current user identities and roles (Admin check).

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from typing import Generator, Optional
from jose import jwt, JWTError

# Import database factories, configurations, and schemas
from database import SessionLocal
from config import settings
from models.user import User
from schemas.user import TokenData

# OAuth2PasswordBearer defines where FastAPI should retrieve the bearer token from (the /auth/login path)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login", auto_error=False)

def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency that yields a database session.
    Automatically closes the connection after the API request is completed.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(token: Optional[str] = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    """
    FastAPI dependency that extracts and validates a JWT access token, returning
    the associated User database record. Throws 401 if token is invalid or expired.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate login credentials.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    if not token:
        raise credentials_exception
        
    try:
        # Decrypt payload containing standard claims (sub = email)
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
        
    # Check database to see if the user exists
    user = db.query(User).filter(User.email == token_data.email).first()
    if user is None:
        raise credentials_exception
        
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="User account is deactivated."
        )
        
    return user

def get_current_admin_user(current_user: User = Depends(get_current_user)) -> User:
    """
    FastAPI dependency that verifies the current authenticated user has administrative
    privileges (is_admin=True). Throws 403 Forbidden if not.
    """
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrative privileges required to access this endpoint."
        )
    return current_user

def get_optional_current_user(token: Optional[str] = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Optional[User]:
    """
    FastAPI dependency that attempts to validate a user token but does not fail if none is supplied.
    Allows public endpoints (like Chatbot QA) to optionally link conversations to profiles.
    """
    if not token:
        return None
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            return None
        user = db.query(User).filter(User.email == email).first()
        return user
    except JWTError:
        return None
