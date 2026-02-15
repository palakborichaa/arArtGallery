# AR Artwork Viewer & Gallery

This application allows users to upload their artwork, view it in Augmented Reality (AR), and browse a curated art gallery with automatically populated artworks.

## 🎨 New Feature: Auto-Populate Gallery

**Automatically add beautiful artworks to your gallery with AI-generated descriptions!**

### Quick Setup:

1. **Add images to the data folder:**
   ```bash
   # The setup script creates this for you
   python3 setup_gallery.py
   ```

2. **Add your artwork images to `data/` folder**
   - Supported formats: JPG, PNG, GIF, BMP, WEBP, TIFF
   - Use descriptive filenames (e.g., "sunset_landscape.jpg")

3. **Auto-populate with one command:**
   ```bash
   python3 populate_artworks.py
   ```
   - Optionally enter your Gemini API key for AI descriptions
   - Or use without API key for fallback descriptions

4. **Or use the web interface:**
   - Start your server: `python3 app.py`
   - Visit: `http://127.0.0.1:7861/admin/populate`
   - Upload and process images through the web interface

### What the Auto-Population Does:

✅ **Realistic Metadata**: Generates authentic artist names, styles, mediums, dimensions  
✅ **AI Descriptions**: Uses Gemini AI to create compelling artwork descriptions  
✅ **Smart Pricing**: Assigns realistic artwork prices ($250-$15,000)  
✅ **3D Models**: Automatically creates GLB files for AR viewing  
✅ **Instant Gallery**: All artworks appear immediately on the buyer page  

### Example Generated Artwork:
- **Title**: "Whispers of Azure Dreams"
- **Artist**: "Georgia O'Keeffe"
- **Style**: "Abstract Expressionist"
- **Medium**: "Acrylic on Canvas"
- **Description**: "A mesmerizing exploration of color and form that captures the ethereal beauty of abstract expressionism through bold brushstrokes and luminous azure tones, inviting viewers into a dreamlike meditation on nature's hidden geometries."

## Live Demo

You can try the live demo at: [https://armodule-knu9fivlq-krushnalis-projects.vercel.app](https://armodule-knu9fivlq-krushnalis-projects.vercel.app)

## Features

### Original Features:
- Upload any image and convert to 3D AR model
- View artworks in AR directly from the browser
- Responsive design for mobile and desktop
- User authentication (signup/login)
- Separate buyer and seller interfaces

### New Gallery Features:
- 🤖 **AI-Powered Descriptions** using Google Gemini
- 🎨 **Automatic Metadata Generation** (artist, style, medium, etc.)
- 💰 **Realistic Pricing** based on artwork characteristics  
- 📱 **Mobile-Optimized** POST requests with retry logic
- 🔄 **Bulk Processing** of artwork images
- 🌐 **Web Interface** for easy management
- 🖼️ **Gallery Browsing** with filtering and search

## Frontend (React)

The UI is a **React** single-page app (Vite + React Router). The Flask backend serves the built app when `frontend/dist` exists.

- **Development:** Run both in parallel:
  - Backend: `python3 app.py` (or your usual port)
  - Frontend: `cd frontend && npm run dev` (Vite dev server with proxy to the backend at `http://127.0.0.1:5000`)
  - Open `http://localhost:5173` for the React app; API and auth go to the backend via proxy.
- **Production:** Build and serve from Flask:
  - `cd frontend && npm run build`
  - Start the backend; it will serve the SPA from `frontend/dist` for `/`, `/start`, `/select-role`, `/buyer`, `/seller`, `/ar-viewer`, and `/artwork/:id`.

Auth is session-based; the React app uses `/api/me`, `/api/login`, and `/api/signup` for the SPA flow.

## How It Works

### For Individual Artwork Upload:
1. User uploads an image via seller interface
2. Server converts image into a 3D GLB model
3. Model is displayed using Google's model-viewer
4. User can view in AR on mobile devices

### For Gallery Population:
1. Add artwork images to the `data/` folder
2. Run the population script or use web interface
3. System generates realistic metadata and AI descriptions
4. Creates 3D models and adds to database
5. Artworks appear instantly on buyer page

## Installation

```bash
# Clone the repository
git clone https://github.com/Krushbiradar18/AR-module1.git

# Navigate to the project directory
cd AR-module1

# Install dependencies
pip install -r requirements.txt

# Set up the gallery (creates data folder)
python3 setup_gallery.py

# Run the application
python3 app.py
```

## Gallery Setup Guide

### Method 1: Command Line (Recommended)
```bash
# 1. Create data folder structure
python3 setup_gallery.py

# 2. Add your artwork images to the data/ folder
# (JPG, PNG, GIF, BMP, WEBP, TIFF)

# 3. Run the population script
python3 populate_artworks.py
# Enter your Gemini API key when prompted (optional)

# 4. Start the server and check results
python3 app.py
# Visit: http://127.0.0.1:7861/buyer
```

### Method 2: Web Interface
```bash
# 1. Start the server
python3 app.py

# 2. Add images to data/ folder

# 3. Visit the admin interface
# http://127.0.0.1:7861/admin/populate

# 4. Enter API key and click "Process Images"
```

### Getting a Gemini API Key (Free):
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key for use in the application

## API Endpoints

### Gallery Management:
- `GET /admin/populate` - Gallery management interface
- `POST /admin/populate` - Process images and populate gallery
- `GET /artworks` - List all artworks (JSON)
- `GET /api/artwork/{id}` - Get artwork details (JSON)

### Original Endpoints:
- `POST /make-glb` - Upload and create 3D model
- `GET /artwork/{id}/image` - Get artwork image
- `GET /artwork/{id}/glb` - Get 3D model file
- `GET /buyer` - Gallery browsing interface
- `GET /seller` - Artwork upload interface

## Mobile Compatibility

### Recent Mobile Fixes:
✅ **Fixed JSON parsing errors** on mobile devices  
✅ **Added retry logic** for unreliable mobile connections  
✅ **Enhanced error handling** with mobile-specific messages  
✅ **File size limits** (5MB mobile, 10MB desktop)  
✅ **Network connectivity checks** before uploads  

### AR Compatibility:

#### iOS Requirements:
- iOS 12 or later
- Safari browser
- ARKit-compatible device (iPhone 6s or newer)

#### Android Requirements:
- Android 8.0 or later
- ARCore-compatible device
- Chrome browser (version 79 or newer)

## File Structure

```
AR-module1/
├── app.py                 # Main Flask application
├── populate_artworks.py   # Gallery auto-population script
├── setup_gallery.py       # Setup helper script
├── data/                  # Artwork images folder
│   └── README.md         # Instructions for adding images
├── frontend/src/          # Frontend HTML files
├── requirements.txt       # Python dependencies
├── artwork.db            # SQLite database
└── README.md             # This file
```

## Deployment

This application is deployed on Vercel. To deploy your own instance:

1. Fork this repository
2. Add your artwork images to the `data/` folder
3. Run the population script locally to populate the database
4. Deploy to Vercel with the included configuration files

### Vercel Deployment Settings:
- `vercel.json` - Platform configuration
- `requirements.txt` - Python dependencies
- `wsgi.py` - WSGI entry point

## Troubleshooting

### Common Issues:

**"No images found in data folder"**
- Make sure images are directly in the `data/` folder
- Check file extensions (JPG, PNG, GIF, BMP, WEBP, TIFF)

**"Unexpected token JSON error"**
- This has been fixed in the latest version
- Make sure you're using the updated code

**"AI descriptions not generating"**
- Check your Gemini API key
- The script works without API key (uses fallback descriptions)

**"Mobile upload not working"**
- Ensure you have good network connectivity
- Try with smaller image files (under 5MB)
- Check browser console for detailed error messages

## License

MIT
