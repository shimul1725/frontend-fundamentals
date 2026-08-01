# MN_BD | Restaurant Menu Landing Page 🍝

A restaurant landing page combining CSS Flexbox and Grid in one layout, with fade-in and staggered entrance animations. No frameworks — pure HTML and CSS.

Part of the [Frontend Fundamentals](../) learning series.

## ✨ Features

- Sticky navbar that stays fixed while scrolling
- Full-width hero section with background image + dark overlay
- Menu section with a responsive card grid (image, title, price, description)
- Staggered fade-in animation — menu cards appear one after another instead of all at once
- Hover lift effect on menu cards and the hero CTA button
- Fully responsive: 2-column menu grid collapses to 1 column on mobile

## 🎯 What I Practiced

- **Flexbox vs Grid — when to use which**: Flexbox for one-directional layout (navbar, hero content, footer), Grid for the two-dimensional menu card layout
- **CSS Animations** — `@keyframes` for a `fadeInUp` animation, reused across the hero and menu cards
- **Staggered animation with `:nth-child()`** — giving each menu card a different `animation-delay` so they reveal in sequence
- **`position: sticky`** — keeping the navbar fixed on scroll without `position: fixed`
- **Background image + gradient overlay** — layering a `linear-gradient` on top of a `background-image` for text readability
- **`object-fit: cover`** — cropping images to fit a fixed container size without distortion
- **Local image paths** — serving images from a local `images/` folder instead of external URLs, and debugging relative path mistakes (missing folder prefix, malformed nested tags)
- **Media queries** — collapsing the grid and adjusting font sizes for smaller screens

## 🛠️ Built With

- HTML5
- CSS3 (Flexbox, Grid, Keyframe Animations, Custom Properties)

## 📸 Preview

*(Add a screenshot here — e.g. `![preview](./preview.png)`)*

## 📂 Project Structure

```
Restaurant-Menu/
├── index.html
├── style.css
├── images/
│   ├── cover.jpg
│   ├── pizza.jpg
│   ├── carbonara.jpg
│   ├── tiramisu.jpg
│   └── risotto.jpg
└── README.md
```

## 🚀 Running Locally

No build tools required — it's a static site.

```bash
git clone https://github.com/shimul1725/frontend-fundamentals.git
cd frontend-fundamentals/Restaurant-Menu
```

Open `index.html` in your browser, or use the **Live Server** extension in VS Code.

## 📝 Notes

This project wraps up **Stage 1 (HTML + CSS Fundamentals)** of the Frontend Fundamentals series — semantic HTML, Flexbox, Grid, responsive design, and animations. Next stage moves into JavaScript: DOM manipulation, event handling, and array methods, continuing with projects like the To-Do List App and Calculator App.

## 👤 Author

**Md Moniruzzaman**
- GitHub: [@shimul1725](https://github.com/shimul1725)
- Email: shimul.tu.dortmund@gmail.com