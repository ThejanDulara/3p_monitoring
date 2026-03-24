import pandas as pd

def test_logic():
    data = {"Advertiser": ["A"]*6, "Channel": ["C"]*6, "Date_key": ["D"]*6, "Dur": ["10"]*6, "Program": ["P"]*6}
    df = pd.DataFrame(data)
    
    spot_counts_data = {("A", "C", "D", "10", "P"): 6}
    
    matched_counts = {}
    time_range_matches = 2
    
    for i, row in df.iterrows():
        spot_key = (row["Advertiser"], row["Channel"], row["Date_key"], row["Dur"], row["Program"])
        required_matches = spot_counts_data.get(spot_key, 1)
        
        if spot_key not in matched_counts:
            matched_counts[spot_key] = 0
            
        if time_range_matches == 0:
            print(f"Row {i}: No match")
        elif time_range_matches < required_matches:
            if matched_counts[spot_key] < time_range_matches:
                matched_counts[spot_key] += 1
                print(f"Row {i}: Matched")
            else:
                print(f"Row {i}: Found only {time_range_matches} matches, needed {required_matches - time_range_matches} more")
        else:
            matched_counts[spot_key] += 1
            print(f"Row {i}: Matched")

test_logic()
