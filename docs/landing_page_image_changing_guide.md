# How to Change Images on the Landing Page

This guide explains how you can easily swap out the images displayed in the animated floating cards and the "Artisanal Collection" gallery on the landing page of **Bowls 'N' Jars**.

## Where are the images located?

The images are hardcoded as an array of URLs at the very top of the `LandingPage.tsx` file.

**File Location:**
`frontend/src/pages/LandingPage.tsx`

## Step-by-Step Guide

### 1. Open the File
Open your code editor (like VS Code) and navigate to `frontend/src/pages/LandingPage.tsx`.

### 2. Locate the `images` Array
Look around **Line 18**, right below the video array. You will see a block of code that looks exactly like this:

```tsx
// Working ceramic images from Unsplash
const images = [
  'https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=400&fit=crop',
  'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=400&fit=crop',
  'https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?q=80&w=400&fit=crop',
  'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?q=80&w=400&fit=crop',
  'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=400&fit=crop',
  'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?q=80&w=400&fit=crop',
  'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?q=80&w=400&fit=crop',
  'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?q=80&w=400&fit=crop',
];
```

This array contains **8 image links**. 
- The first image corresponds to Card 1 in the floating animation and the first item in the gallery.
- The second image corresponds to Card 2... and so on.

### 3. Replace the Links

To change an image, simply delete the URL inside the single quotes `''` and paste your new link.

**Using External Images (e.g., Unsplash):**
Just paste the new URL directly.
`'https://images.unsplash.com/photo-YOUR-NEW-PHOTO-ID'`

**Using Local Images:**
If you want to use images saved on your computer:
1. Save your image files in the `frontend/public/images/` folder (create the `images` folder if it doesn't exist).
2. Update the array to point to the local path, starting with a forward slash `/`. For example, if you saved `bowl.jpg` in that folder, your code should look like this:

```tsx
const images = [
  '/images/bowl.jpg', // Using a local image
  'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=400&fit=crop',
  // ...
];
```

### 4. Save and Preview
Once you have swapped out the links, save the `LandingPage.tsx` file. If your Vite development server is running (`npm run dev`), the website will automatically refresh and display your new images!

## Important Tips
* **Aspect Ratio:** The cards are designed with a **3:4 aspect ratio** (portrait orientation). For the best visual result, use images that are taller than they are wide.
* **Keep 8 Images:** Make sure you always have exactly 8 images in this array. If you have fewer, the page will break because it is expecting 8 images for the 8 cards on the screen.
