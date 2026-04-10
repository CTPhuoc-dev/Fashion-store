# Forgot Password Feature Setup

## ✅ Completed Changes

### 1. **Database Model Updated**
   - Added `resetPasswordToken` field
   - Added `resetPasswordExpires` field to [models/user.model.js](models/user.model.js)

### 2. **Authentication Controller Enhanced**
   - Added `forgotPassword` function - generates reset token and sends email
   - Added `resetPassword` function - verifies token and updates password
   - See [controllers/auth.controller.js](controllers/auth.controller.js)

### 3. **Routes Added**
   - `POST /api/auth/forgot-password` - Request password reset
   - `POST /api/auth/reset-password` - Reset password with token
   - See [routes/auth.routes.js](routes/auth.routes.js)

### 4. **Environment Variables Added**
   - `EMAIL_SERVICE`: Email service provider (default: gmail)
   - `EMAIL_USER`: Your email address
   - `EMAIL_PASSWORD`: Your email app password
   - `FRONTEND_URL`: Frontend URL for reset link

## 📧 Email Configuration (Gmail)

1. **Enable 2-Step Verification** in your Google Account
2. **Generate App Password**:
   - Go to myaccount.google.com
   - Select "Security" in the left menu
   - Find "App passwords" under "Your devices"
   - Select Mail and Windows Computer
   - Copy the generated password

3. **Update .env file**:
   ```
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=xxxx-xxxx-xxxx-xxxx
   FRONTEND_URL=http://localhost:3000
   ```

## 🔗 API Endpoints

### Request Password Reset
```
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

### Reset Password
```
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset-token-from-email",
  "password": "newPassword@123",
  "confirmPassword": "newPassword@123"
}
```

## 🎨 Frontend Integration

### Reset Link Format
The reset link sent in the email will be:
```
http://localhost:3000/reset-password/{resetToken}
```

### Reset Password Page
Create a page with:
1. Form to input new password and confirm password
2. Extract token from URL: `/reset-password/:token`
3. Call API endpoint with token and new password

### Example Frontend Code
```javascript
// Extract token from URL
const token = useParams().token;

// Handle form submission
const handleResetPassword = async (password, confirmPassword) => {
  const response = await fetch('http://localhost:5000/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token,
      password,
      confirmPassword
    })
  });
  const data = await response.json();
  // Show success/error message
};
```

## ⚙️ Token Expiration
- Reset tokens expire in **30 minutes**
- Modify the expiration time in [controllers/auth.controller.js](controllers/auth.controller.js) line ~69
- Change: `new Date(Date.now() + 30 * 60 * 1000)` to desired duration

## 🔒 Security Notes
- Tokens are hashed before storing in database
- Passwords are hashed using bcrypt
- Reset tokens are valid for 30 minutes only
- Always use HTTPS in production

## 📝 Testing with Postman

1. **Test Forgot Password**:
   - Method: POST
   - URL: http://localhost:5000/api/auth/forgot-password
   - Body: `{"email": "user@example.com"}`
   - Check email for reset link

2. **Test Reset Password**:
   - Method: POST
   - URL: http://localhost:5000/api/auth/reset-password
   - Body: `{"token": "token-from-email", "password": "new123", "confirmPassword": "new123"}`

## ❌ Troubleshooting

### Email not sending?
- Check EMAIL_USER and EMAIL_PASSWORD in .env
- Verify Gmail app password is generated correctly
- Check Firebase/Mailtrap configuration if using other services

### Token invalid error?
- Make sure token hasn't expired (30 minutes)
- Copy token exactly from email
- Verify token format in reset link

### Database error?
- Run `npm install --legacy-peer-deps` to ensure nodemailer is installed
- Check database connection in .env
- Run migrations if needed
