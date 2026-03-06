# ChaturVima Frontend

A comprehensive employee assessment and organizational health platform built with React, TypeScript, and modern web technologies. ChaturVima helps organizations understand employee engagement across different stages of their journey and provides insights for better organizational alignment.

## 🚀 Features

### **Multi-Role Dashboard System**
- **Employee Dashboard**: Personal assessment tracking, stage analysis, and journey visualization
- **HR Admin Dashboard**: Assessment cycle management, organization health reports, and employee analytics
- **Super Admin**: Complete system administration, organization setup, department and employee management
- **Department Head**: Team-level insights and management capabilities

### **Assessment System**
- **Dynamic Assessment Cycles**: Create and manage assessment periods with customizable questionnaires
- **Stage-Based Analysis**: Track employees through four key stages:
  - Honeymoon (Initial enthusiasm)
  - Self-Reflection (Learning and adaptation)
  - Soul-Searching (Challenge and growth)
  - Steady-State (Established performance)
- **Real-time Progress Tracking**: Monitor assessment completion and engagement metrics
- **SWOT Analysis Integration**: Comprehensive strength, weakness, opportunity, and threat analysis

### **Advanced Analytics & Reporting**
- **Interactive Data Visualizations**: Built with Nivo charts, Recharts, and custom components
- **Organizational Health Reports**: Multi-level insights from individual to company-wide metrics
- **PDF Report Generation**: Automated report creation with HTML2Canvas and jsPDF
- **Excel Integration**: Bulk employee upload and data export capabilities
- **Heatmap Visualizations**: Department and team performance mapping

### **Modern User Experience**
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Smooth Animations**: Framer Motion for enhanced user interactions
- **Gamification Elements**: Achievement system with React Confetti celebrations
- **Real-time Updates**: React Query for efficient data fetching and caching
- **OTP Authentication**: Secure login system with phone verification

## 🛠️ Tech Stack

### **Frontend Framework**
- **React 19.2.0** - Latest React with modern features
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and development server

### **Styling & UI**
- **Tailwind CSS 4.1.16** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library
- **Framer Motion** - Animation library
- **React Confetti** - Celebration effects

### **Data Visualization**
- **Nivo Charts** - Professional data visualization suite
  - Bar, Line, Pie, Radar, Scatter plots
  - Heatmaps, Treemaps, and specialized charts
- **Recharts** - Additional charting capabilities
- **React Gauge Component** - Performance indicators
- **React Heatmap Grid** - Custom heatmap visualizations

### **State Management & API**
- **React Query (TanStack)** - Server state management
- **React Context** - Global state management
- **Axios** - HTTP client for API communication

### **Additional Libraries**
- **React Router DOM** - Client-side routing
- **HTML2Canvas & jsPDF** - Report generation
- **XLSX** - Excel file processing
- **React Phone Input** - International phone number input

## 📁 Project Structure

```
src/
├── api/                    # API configuration and endpoints
│   ├── api-functions/      # Organized API functions
│   ├── axios-setup.ts      # Axios configuration
│   └── endpoints.ts        # API endpoint definitions
├── assets/                 # Static assets and images
├── components/             # Reusable UI components
│   ├── assessment/         # Assessment-specific components
│   ├── assessmentCycles/   # Cycle management components
│   ├── assessmentDashboard/# Dashboard components
│   ├── common/            # Shared components
│   ├── dashboard/         # General dashboard components
│   ├── layout/            # Layout components
│   └── ui/                # Base UI components
├── context/               # React Context providers
│   ├── AssessmentContext.tsx
│   ├── UserContext.tsx
│   ├── SidebarContext.tsx
│   └── SelectedAssessmentCycleContext.tsx
├── pages/                 # Page components
│   ├── Employee/          # Employee-specific pages
│   ├── hrAdmin/           # HR Admin pages
│   ├── superAdmin/        # Super Admin pages
│   ├── Settings/          # User settings
│   └── Login.tsx          # Authentication
├── types/                 # TypeScript type definitions
└── App.tsx               # Main application component
```

## 🚦 Getting Started

### **Prerequisites**
- Node.js (v18 or higher)
- npm or yarn package manager

### **Installation**

1. **Clone the repository**
```bash
git clone <repository-url>
cd Chaturvima-Frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
Create a `.env` file in the root directory:
```env
VITE_API_BASE_URL=your_api_base_url
VITE_REPORT_BASE_URL=your_report_service_url
```

4. **Start development server**
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### **Build for Production**
```bash
npm run build
```

### **Preview Production Build**
```bash
npm run preview
```

## 🔐 Authentication & Roles

The application supports multiple user roles with different access levels:

- **Employee**: Access to personal dashboard, assessments, and reports
- **HR Admin**: Assessment cycle management, organization health monitoring
- **Department Head**: Team insights and departmental analytics
- **Superadmin**: Complete system administration and setup
- **HR Doctorate**: Advanced analytics and research capabilities

Authentication is handled through OTP verification with persistent session management.

## 📊 Key Features Deep Dive

### **Assessment Cycles**
- Create custom assessment periods
- Define questionnaires and scoring criteria
- Schedule automated assessments
- Track completion rates and engagement

### **Stage Analysis**
The platform analyzes employee journey through four distinct stages:
- **Honeymoon**: High energy, learning phase
- **Self-Reflection**: Adaptation and skill development
- **Soul-Searching**: Challenges and growth opportunities
- **Steady-State**: Established performance and contribution

### **Organizational Health**
- Multi-level alignment analysis
- Department-wise performance tracking
- Trend analysis and predictive insights
- Actionable recommendations for improvement

## 🎨 Design System

The application uses a modern design system with:
- **Color Variants**: Warm pastels, cool blues, and earthy naturals
- **Responsive Breakpoints**: Mobile-first responsive design
- **Consistent Typography**: Hierarchical text styling
- **Interactive Elements**: Hover states and smooth transitions

## 🔧 Development Guidelines

### **Code Style**
- TypeScript strict mode enabled
- ESLint configuration for code quality
- Consistent file naming conventions
- Component-based architecture

### **State Management**
- React Query for server state
- Context API for global client state
- Local state for component-specific data

### **API Integration**
- Centralized API configuration
- Error handling and retry logic
- Request/response interceptors
- Type-safe API calls

## 📈 Performance Optimizations

- **Code Splitting**: Route-based lazy loading
- **Image Optimization**: Optimized asset delivery
- **Caching Strategy**: React Query with smart cache invalidation
- **Bundle Analysis**: Optimized build output

## 🧪 Testing

```bash
npm run lint        # Run ESLint
npm run test        # Run tests (when configured)
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software. All rights reserved.