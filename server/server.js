// server.js
import express from 'express';
import fileUpload from 'express-fileupload';
import axios from 'axios';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(fileUpload());

app.post('/upload', async (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }   

    const image = req.files.image;

    // Example: Use Google Cloud Vision API or similar.
    try {
        const response = await axios.post('/api/upload', {
            image: image.data,
            // Additional parameters...
        });

        // Send the response back to the client
        res.json(response.data);
    } catch (error) {
        console.error('Error calling image recognition API:', error);
        res.status(500).send('Error processing the image.');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
