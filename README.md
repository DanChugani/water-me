# Water Me – Plant Watering Tracker

A modern, internal web application for tracking the watering status of office plants. Built with Next.js, TypeScript, TailwindCSS, MongoDB, and NextAuth for secure Google authentication.

## Features
- 🌱 Track watering status and history for shared office plants
- Google authentication (IDENTOS email only)
- Watering history log with user and timestamp
- Visual status indicators for plant health
- Responsive, modern UI with TailwindCSS
- Secure, internal-only access (not indexed by search engines)

## Tech Stack
- [Next.js](https://nextjs.org/) (App Router)
- [TypeScript](https://www.typescriptlang.org/)
- [TailwindCSS](https://tailwindcss.com/)
- [MongoDB Atlas](https://www.mongodb.com/atlas)
- [NextAuth.js](https://next-auth.js.org/) (Google provider)

## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/your-org/water-me.git
cd water-me
```

### 2. Install dependencies
```bash
npm install
# or
yarn install
```

### 3. Configure environment variables
Create a `.env.local` file in the root directory with the following variables:

```env
MONGODB_URI=your-mongodb-uri
GOOGLE_ID=your-google-oauth-client-id
GOOGLE_SECRET=your-google-oauth-client-secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret
```

**Note:** Never commit `.env.local` to version control. See `.env.example` for a template.

### 4. Run the development server
```bash
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000) in your browser.

## Usage
- Sign in with your IDENTOS Google account
- View plant status and watering history
- Mark a plant as watered and add optional notes
- Only authenticated users can access the app

## Security & Privacy
- All secrets are stored in `.env.local` (not tracked by git)
- The app is internal-only and blocks search engine indexing via `robots.txt`
- Only IDENTOS email addresses are allowed to sign in

## Deployment
- Configure production environment variables as above
- Recommended: Deploy on [Vercel](https://vercel.com/) or your preferred platform
- Ensure `robots.txt` is set to `Disallow: /` for internal use

## License
MIT (or your company's internal license)

---

*Made with ❤️ at IDENTOS.*
