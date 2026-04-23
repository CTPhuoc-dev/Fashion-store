# Google OAuth Login Setup Guide

## ✅ Hoàn thành các thay đổi

### 1. User Model
- Thêm trường `googleId` để lưu Google ID

### 2. App Configuration  
- Thêm Passport middleware
- Cấu hình session
- Import Passport strategy

### 3. Passport Config ([config/passport.js](config/passport.js))
- Google OAuth 2.0 Strategy
- Serialize/Deserialize user
- Tự động tạo hoặc cập nhật user

### 4. Auth Controller
- `googleCallback()` - Xử lý Google callback từ OAuth
- `loginWithGoogle()` - Trả về JWT token

### 5. Auth Routes
- `GET /api/auth/google` - Redirect đến Google login
- `GET /api/auth/google/callback` - Google redirect về
- `GET /api/auth/google/token` - Lấy JWT token

---

## 🔧 Cấu hình Google OAuth

### Bước 1: Tạo Google OAuth Credentials

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project hiện tại
3. Vào **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth 2.0 Client ID**
5. Chọn **Web application**
6. Thêm Authorized redirect URIs:
   - `http://localhost:5000/api/auth/google/callback`
   - `https://your-domain.com/api/auth/google/callback` (production)
7. Copy **Client ID** và **Client Secret**

### Bước 2: Cập nhật .env

```env
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
SESSION_SECRET=any-random-string
```

---

## 🌐 Frontend Integration

### Option 1: Direct Backend Redirect (Easiest)

```html
<a href="http://localhost:5000/api/auth/google">
  Login with Google
</a>
```

Sau khi đăng nhập, Google sẽ redirect về:
```
http://localhost:3000/auth/success?token=JWT_TOKEN&user={USER_DATA}
```

### Option 2: Using Google Sign-In Button (Recommended)

1. **Cài đặt Google Sign-In library:**

```html
<script src="https://accounts.google.com/gsi/client" async defer></script>
```

2. **Frontend code (React example):**

```jsx
import { useEffect } from 'react';

export default function GoogleLogin() {
  useEffect(() => {
    window.google.accounts.id.initialize({
      client_id: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com'
    });

    window.google.accounts.id.renderButton(
      document.getElementById('google-login-button'),
      { theme: 'outline', size: 'large' }
    );

    window.google.accounts.id.prompt();
  }, []);

  const handleCredentialResponse = async (response) => {
    // Send token to backend
    const result = await fetch('/api/auth/google/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: response.credential })
    });
    const data = await result.json();
    // Use JWT token for authentication
  };

  return <div id="google-login-button"></div>;
}
```

---

## 🔗 API Endpoints

### Endpoint 1: Initiate Google Login
```
GET /api/auth/google
```
Redirect người dùng đến Google login page

### Endpoint 2: Google OAuth Callback
```
GET /api/auth/google/callback?code=...&state=...
```
Google tự động gọi endpoint này  
Kết quả: Redirect đến `{FRONTEND_URL}/auth/success?token={JWT}&user={USER_DATA}`

### Endpoint 3: Get JWT Token
```
GET /api/auth/google/token
```
Yêu cầu: Phải có session từ Google callback  
Response:
```json
{
  "message": "Google login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@gmail.com",
    "googleId": "1234567890",
    "role": "user"
  }
}
```

---

## 🎯 Test với Postman

### Step 1: Start Google Login
```
GET: http://localhost:5000/api/auth/google
```
Sẽ redirect đến Google login page

### Step 2: Sau khi login Google
Browser tự động sang `/api/auth/google/callback` rồi redirect đến:
```
http://localhost:3000/auth/success?token=...&user=...
```

---

## ⚙️ Troubleshooting

### Error: "Invalid client"
- ✓ Kiểm tra `GOOGLE_CLIENT_ID` và `GOOGLE_CLIENT_SECRET` trong .env
- ✓ Đảm bảo credentials từ Google Cloud Console
- ✓ Kiểm tra Authorized redirect URIs in Google Console

### Error: "Redirect URI mismatch"
- ✓ `GOOGLE_CALLBACK_URL` phải khớp với Authorized redirect URI in Google Console
- ✓ Phải bao gồm full URL: `http://localhost:5000/api/auth/google/callback`

### User không được tạo
- ✓ Kiểm tra database connection
- ✓ Xác nhận User model có trường `googleId`
- ✓ Chạy: `db.sequelize.sync()`

### Session không hoạt động
- ✓ Kiểm tra `SESSION_SECRET` trong .env
- ✓ Cookies phải enable
- ✓ Kiểm tra Express-session configuration in app.js

---

## 🔒 Security Notes

- ✓ Luôn dùng HTTPS trong production
- ✓ Không commit credentials vào git - dùng .env
- ✓ Client Secret phải bảo mật, chỉ dùng server-side
- ✓ JWT token có expiration (24h) - cần refresh token cho long-term

---

## 📝 Database Sync

Khi lần đầu chạy, Sequelize sẽ tự động tạo bảng User với trường mới:

```js
// Trong app.js
db.sequelize.sync(); // true = drop & recreate, false = just create if not exists
```

Nếu cần xóa toàn bộ data:
```js
db.sequelize.sync({ force: true });
```

---

## 🚀 Production Deployment

1. **Update redirect URIs in Google Console:**
   - `https://your-domain.com/api/auth/google/callback`

2. **Update .env:**
   ```env
   FRONTEND_URL=https://your-domain.com
   GOOGLE_CALLBACK_URL=https://your-domain.com/api/auth/google/callback
   NODE_ENV=production
   ```

3. **Enable HTTPS:** Bắt buộc trong production

4. **Session Cookie Security:**
   - `secure: true` (HTTPS only)
   - `httpOnly: true` (no JavaScript access)
   - `sameSite: 'Strict'` (prevent CSRF)
