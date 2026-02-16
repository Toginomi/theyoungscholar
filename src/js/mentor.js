const API_KEY = 'AIzaSyDXuFthP6G66zGNs1AXH9Ixy1EpP-bvSuk'; 
const SHEET_ID = '1kN86UlO-dPnrDFtGZVw6gJAU6xoUzLjxD3nqpjapTYY'; // Different Sheet ID if it's a separate file
const RANGE = 'Sheet1!A2:E'; // Adjust columns based on your headers

export async function fetchMentors() {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch mentors');

        const data = await response.json();
        const rows = data.values;

        if (!rows) return [];

        // Map rows to Mentor Objects
        // Assumed Sheet Headers: Name | Role | Bio | Image URL | School/Campus
        const mentors = rows.map(row => ({
            name: row[0],
            role: row[1],
            bio: row[2],
            image_url: row[3],
            campus: row[4]
        }));

        return mentors;

    } catch (error) {
        console.error('Error loading mentors:', error);
        return [];
    }
}