from datetime import datetime, timedelta
import pandas as pd


def _to_time(x):
    t = pd.to_datetime(x, errors="coerce")
    if pd.isna(t):
        return None
    return t.time()


def create_time_range(row):
    start_time = row["Prog_time"]

    morning_start = datetime.strptime("06:00:00", "%H:%M:%S").time()
    evening_start = datetime.strptime("18:00:00", "%H:%M:%S").time()
    evening_end = datetime.strptime("22:59:00", "%H:%M:%S").time()

    if row["Program"] == "Tag":
        if isinstance(start_time, str):
            start_time = datetime.strptime(start_time, "%H:%M:%S").time()

        if morning_start <= start_time < evening_start:
            return morning_start, evening_start
        elif evening_start <= start_time <= evening_end:
            return evening_start, evening_end
        else:
            return None, None
    else:
        end_time = row["End_Time"]

        start_dt = datetime.combine(datetime.today(), start_time)
        end_dt = datetime.combine(datetime.today(), end_time)

        start_range = (start_dt - timedelta(minutes=7)).time()
        end_range = (end_dt + timedelta(minutes=5)).time()

        return start_range, end_range


def check_time_in_range(time_to_check, start_range, end_range):
    if isinstance(time_to_check, str):
        check_time = datetime.strptime(time_to_check, "%H:%M:%S").time()
    else:
        check_time = time_to_check

    if start_range > end_range:
        return check_time >= start_range or check_time <= end_range
    else:
        return start_range <= check_time <= end_range


def find_unmatched_records(schedule_df: pd.DataFrame, nilson_df: pd.DataFrame, ro_number: str):
    data = schedule_df.copy()
    data_n = nilson_df.copy()

    data_n["RO Number"] = ""

    columns = list(data.columns) + ["Unmatched_Reason"]
    unmatched_records = pd.DataFrame(columns=columns)

    # --- schedule preprocessing (Time split, Date normalize) ---
    if "Time" in data.columns:
        tmp = data["Time"].astype(str).str.split("-", expand=True)
        if tmp.shape[1] >= 2:
            data["Prog_time_raw"] = tmp[0]
            data["End_Time_raw"] = tmp[1]
        else:
            data["Prog_time_raw"] = data["Time"]
            data["End_Time_raw"] = None

    data["Prog_time"] = data.get("Prog_time_raw", data.get("Prog_time")).apply(_to_time)
    data["End_Time"] = data.get("End_Time_raw", data.get("End_Time")).astype(str).str.strip().apply(_to_time)
    data["Date"] = pd.to_datetime(data["Date"], dayfirst=True, errors="coerce")

    # required columns check
    for col in ["Advertiser", "Channel", "Program", "Dur"]:
        if col not in data.columns:
            raise ValueError(f"Schedule is missing required column: {col}")

    # --- nilson preprocessing ---
    if "Prog_time" in data_n.columns:
        data_n["Prog_time"] = pd.to_datetime(data_n["Prog_time"], errors="coerce").dt.time

    if all(c in data_n.columns for c in ["Dd", "Mn", "Yr"]):
        data_n["Date"] = pd.to_datetime(
            data_n[["Dd", "Mn", "Yr"]].astype(str).agg("-".join, axis=1),
            format="%d-%m-%Y",
            errors="coerce"
        )
    elif "Date" in data_n.columns:
        data_n["Date"] = pd.to_datetime(data_n["Date"], errors="coerce")

    # normalize for matching
    data["Date_key"] = pd.to_datetime(data["Date"], errors="coerce").dt.strftime("%Y-%m-%d")
    data_n["Date_key"] = pd.to_datetime(data_n["Date"], errors="coerce").dt.strftime("%Y-%m-%d")

    # Convert nilson Prog_time if first row is string
    if len(data_n) > 0 and isinstance(data_n["Prog_time"].iloc[0], str):
        data_n["Prog_time"] = data_n["Prog_time"].apply(lambda x: datetime.strptime(x, "%H:%M:%S").time())

    matched_counts = {}
    matched_indices = set()

    spot_counts_data = data.groupby(
        ["Advertiser", "Channel", "Date_key", "Dur", "Program"]
    )["Prog_time"].count().to_dict()

    for _, row in data.iterrows():
        start_range, end_range = create_time_range(row)

        if row["Program"] == "Tag" and (start_range is None or end_range is None):
            row_dict = row.to_dict()
            row_dict["Unmatched_Reason"] = "Tag program outside allowed time ranges (6AM-6PM or 6PM-10:59PM)"
            unmatched_records = pd.concat([unmatched_records, pd.DataFrame([row_dict])], ignore_index=True)
            continue

        spot_key = (row["Advertiser"], row["Channel"], row["Date_key"], row["Dur"], row["Program"])

        matched_records = data_n[
            (data_n["Advertiser"] == row["Advertiser"]) &
            (data_n["Channel"] == row["Channel"]) &
            (data_n["Date_key"] == row["Date_key"]) &
            (data_n["Dur"] == row["Dur"])
        ]

        if len(matched_records) == 0:
            reason_parts = []
            if len(data_n[data_n["Advertiser"] == row["Advertiser"]]) == 0:
                reason_parts.append("Advertiser not found")
            if len(data_n[data_n["Channel"] == row["Channel"]]) == 0:
                reason_parts.append("Channel not found")
            if len(data_n[data_n["Date_key"] == row["Date_key"]]) == 0:
                reason_parts.append("Date not found")
            if len(data_n[data_n["Dur"] == row["Dur"]]) == 0:
                reason_parts.append("Duration not found")

            row_dict = row.to_dict()
            row_dict["Unmatched_Reason"] = " & ".join(reason_parts) if reason_parts else "No match"
            unmatched_records = pd.concat([unmatched_records, pd.DataFrame([row_dict])], ignore_index=True)
            continue

        if row["Program"] == "Tag":
            if "Advt_Theme" in matched_records.columns:
                matched_records = matched_records[
                    matched_records["Advt_Theme"].astype(str).str.strip().isin(
                        ["Tag", "-Tr", "-BB", " Com Break", "-Extro", "-Intro", " Time Check"]
                    )
                ]
            else:
                matched_records = matched_records.iloc[0:0]

            if len(matched_records) == 0:
                row_dict = row.to_dict()
                row_dict["Unmatched_Reason"] = "No matching Tag theme found"
                unmatched_records = pd.concat([unmatched_records, pd.DataFrame([row_dict])], ignore_index=True)
                continue

        time_range_matches = 0
        for match_idx, match_row in matched_records.iterrows():
            if check_time_in_range(match_row["Prog_time"], start_range, end_range):
                time_range_matches += 1
                if match_idx not in matched_indices:
                    data_n.at[match_idx, "RO Number"] = ro_number
                    matched_indices.add(match_idx)

        if spot_key not in matched_counts:
            matched_counts[spot_key] = 0
        if time_range_matches > 0:
            matched_counts[spot_key] += 1

        required_matches = spot_counts_data.get(spot_key, 1)
        current_matches = matched_counts[spot_key]

        if time_range_matches == 0:
            row_dict = row.to_dict()
            row_dict["Unmatched_Reason"] = f"No matching program time found in range {start_range} to {end_range}"
            unmatched_records = pd.concat([unmatched_records, pd.DataFrame([row_dict])], ignore_index=True)
        elif current_matches < required_matches and time_range_matches < (required_matches - current_matches):
            row_dict = row.to_dict()
            row_dict["Unmatched_Reason"] = f"Found only {time_range_matches} matches, needed {required_matches - current_matches} more"
            unmatched_records = pd.concat([unmatched_records, pd.DataFrame([row_dict])], ignore_index=True)

    return unmatched_records, data_n
