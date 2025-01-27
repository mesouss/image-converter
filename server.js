// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000; // Use PORT from environment variable or default to 3000

// Middleware
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Serve the HTML page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Image conversion endpoint
app.post('/convert', async (req, res) => {
    try {
        const { image, format } = req.body;

        if (!image || !format) {
            return res.status(400).send({ error: 'Image data or format missing' });
        }

        // Supported formats validation
        const supportedFormats = ['jpeg', 'png', 'webp', 'tiff', 'gif', 'bmp'];
        if (!supportedFormats.includes(format)) {
            return res.status(400).send({ error: `Unsupported format. Supported formats: ${supportedFormats.join(', ')}` });
        }

        // Decode the base64 image
        const buffer = Buffer.from(image.split(',')[1], 'base64');

        // Perform conversion using sharp
        const convertedBuffer = await sharp(buffer).toFormat(format).toBuffer();

        // Encode the converted image to base64
        const convertedImageUrl = `data:image/${format};base64,${convertedBuffer.toString('base64')}`;

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
