# Agri-OS Setup Guide

Complete guide to setting up Agri-OS for development and production.

---

## 📋 **Prerequisites**

Before you begin, ensure you have:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** (v7 or higher) - Comes with Node.js
- **Git** - [Download](https://git-scm.com/)
- **Supabase Account** - [Sign up](https://supabase.com/)
- **Code Editor** - VS Code recommended

---

## 🚀 **Quick Start (5 Minutes)**

### **Option 1: Automated Setup (Recommended)**

```bash
# 1. Clone the repository
git clone https://github.com/your-username/agri-os.git
cd agri-os

# 2. Run the setup script
node setup.js

# 3. Follow the prompts to configure Supabase

# 4. Start the development server
npm start
```

### **Option 2: Manual Setup**

```bash
# 1. Clone and install
git clone https://github.com/your-username/agri-os.git
cd agri-os
npm install

# 2. Create .env file
cp .env.example .env

# 3. Edit .env and add your Supabase credentials
# (Get these from https://supabase.com/dashboard)

# 4. Start the server
npm start
```

---

## 🔧 **Detailed Setup**

### **Step 1: Clone the Repository**

```bash
git clone https://github.com/your-username/agri-os.git
cd agri-os
```

### **Step 2: Install Dependencies**

```bash
npm install
```

This will install all required packages including:
- React 18
- React Router DOM
- Supabase JS Client
- Lucide React (icons)
- Recharts (charts)

### **Step 3: Configure Environment Variables**

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
# Supabase Configuration
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: Weather API
REACT_APP_WEATHER_API_KEY=your-weather-api-key
```

**Where to find Supabase credentials:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings → API
4. Copy the URL and anon/public key

### **Step 4: Set Up Supabase Database**

#### **4.1 Create a New Project**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Enter project name: `agri-os`
4. Set a strong database password
5. Choose a region close to you
6. Click "Create new project"

#### **4.2 Run Database Setup SQL**

1. In Supabase Dashboard, go to SQL Editor
2. Click "New Query"
3. Copy the entire contents of `supabase_setup.sql`
4. Paste into the SQL Editor
5. Click "Run" or press Ctrl+Enter

This will create all necessary tables:
- `batches` - Microgreens batches
- `daily_logs` - Hydroponics system logs
- `harvest_records` - Harvest tracking
- `users` - User profiles (auto-created by Supabase Auth)

#### **4.3 Verify Tables**

1. Go to Table Editor in Supabase Dashboard
2. You should see all tables listed
3. Check that Row Level Security (RLS) is enabled

### **Step 5: (Optional) Configure Google OAuth**

For Google Sign-In functionality:

1. Follow the detailed guide in `google_auth_setup.md`
2. Or skip this step and use email/password authentication

### **Step 6: Start Development Server**

```bash
npm start
```

The app will open at `http://localhost:3000`

---

## 🎮 **Try Demo Mode**

Don't want to set up Supabase right away? Try demo mode!

1. Go to `http://localhost:3000`
2. Click **"Try Demo (No Login)"**
3. Explore all features with sample data
4. No database required!

**Demo mode features:**
- ✅ 4 sample microgreens batches
- ✅ 2 sample hydroponics systems
- ✅ 6 daily logs
- ✅ 2 harvest records
- ✅ Full CRUD operations (saved to localStorage)
- ✅ All analytics and charts work

---

## 📁 **Project Structure**

```
agri-os/
├── public/              # Static files
├── src/
│   ├── components/      # Reusable components
│   │   ├── EmptyState.js
│   │   ├── Tooltip.js
│   │   ├── HelpIcon.js
│   │   └── WelcomeModal.js
│   ├── features/        # Feature modules
│   │   ├── auth/        # Authentication
│   │   ├── dashboard/   # Dashboard
│   │   ├── microgreens/ # Microgreens tracking
│   │   ├── hydroponics/ # Hydroponics monitoring
│   │   ├── tracker/     # Daily tracker
│   │   ├── analytics/   # Analytics & charts
│   │   ├── finance/     # Finance calculator
│   │   └── landing/     # Landing page
│   ├── utils/           # Utility functions
│   │   ├── sampleData.js
│   │   ├── harvestData.js
│   │   └── glossary.js
│   ├── lib/             # External libraries
│   │   └── supabaseClient.js
│   └── App.js           # Main app component
├── .env.example         # Environment template
├── setup.js             # Setup script
├── supabase_setup.sql   # Database schema
└── package.json         # Dependencies
```

---

## 🧪 **Testing Your Setup**

### **1. Check Environment Variables**

```bash
# In browser console (F12)
console.log('Supabase URL:', process.env.REACT_APP_SUPABASE_URL);
```

Should show your Supabase URL (not undefined).

### **2. Test Authentication**

1. Go to `/login`
2. Click "Sign Up"
3. Enter email and password
4. Check Supabase Dashboard → Authentication → Users
5. You should see your new user

### **3. Test Database Connection**

1. Log in to the app
2. Go to Microgreens page
3. Click "+ New Batch"
4. Add a batch
5. Check Supabase Dashboard → Table Editor → batches
6. You should see your new batch

### **4. Test Demo Mode**

1. Log out (or use incognito window)
2. Go to landing page
3. Click "Try Demo (No Login)"
4. Navigate through all pages
5. All features should work with sample data

---

## 🐛 **Troubleshooting**

### **Issue: "Module not found" errors**

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### **Issue: "Supabase client error"**

**Causes:**
- Missing or incorrect `.env` file
- Wrong Supabase URL or key
- Supabase project not created

**Solution:**
1. Check `.env` file exists
2. Verify credentials in Supabase Dashboard
3. Ensure no extra spaces in `.env`
4. Restart development server

### **Issue: "Table does not exist"**

**Solution:**
1. Go to Supabase SQL Editor
2. Run `supabase_setup.sql` again
3. Check Table Editor to verify tables exist

### **Issue: "Row Level Security policy violation"**

**Solution:**
1. Check that RLS policies are created (in `supabase_setup.sql`)
2. Ensure you're logged in
3. Check that `user_id` matches your auth user ID

### **Issue: Port 3000 already in use**

**Solution:**
```bash
# Kill process on port 3000
npx kill-port 3000

# Or use a different port
PORT=3001 npm start
```

### **Issue: Demo mode not working**

**Solution:**
1. Clear browser localStorage: `localStorage.clear()`
2. Refresh page
3. Click "Try Demo" again

---

## 🔒 **Security Best Practices**

### **Environment Variables**

- ✅ Never commit `.env` to Git
- ✅ Use `.env.example` as a template
- ✅ Keep Supabase keys secret
- ✅ Use different keys for dev/prod

### **Supabase Security**

- ✅ Enable Row Level Security (RLS) on all tables
- ✅ Use anon key for client-side (not service key!)
- ✅ Validate user input on server-side
- ✅ Use Supabase Auth for authentication

### **Production Deployment**

- ✅ Set environment variables in hosting platform
- ✅ Enable HTTPS
- ✅ Use production Supabase project
- ✅ Enable rate limiting

---

## 📦 **Available Scripts**

### **Development**

```bash
npm start          # Start development server
npm run build      # Build for production
npm test           # Run tests
npm run eject      # Eject from Create React App (⚠️ irreversible)
```

### **Setup**

```bash
node setup.js      # Interactive setup wizard
```

### **Database**

```bash
# Run in Supabase SQL Editor
supabase_setup.sql  # Create all tables and policies
```

---

## 🌐 **Deployment**

### **Netlify (Recommended)**

1. Push code to GitHub
2. Go to [Netlify](https://netlify.com)
3. Click "New site from Git"
4. Select your repository
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `build`
6. Add environment variables in Netlify dashboard
7. Deploy!

### **Vercel**

1. Push code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Add environment variables
5. Deploy!

### **Manual Deployment**

```bash
# Build the app
npm run build

# Deploy the 'build' folder to your hosting service
```

---

## 📚 **Next Steps**

After setup is complete:

1. **Read the Documentation**
   - [ARCHITECTURE.md](./ARCHITECTURE.md) - Understand the codebase
   - [testing_guide.md](./testing_guide.md) - Learn how to test

2. **Explore the Code**
   - Start with `src/App.js`
   - Check out `src/features/` for main features
   - Look at `src/components/` for reusable components

3. **Customize**
   - Update branding in `src/features/landing/LandingPage.js`
   - Modify color scheme in `src/index.css`
   - Add your own features!

4. **Deploy**
   - Follow deployment guide above
   - Share your app with users!

---

## 🆘 **Getting Help**

- **Documentation**: Check all `.md` files in the project
- **Issues**: Open an issue on GitHub
- **Community**: Join our Discord (link in README)
- **Email**: support@agri-os.com

---

## ✅ **Setup Checklist**

Use this checklist to track your setup progress:

- [ ] Node.js and npm installed
- [ ] Repository cloned
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file created and configured
- [ ] Supabase project created
- [ ] Database tables created (`supabase_setup.sql`)
- [ ] Development server starts (`npm start`)
- [ ] Can access `http://localhost:3000`
- [ ] Demo mode works
- [ ] Can create an account
- [ ] Can add a microgreens batch
- [ ] Can add a hydroponics system
- [ ] Can log daily data
- [ ] Can view analytics

**All checked?** 🎉 You're ready to start developing!

---

**Last Updated**: 2026-01-13  
**Version**: 1.0.0  
**Maintainer**: Agri-OS Team
