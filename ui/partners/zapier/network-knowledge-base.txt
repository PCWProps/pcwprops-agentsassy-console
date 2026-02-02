# Normalization Rules (Critical)

- Treat all text as lowercase.
- Trim leading/trailing whitespace.
- For list-style inputs (network_issues, add_on_services):
  - Accept commas, new lines, or | as separators.
  - Convert into a list of clean strings.
- If an input is empty or missing, treat it as an empty list or empty string.

---

## Scoring Logic

Initialize `qualification_score = 0`.

### 1. Network Issues (each adds +2)

Add 2 points for each item present:

- poor coverage
- slow speeds
- dropouts
- device overload
- security concerns

---

### 2. Estimated Devices

- If `estimated_devices` is exactly:
  - `10-30` or `10–30` → +1
  - `30-60`, `30–60`, or `60+` → +2

---

### 3. Add-On Services

Add points if present:

- guest network → +1
- vlan segmentation → +2
- iot isolation → +2
- vpn / remote access OR vpn remote access → +2
- content filtering → +1
- managed network → +3

---

### 4. New Hardware Allowed

If `new_hardware_allowed` equals any of the following, add +1:

- yes - recommend
- yes – recommend
- yes - preferred brands
- yes – preferred brands