import re
from datetime import datetime, timedelta
import pandas as pd


def _to_time(x):
    if pd.isna(x):
        return None
    
    x_str = str(x).strip()
    if not x_str or x_str.lower() == 'none':
        return None
        
    # Replace dots with colons for time format, e.g., 10.00 AM -> 10:00 AM
    x_str = re.sub(r'(\d+)\.(\d+)', r'\1:\2', x_str)
    
    t = pd.to_datetime(x_str, errors="coerce")
    if pd.isna(t):
        return None
    return t.time()


def is_special_program(prog_val):
    if pd.isna(prog_val):
        return False
    p = str(prog_val).strip().lower()
    return p == "tag" or p.startswith("sponsorship")


def create_time_range(row):
    start_time = row["Prog_time"]

    morning_start = datetime.strptime("06:00:00", "%H:%M:%S").time()
    evening_start = datetime.strptime("18:00:00", "%H:%M:%S").time()
    evening_end = datetime.strptime("22:59:00", "%H:%M:%S").time()

    if is_special_program(row["Program"]):
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

                # 🔎 DEBUG PRINT HERE
        if start_time is None or end_time is None:
            print("Invalid time detected:")
            print("Program:", row["Program"])
            print("Start Time:", start_time)
            print("End Time:", end_time)
            print(row)
            return None, None

        start_dt = datetime.combine(datetime.today(), start_time)
        end_dt = datetime.combine(datetime.today(), end_time)

        start_range = (start_dt - timedelta(minutes=7)).time()
        
        if start_time.hour >= 22:
            end_range = (end_dt + timedelta(minutes=20)).time()
        else:
            end_range = (end_dt + timedelta(minutes=12)).time()

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

    columns = list(data.columns) + ["Aired_Status", "Aired_Row_Data"]
    all_records = pd.DataFrame(columns=columns)

    # --- schedule preprocessing (Time split, Date normalize) ---
    if "Time" in data.columns:
        # replace en-dash and em-dash with standard hyphen
        tmp_time = data["Time"].astype(str).str.replace("–", "-", regex=False).str.replace("—", "-", regex=False)
        tmp = tmp_time.str.split("-", expand=True)
        if tmp.shape[1] >= 2:
            data["Prog_time_raw"] = tmp[0].str.strip()
            data["End_Time_raw"] = tmp[1].str.strip()
        else:
            data["Prog_time_raw"] = tmp_time.str.strip()
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
    if "Advt_time" in data_n.columns:
        data_n["Advt_time"] = pd.to_datetime(data_n["Advt_time"], errors="coerce").dt.time

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
    
    for col in ["Advertiser", "Channel", "Program"]:
        if col in data.columns:
            data[col] = data[col].astype(str).str.strip().str.lower()
        if col in data_n.columns:
            data_n[col] = data_n[col].astype(str).str.strip().str.lower()
    
    if "Dur" in data.columns:
        data["Dur"] = data["Dur"].astype(str).str.strip().str.replace(r'\.0$', '', regex=True)
    if "Dur" in data_n.columns:
        data_n["Dur"] = data_n["Dur"].astype(str).str.strip().str.replace(r'\.0$', '', regex=True)

    # Convert nilson Prog_time/Advt_time if first row is string
    if len(data_n) > 0:
        if "Prog_time" in data_n.columns and isinstance(data_n["Prog_time"].iloc[0], str):
            data_n["Prog_time"] = data_n["Prog_time"].apply(lambda x: datetime.strptime(x, "%H:%M:%S").time() if isinstance(x, str) else x)
        if "Advt_time" in data_n.columns and isinstance(data_n["Advt_time"].iloc[0], str):
            data_n["Advt_time"] = data_n["Advt_time"].apply(lambda x: datetime.strptime(x, "%H:%M:%S").time() if isinstance(x, str) else x)

    matched_counts = {}
    matched_indices = set()

    spot_counts_data = data.groupby(
        ["Advertiser", "Channel", "Date_key", "Dur", "Program"]
    )["Prog_time"].count().to_dict()

    row_match_idx = [None] * len(data)
    row_match_data = [""] * len(data)
    row_total_in_range = [0] * len(data)
    row_early_status = [None] * len(data)
    row_start_end = [None] * len(data)

    matched_indices = set()

    for step in [1, 2, 3]:
        for i in range(len(data)):
            row = data.iloc[i]
            
            # Skip rows already matched or failed early
            if row_match_idx[i] is not None or row_early_status[i] is not None:
                continue

            is_special = is_special_program(row["Program"])
            
            if step == 1 and is_special:
                continue
            if step == 2 and not is_special:
                continue
            if step == 3 and not is_special:
                continue

            if row_start_end[i] is None: # Only calculate once
                start_range, end_range = create_time_range(row)
                row_start_end[i] = (start_range, end_range)
            else:
                start_range, end_range = row_start_end[i]

            if is_special and (start_range is None or end_range is None):
                row_early_status[i] = "Tag/Sponsorship program outside allowed time ranges (6AM-6PM or 6PM-10:59PM)"
                continue

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

                row_early_status[i] = " & ".join(reason_parts) if reason_parts else "No match"
                continue

            # Filtering records by Theme if Step 2
            filtered_records = matched_records.copy()
            if step == 2 and is_special:
                if "Advt_Theme" in filtered_records.columns:
                    filtered_records = filtered_records[
                        filtered_records["Advt_Theme"].astype(str).str.strip().isin(
                            ["Tag", "-Tr", "-BB", " Com Break", "-Extro", "-Intro", " Time Check"]
                        )
                    ]
                else:
                    filtered_records = filtered_records.iloc[0:0]

                if len(filtered_records) == 0:
                    # Don't fail it yet! Let it try again in Step 3 without the theme filter.
                    continue

            # In Step 3, we allow any theme, meaning we just use `matched_records` as `filtered_records`
            
            consumed_idx = None
            matched_row_data = ""
            total_in_time_range = 0
            
            for match_idx, match_row in filtered_records.iterrows():
                time_to_check = match_row["Advt_time"] if ("Advt_time" in match_row and pd.notnull(match_row["Advt_time"])) else match_row["Prog_time"]
                if check_time_in_range(time_to_check, start_range, end_range):
                    total_in_time_range += 1
                    if match_idx not in matched_indices:
                        consumed_idx = match_idx
                        data_n.at[match_idx, "RO Number"] = ro_number
                        matched_indices.add(match_idx)
                        matched_row_data = " _ ".join(str(val) for val in match_row.values)
                        break

            # update state
            if consumed_idx is not None:
                row_match_idx[i] = consumed_idx
                row_match_data[i] = matched_row_data
            
            # Keep highest total_in_time_range to show user the availability across passes
            row_total_in_range[i] = max(row_total_in_range[i], total_in_time_range)
            
    # Now generate all_records in original order
    matched_counts = {}
    all_records_list = []
    
    for i in range(len(data)):
        row = data.iloc[i]
        spot_key = (row["Advertiser"], row["Channel"], row["Date_key"], row["Dur"], row["Program"])
        if spot_key not in matched_counts:
            matched_counts[spot_key] = 0
            
        row_dict = row.to_dict()
        
        if row_early_status[i] is not None:
            row_dict["Aired_Status"] = row_early_status[i]
            row_dict["Aired_Row_Data"] = ""
            all_records_list.append(row_dict)
            continue
            
        if row_match_idx[i] is not None:
            matched_counts[spot_key] += 1
            row_dict["Aired_Status"] = "Aired"
            row_dict["Aired_Row_Data"] = row_match_data[i]
        else:
            current_found = matched_counts[spot_key]
            required_matches = spot_counts_data.get(spot_key, 1)
            total_in_range = row_total_in_range[i]
            
            start_range, end_range = row_start_end[i]
            
            if current_found == 0:
                if total_in_range > 0:
                    row_dict["Aired_Status"] = f"Found 0 available matches, but {total_in_range} records existed in range {start_range}-{end_range} (consumed by other spots)"
                else:
                    if is_special_program(row["Program"]):
                        row_dict["Aired_Status"] = f"No matching available theme or time found in range {start_range} to {end_range}"
                    else:
                        row_dict["Aired_Status"] = f"No matching program time found in range {start_range} to {end_range}"
            else:
                needed_more = required_matches - current_found
                row_dict["Aired_Status"] = f"Found only {current_found} matches, needed {needed_more} more"
            row_dict["Aired_Row_Data"] = ""
            
        all_records_list.append(row_dict)

    all_records = pd.DataFrame(all_records_list, columns=columns)
    unmatched_records = all_records[all_records["Aired_Status"] != "Aired"].copy()

    return unmatched_records, all_records, data_n

