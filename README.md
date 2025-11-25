# Tulung - AI-Powered Expense Tracking App 📱💰

> **Tulung** - Your personal AI assistant for effortless expense tracking

An intelligent expense tracking mobile app that uses AI-powered receipt scanning to automatically extract transaction details from photos.

## ✨ Features

### Phase 1: Core Expense Tracking ✅
- Manual expense entry with rich categorization
- Real-time expense tracking and visualization
- Budget monitoring and alerts
- User authentication with Supabase

### Phase 2: Receipt Photography ✅
- Camera integration for receipt capture
- Gallery photo selection
- Image optimization and cloud storage
- Receipt attachment to expenses

### Phase 3: AI-Powered OCR ✅
- **GPT-4o mini Vision** for intelligent receipt scanning
- Automatic extraction of:
  - Amount
  - Currency (8 supported currencies)
  - Merchant name
  - Expense category
- Smart image optimization (800px, ~150KB)
- Quota system (10 free scans/month)
- Pro tier for unlimited scans

## 🔐 Security & Quality

- ✅ API key sanitization and format validation
- ✅ OCR quota enforcement before API calls
- ✅ Memory leak prevention with AbortController
- ✅ Comprehensive API response validation
- ✅ Currency normalization with fallbacks
- ✅ TypeScript strict mode
- ✅ Error boundary implementation
- ✅ Secure authentication with Supabase

## 📱 Tech Stack

**Frontend:**
- React Native + Expo SDK 52
- TypeScript (strict mode)
- Zustand for state management
- React Navigation v7
- Expo Image Picker & Manipulator

**Backend:**
- Supabase (PostgreSQL + Auth + Storage)
- OpenAI GPT-4o mini Vision API
- RESTful API design

**Development:**
- ESLint + Prettier
- Git hooks for code quality
- Comprehensive documentation

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Expo CLI (`npm install -g expo-cli`)
- Supabase account
- OpenAI API key

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Zahrinnnnn/TulungApp.git
   cd TulungApp/tulung
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your credentials:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   EXPO_PUBLIC_OPENAI_API_KEY=your_openai_api_key
   ```

4. **Start the development server:**
   ```bash
   npm start
   ```

5. **Run on device:**
   - Scan QR code with Expo Go app (iOS/Android)
   - Or press `a` for Android emulator
   - Or press `i` for iOS simulator

## 📊 OCR Performance

- **Image Optimization:** 800px width, 0.4 compression → ~150KB
- **API Timeout:** 10 seconds for fast responses
- **Temperature:** 0 (deterministic results)
- **Token Limit:** 150 tokens (efficient JSON responses)
- **Cost:** ~$0.00026 per scan

## 🗂️ Project Structure

```
TulungApp/
├── tulung/                      # Mobile app codebase
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── constants/           # App constants & config
│   │   ├── navigation/          # Navigation setup
│   │   ├── screens/             # Screen components
│   │   ├── services/            # API & business logic
│   │   ├── store/               # Zustand state management
│   │   ├── types/               # TypeScript types
│   │   └── utils/               # Utility functions
│   ├── assets/                  # Images, icons
│   └── App.tsx                  # App entry point
├── PHASE_1_*.md                 # Phase 1 documentation
├── PHASE_2_*.md                 # Phase 2 documentation
├── PHASE_3_*.md                 # Phase 3 documentation
├── prd-tulung-mlp.md            # Product Requirements
└── tulung-implementation-guide.md
```

## 📱 Supported Currencies

| Currency | Code | Variations |
|----------|------|------------|
| US Dollar | USD | $, dollar, dollars |
| Malaysian Ringgit | MYR | RM, ringgit |
| Euro | EUR | €, euro, euros |
| British Pound | GBP | £, pound, pounds |
| Singapore Dollar | SGD | S$ |
| Japanese Yen | JPY | ¥, yen |
| Australian Dollar | AUD | AU$ |
| Canadian Dollar | CAD | CA$ |

## 🎨 Expense Categories

- 🍽️ Food & Dining
- 🚗 Transportation
- 🛍️ Shopping
- 🎬 Entertainment
- 💡 Bills & Utilities
- 🏥 Healthcare
- 📦 Other

## 📖 Documentation

Comprehensive documentation available in the repository:

- **[PRD](prd-tulung-mlp.md)** - Product requirements document
- **[Implementation Guide](tulung-implementation-guide.md)** - Development roadmap
- **[UI/UX Specifications](tulung-uiux-specification.md)** - Design system
- **[Phase 1 Report](PHASE_1_POLISH_COMPLETE.md)** - Core features completion
- **[Phase 2 Report](PHASE_2_FIXES_SUMMARY.md)** - Camera integration
- **[Phase 3 Report](PHASE_3_FIXES_REPORT.md)** - OCR implementation & fixes

## 🐛 Known Issues

See [Issues](https://github.com/Zahrinnnnn/TulungApp/issues) for current bugs and feature requests.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is private and proprietary. All rights reserved.

## 👤 Author

**Zahrin Jasni**
- Email: zahrin16@proton.me
- GitHub: [@Zahrinnnnn](https://github.com/Zahrinnnnn)

## 🙏 Acknowledgments

- Built with [Claude Code](https://claude.com/claude-code)
- Powered by [OpenAI GPT-4o mini](https://openai.com)
- Backend by [Supabase](https://supabase.com)
- Framework by [Expo](https://expo.dev)

---

**Status:** ✅ Phase 3 Complete - AI-Powered Receipt Scanning

Made with ❤️ using Claude Code
