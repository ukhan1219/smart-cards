// server.js
import express from 'express';
import fileUpload from 'express-fileupload';
import axios from 'axios';
import cors from 'cors';
import OpenAI from "openai";
import dotenv from 'dotenv';
import session from 'express-session';
import passport from 'passport';
import { Strategy as googleStrategy } from 'passport-google-oauth20';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
const openai = new OpenAI({
    apiKey: process.env.OPEN_API_KEY,
  });
// Enable CORS for all routes
app.use(cors({
    origin: 'http://localhost:5173', // Allow requests from Vite frontend
    credentials: true // Allow credentials (cookies, sessions)
}));

app.use(fileUpload()); 



// Function to send a prompt to OpenAI for verification
const verifyReceipt = async (imageData) => {
        try {
        const base64Image = imageData.toString('base64');  // Convert binary image to base64 string
        const dataUrl = `data:image/jpeg;base64,${base64Image}`;
        // Create a message with text and base64-encoded image for the OpenAI Vision model
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",  // Replace with the appropriate Vision model
            messages: [
            {
                role: "user",
                content: [
                { type: "text", text: "Is this a receipt? Please respond with only true or false." },
                {
                    type: "image_url",
                    image_url: {
                      "url": dataUrl,  // Send the base64-encoded image directly
                    "detail": "high"
                    }
                }
            ]
            }
        ]
        });
    
          // Extract the result from OpenAI's response
        let result = response['choices'][0]['message']['content'].trim();  // Use let instead of const to allow reassignment

          // Remove punctuation
        result = result.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
    
        // Convert to lowercase and trim extra spaces
        result = result.toLowerCase().trim();
    
    
          // Log the comparison (Node.js uses console.log, not print)
    
          // Return true if the response is 'true', otherwise return false
        return result === 'true';
        } catch (error) {
        console.error('Error verifying the receipt:', error);
        throw new Error('Failed to verify the receipt.');
    }
};
const extractReceiptDetails = async (imageData) => {
    try {
        const base64Image = imageData.toString('base64');  // Convert binary image to base64 string
        const dataUrl = `data:image/jpeg;base64,${base64Image}`;
        
        const response = await openai.chat.completions.create({
            model: "gpt-4o",  // Replace with the appropriate Vision model
            messages: [
                {
                    role: "user",
                    content: [
                            { type: "text", text: 
                                `Obtain each good purchased, followed by the price of the good.An example should look EXACTLY like this:
                                calzone: 2.00
                                multi-grain wraps: 19.77
                                store-brand plant-based food: 1.97
                                store-brand sunflower: 1.97
                                store-brand sunflower: 1.97
                                store-brand sunflower: 1.97
                                bling beads: 4.99
                                great value: 9.97
                                lipton tea: 12.48
                                dry dog food: 12.46
                                tax: 4.59. 
                                If the product appears to be abbreviated, REPLACE do not append  with its normal product name for future categorization.` },
                        {
                            type: "image_url",
                            image_url: {
                                "url": dataUrl,  // Send the base64-encoded image directly
                                "detail": "high"
                            }
                        }
                    ]
                }
            ]
        });

        // Extract the result from OpenAI's response
        const result = response['choices'][0]['message']['content'].trim();

        // convert to json, lower case
        const items = result.split('\n');  // Split the result by new lines
        const receiptData = {
            items: [],
            tax: 0
        };

        // Process each line to extract the product and price
        items.forEach(item => {
            const [name, price] = item.split(':').map(str => str.trim());  // Split by colon and trim spaces
            if (name.toLowerCase() === 'tax') {
                receiptData.tax = parseFloat(price);  // If it's tax, store the tax amount
            } else {
                receiptData.items.push({
                    name: name.toLowerCase(),  // Lowercase the product name
                    price: parseFloat(price)   // Convert the price to a number
                });
            }
        });

        // remove items where name is '' or price is NaN
        receiptData.items = receiptData.items.filter(item => item.name && !isNaN(item.price));


        // add a total price to receiptData
        receiptData.total = parseFloat((receiptData.items.reduce((total, item) => total + item.price, 0) + receiptData.tax).toFixed(2));
        return receiptData;  // Return the extracted goods and prices
    } catch (error) {
        console.error('Error extracting receipt details:', error);
        throw new Error('Failed to extract receipt details.');
    }
};

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

        // Step 1: Verify if the image is a receipt using OpenAI's model
        const isReceipt = await verifyReceipt(image.data);

        if (!isReceipt) {
            return res.status(400).json({ message: 'The uploaded file is not recognized as a receipt.' });
        }

        // Step 2: Extract Item Details from the Receipt + Tax
        const receiptDetails = await extractReceiptDetails(image.data);

        // Step 3: Categorize the items in the receipt via pretrained model
        const pythonResponse = await axios.post('http://127.0.0.1:5001/autocategorize', {
            items: receiptDetails.items  // Send JSON object containing the items
        }, {
            headers: {
                'Content-Type': 'application/json'  // Make sure Content-Type is set to JSON
            }
        });

        
        const categorizedItems = pythonResponse.data;
        // remove receiptDetails.items and add categorizedItems
        receiptDetails.items = categorizedItems;

        console.log(receiptDetails);

        // Send the response back to the client
        // res.json(response.data);
        res.json({
            message: 'Image uploaded successfully!',
            fileName: image.name,
            fileSize: image.size,
            fileType: image.mimetype,
            productInfo: receiptDetails.items,
            tax: receiptDetails.tax,
            total: receiptDetails.total
        });

    } catch (error) {
        console.error('Error calling image recognition API:', error);
        res.status(500).send('Error processing the image.');
    }
});

dotenv.config();

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new googleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
  },
  function(accessToken, refreshToken, profile, done) {
    // Here we can associate the Google account with a user record in our database
    return done(null, profile);
  }
));

// Serialize user
passport.serializeUser(function(user, done) {
    done(null, user);
});
  
// Deserialize user
passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

// Routes for OAuth
app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  function(req, res) {
    // Successful authentication, redirect to frontend
    res.redirect('http://localhost:5173/upload');
  }
);

// A route to check if user is logged in
app.get('/api/user', (req, res) => {
    if (req.isAuthenticated()) {
      res.json(req.user);
    } else {
      res.status(401).send('Not authenticated');
    }
  });

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
