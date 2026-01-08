const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

async function debugPdf() {
    // Corrected path based on the user's workspace structure
    const filePath = path.join(__dirname, '../../uploads/knowledge-base/tkather/tkather01.pdf');
    
    console.log(`Checking file: ${filePath}`);

    if (!fs.existsSync(filePath)) {
        console.error("File not found!");
        return;
    }

    const dataBuffer = fs.readFileSync(filePath);

    try {
        const data = await pdf(dataBuffer);
        console.log("--- START OF PDF TEXT ---");
        console.log(data.text.substring(0, 1000)); // Print first 1000 chars
        console.log("--- END OF PDF TEXT ---");
    } catch (error) {
        console.error("Error parsing PDF:", error);
    }
}

debugPdf();