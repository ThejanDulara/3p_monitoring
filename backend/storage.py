import time
import secrets

# token -> {"created": ts, "df": pandas_df, "meta": {...}}
EXTRACT_STORE = {}

# job_id -> {"created": ts, "unmatched": df, "nilson": df, "summary": {...}}
RESULT_STORE = {}

TTL_SECONDS = 60 * 60  # 1 hour


def _cleanup(store: dict):
    now = time.time()
    dead = [k for k, v in store.items() if now - v["created"] > TTL_SECONDS]
    for k in dead:
        store.pop(k, None)


def new_token() -> str:
    return secrets.token_urlsafe(16)


def put_extract(df, meta=None) -> str:
    _cleanup(EXTRACT_STORE)
    token = new_token()
    EXTRACT_STORE[token] = {"created": time.time(), "df": df, "meta": meta or {}}
    return token


def get_extract(token: str):
    _cleanup(EXTRACT_STORE)
    return EXTRACT_STORE.get(token)


def put_result(unmatched_df, nilson_df, summary=None) -> str:
    _cleanup(RESULT_STORE)
    job_id = new_token()
    RESULT_STORE[job_id] = {
        "created": time.time(),
        "unmatched": unmatched_df,
        "nilson": nilson_df,
        "summary": summary or {}
    }
    return job_id


def get_result(job_id: str):
    _cleanup(RESULT_STORE)
    return RESULT_STORE.get(job_id)
