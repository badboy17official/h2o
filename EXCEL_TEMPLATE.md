# Example Teams Excel Template

Create an Excel file (.xlsx) with the following format:

## Required Columns

| Team ID  | Team Name        | Password   |
|----------|------------------|------------|
| TEAM001  | Alpha Warriors   | alpha123   |
| TEAM002  | Beta Coders      | beta456    |
| TEAM003  | Gamma Hackers    | gamma789   |
| TEAM004  | Delta Squad      | delta012   |
| TEAM005  | Epsilon Elite    | epsilon345 |

## Column Details

1. **Team ID** (Required)
   - Unique identifier for the team
   - Example: TEAM001, TEAM002, etc.
   - No spaces recommended
   - Max 50 characters

2. **Team Name** (Required)
   - Display name for the team
   - Example: "Alpha Warriors", "Code Ninjas"
   - Max 255 characters
   - Can contain spaces and special characters

3. **Password** (Required)
   - Plain text password (will be hashed automatically)
   - Example: alpha123, SecurePass2024
   - Recommend at least 6 characters
   - Max 100 characters

## Instructions

1. Create a new Excel file (.xlsx or .xls)
2. Add the three column headers in the first row
3. Fill in team data starting from row 2
4. Save the file
5. Upload via Admin Dashboard → Upload Teams tab

## Notes

- Duplicate Team IDs will be skipped
- All three columns are required for each team
- Passwords are automatically hashed before storage
- Teams can login immediately after upload
- Invalid rows will be reported in upload results

## Example File

You can download a sample Excel template with 10 pre-filled teams from the admin dashboard (coming soon) or create your own following this format.

## Common Issues

- **"Missing required fields"**: Ensure all three columns have values
- **"Team ID already exists"**: Use unique Team IDs for each team
- **"Only Excel files allowed"**: Upload .xlsx or .xls files only
