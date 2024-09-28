// server.js
import express from 'express';
import fileUpload from 'express-fileupload';
import axios from 'axios';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for all routes
app.use(cors());  // CORS middleware should be placed before other middlewares

app.use(fileUpload()); 

app.post('/upload', async (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }   
    else{
        console.log(req.files);
    }
    const image = req.files.image;

    // Example: Use Google Cloud Vision API or similar.
    try {
        // const response = await axios.post('/api/upload', {
        //     image: image.data,
        //     // Additional parameters...
        // });
        console.log('Image uploaded:', image.name, image.data);

        // Send the response back to the client
        // res.json(response.data);
        res.json({
            message: 'Image uploaded successfully!',
            fileName: image.name,
            fileSize: image.size,
            fileType: image.mimetype
        });
        
    } catch (error) {
        console.error('Error calling image recognition API:', error);
        res.status(500).send('Error processing the image.');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
