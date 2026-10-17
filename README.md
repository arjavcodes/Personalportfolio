# 🌟 3D Full-Stack Personal Portfolio

A high-performance, responsive **3D Personal Portfolio** built for **Arjav Upadhyay** (Software Development Engineer). Featuring Three.js interactive 3D visualizations, dynamic tabbed tech stack skills system, Nodemailer direct inbox email integration, Express REST API, MongoDB persistence, and Netlify Serverless deployment readiness.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-https%3A%2F%2Fpersonalportfoliobyau.netlify.app%2F-00C7B7?style=for-the-badge&logo=netlify)](https://personalportfoliobyau.netlify.app/)

🔗 **Live Website**: [https://personalportfoliobyau.netlify.app/](https://personalportfoliobyau.netlify.app/)

![Node.js](https://img.shields.io/badge/Node.js-v18+-green?style=for-the-badge&logo=nodedotjs)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb)
![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=three.js)
![GSAP](https://img.shields.io/badge/GSAP-88CE02?style=for-the-badge&logo=greensock)
![Netlify](https://img.shields.io/badge/Netlify-00C7B7?style=for-the-badge&logo=netlify)

---

## ✨ Features

- 🌌 **3D Particle Galaxy Hero**: Interactive Three.js particle galaxy with mouse parallax and rotating icosahedron core.
- 🧬 **3D DNA Code Helix**: Rotating torus-knot 3D scene in the About section.
- 🗂️ **Dynamic Tabbed Tech Stack**: Glassmorphic filter tabs (Languages, Backend, Databases, Tools) with sliding indicator pill and proficiency bars.
- 💎 **Interactive 3D Project Cards**: Filterable project gallery with 3D tilt effects, fetched from Express/MongoDB.
- 📧 **Direct Inbox Email Delivery**: Contact form integrated with **Nodemailer** for direct email delivery to `aryay0108@gmail.com` with Reply-To header support.
- ✨ **GSAP ScrollTrigger**: Smooth reveal animations on scroll across all sections.
- 📱 **Responsive Design**: Modern deep-space glassmorphism UI styled with CSS variables and custom responsive breakpoints.

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, Vanilla CSS3, JavaScript (ES6+), Three.js, GSAP
- **Backend**: Node.js, Express.js, Nodemailer
- **Database**: MongoDB / Mongoose ODM (with automatic fallback data layer)
- **Deployment**: Netlify Functions (`serverless-http`) / Render / Vercel

---

## 📁 Project Structure

```
personalportfolio/
├── netlify.toml                # Netlify deployment configuration
├── server.js                   # Main Express server & app export
├── seed.js                     # Seed script for MongoDB
├── netlify/
│   └── functions/
│       └── api.js              # Netlify Serverless Function wrapper
├── routes/
│   ├── projects.js             # Project CRUD REST API endpoints
│   └── contact.js              # Contact submission & Nodemailer dispatcher
├── models/
│   ├── Project.js              # Mongoose schema for projects
│   └── Contact.js              # Mongoose schema for contact messages
└── public/
    ├── index.html              # Main portfolio SPA HTML
    ├── _redirects              # Netlify SPA routing rules
    ├── css/style.css           # Glassmorphism design system
    └── js/
        ├── three-scene.js      # Three.js 3D canvas renderer
        ├── projects.js         # API fetch & project card generator
        └── main.js             # GSAP, dynamic skills tabs, UI handlers
```

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/deadguycodes/Personalportfolio.git
cd Personalportfolio
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory:
```env
PORT=5000
NODE_ENV=development

# Optional: MongoDB URI
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/portfolio

# Gmail Direct Email Delivery
EMAIL_USER=avuy2207@gmail.com
EMAIL_PASS=your_16_digit_gmail_app_password
RECEIVER_EMAIL=aryay0108@gmail.com
```

### 4. Run the Development Server
```bash
npm run dev
# Server running at http://localhost:5000
```

---

## ☁️ Netlify Deployment

This repository is pre-configured for 1-click Netlify deployment via `netlify.toml` and `netlify/functions/api.js`.

1. Import this repository to **Netlify** (`app.netlify.com`).
2. Add your environment variables under **Site Settings > Environment Variables**:
   - `EMAIL_USER`
   - `EMAIL_PASS`
   - `RECEIVER_EMAIL`
3. Click **Deploy Site**!

---

## 📝 License

Designed & Developed by **Arjav Upadhyay**.
Licensed under the [MIT License](LICENSE).

## ✏️ Customization
Update these in `public/index.html`:
- Your name (search `Your Name`)
- GitHub/LinkedIn/Email links
- Location, availability status
- Years of experience in hero stats
