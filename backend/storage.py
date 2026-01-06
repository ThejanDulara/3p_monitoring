import os
import redis
import pickle
import time

REDIS_URL = os.getenv("REDIS_URL")
r = redis.from_url(REDIS_URL, decode_responses=False)

EXTRACT_TTL = 60 * 60        # 1 hour
RESULT_TTL = 60 * 60 * 2    # 2 hours


def put_extract(df, meta=None):
    token = f"extract:{int(time.time()*1000)}"
    payload = {
        "df": df,
        "meta": meta or {}
    }
    r.setex(token, EXTRACT_TTL, pickle.dumps(payload))
    return token


def get_extract(token):
    raw = r.get(token)
    if not raw:
        return None
    return pickle.loads(raw)


def put_result(unmatched_df, nilson_df, summary=None):
    job_id = f"result:{int(time.time()*1000)}"
    payload = {
        "unmatched": unmatched_df,
        "nilson": nilson_df,
        "summary": summary or {}
    }
    r.setex(job_id, RESULT_TTL, pickle.dumps(payload))
    return job_id


def get_result(job_id):
    raw = r.get(job_id)
    if not raw:
        return None
    return pickle.loads(raw)
