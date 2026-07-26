<div align="center">

<img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
<img src="https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
<img src="https://img.shields.io/badge/TailwindCSS-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
<img src="https://img.shields.io/badge/Deployed-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" />
<img src="https://img.shields.io/badge/Gemini-AI%20Powered-4285F4?style=for-the-badge&logo=google&logoColor=white" />

<br /><br />

# 🎓 CampusConnect

### *Your Campus. Your Events. Your Story.*

**A full-featured college event management platform** — discover events, register with a click, get digital tickets with QR codes, earn achievement badges, and chat with an AI assistant — all in one beautiful experience.

**🌐 [Live Demo → campusconnect-frontend-six.vercel.app](https://campusconnect-frontend-six.vercel.app/)**

</div>

---

## ✨ Features at a Glance

| Feature | Description |
|---|---|
| 🎭 **Event Discovery** | Browse upcoming campus events in a responsive grid or interactive calendar view |
| 🔐 **Authentication** | Secure Sign Up / Sign In with JWT tokens stored in localStorage |
| 🎫 **One-Click Registration** | Register for events and choose from multiple ticket tiers (FREE / Paid) |
| 📲 **Digital Tickets with QR** | Auto-generated QR-code tickets for event check-in |
| 🏅 **Badge & Achievement System** | Earn badges for milestones (First Step, Power Attendee, Department Explorer, etc.) |
| 🤖 **Gemini AI Chatbot** | Ask questions about events, get recommendations, and get help — powered by Google Gemini |
| 🔔 **Smart Notifications** | Browser push reminders scheduled 24h and 1h before your registered events |
| 📤 **Event Sharing** | Generate a shareable social-media card (via html2canvas), WhatsApp share & link copy |
| ⭐ **Feedback System** | Rate and review events after attending |
| 🔖 **Bookmarks** | Save events to your personal watchlist |
| 🛡️ **Admin Panel** | Admin-only dashboard for event management |
| 📷 **QR Check-in Scanner** | Admin scanner page for marking attendees as checked in |
| 📊 **Sold-Out Detection** | Real-time capacity tracking with sold-out badges on event cards |
| 📱 **Fully Responsive** | Pixel-perfect layout on mobile, tablet, and desktop |

---

## 📸 Screenshots

<table>
  <tr>
    <td align="center"><b>🏠 Home / Event Discovery</b></td>
    <td align="center"><b>🔐 Auth Page</b></td>
  </tr>
  <tr>
    <td><img src="https://campusconnect-frontend-six.vercel.app/screenshot_home.png" alt="Home" /></td>
    <td><img src="https://campusconnect-frontend-six.vercel.app/screenshot_auth.png" alt="Auth" /></td>
  </tr>
  <tr>
    <td align="center"><b>📊 Student Dashboard</b></td>
    <td align="center"><b>🤖 AI Chatbot</b></td>
  </tr>
  <tr>
    <td><img src="https://campusconnect-frontend-six.vercel.app/screenshot_dashboard.png" alt="Dashboard" /></td>
    <td><img src="https://campusconnect-frontend-six.vercel.app/screenshot_chatbot.png" alt="Chatbot" /></td>
  </tr>
</table>

> 💡 **Try the live demo** → [campusconnect-frontend-six.vercel.app](https://campusconnect-frontend-six.vercel.app/)

---

## 🏗️ Tech Stack

### Frontend
| Layer | Technology |
|---|---|
| **Framework** | [React 19](https://react.dev) |
| **Build Tool** | [Vite 7](https://vitejs.dev) |
| **Styling** | [Tailwind CSS 3](https://tailwindcss.com) + inline CSS-in-JS animations |
| **Routing** | [React Router DOM v7](https://reactrouter.com) |
| **State Management** | [Redux Toolkit](https://redux-toolkit.js.org) + `useState` |
| **HTTP Client** | [Axios](https://axios-http.com) with JWT interceptor |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) |
| **Charting** | [Recharts](https://recharts.org) |
| **QR Code** | `qrcode.react` + `react-qr-code` |
| **Image Capture** | [html2canvas](https://html2canvas.hertzen.com) for share card generation |
| **Markdown** | [react-markdown](https://remarkjs.github.io/react-markdown/) (AI chatbot output) |
| **AI** | Google Gemini (via backend proxy) |

### Deployment
| Service | Purpose |
|---|---|
| **Vercel** | Frontend hosting with SPA rewrite rules |
| **Backend** | Node.js/Express REST API (separate repo) |

---

## 📁 Project Structure

```
frontend/
├── public/                    # Static assets (favicon, images)
├── src/
│   ├── Pages/
│   │   ├── Home/              # Event discovery + hero banner + countdown
│   │   ├── Auth/              # Sign In / Sign Up
│   │   ├── Dashboard/         # Student dashboard with registrations & badges
│   │   ├── EventDetails/      # Full event info + share card
│   │   ├── Register/          # Event registration + ticket selection
│   │   ├── Ticket/            # Digital ticket with QR code
│   │   ├── Feedback/          # Star rating + review form
│   │   ├── ProfileEdit/       # Edit student profile info
│   │   ├── Admin/             # Admin event management panel
│   │   ├── CheckinScanner/    # QR scanner for check-ins
│   │   └── NotFound/          # 404 page
│   ├── components/
│   │   ├── Navbar.jsx         # Sticky top navbar with role-based links
│   │   ├── Footer.jsx         # Site footer
│   │   ├── ChatBot.jsx        # Gemini AI floating chat widget
│   │   ├── ProtectedRoute.jsx # Auth + admin guards
│   │   ├── ErrorBoundary.jsx  # App-level error boundary
│   │   ├── EventCalendar.jsx  # Monthly event calendar
│   │   ├── BadgeDisplay.jsx   # Achievement badge grid
│   │   ├── NotificationBell.jsx # Upcoming event notifications
│   │   └── AnalyticsCharts.jsx  # Dashboard charts
│   ├── utils/
│   │   └── notifications.js   # Browser push notification scheduling
│   ├── api.js                 # Axios instance with JWT interceptor
│   ├── auth.js                # Auth helper (getUser, setAuth, clearAuth)
│   └── App.jsx                # Root routes
├── vercel.json                # SPA rewrite rule
├── tailwind.config.js
└── vite.config.js
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- A running backend API (see backend repo)

### Local Development

```bash
# 1. Clone the repository
git clone https://github.com/Rahul-Naik27/CampusConnect-FrontEnd.git
cd CampusConnect-FrontEnd/frontend

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env and set:
#   VITE_API_BASE=http://localhost:5000/api/v1

# 4. Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build

```bash
npm run build
npm run preview   # preview the production build locally
```

---

## 🔐 Environment Variables

Create a `.env` file in the `frontend/` directory:

```env
# Backend API base URL
VITE_API_BASE=http://localhost:5000/api/v1
```

For **Vercel deployment**, set this in **Vercel → Project → Settings → Environment Variables**:

```
VITE_API_BASE = https://your-backend-api.onrender.com/api/v1
```

> ⚠️ **Important:** The `VITE_` prefix is required for Vite to expose the variable to the browser bundle.

---

## 🛣️ Routes

| Route | Access | Description |
|---|---|---|
| `/` | Public | Home — event discovery, hero banner, countdown |
| `/auth` | Public | Sign In / Sign Up |
| `/event/:id` | Public | Event detail page with share card |
| `/register/:id` | 🔒 Auth | Event registration with ticket selection |
| `/dashboard` | 🔒 Auth | Student dashboard — registrations, badges, stats |
| `/ticket/:ticketId` | 🔒 Auth | Digital ticket with QR code |
| `/profile` | 🔒 Auth | Edit student profile |
| `/feedback/:eventId` | 🔒 Auth | Post-event feedback form |
| `/admin` | 🔒 Admin | Admin event management panel |
| `/checkin-scanner` | 🔒 Admin | QR check-in scanner |
| `*` | Public | 404 Not Found |

---

## 🏅 Badge System

Students earn badges based on activity:

| Badge | Unlock Condition |
|---|---|
| 🥇 **First Step** | Register for your first event |
| 🌟 **Event Enthusiast** | Register for 3+ events |
| 🏆 **Power Attendee** | Attend 5+ events (checked in) |
| 🎉 **Big Fest Champion** | Attend a major fest/conference |
| 🌐 **Department Explorer** | Attend events from 3+ departments |

---

## 🤖 AI Chatbot

CampusConnect includes a **Gemini-powered AI assistant** that:
- Answers questions about upcoming events
- Helps you find events matching your interests
- Explains how to register, get tickets, and check in
- Available on every page via the floating chat button

The chatbot is powered by the backend `/api/v1/chatbot` endpoint which proxies to Google Gemini.

---

## 🔔 Browser Notifications

When you visit the dashboard, CampusConnect requests browser notification permission and automatically schedules:
- **24-hour reminder** before each registered event
- **1-hour reminder** before each registered event

Reminders are sent as native browser notifications even if the tab is in the background.

---

## 🔧 API Integration

All API calls use the centralized Axios instance in [`src/api.js`](src/api.js):

```js
// JWT token is attached automatically via interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});
```

Key endpoints used:

```
GET    /events                         → list all events
GET    /events/featured/one            → featured event for hero section
GET    /events/:id                     → event detail
GET    /events/:id/registration-count  → capacity & sold-out status
POST   /registrations                  → register for an event
GET    /registrations/me               → my registrations
POST   /tickets/issue                  → generate a ticket
GET    /users/badges                   → my badge stats
POST   /users/saved/:eventId           → toggle bookmark
POST   /chatbot                        → Gemini AI chat
```

---

## 📱 Responsive Design

CampusConnect is fully responsive:
- **Desktop:** 3-column event grid, sidebar dashboard
- **Tablet:** 2-column grid, collapsible sidebar
- **Mobile:** 1-column grid, hamburger menu, bottom-sheet sidebar

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Built with ❤️ by **Rahul Naik** and contributors

⭐ **Star this repo** if you found it helpful!

[🌐 Live Demo](https://campusconnect-frontend-six.vercel.app/) · [🐛 Report Bug](https://github.com/Rahul-Naik27/CampusConnect-FrontEnd/issues) · [✨ Request Feature](https://github.com/Rahul-Naik27/CampusConnect-FrontEnd/issues)

</div>
