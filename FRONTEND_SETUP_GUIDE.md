
# Frontend Setup & Run Guide

## 📋 Frontend Structure Created

```
frontend/
├── src/
│   ├── config/api.js                 # Axios API setup
│   ├── context/AuthContext.jsx       # Authentication context & hooks
│   ├── pages/
│   │   ├── LoginPage.jsx             # Email/Password login
│   │   ├── RegisterPage.jsx          # User registration
│   │   ├── AuthSuccessPage.jsx       # Google OAuth callback
│   │   ├── ForgotPasswordPage.jsx    # Forgot password request
│   │   ├── ResetPasswordPage.jsx     # Reset password
│   │   ├── DashboardPage.jsx         # User dashboard
│   │   └── ProfilePage.jsx           # Edit profile
│   ├── styles/
│   │   ├── index.css
│   │   ├── auth.css
│   │   ├── dashboard.css
│   │   └── profile.css
│   ├── App.jsx                       # Main app with routing
│   └── index.jsx                     # React entry point
├── public/index.html                 # HTML template
├── package.json                      # Dependencies
├── .env                              # Environment configuration
└── README.md                         # Frontend documentation
```

## ⚙️ Installation & Setup

### Step 1: Install Dependencies

```bash
cd frontend
npm install
```

### Step 2: Configure Environment

Update `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### Step 3: Start Backend (if not running)

```bash
cd backend
npm start
# Should run on http://localhost:5000
```

### Step 4: Start Frontend

```bash
cd frontend
npm start
# Opens http://localhost:3000 automatically
```

## 🔐 Features Implemented

### Authentication Pages
✅ **Login** (`/login`)
- Email/Password login
- Google OAuth button
- Forgot password link
- Register link

✅ **Register** (`/register`)
- Create new account
- Email & Password validation
- Auto-login after registration

✅ **Forgot Password** (`/forgot-password`)
- Request password reset
- Email validation

✅ **Reset Password** (`/reset-password/:token`)
- Reset with token from email
- Password confirmation

✅ **Google OAuth Callback** (`/auth/success`)
- Handles Google login redirect
- Stores token & user info

### Protected Pages
✅ **Dashboard** (`/dashboard`)
- Welcome message
- Quick links to Products, Orders, Cart, Profile
- User menu with Logout

✅ **Profile** (`/profile`)
- View profile info
- Edit name and email
- Display user ID, role, login method
- Logout button

## 🔗 Authentication Flow

### Email/Password Login
1. User goes to `/login`
2. Enters email and password
3. API call to `POST /api/auth/login`
4. Token stored automatically
5. Redirected to `/dashboard`

### Google OAuth
1. User clicks "Login with Google"
2. Redirected to backend `/api/auth/google`
3. Google authentication
4. Backend redirects to `/auth/success?token=...&user=...`
5. Frontend extracts token and user
6. Redirected to `/dashboard`

### Forgot Password
1. User goes to `/forgot-password`
2. Enters email
3. Email sent with reset link
4. User clicks link in email → `/reset-password/:token`
5. Enters new password
6. Redirected to login

## 🎯 API Endpoints Used

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/auth/login` | Email login |
| POST | `/auth/register` | Register account |
| POST | `/auth/forgot-password` | Request reset |
| POST | `/auth/reset-password` | Reset password |
| PUT | `/auth/profile` | Update profile |
| GET | `/auth/google` | Google OAuth init |
| GET | `/auth/google/callback` | OAuth callback |

## 📱 Responsive Design

- ✅ Desktop (1920px+)
- ✅ Tablet (768px - 1024px)  
- ✅ Mobile (320px - 767px)

## 🎨 Styling Features

- Purple/Blue gradient theme
- Smooth animations
- Clean, modern UI
- Dark mode ready

## 🛡️ Security Features

- JWT token stored in localStorage
- Automatic token in API headers
- Auto logout on 401 error
- Password confirmation validation
- Secure session cookies

## 💾 State Management

Using React Context API:

```javascript
// In any component
import { useAuth } from './context/AuthContext';

function MyComponent() {
  const { user, token, isAuthenticated, login, logout } = useAuth();
  
  return <div>{user?.name}</div>;
}
```

## 🧪 Testing URLs

### Login Page
```
http://localhost:3000/login
```

### Register Page
```
http://localhost:3000/register
```

### Dashboard (Protected)
```
http://localhost:3000/dashboard
```
(Will redirect to login if not authenticated)

## ⚠️ Common Issues & Solutions

### Issue: "Cannot GET /api/auth/login"
**Solution:** Backend not running or wrong API URL in `.env`

### Issue: Google login says "Redirect URI mismatch"
**Solution:** Check Google Console OAuth settings match backend GOOGLE_CALLBACK_URL

### Issue: "Token missing" errors
**Solution:** Clear localStorage and re-login

### Issue: Styles not loading
**Solution:** 
```bash
npm install
npm start
# Clear browser cache (Ctrl+Shift+Del)
```

## 📚 Next Steps

1. ✅ Backend running on `http://localhost:5000`
2. ✅ Frontend running on `http://localhost:3000`
3. ✅ Update `.env` with your Google Client ID
4. ✅ Test login flows
5. ✅ Add product pages (not included in auth setup)
6. ✅ Deploy to production

## 🚀 Production Deployment

### Build
```bash
npm run build
```

### Deploy
- Upload `build/` folder to hosting service
- Update `REACT_APP_API_URL` to production backend
- Update Google OAuth redirect URIs

## 📖 Documentation Files

- `README.md` - Frontend overview and setup
- `FRONTEND_SETUP_GUIDE.md` - This file
- `GOOGLE_LOGIN_FRONTEND.jsx` - Frontend integration examples
