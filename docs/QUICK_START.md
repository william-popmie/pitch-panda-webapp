# Quick Start Guide - Testing Image Analysis Feature

## 🚀 How to Test the New Feature

### Prerequisites

Make sure you have your OpenAI API key set in `.env`:

```bash
VITE_OPENAI_API_KEY=sk-...
```

### Start the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or the URL shown in terminal).

## 📝 Test Scenario 1: Basic Image Upload

1. **Open the webapp** in your browser
2. **Fill in the form**:
   - Startup Name: `Stripe`
   - Website URL: `stripe.com`
3. **Upload an image**:
   - Click "📎 Click to upload pitch deck slides, charts, or screenshots"
   - Select any startup-related image (pitch deck slide, chart, etc.)
4. **See the preview**:
   - Image filename should appear in the list
   - You should see a "Remove" button next to it
5. **Click "Analyze Startup"**
6. **Watch the loading message**:
   - Should say "Analyzing 1 image(s) and fetching website data..."
7. **Check the console** (F12 in browser):
   - Should see: `🖼️  Analyzing 1 image(s) with Vision AI...`
   - Should see: `Processing image 1/1: [filename]`
   - Should see: `✅ Image analysis complete`
8. **View results**:
   - Analysis should complete with data from both website and image

## 📊 Test Scenario 2: Multiple Images

1. **Fill in the form** (same as above)
2. **Upload multiple images**:
   - Click upload button
   - Select 2-3 images at once (or upload one by one)
3. **Verify preview list**:
   - All images should appear
   - Each should have a remove button
4. **Test remove functionality**:
   - Click "Remove" on one image
   - It should disappear from the list
5. **Submit the form**
6. **Check loading message**:
   - Should say "Analyzing X image(s)..." where X is the count
7. **Monitor console**:
   - Should process each image sequentially
   - Should show progress for each

## 🔍 Test Scenario 3: Text + Images

1. **Fill in all fields**:
   - Startup Name: `Tesla`
   - Website URL: `tesla.com`
   - Extra Context: `Founded in 2003. Current revenue $50B+`
   - Upload: 1-2 images
2. **Submit and verify**:
   - Console should show both text context and image analysis
   - Final analysis should combine both sources
3. **Check the results**:
   - Should include info from all sources (web, text, images)

## ⚡ Test Scenario 4: Edge Cases

### Test 4a: No Images (Should Work Normally)

1. Fill in name and URL only
2. Don't upload any images
3. Submit
4. ✅ Should work exactly as before

### Test 4b: Images Only (No Text Context)

1. Fill in name and URL
2. Upload images but leave extra context blank
3. Submit
4. ✅ Should work with image data only

### Test 4c: Remove All Images

1. Upload several images
2. Remove them all one by one
3. Submit
4. ✅ Should work without images

## 🖼️ What to Upload (Example Images)

Good test images:

- **Pitch deck slide with metrics** (MRR, ARR, growth charts)
- **Team slide** (photos with names and roles)
- **Market size chart** (TAM/SAM/SOM breakdown)
- **Financial dashboard screenshot**
- **Competitive comparison matrix**
- **Product roadmap slide**
- **Traction slide** (customer logos, metrics)

Where to find test images:

- Create a simple slide in PowerPoint/Google Slides
- Screenshot of any startup dashboard
- Sample pitch decks from Y Combinator or similar
- Financial charts from Google Sheets
- Even hand-drawn slides with numbers

## 📋 Verification Checklist

### UI Functionality

- [ ] Upload button appears and is clickable
- [ ] File input accepts multiple images
- [ ] Uploaded images appear in preview list
- [ ] Remove buttons work for each image
- [ ] Loading message shows image count
- [ ] Form can be submitted with/without images

### Image Processing

- [ ] Console shows "🖼️ Analyzing..." message
- [ ] Console shows progress per image
- [ ] Console shows "✅ Image analysis complete"
- [ ] No errors in console during processing

### Data Integration

- [ ] Extracted data appears in console (if logging enabled)
- [ ] Analysis completes successfully
- [ ] Results include data from images
- [ ] Extra context shows image data markers

### Error Handling

- [ ] Invalid file types are filtered out
- [ ] Errors are logged but don't crash the app
- [ ] Failed images don't prevent submission
- [ ] Analysis works even if vision API fails

## 🐛 Troubleshooting

### Images not uploading

- Check that you're clicking the upload button/area
- Verify files are image types (PNG, JPG, etc.)
- Check browser console for errors

### Vision API errors

- Verify OpenAI API key is set correctly
- Check that you have credits in your OpenAI account
- Try with a smaller image first
- Check browser console for specific error messages

### Slow processing

- Normal! Each image takes 2-5 seconds
- 5 images = ~15-25 seconds total
- Check console for progress updates

### No data extracted

- Verify images contain readable text/data
- Try with a clearer, higher-quality image
- Check that image shows relevant startup info

## 📸 Example Console Output

When working correctly, you should see:

```
🖼️  Analyzing 3 image(s) with Vision AI...
  Processing image 1/3: pitch-deck-slide-5.png
  Processing image 2/3: team-photo.jpg
  Processing image 3/3: financial-chart.png
✅ Image analysis complete

🐼 Starting analysis for: YourStartup
📍 Using unified pipeline v3.0
📝 Extra context provided (1524 chars)

📝 Extracting structured data from extra context...
📡 Fetching website: yoursite.com
🧠 Analyzing problem & solution...
✅ Validating analysis...
🏢 Finding competition...
👥 Analyzing team...
📊 Analyzing market...
🚀 Analyzing traction & competitive advantages...
```

## 🎯 Expected Results

After successful analysis with images, you should see:

1. **Team Section**: May include team members mentioned in slides
2. **Traction Section**: May include metrics from financial slides
3. **Market Section**: May include TAM/SAM/SOM from pitch deck
4. **Funding Info**: If mentioned in images
5. **Other Metrics**: Any relevant data extracted from images

All clearly integrated into the normal analysis output!

## 💡 Tips

1. **Start simple**: Test with 1 image first
2. **Use clear images**: High-quality, readable text
3. **Check console**: Most useful for debugging
4. **Try different types**: Financial slides, team slides, charts
5. **Combine sources**: Use both text context and images for best results

## ✨ Success Criteria

You know it's working when:

- ✅ Images upload and preview correctly
- ✅ Console shows processing messages
- ✅ No errors during analysis
- ✅ Results include data from images
- ✅ Analysis completes in reasonable time
- ✅ Remove functionality works
- ✅ Works with and without images

---

**Ready to test?** Start the dev server and try uploading your first pitch deck slide! 🚀
