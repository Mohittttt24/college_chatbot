# Why this file is written:
# This router defines the API endpoints for user registration, user login, 
# token generation (JWT), and retrieving the current logged-in user profile.
# It uses the AuthService for password hashing/verification and JWT creation.

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

# Import schemas, models, and dependencies
from schemas.user import UserCreate, UserResponse, Token, UserLogin
from models.user import User
from services.auth_service import AuthService
from dependencies import get_db, get_current_user
from config import settings

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user_in: UserCreate, db: Session = Depends(get_db)):
    """
    Registers a new user in the database.
    
    Inputs:
        user_in (UserCreate): Email, full_name, is_admin, and password.
        db (Session): Database session.
        
    Outputs:
        UserResponse: The created user database object (excluding password).
        
    Flow:
        1. Check if email already exists.
        2. Hash plain password using AuthService.
        3. Create and save User record to PostgreSQL.
    """
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email address already exists."
        )
        
    # Hash password and create database model instance
    hashed_password = AuthService.get_password_hash(user_in.password)
    db_user = User(
        email=user_in.email,
        hashed_password=hashed_password,
        full_name=user_in.full_name,
        is_admin=user_in.is_admin
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/login", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
 
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not AuthService.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user account."
        )

    # Generate JWT token payload (storing email and admin scope)
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = AuthService.create_access_token(
        data={"sub": user.email, "is_admin": user.is_admin},
        expires_delta=access_token_expires
    )
    return Token(access_token=access_token, token_type="bearer")
    

@router.get("/me", response_model=UserResponse)
def read_current_user_profile(current_user: User = Depends(get_current_user)):
    """
    Protected endpoint to retrieve the currently logged-in user profile.
    
    Inputs:
        current_user (User): Extracted by get_current_user dependency verification.
        
    Outputs:
        UserResponse: Current user details.
    """
    return current_user