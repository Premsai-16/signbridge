import json
from pathlib import Path
from threading import Lock
from typing import Any

from app.schemas.dataset import DatasetSample


DATA_DIRECTORY = Path(__file__).resolve().parents[2] / "data"
DATA_FILE = DATA_DIRECTORY / "isl_dataset.jsonl"

_storage_lock = Lock()


def save_sample(sample: DatasetSample) -> dict[str, Any]:
    DATA_DIRECTORY.mkdir(parents=True, exist_ok=True)

    sample_data = sample.model_dump(mode="json")

    with _storage_lock:
        if DATA_FILE.exists():
            with DATA_FILE.open("r", encoding="utf-8") as file:
                for line in file:
                    if not line.strip():
                        continue

                    existing = json.loads(line)

                    if existing.get("id") == sample.id:
                        raise ValueError("A sample with this ID already exists.")

        with DATA_FILE.open("a", encoding="utf-8") as file:
            file.write(
                json.dumps(sample_data, ensure_ascii=False) + "\n"
            )

    return {
        "id": sample.id,
        "label": sample.label,
        "signerId": sample.signerId,
        "stored": True,
    }


def get_dataset_stats() -> dict[str, Any]:
    DATA_DIRECTORY.mkdir(parents=True, exist_ok=True)

    total_samples = 0
    total_frames = 0
    signs: dict[str, int] = {}
    signer_count: set[str] = set()

    if DATA_FILE.exists():
        with DATA_FILE.open("r", encoding="utf-8") as file:
            for line in file:
                if not line.strip():
                    continue

                sample = json.loads(line)

                total_samples += 1
                total_frames += len(sample.get("frames", []))

                label = sample.get("label", "Unknown")
                signs[label] = signs.get(label, 0) + 1

                signer_id = sample.get("signerId")
                if signer_id:
                    signer_count.add(signer_id)

    return {
        "totalSamples": total_samples,
        "totalFrames": total_frames,
        "uniqueSigns": len(signs),
        "uniqueSigners": len(signer_count),
        "samplesPerSign": signs,
        "storageFormat": "JSONL",
    }