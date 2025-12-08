# 🌍 Planet Calm - Interactive Global Movement Map

A MERN stack application that creates an interactive, real-time updating map showing people joining the Planet Calm movement. When someone signs up, their pin automatically appears on the map.

## ✨ Features

- **Real-time Map Updates**: Pins appear automatically using WebSockets (Socket.io)
- **Beautiful Mapbox Integration**: Calm, aesthetic map styling matching the Planet Calm brand
- **Webhook Support**: Receives data from GoHighLevel via Make.com/Zapier
- **Member Counter**: Shows growing community in real-time
- **Mobile Responsive**: Works beautifully on all devices
- **Email Capture**: Secondary form for newsletter signup

## 🏗️ Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  GoHighLevel    │────▶│   Make.com      │────▶│  Backend API    │
│  Form Submit    │     │   Webhook       │     │  (Express)      │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
                                                         ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  React Frontend │◀────│  Socket.io      │◀────│   MongoDB       │
│  (Mapbox GL)    │     │  Real-time      │     │   Database      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Mapbox account (free tier works)

### Environment Variables

Create `.env` files:

**Backend (.env)**
```env
PORT=5000
MONGODB_URI=mongodb+srv://your-connection-string
MAPBOX_ACCESS_TOKEN=your-mapbox-token
WEBHOOK_SECRET=your-webhook-secret
JWT_SECRET=your-jwt-secret
FRONTEND_URL=http://localhost:3000
```

**Frontend (.env)**
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_MAPBOX_TOKEN=your-mapbox-token
REACT_APP_SOCKET_URL=http://localhost:5000
```

### Installation

```bash
# Clone and install backend
cd backend
npm install

# Install frontend
cd ../frontend
npm install

# Run both (from root)
npm run dev
```

## 📡 Webhook Integration (Make.com/Zapier)

### Webhook Endpoint
```
POST /api/members/webhook
Content-Type: application/json
```

### Expected Payload
```json
{
  "petName": "Luna",
  "petType": "Dog",
  "city": "Austin",
  "state": "Texas",
  "country": "United States"
}
```

### Make.com Setup
1. Create new scenario with GoHighLevel trigger
2. Add HTTP module pointing to your webhook URL
3. Map fields from GoHighLevel form to webhook payload
4. Enable scenario

## 🗺️ Map Customization

The map uses a custom calm-themed style. Customize in:
- `frontend/src/utils/mapStyle.js` - Mapbox style configuration
- `frontend/src/components/Map.jsx` - Map component settings

## 📁 Project Structure

```
planet-calm/
├── backend/
│   ├── config/          # Database & app config
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Auth, validation
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   └── server.js        # Express app entry
├── frontend/
│   ├── public/          # Static assets
│   └── src/
│       ├── components/  # React components
│       ├── context/     # Global state
│       ├── hooks/       # Custom hooks
│       ├── pages/       # Page components
│       ├── styles/      # CSS/Tailwind
│       └── utils/       # Helpers
└── README.md
```

## 🔐 Security

- Webhook signature validation
- Rate limiting on API endpoints
- CORS configured for your domain
- Input sanitization

## 📈 Scaling

For production:
1. Use MongoDB Atlas with replica set
2. Deploy backend to Railway/Render/AWS
3. Deploy frontend to Vercel/Netlify
4. Enable Mapbox production token
5. Set up monitoring (Sentry, LogRocket)

## 🎨 Brand Colors

```css
--calm-sage: #A8C5A8
--calm-cream: #F5F2EB
--calm-earth: #8B7355
--calm-sky: #B8D4E3
--calm-mist: #E8E4DD
--calm-deep: #2C3E2D
```

## License

Private - Planet Calm © 2024
