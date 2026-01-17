# Agri-OS Architecture

Technical architecture and design decisions for Agri-OS.

---

## 🏗️ **System Overview**

Agri-OS is a React-based web application for smart farm management, built with:
- **Frontend**: React 18 with React Router
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **State Management**: React Hooks + Local Storage (demo mode)
- **Styling**: Tailwind CSS + Custom CSS
- **Charts**: Recharts
- **Icons**: Lucide React

---

## 📐 **Architecture Diagram**

```
┌─────────────────────────────────────────────────────────────┐
│                      USER INTERFACE                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Landing  │  │Dashboard │  │Microgreens│  │Hydroponics│   │
│  │  Page    │  │   Home   │  │   Page   │  │   Page   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Daily   │  │Analytics │  │ Finance  │  │  Market  │   │
│  │ Tracker  │  │   Page   │  │   Page   │  │   Page   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    FEATURE MODULES                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │     Auth     │  │  Microgreens │  │ Hydroponics  │     │
│  │  - Login     │  │  - Batches   │  │  - Systems   │     │
│  │  - Sign Up   │  │  - Harvest   │  │  - Monitoring│     │
│  │  - OAuth     │  │  - Tracking  │  │  - Harvest   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  SHARED COMPONENTS                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │EmptyState│  │ Tooltip  │  │HelpIcon  │  │WelcomeModal│   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    UTILITIES & HOOKS                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ sampleData   │  │ harvestData  │  │  glossary    │     │
│  │ - Demo mode  │  │ - Revenue    │  │ - Terms      │     │
│  │ - Sample DB  │  │ - Yield      │  │ - Tooltips   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │useMicrogreens│  │useHydroponics│                        │
│  │   (Hook)     │  │    (Hook)    │                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    DATA LAYER                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Supabase Client                          │  │
│  │  - Authentication (Auth)                              │  │
│  │  - Database (PostgreSQL)                              │  │
│  │  - Real-time subscriptions                            │  │
│  └──────────────────────────────────────────────────────┘  │
│                            ↓                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Local Storage (Demo Mode)                │  │
│  │  - demo_batches                                       │  │
│  │  - demo_systems                                       │  │
│  │  - demo_logs                                          │  │
│  │  - demo_harvests                                      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📂 **Directory Structure**

```
src/
├── components/          # Shared UI components
│   ├── ui/             # Basic UI components
│   │   └── StatCard.js
│   ├── EmptyState.js   # Empty state component
│   ├── Tooltip.js      # Tooltip component
│   ├── HelpIcon.js     # Help icon with glossary
│   └── WelcomeModal.js # Onboarding modal
│
├── features/           # Feature-based modules
│   ├── auth/          # Authentication
│   │   └── LoginPage.js
│   ├── landing/       # Landing page
│   │   └── LandingPage.js
│   ├── dashboard/     # Dashboard
│   │   └── DashboardHome.js
│   ├── microgreens/   # Microgreens tracking
│   │   ├── MicrogreensPage.js
│   │   └── hooks/
│   │       └── useMicrogreens.js
│   ├── hydroponics/   # Hydroponics monitoring
│   │   ├── HydroponicsPage.js
│   │   └── hooks/
│   │       └── useHydroponics.js
│   ├── tracker/       # Daily tracker
│   │   └── DailyTrackerPage.js
│   ├── analytics/     # Analytics & charts
│   │   └── AnalyticsPage.js
│   ├── finance/       # Finance calculator
│   │   └── FinancePage.js
│   ├── market/        # Market prices
│   │   └── MarketPage.js
│   ├── fields/        # Field management
│   │   └── FieldsPage.js
│   └── agronomy/      # Agronomy intelligence
│       └── AgronomyPanel.js
│
├── utils/             # Utility functions
│   ├── sampleData.js      # Demo mode data
│   ├── harvestData.js     # Harvest utilities
│   ├── glossary.js        # Term definitions
│   └── agronomyAlgorithms.js
│
├── lib/               # External libraries
│   ├── supabaseClient.js  # Supabase config
│   └── supabase.js        # Supabase instance
│
├── layouts/           # Layout components
│   └── DashboardLayout.js
│
├── store/             # State management
│   └── farmStore.js
│
├── App.js             # Main app component
├── index.js           # Entry point
└── index.css          # Global styles
```

---

## 🔄 **Data Flow**

### **1. Authentication Flow**

```
User → LoginPage → Supabase Auth → Session Token → Protected Routes
                                         ↓
                                    User Profile
```

### **2. Microgreens Batch Flow**

```
User Input → MicrogreensPage → useMicrogreens Hook
                                      ↓
                            ┌─────────┴─────────┐
                            ↓                   ↓
                     Demo Mode?           Real Mode
                            ↓                   ↓
                    localStorage          Supabase DB
                    (demo_batches)        (batches table)
                            ↓                   ↓
                            └─────────┬─────────┘
                                      ↓
                              Update UI State
```

### **3. Harvest Flow**

```
Harvest Button → Harvest Modal → Capture Data
                                      ↓
                          ┌───────────┴───────────┐
                          ↓                       ↓
                    Harvest Record          Update Source
                 (demo_harvests/DB)      (batch/system status)
                          ↓                       ↓
                          └───────────┬───────────┘
                                      ↓
                            Update Dashboard Stats
                            Update Finance Page
```

---

## 🗄️ **Database Schema**

### **Tables**

#### **batches** (Microgreens)
```sql
id              UUID PRIMARY KEY
user_id         UUID REFERENCES auth.users
batch_id        TEXT UNIQUE
crop            TEXT
tray_id         TEXT
sow_date        DATE
expected_harvest_date DATE
status          TEXT (growing/harvested)
yield_grams     INTEGER
cost            DECIMAL
revenue         DECIMAL
created_at      TIMESTAMP
```

#### **daily_logs** (Hydroponics)
```sql
id              UUID PRIMARY KEY
user_id         UUID REFERENCES auth.users
system_id       TEXT
ph              DECIMAL
ec              DECIMAL
temp            DECIMAL
water_level     INTEGER
notes           TEXT
status          TEXT
created_at      TIMESTAMP
```

#### **harvest_records**
```sql
id                      UUID PRIMARY KEY
user_id                 UUID REFERENCES auth.users
source_type             TEXT (microgreens/hydroponics)
source_id               TEXT
crop                    TEXT
harvest_date            DATE
yield_kg                DECIMAL
quality_grade           TEXT (A/B/C)
selling_price_per_kg    DECIMAL
total_revenue           DECIMAL
created_at              TIMESTAMP
```

### **Row Level Security (RLS)**

All tables have RLS enabled with policies:
- Users can only read/write their own data
- `user_id` must match authenticated user
- Public read for demo data (if needed)

---

## 🎣 **Custom Hooks**

### **useMicrogreens**

Manages microgreens batch data with demo mode support.

```javascript
const {
    batches,        // Array of batches
    addBatch,       // (batch) => void
    harvestBatch,   // (id) => void
    predictYield,   // (crop, qty) => number
    loading,        // boolean
    error          // Error | null
} = useMicrogreens();
```

**Features:**
- Auto-detects demo mode
- Fetches from localStorage or Supabase
- Calculates days current
- Determines harvest readiness

### **useHydroponics**

Manages hydroponics system data with demo mode support.

```javascript
const {
    systems,        // Array of systems
    addSystem,      // (system) => void
    updateSystem,   // (id, field, value) => void
    deleteSystem,   // (id) => void
    stats,          // { avgPH, avgEC, avgTemp }
    loading        // boolean
} = useHydroponics();
```

**Features:**
- Tracks pH, EC, temperature
- Calculates system status (critical/warning/active)
- Supports harvest workflow
- Demo mode compatible

---

## 🎨 **Component Patterns**

### **1. Feature Pages**

All feature pages follow this pattern:

```javascript
const FeaturePage = () => {
    // 1. Hooks
    const { data, loading } = useFeatureHook();
    
    // 2. Local state
    const [showModal, setShowModal] = useState(false);
    
    // 3. Handlers
    const handleAdd = () => { /* ... */ };
    
    // 4. Render
    return (
        <div>
            {/* Header */}
            {/* Stats */}
            {/* Table/Content */}
            {/* Modals */}
        </div>
    );
};
```

### **2. Reusable Components**

Components are designed to be:
- **Self-contained**: Own styles and logic
- **Configurable**: Props for customization
- **Accessible**: ARIA labels and keyboard support
- **Responsive**: Mobile-first design

Example:
```javascript
<EmptyState
    icon={<Sprout size={64} />}
    title="No batches yet"
    description="Start tracking..."
    primaryAction={<button>Add Batch</button>}
    secondaryAction={<button>Load Sample</button>}
/>
```

---

## 🔐 **Authentication**

### **Supabase Auth**

```javascript
// Sign up
const { data, error } = await supabase.auth.signUp({
    email,
    password
});

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
});

// Google OAuth
const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google'
});

// Get current user
const { data: { user } } = await supabase.auth.getUser();

// Sign out
await supabase.auth.signOut();
```

### **Protected Routes**

```javascript
// In App.js
const ProtectedRoute = ({ children }) => {
    const [user, setUser] = useState(null);
    
    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            setUser(data.user);
        });
    }, []);
    
    return user ? children : <Navigate to="/login" />;
};
```

---

## 📊 **State Management**

### **Demo Mode**

Demo mode uses localStorage for persistence:

```javascript
// Check demo mode
const isDemoMode = () => {
    return localStorage.getItem('demoMode') === 'true';
};

// Enter demo mode
const enterDemoMode = () => {
    localStorage.setItem('demoMode', 'true');
    loadSampleDataToLocalStorage();
};

// Load sample data
const loadSampleDataToLocalStorage = () => {
    localStorage.setItem('demo_batches', JSON.stringify(SAMPLE_BATCHES));
    localStorage.setItem('demo_systems', JSON.stringify(SAMPLE_SYSTEMS));
    localStorage.setItem('demo_logs', JSON.stringify(SAMPLE_LOGS));
    localStorage.setItem('demo_harvests', JSON.stringify(SAMPLE_HARVEST_RECORDS));
};
```

### **Real Mode**

Real mode uses Supabase for persistence:

```javascript
// Fetch data
const { data, error } = await supabase
    .from('batches')
    .select('*')
    .eq('user_id', user.id);

// Insert data
const { data, error } = await supabase
    .from('batches')
    .insert({ ...batch, user_id: user.id });

// Update data
const { data, error } = await supabase
    .from('batches')
    .update({ status: 'harvested' })
    .eq('id', batchId);

// Delete data
const { data, error } = await supabase
    .from('batches')
    .delete()
    .eq('id', batchId);
```

---

## 🧩 **Key Algorithms**

### **1. Days Calculation**

```javascript
const calculateDays = (startDate, endDate = new Date()) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};
```

### **2. Harvest Readiness**

```javascript
const isHarvestReady = (batch) => {
    const daysCurrent = calculateDays(batch.sow_date);
    const expectedDays = CROP_DATA[batch.crop].days;
    return daysCurrent >= expectedDays;
};
```

### **3. System Status**

```javascript
const calculateStatus = (ph, ec, temp) => {
    if (ph < 5.5 || ph > 6.5) return 'critical';
    if (ec < 1.2 || ec > 2.5) return 'warning';
    if (temp < 18 || temp > 28) return 'warning';
    return 'active';
};
```

### **4. Revenue Calculation**

```javascript
const calculateRevenue = (yield_kg, price_per_kg, quality_grade) => {
    const qualityMultiplier = {
        'A': 1.0,
        'B': 0.85,
        'C': 0.70
    };
    return yield_kg * price_per_kg * qualityMultiplier[quality_grade];
};
```

---

## 🚀 **Performance Optimizations**

### **1. Code Splitting**

```javascript
// Lazy load routes
const MicrogreensPage = lazy(() => import('./features/microgreens/MicrogreensPage'));
const HydroponicsPage = lazy(() => import('./features/hydroponics/HydroponicsPage'));
```

### **2. Memoization**

```javascript
// Memoize expensive calculations
const stats = useMemo(() => {
    return calculateStats(batches);
}, [batches]);
```

### **3. Debouncing**

```javascript
// Debounce search input
const debouncedSearch = useDebounce(searchTerm, 300);
```

---

## 🧪 **Testing Strategy**

### **Unit Tests**
- Utility functions
- Custom hooks
- Algorithms

### **Integration Tests**
- Component interactions
- Data flow
- API calls

### **E2E Tests**
- User workflows
- Demo mode
- Authentication

---

## 📈 **Scalability**

### **Current Limits**
- Demo mode: ~100 records in localStorage
- Real mode: Unlimited (Supabase)
- Concurrent users: Depends on Supabase plan

### **Future Improvements**
- Implement React Context for global state
- Add caching layer (React Query)
- Optimize database queries
- Add pagination for large datasets
- Implement virtual scrolling for tables

---

## 🔧 **Development Workflow**

1. **Feature Development**
   - Create feature branch
   - Develop in `src/features/`
   - Test with demo mode
   - Test with real Supabase

2. **Component Development**
   - Create in `src/components/`
   - Make reusable and configurable
   - Add to Storybook (if available)
   - Document props

3. **Utility Development**
   - Create in `src/utils/`
   - Write unit tests
   - Document functions
   - Export from index

---

## 📚 **Further Reading**

- [React Documentation](https://react.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/)
- [Recharts](https://recharts.org/)

---

**Last Updated**: 2026-01-13  
**Version**: 1.0.0  
**Maintainer**: Agri-OS Team
