# SMS Launcher

A mobile-first web app that stores phone numbers and opens your device's native SMS app with pre-filled recipients and message. **No automatic SMS sending** - you always press send manually.

## Features

- 🔐 User authentication (register/login with JWT)
- 📱 Add and manage phone contacts
- ✅ Select multiple contacts (up to 20)
- 💬 Compose message text
- 📤 Opens native SMS app with pre-filled data
- 📲 Mobile-first design (desktop warning shown)

## Tech Stack

- **Backend**: Node.js, Express, MongoDB, JWT
- **Frontend**: React (Vite), React Router
- **Deployment**: Render-ready

## Local Development

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### Setup

1. **Clone and install dependencies:**

```bash
# Backend
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Frontend
cd ../frontend
npm install
```

2. **Start development servers:**

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

3. **Open http://localhost:5173**

## Deploy to Render

### Option 1: Using render.yaml (Blueprint)

1. Push code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Click "New" → "Blueprint"
4. Connect your repository
5. Set `MONGODB_URI` environment variable (use MongoDB Atlas)
6. Deploy!

### Option 2: Manual Setup

1. **Create Web Service on Render:**
   - Build Command: `cd frontend && npm install && npm run build && cd ../backend && npm install`
   - Start Command: `cd backend && npm start`

2. **Set Environment Variables:**
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: A secure random string (32+ characters)

3. **Deploy!**

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port (auto-set by Render) | No |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret for JWT signing | Yes |
| `NODE_ENV` | `development` or `production` | No |

## SMS URI Format

The app uses the standard `sms:` URI scheme:

```
sms:+998901234567,+998931112233?body=Hello%20World
```

This opens the device's native SMS app with:
- Recipients pre-filled
- Message body pre-filled
- User must manually press Send

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Phones (requires auth)
- `GET /api/phones` - List all contacts
- `POST /api/phones` - Add contact
- `PUT /api/phones/:id` - Update contact
- `DELETE /api/phones/:id` - Delete contact

## Security Notes

- Passwords hashed with bcrypt (12 rounds)
- JWT tokens expire in 7 days
- All phone routes require authentication
- Input validation on all endpoints
- No SMS permissions required - uses URI scheme only

## License

MIT
