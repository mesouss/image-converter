// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000; // Use PORT from environment variable or default to 3000

// Middleware to parse JSON requests
app.use(bodyParser.json({ limit: '50mb' }));

// Endpoint for image conversion
app.post('/convert', async (req, res) => {
    try {
        const { image, format } = req.body;

        if (!image || !format) {
            return res.status(400).send({ error: 'Image data or format missing' });
        }

        // Supported formats validation
        const supportedFormats = ['jpeg', 'png', 'webp', 'tiff'];
        if (!supportedFormats.includes(format)) {
            return res.status(400).send({ error: `Unsupported format. Supported formats: ${supportedFormats.join(', ')}` });
        }

        // Decode the base64 image
        const buffer = Buffer.from(image.split(',')[1], 'base64');

        // Set output file path
        const outputFilePath = path.join(__dirname, `output.${format}`);

        // Perform conversion using sharp
        await sharp(buffer).toFormat(format).toFile(outputFilePath);

        // Send the converted image back as a base64 URL
        const convertedImage = fs.readFileSync(outputFilePath, { encoding: 'base64' });
        const convertedImageUrl = `data:image/${format};base64,${convertedImage}`;

        // Delete the file after sending it
        fs.unlinkSync(outputFilePath);

        res.send({ convertedImageUrl });
    } catch (error) {
        console.error('Error during image conversion:', error);
        res.status(500).send({ error: 'Image conversion failed' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
});
