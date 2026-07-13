# Why this file is written:
# This router defines administrative endpoints. It allows admin users
# to manage static FAQs (CRUD operations: create, read, update, delete)
# stored in the PostgreSQL database.

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

# Import schemas, models, and dependencies
from schemas.faq import FAQCreate, FAQUpdate, FAQResponse
from models.faq import FAQ
from models.user import User
from schemas.user import UserResponse
from dependencies import get_db, get_current_admin_user

router = APIRouter(
    prefix="/admin",
    tags=["Admin FAQ Management"]
)

@router.post("/faqs", response_model=FAQResponse, status_code=status.HTTP_201_CREATED)
def create_faq(
    faq_in: FAQCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    """
    Creates a new predefined FAQ entry.
    
    Inputs:
        faq_in (FAQCreate): Question, answer, and optional category.
        db (Session): Database session.
        current_user: Admin check dependency.
        
    Outputs:
        FAQResponse: The created FAQ database record.
    """
    # Check if FAQ question already exists
    existing = db.query(FAQ).filter(FAQ.question == faq_in.question).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An FAQ with this question already exists."
        )

    db_faq = FAQ(
        question=faq_in.question,
        answer=faq_in.answer,
        category=faq_in.category
    )
    db.add(db_faq)
    db.commit()
    db.refresh(db_faq)
    return db_faq

@router.get("/faqs", response_model=List[FAQResponse])
def list_faqs(db: Session = Depends(get_db)):
    """
    Lists all predefined FAQ entries. Accessible by anyone.
    """
    faqs = db.query(FAQ).order_by(FAQ.category.asc(), FAQ.question.asc()).all()
    return faqs

@router.put("/faqs/{faq_id}", response_model=FAQResponse)
def update_faq(
    faq_id: int,
    faq_in: FAQUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    """
    Updates an existing FAQ entry (partial update supported).
    
    Inputs:
        faq_id (int): Database record ID.
        faq_in (FAQUpdate): Updated question, answer, or category.
        db (Session): Database session.
        current_user: Admin check dependency.
        
    Outputs:
        FAQResponse: The updated FAQ database record.
    """
    db_faq = db.query(FAQ).filter(FAQ.id == faq_id).first()
    if not db_faq:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="FAQ entry not found."
        )

    # Apply updates dynamically
    update_data = faq_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_faq, key, value)

    db.commit()
    db.refresh(db_faq)
    return db_faq

@router.delete("/faqs/{faq_id}", status_code=status.HTTP_200_OK)
def delete_faq(
    faq_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    """
    Deletes an FAQ entry from the database.
    
    Inputs:
        faq_id (int): Record ID.
        db (Session): Database session.
        current_user: Admin check dependency.
        
    Outputs:
        dict: Success message.
    """
    db_faq = db.query(FAQ).filter(FAQ.id == faq_id).first()
    if not db_faq:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="FAQ entry not found."
        )

    db.delete(db_faq)
    db.commit()
    return {"message": "FAQ entry successfully deleted."}

@router.get("/users", response_model=List[UserResponse])
def list_users(
    db: Session = Depends(get_db),
    current_admin = Depends(get_current_admin_user)
):
    """
    Lists all registered users. Admin only.
    """
    users = db.query(User).order_by(User.id.asc()).all()
    return users

@router.delete("/users/{user_id}", status_code=status.HTTP_200_OK)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin = Depends(get_current_admin_user)
):
    """
    Deletes a user by ID. Admin only. Prevents self-deletion.
    """
    if current_admin.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot delete your own admin account."
        )

    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )

    db.delete(db_user)
    db.commit()
    return {"message": "User successfully deleted."}
