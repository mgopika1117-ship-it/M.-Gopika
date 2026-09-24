# ComicCraft AI – Comic Story Creator

ComicCraft AI is a starter full-stack web project for creating comic stories with Google Gemini models.

## Features
- Enter a story idea, genre, characters, and number of panels.
- Generate a structured comic script using Gemini.
- Display panels with scene descriptions, dialogue, captions, and image prompts.
- Export the generated comic script as JSON.
- Clean responsive UI.

## Setup
1. Install Node.js 18+.
2. Open this folder in a terminal.
3. Run:
   ```bash
   npm install
   ```
4. Create `.env` from `.env.example` and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```
5. Run:
   ```bash
   npm run dev
   ```
6. Open http://localhost:3000

The Gemini call is performed on the server so the API key is not exposed to the browser.

## Note
This project generates comic scripts and image prompts. Actual comic-panel image generation can be connected later to an image-capable model/API.
