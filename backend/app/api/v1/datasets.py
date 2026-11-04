from fastapi import APIRouter, HTTPException, status

from app.schemas.dataset import DatasetSample
from app.services.dataset_storage import (
    get_dataset_stats,
    save_sample,
)

router = APIRouter(
    prefix="/datasets",
    tags=["Dataset Management"],
)


@router.post(
    "/samples",
    status_code=status.HTTP_201_CREATED,
)
async def upload_dataset_sample(sample: DatasetSample):
    try:
        result = save_sample(sample)

        return {
            "message": "Dataset sample uploaded successfully.",
            "data": result,
        }

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(error),
        ) from error

    except OSError as error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not store the dataset sample.",
        ) from error


@router.get("/stats")
async def dataset_statistics():
    return get_dataset_stats()