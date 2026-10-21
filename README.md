# ITC International Program Portal

A web portal for students and class monitors at the Institute of Technology of Cambodia (ITC) International Engineering School.

## Overview

This portal provides centralized schedule access and classroom utility tools for the ITC International Program:

- **Student Portal**: Direct access to cohort timetables (I2, I3, I4), today's agenda, and quick links to Moodle and community Discord.
- **Class Monitor Portal**: Timetable matrix view, day filters, and makeup class room booking requests.
- **Free Study Room Finder**: Classroom vacancy tracker for Building A and Building J.

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS
- Lucide React

## Local Development

Prerequisites: Node.js (v18 or higher recommended).

1. Clone the repository:
   ```bash
   git clone https://github.com/<your-username>/<repo-name>.git
   cd <repo-name>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open `http://localhost:3000` in your browser.

To verify TypeScript types before committing:
```bash
npm run lint
```

## Contributing

Contributions are welcome. If you'd like to help improve the portal:

1. Fork the repo and create a new branch (`git checkout -b feature/your-feature-name`).
2. Make your changes (e.g. updating schedule data, UI improvements, fixing room availability logic).
3. Commit your changes (`git commit -m "Describe your update"`).
4. Push to your branch (`git push origin feature/your-feature-name`) and open a Pull Request.

Feel free to open an Issue if you find incorrect schedule information or want to suggest new features.
