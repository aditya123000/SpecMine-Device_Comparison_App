# SpecMine

SpecMine is a modern, comprehensive web application designed to help users intelligently search, explore, and compare the technical specifications of electronic devices. It bridges the gap between complex hardware details and a user-friendly interface, simplifying the consumer decision-making process.

## Key Features

- **Advanced Device Search:** Quickly locate specific devices by brand name, model number, or product category using our interactive search interface.
- **Multi-Category Browsing:** Seamlessly navigate through diverse categories, including Smartphones, Laptops, Tablets, Earbuds, Headphones, Televisions, Smartwatches, Gaming Consoles, and Monitors.
- **Side-by-Side Comparisons:** Evaluate multiple devices simultaneously to directly compare performance capabilities, display quality, battery life, and other critical hardware metrics.
- **Detailed Specifications:** Access highly structured data for every device, covering Processor/Chipset, RAM/Storage, Display, Battery, Camera, and Connectivity features.
- **User Authentication:** Create a personalized account to save your place and ensure a tailored comparison experience.
- **Responsive Design:** A beautifully crafted, Tailwind-powered user interface that ensures a flawless experience on both desktop and mobile devices.

## Technology Stack

**Frontend:**
- React (bootstrapped with Vite)
- React Router (for seamless client-side routing)
- Tailwind CSS

**Backend & Database:**
- Node.js & Express
- PostgreSQL

## Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- PostgreSQL (Ensure you have a local database named `compare_devices` ready)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/aditya123000/specmine.git
   cd specmine
   ```

2. **Backend Setup:**
   - Define your environment variables by copying the example file:
     ```bash
     cp src/Backend/.env.example src/Backend/.env
     ```
   - Update `src/Backend/.env` with your PostgreSQL credentials (specifically, set `PGPASSWORD`). By default, the server connects via `host: localhost`, `port: 5432`, `user: postgres`, and `database: compare_devices`.
   - Start the backend server. The database will automatically be seeded from `src/Backend/Data/db.json` upon startup if it is currently empty:
     ```bash
     npm run server
     ```

3. **Frontend Setup:**
   - In a new terminal window, install the project dependencies:
     ```bash
     npm install
     ```
   - Start the Vite development server:
     ```bash
     npm run dev
     ```
   - Open your browser and navigate to `http://localhost:5173`.

## Future Roadmap

- Advanced filtering modules (filter by exact specifications like price, RAM, or CPU power)
- Device-specific user reviews, ratings, and community discussions
- Deep integration for user accounts allowing saved cross-session device comparisons
- Enhanced visual data charting for specification highlighting

## Author

**Aditya**  
GitHub: [aditya123000](https://github.com/aditya123000)

⭐ *If you find this project helpful or interesting, please consider giving it a star on GitHub!*
