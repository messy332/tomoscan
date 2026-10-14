from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ...core.database import get_db
from ...core.deps import require_admin
from ...models.user import User
from ...models.scan import ScanRecord
from ...schemas.user import UserOut, UserUpdate
from ...schemas.scan import ScanListItem
from ...ml.classifier import get_evaluation_report

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/users", response_model=list[UserOut])
def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return db.query(User).order_by(User.created_at.desc()).offset(skip).limit(limit).all()


@router.patch("/users/{user_id}", response_model=UserOut)
def update_user(
    user_id: str,
    payload: UserUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")

    if payload.is_active is not None:
        user.is_active = payload.is_active
    if payload.role is not None:
        if payload.role not in ("member", "admin"):
            raise HTTPException(400, "Invalid role")
        user.role = payload.role

    db.commit()
    db.refresh(user)
    return user


@router.get("/scans", response_model=list[ScanListItem])
def all_scans(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return (
        db.query(ScanRecord)
        .order_by(ScanRecord.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.get("/evaluation")
def evaluation_report(_: User = Depends(require_admin)):
    """Full model evaluation report with cross-validation."""
    return get_evaluation_report()
