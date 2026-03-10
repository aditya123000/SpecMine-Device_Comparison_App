# SpecMine

SpecMine is a modern web application designed to help users search, explore, and compare specifications of electronic devices in a structured and intuitive interface.

The platform aggregates technical specifications of devices such as smartphones, laptops, tablets, and other consumer electronics, allowing users to analyze and compare hardware features side-by-side.

SpecMine aims to simplify the decision-making process for consumers by presenting clear, organized, and easily comparable device data.

---

## Key Features

### Device Search
Users can quickly locate devices by searching for brand names, model numbers, or product categories through an interactive search interface.

### Multi-Category Device Browsing
Devices are organized into multiple categories for easier navigation:

- Smartphones  
- Laptops  
- Tablets  
- Earbuds  
- Headphones  
- Televisions  
- Smartwatches  
- Gaming Consoles  
- Monitors  

### Structured Device Specifications
Each device page presents technical specifications in a clean and structured format, including:

- Processor / Chipset
- RAM and Storage
- Display characteristics
- Battery capacity
- Camera specifications
- Connectivity features
- Additional hardware details

### Side-by-Side Device Comparison
Users can compare multiple devices simultaneously to identify differences in specifications such as performance, display quality, battery life, and hardware capabilities.

### Responsive User Interface
The application features a clean and responsive design built with Tailwind CSS, ensuring a smooth experience across desktop and mobile devices.

### Seamless Navigation
Routing is handled using React Router, enabling fast page transitions without full page reloads.

---

## Technology Stack

### Frontend
- React
- Vite
- React Router
- Tailwind CSS
- JavaScript (ES6+)

### Development Tools
- ESLint
- PostCSS
- Node.js

---

## Project Structure

```
src
│
├── api
│   └── deviceApi.js
│
├── components
│   ├── SearchBar
│   └── FeatureCard
│
├── layouts
│   ├── MainLayout
│   └── AppLayout
│
├── pages
│   ├── Home
│   ├── Compare
│   ├── DeviceDetails
│   └── Devices
│       └── sections
│           ├── PhonesPage
│           ├── LaptopsPage
│           ├── TabletsPage
│           ├── EarbudsPage
│           ├── HeadphonesPage
│           └── TVsPage
│
├── App.jsx
└── main.jsx
```

The project follows a component-based architecture that separates UI components, layouts, page views, and API utilities to maintain scalability and readability.

---

## Installation and Setup

Clone the repository

```bash
git clone https://github.com/aditya123000/specmine.git
```

Navigate to the project directory

```bash
cd specmine
```

Install dependencies

```bash
npm install
```

Run the development server

```bash
npm run dev
```

Open the application at

```
http://localhost:5173
```

---

## Application Workflow

1. Search for a device using the search bar  
2. Browse devices across different categories  
3. Open device pages to view detailed specifications  
4. Compare multiple devices side-by-side  

---

## Future Improvements

- Backend API for dynamic device data
- Database integration (MongoDB or PostgreSQL)
- Advanced filtering (price, RAM, processor, battery)
- Device reviews and ratings
- User accounts and saved comparisons
- Improved visualization for specification comparison

---

## Learning Objectives

This project was built to strengthen understanding of:

- React application architecture
- Component-based UI design
- Client-side routing using React Router
- API-driven data handling
- Responsive design using Tailwind CSS
- Modern frontend tooling with Vite

---

## Author

Aditya

GitHub:  
https://github.com/aditya123000

---

⭐ If you found this project interesting, consider giving it a star.
