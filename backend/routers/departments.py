from fastapi import APIRouter, Depends
from pydantic import BaseModel

import models

from dependencies import require_role


router = APIRouter(
    prefix="/departments",
    tags=["Departments"]
)


# ==========================
# Department Schema
# ==========================

class DepartmentCreate(BaseModel):

    department_name: str
    description: str | None = None


# ==========================
# Get Active Departments
# ==========================

@router.get("/")
def get_all_departments(

    current_user = Depends(
        require_role(
            ["SuperAdmin", "HospitalAdmin"]
        )
    )

):

    departments = models.get_departments(
        current_user["hospital_id"]
    )

    return {

        "departments": departments

    }


# ==========================
# Create Department
# ==========================

@router.post("/")
def create_department(

    department: DepartmentCreate,

    current_user = Depends(
        require_role(
            ["SuperAdmin", "HospitalAdmin"]
        )
    )

):

    department_id = models.create_department(

        current_user["hospital_id"],

        department.department_name,

        department.description

    )

    return {

        "message": "Department created successfully",

        "department_id": department_id

    }


# ==========================
# Update Department
# ==========================

@router.put("/{department_id}")
def update_department(

    department_id: int,

    department: DepartmentCreate,

    current_user = Depends(
        require_role(
            ["SuperAdmin", "HospitalAdmin"]
        )
    )

):

    affected_rows = models.update_department(

        department_id,

        current_user["hospital_id"],

        department.department_name,

        department.description

    )

    if affected_rows == 0:

        return {

            "message": "Department not found"

        }

    return {

        "message": "Department updated successfully"

    }


# ==========================
# Deactivate Department
# ==========================

@router.delete("/{department_id}")
def deactivate_department(

    department_id: int,

    current_user = Depends(
        require_role(
            ["SuperAdmin", "HospitalAdmin"]
        )
    )

):

    affected_rows = models.deactivate_department(

        department_id,

        current_user["hospital_id"]

    )

    if affected_rows == 0:

        return {

            "message": "Department not found"

        }

    return {

        "message": "Department deactivated successfully"

    }
