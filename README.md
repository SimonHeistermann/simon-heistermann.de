# Portfolio — portfolio.projects.simon-heistermann.de

> Personal developer portfolio built with Angular 19 — training project from Developer Akademie.

## Disclaimer

This is a **training project** built as part of my education at [Developer Akademie](https://developerakademie.com/). It is not a commercial product and is not intended for real-world use as a service. The contact form is functional and forwards messages via email. No real transactions, orders, or services are processed through this website.

## About

A single-page portfolio website showcasing my projects, skills, references, and contact information. Built with Angular 19 featuring server-side rendering (SSR), bilingual support (German/English), and a custom mouse-follower animation. Project and skill data is loaded dynamically from Firebase Firestore.

## Tech Stack

- **Framework:** Angular 19 (standalone components, SSR)
- **Language:** TypeScript
- **Styling:** SASS
- **Database:** Firebase Firestore (project & skill data)
- **i18n:** @ngx-translate (German/English)
- **Animations:** Typed.js, Angular Animations
- **Hosting:** Firebase Hosting
- **Fonts:** Self-hosted Montserrat

## Features

- Responsive single-page design with smooth scroll navigation
- Bilingual UI (German/English) with language switcher
- Dynamic project showcase loaded from Firestore
- Skill set display with categorized skills
- Colleague references/testimonials section
- Contact form with validation, honeypot spam protection, and PHP mail backend
- Custom mouse-follower cursor animation
- Server-side rendering for SEO
- Menu overlay for mobile navigation

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm

### Installation

```bash
npm install
```

### Running

```bash
ng serve
```

Open [http://localhost:4200](http://localhost:4200) in your browser.

### Building

```bash
ng build
```

Build artifacts are stored in `dist/portfolio/`.

## Legal

- [Legal Notice / Impressum](https://portfolio.projects.simon-heistermann.de/legal-notice)
- [Privacy Policy / Datenschutz](https://portfolio.projects.simon-heistermann.de/privacy-policy)

## Author

**Simon Maximilian Heistermann**
- Website: [simon-heistermann.de](https://simon-heistermann.de)
- Email: simon@heistermann-solutions.de
- LinkedIn: [Simon Heistermann](https://www.linkedin.com/in/simon-maximilian-heistermann-419531250/)

## License

This project is part of a training curriculum and is not licensed for commercial use.
