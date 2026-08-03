🚜 Kisangaddi
Kisangaddi (branded in-app as KisanGaadi — "Fasal ko Mandi tak, Aasani se Pahunchao") is an agri-logistics platform that connects farmers with nearby drivers (mini tempo, truck, or tractor) to transport crops from farm to market. It supports real-time driver tracking, distance-based fare estimation, in-app payments, and SMS notifications.
The app has a Hindi/Hinglish-first UI aimed at Indian farmers and local transport drivers.
---
📸 Screenshots
**Splash Screen	Login / Register**
![Splash Screen](files%20(1)/01-splash-screen.png)
![Login Register](files%20(1)/02-login-register.png)

**Farmer Dashboard	Book Crop Transport**
![Farmer dashboard](files%20(1)/03-farmer-dashboard.png)

![Book crop transport form](files%20(1)/04-book-transport.png)

Driver Dashboard	Payment Checkout
![Driver dashboard](files%20(1)/05-driver-dashboard.png)	![Razorpay payment checkout](files%20(1)/06-payment-checkout.png)
---
✨ Features
Core
Farmer & Driver accounts — phone-number based registration/login with hashed passwords (bcrypt), role toggle (Farmer 🧑‍🌾 / Driver 🚜) on a single splash + auth screen
Nearby driver search — Haversine-based radius search filtered by vehicle type
Address input — free-text location search and "use my GPS" reverse geocoding via OpenStreetMap Nominatim (no API key needed)
Direct booking — farmer picks a specific driver, pickup/drop location, crop type, weight; price estimated from distance × driver's price/km
Open ("broadcast") requests — farmer posts a request with a budget and note to all drivers instead of picking one; drivers browse open requests and claim one
Booking lifecycle — `pending → accepted → picked → delivered` (or `cancelled`), with timestamps for each stage
Live GPS tracking — real-time driver location shown on a Leaflet/OpenStreetMap map, updated via Socket.io
Driver dashboard — go online/offline, set price/km & vehicle/speciality, set a planned trip route, view and claim requests, update booking status
Farmer dashboard — browse drivers, book directly or broadcast, track live, pay, view booking history
Payments — Razorpay order creation and signature verification
SMS notifications — via Fast2SMS API
Standalone demo pages (`payment.html`, `tracking.html`) — simplified, hardcoded-data versions of the payment and live-tracking flows, useful for testing those pieces in isolation from the full dashboards.
---
🛠️ Tech Stack
Layer	Technology
Frontend	Plain HTML/CSS/JS (no build step), Google Fonts (Sora, DM Sans)
Maps & Geocoding	Leaflet.js + OpenStreetMap tiles, Nominatim geocoding API
Backend runtime	Node.js
Framework	Express 5
Database	MongoDB (Mongoose)
Real-time	Socket.io
Auth	bcryptjs, jsonwebtoken
Payments	Razorpay (Checkout.js on frontend, Orders API on backend)
SMS	Fast2SMS (via axios)
---
📁 Project Structure
```
kisangaddi/
├── backend/
│   ├── server.js           # App entry point, DB connection, Socket.io setup
│   ├── models/
│   │   ├── Farmer.js       # Farmer schema (name, mobile, village, location, password)
│   │   ├── Driver.js       # Driver schema (vehicle, price/km, location, trip route, rating)
│   │   └── Booking.js      # Booking schema (farmer, driver, locations, crop, status)
│   ├── routes/
│   │   ├── farmers.js      # Farmer register/login/list/get
│   │   ├── drivers.js      # Driver register/login/nearby-search/location/settings/status
│   │   ├── bookings.js     # Booking create/list/status-update
│   │   └── payments.js     # Razorpay order creation & verification
│   ├── utils/
│   │   └── sms.js          # Fast2SMS helper
│   └── package.json
├── frontend/
│   ├── index.html              # Splash screen + phone-based login/register (farmer or driver)
│   ├── farmer-dashboard.html   # Farmer home: browse/book drivers, broadcast requests, track, pay
│   ├── driver-dashboard.html   # Driver home: go online, set price/route, view & claim requests
│   ├── payment.html            # Standalone Razorpay payment demo (hardcoded amount/booking)
│   └── tracking.html           # Standalone live-tracking demo (Leaflet map + simulated GPS)
└── README.md
```
---
⚙️ Prerequisites
Node.js (v18+ recommended)
MongoDB running locally (or update the connection string)
A Razorpay account (test keys are fine for development)
A Fast2SMS account for SMS notifications
---
🚀 Getting Started
1. Clone and install dependencies
```bash
git clone <your-repo-url> kisangaddi
cd kisangaddi/backend
npm install
```
2. Configure environment variables
Create a `.env` file in the project root:
```env
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
FAST2SMS_API_KEY=your_fast2sms_api_key
```
> **Note:** The MongoDB connection string is currently hardcoded in `server.js` as `mongodb://localhost:27017/kisangaadi`. Consider moving this to `.env` as `MONGO_URI` for flexibility across environments.
3. Run the server
```bash
node server.js
```
The server starts on port 5000. Visit `http://localhost:5000` — you should see:
```
KisanGaadi Backend is Running! 🚜
```
4. Run the frontend
The frontend is plain static HTML/JS — no build step or bundler required. All pages call the backend at `http://localhost:5000/api`, hardcoded at the top of each file's `<script>` block, so update that if you deploy the backend elsewhere.
From the `frontend/` folder, serve the files with any static server, for example:
```bash
cd frontend
npx serve .
# or: python3 -m http.server 8080
```
Then open `index.html` first — it handles login/registration and redirects to the correct dashboard (`farmer-dashboard.html` or `driver-dashboard.html`) based on role, storing the logged-in user in `localStorage`.
> `payment.html` and `tracking.html` can be opened directly for quick, isolated testing of those two flows without going through login.
---
📡 API Reference
Farmers — `/api/farmers`
Method	Endpoint	Description
POST	`/register`	Register a new farmer
POST	`/login`	Farmer login
GET	`/all`	List all farmers
GET	`/:id`	Get a single farmer
Drivers — `/api/drivers`
Method	Endpoint	Description
POST	`/register`	Register a new driver
POST	`/login`	Driver login
GET	`/all`	List all drivers
GET	`/nearby?lat=&lng=&radius=&vehicleType=`	Find online drivers within a radius (km), optionally filtered by vehicle type
GET	`/:id`	Get a single driver
PATCH	`/:id/location`	Update driver's current GPS location (sets `isOnline: true`)
PATCH	`/:id/settings`	Update price/km, vehicle info, or speciality
PATCH	`/:id/status`	Toggle online/offline status
PATCH	`/:id/trip-route`	Set a planned trip route (from/to with coordinates)
Bookings — `/api/bookings`
Method	Endpoint	Description
POST	`/create`	Create a booking (farmer + driver + locations + crop details)
GET	`/all`	List all bookings
GET	`/farmer/:farmerId`	List bookings for a specific farmer
GET	`/driver/:driverId`	List bookings for a specific driver
PATCH	`/status/:bookingId`	Update booking status (`accepted`, `picked`, `delivered`, `cancelled`)
Payments — `/api/payments`
Method	Endpoint	Description
POST	`/create-order`	Create a Razorpay order for a booking
POST	`/verify`	Verify Razorpay payment signature
---
🔌 Real-Time Events (Socket.io)
Event	Direction	Payload	Description
`driverLocation`	Client → Server	`{ lat, lng, ... }`	Driver emits their current location
`updateLocation`	Server → All Clients	same as above	Broadcast to all connected clients (e.g. farmer tracking a driver)
---
🗺️ Booking Status Flow
```
pending → accepted → picked → delivered
              ↘
            cancelled
```
Each transition (`accepted`, `picked`, `delivered`) stamps the corresponding timestamp field on the booking document.
---
⚠️ Known Frontend/Backend Gaps
The dashboards call a few endpoints that don't exist yet in the current backend routes — worth wiring up before the app fully works end-to-end:
Frontend calls	Backend has	Notes
`GET /api/bookings/open`	—	Powers the driver's "open requests" feed; not implemented
`POST /api/bookings/claim/:bookingId`	—	Lets a driver claim a broadcast request; not implemented
`PATCH /api/drivers/update-location`	`PATCH /api/drivers/:id/location`	Frontend is missing the driver ID in the path
Also, `postOpenRequest()` on the farmer dashboard needs a way to mark a booking as an open/broadcast request (e.g. an `isOpenRequest` boolean or a `driver: null` convention) — the current `Booking` schema requires a `driver` on creation, which conflicts with "post to all drivers, let one claim it."
---
🔒 Security Notes for Production
A few things worth hardening before deploying:
Move the MongoDB URI into environment variables instead of hardcoding it
Issue and verify JWTs on login (the dependency is included but not yet wired into the routes)
Add request validation (e.g. `express-validator` or `zod`) on all POST/PATCH bodies
Rate-limit auth endpoints to prevent brute-force attempts
Restrict Socket.io CORS origin from `*` to your actual frontend domain
---
📄 License
ISC
