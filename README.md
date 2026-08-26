# 🎈 Interactive Birthday Wish Website

A beautiful, premium, and interactive 3D birthday wish website built with Next.js, React, Tailwind CSS, Framer Motion, and Three.js. It features interactive countdown screens, gorgeous 3D card galleries, floating captions, draggable polaroid cards, and custom music.

---

## 🚀 How to Run the Project (For Beginners)

To run this project on your computer, follow these simple steps:

### Step 1: Install Node.js
If you don't have Node.js installed, download and install the **LTS version** from the official website:
👉 [https://nodejs.org](https://nodejs.org)

### Step 2: Open your terminal and go to the project folder
1. Open your terminal, command prompt, or VS Code terminal.
2. Navigate to the project directory where the website code is located:
   ```bash
   cd birthday-wish
   ```

### Step 3: Install all dependencies (Only needed the first time)
Run this command to download and install all the necessary code packages:
```bash
npm install
```

### Step 4: Run the website locally
Start the development server with:
```bash
npm run dev
```
Once the server starts running, open your web browser (Chrome, Edge, Safari, etc.) and go to:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🛠️ How to Customize this Website for Someone Else

You can customize almost everything (dates, names, messages, images, and music) without writing complex code. Here is how:

### 1. 📅 Change the Birthday Countdown Date
The countdown curtain screen locks the page until the birthday arrives.
* **File to edit**: [app/page.tsx](file:///c:/react-node%20projects/pipi-birthday/birthday-wish/app/page.tsx)
* **What to do**: Find the `targetDate` property (around line 21) and change it to the target birthday date and time:
  ```typescript
  targetDate={new Date('2026-08-11T00:00:00+05:30')} // YYYY-MM-DD format
  ```

### 2. ✍️ Change the Birthday Name & Main Message
* **File to edit**: [components/sections/HeroSection.tsx](file:///c:/react-node%20projects/pipi-birthday/birthday-wish/components/sections/HeroSection.tsx)
* **What to do**:
  * **To change the date display**: Edit line 63 (currently `Aug 5`).
  * **To change the nickname**: Edit line 74 (currently `Sweety`).
  * **To change the message description**: Edit the paragraph text on line 78.

### 3. 🖼️ Swap Out the Images & Memories
All images are stored inside the `/public/ref/` folder.
* **How to replace images**:
  1. Open your files folder: [birthday-wish/public/ref/](file:///c:/react-node%20projects/pipi-birthday/birthday-wish/public/ref/)
  2. Put your own images there (e.g., `myphoto1.jpg`, `myphoto2.jpg`, etc.).
  3. Update references in these component files to match your new filenames:
     * **Hero Page Scrolling Image Stream**: Update the `imgs` array in [HeroSection.tsx](file:///c:/react-node%20projects/pipi-birthday/birthday-wish/components/sections/HeroSection.tsx#L10).
     * **Polaroid Draggable Cards Captions & Images**: Update the `images` and `captions` arrays in [LoveGallery.tsx](file:///c:/react-node%20projects/pipi-birthday/birthday-wish/components/LoveGallery.tsx#L26).
     * **3D Stellar Starfield Cards**: Update the `cards` array in [NewWorld.tsx](file:///c:/react-node%20projects/pipi-birthday/birthday-wish/components/NewWorld.tsx#L81).

### 4. 🎵 Change the Background Music
* **File to replace**: `public/sounds/pipi-song.mp3` inside [sounds directory](file:///c:/react-node%20projects/pipi-birthday/birthday-wish/public/sounds/)
* **What to do**:
  1. Find your favorite song (in `.mp3` format).
  2. Rename it to `pipi-song.mp3`.
  3. Replace the existing `pipi-song.mp3` file inside `public/sounds/` with your new file.

---

## 🌐 How to Share / Deploy Online

To share this website with your loved one, you can host it online for free:

### Option 1: Vercel (Recommended & Easiest)
1. Go to [Vercel](https://vercel.com/) and create a free account.
2. Connect your GitHub repository.
3. Import the `birthday-wish` folder and click **Deploy**.
4. You will get a free public link (e.g., `my-birthday-wish.vercel.app`) to share!
