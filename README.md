# StayHub — Airbnb Clone (MERN Stack)

A production-ready, full-stack Airbnb clone built with the MERN stack.

## 🚀 Quick Start

### Prerequisites
- Node.js v18+ (v24.x installed)
- MongoDB Atlas or local MongoDB
- Cloudinary account (for image uploads)

### 1. Setup Environment Variables

**Server:**
```bash
cd server
copy .env.example .env
# Fill in your values in .env
```

Required values in `server/.env`:
```
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/airbnb-clone
JWT_SECRET=your_super_secret_32+_chars_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 2. Install Dependencies
```bash
# From project root
npm run install-all
```

### 3. Run Development Servers

**Server (port 5000):**
```bash
cd server
npx nodemon server.js
# OR: node server.js
```

**Client (port 5173):**
```bash
cd client
npx vite
```

---

## 📁 Project Structure

```
project/
├── server/          # Express.js API
│   ├── config/      # DB + Cloudinary config
│   ├── controllers/ # Route controllers
│   ├── middleware/  # Auth, upload, validation
│   ├── models/      # Mongoose models
│   ├── routes/      # API routes
│   ├── utils/       # Helpers
│   └── server.js    # Entry point
│
└── client/          # React + Vite frontend
    └── src/
        ├── components/  # Reusable components
        ├── context/     # Auth + Wishlist contexts
        ├── pages/       # Route pages
        └── services/    # API service layer
```

---

## 🔑 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/update-profile` | Update profile |
| PUT | `/api/auth/change-password` | Change password |

### Properties
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/properties` | List with filters |
| GET | `/api/properties/featured` | Featured listings |
| GET | `/api/properties/:id` | Single property |
| GET | `/api/properties/my-listings` | Host's properties |
| POST | `/api/properties` | Create (host/admin) |
| PUT | `/api/properties/:id` | Update (owner/admin) |
| DELETE | `/api/properties/:id` | Delete |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bookings` | Create booking |
| GET | `/api/bookings/my-bookings` | User's bookings |
| GET | `/api/bookings/host-bookings` | Host's bookings |
| GET | `/api/bookings/:id` | Single booking |
| PUT | `/api/bookings/:id/cancel` | Cancel |
| GET | `/api/bookings/availability/:propertyId` | Check availability |

### Reviews, Wishlist, Admin — see `server/routes/` for full list

---

## 🚀 Deployment

### Frontend → Vercel
1. Push `client/` to GitHub
2. Connect to Vercel
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Add environment variable: `VITE_API_URL=https://your-api.render.com`

### Backend → Render
1. Push `server/` to GitHub
2. Create Render Web Service
3. Set build command: `npm install`
4. Set start command: `node server.js`
5. Add all environment variables from `.env.example`

### Database → MongoDB Atlas
1. Create free M0 cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create database user
3. Whitelist all IPs (0.0.0.0/0 for Render)
4. Copy connection string to `MONGO_URI`

### Cloudinary (Image Uploads)
1. Create account at [cloudinary.com](https://cloudinary.com)
2. Copy Cloud Name, API Key, API Secret to `.env`

---

## 🔐 Security Features

- JWT authentication (7-day expiry)
- bcrypt password hashing (12 rounds)
- Helmet security headers
- Rate limiting (100/15min global, 10/hr auth)
- XSS protection
- MongoDB injection prevention
- CORS whitelist
- Input validation & sanitization

---

## 👤 Default Admin Account

After registering, manually update a user's role to `admin` in MongoDB:
```js
db.users.updateOne({ email: "your@email.com" }, { $set: { role: "admin" } })
```
