# ScoreCast AI ⚽🤖

**ScoreCast AI** is a next-generation sports prediction dashboard that combines real-time football data with advanced AI analysis. Built with **Next.js 16** and **React 19**, it leverages **Gemini 2.5 Flash** and **Tavily Search** to provide "Deep Dive" insights—going beyond simple stats to analyze recent news, team form, and external factors for every match.

## 🚀 Key Features

- **📊 Live Match Dashboard**: Browse daily football fixtures from major European leagues with real-time odds.
- **🧠 AI Deep Dives**: One-click analysis powered by **Gemini 2.5 Flash**. The AI evaluates:
  - Win/Draw/Loss probabilities
  - Predicted scorelines
  - Key tactical insights
  - Confidence levels
- **🌐 Contextual Search**: Integrates **Tavily API** to fetch improved context (injuries, locker room news, weather) before generating predictions.
- **👤 Personalized Experience**:
  - **Favorites**: Pin matches to your personal watchlist.
  - **Prediction History**: Track the AI's past performance on matches you've analyzed.
  - **Secure Auth**: Full user management via Supabase.
- **⚡ Modern Tech Stack**: Built on the bleeding edge of web development.

---

## 🛠️ Tech Stack

### Framework & UI

- **[Next.js 16](https://nextjs.org/)** (App Router, Server Actions)
- **[React 19](https://react.dev/)** (using `use()` hook for promise resolution)
- **[Tailwind CSS v4](https://tailwindcss.com/)** (configured via CSS `@theme` variables)
- **[shadcn/ui](https://ui.shadcn.com/)** (Accessible component primitives)
- **[Framer Motion](https://www.framer.com/motion/)** (Fluid animations and transitions)

### Backend & Data

- **[Supabase](https://supabase.com/)** (Database, Auth, Row Level Security)
- **[Google Gemini API](https://ai.google.dev/)** (LLM for match analysis)
- **[Tavily AI](https://tavily.com/)** (Search API for real-time context)
- **[The Odds API](https://the-odds-api.com/)** (Betting odds data)
- **[Football-Data.org](https://www.football-data.org/)** (Fixture and team data)

---

## 🏗️ Project Structure

```bash
📦 src
 ┣ 📂 actions       # Server Actions for mutations (auth, favorites)
 ┣ 📂 app           # Next.js App Router pages & layouts
 ┃ ┣ 📂 (auth)      # Authentication routes (login, register)
 ┃ ┗ 📂 dashboard   # Main application interface
 ┣ 📂 components    # React components (shadcn/ui + custom)
 ┣ 📂 lib           # External API integrations & utilities
 ┃ ┣ 📜 football.ts # Football-Data.org fetcher
 ┃ ┣ 📜 gemini.ts   # Gemini AI prediction logic
 ┃ ┣ 📜 odds.ts     # Odds API fetcher
 ┃ ┣ 📜 proxy.ts    # Central API orchestrator
 ┃ ┗ 📜 tavily.ts   # Contextual news search
 ┗ 📂 types         # TypeScript definitions
```

---

## 🏁 Getting Started

### Prerequisites

- Node.js 18+
- Supabase project
- API keys for Google Gemini, Tavily, The Odds API, and Football-Data.org

### Environment Variables

Create a `.env` file in the root directory:

```env
# AI & Data
GOOGLE_API_KEY=...
TAVILY_API_KEY=...
ODDS_API_KEY=...
FOOTBALL_API_KEY=...

# Backend
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/score-cast-ai.git
   cd score-cast-ai
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Run the development server**

   ```bash
   npm run dev
   ```

4. **View the dashboard**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
