# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
JobReady is a local AI-powered job search assistant for university graduates. It helps track applications, prepare for interviews, and generate personalized self-introductions. All data is stored locally in the browser (localStorage and IndexedDB) for privacy.

## Development Commands
- `npm run dev` - Start development server (Vite)
- `npm run build` - Build for production (TypeScript check + Vite build)
- `npm run lint` - Run ESLint on TypeScript/TSX files
- `npm run preview` - Preview production build locally
- `npm run deploy` - Deploy to GitHub Pages (requires predeploy build)

## Architecture Overview

### Tech Stack
- **Frontend**: React 18 + TypeScript, Vite build tool
- **UI**: shadcn/ui components with Tailwind CSS for styling
- **Routing**: React Router v6 for SPA navigation
- **State Management**: React state hooks (useState, useContext) + localStorage for persistence
- **AI Integration**: DeepSeek API (OpenAI-compatible) for all AI features
- **Icons**: lucide-react for consistent iconography

### Key Architectural Patterns

#### Path Aliases
- `@/*` maps to `./src/*` - consistent import pattern throughout the codebase

#### Data Storage Strategy
- **LocalStorage**: For structured application data (applications, interview experiences, etc.) via `LocalStorageManager` class in `src/lib/storage.ts`
- **IndexedDB**: For binary data (PDF resumes) - not fully implemented in current codebase
- **Storage Keys**: Defined in `src/types/index.ts` under `STORAGE_KEYS` constant

#### AI Service Architecture
- **DeepSeek Integration**: `src/services/deepseek.ts` provides core AI functions:
  - `callDeepSeek()` - Generic API call wrapper with error handling
  - `parseAIJson()` - Helper to parse AI responses with fallback JSON extraction
  - Specialized functions: `generateInterviewQuestions()`, `parseJobDescription()`, `analyzeResumeHighlights()`, etc.
- **Web Content Extraction**: `src/services/jina.ts` uses Jina Reader API to scrape job description content from URLs
  - Includes fallback mechanism when API fails
  - Helper functions for URL validation and content cleaning

#### Component Structure
- **Pages**: Route-level components in `src/pages/`
  - Each page corresponds to a route defined in `src/App.tsx`
  - Follow naming pattern: `Applications.tsx`, `NewApplication.tsx`, `InterviewPrep.tsx`, etc.
- **UI Components**: Reusable shadcn/ui components in `src/components/ui/`
  - All components use consistent Tailwind classes and rounded-xl border-radius
- **Layout**: `src/components/Layout.tsx` provides main navigation structure

#### Type System
- Centralized types in `src/types/index.ts`:
  - `Resume`, `Application`, `InterviewExperience`, `MockAnswer`, `SelfIntro`
  - Type-safe status enums (`ApplicationStatus`, `QuestionCategory`)
  - All types include optional fields for flexibility

### Design System Guidelines
- **Color Palette**: Sage green primary color, warm white backgrounds, avoid pure white and cold grays
- **Spacing**: Consistent use of Tailwind spacing scale
- **Border Radius**: Large rounded corners (rounded-xl globally)
- **Typography**: Increased line height, dark gray text for paragraphs
- **Emotional Design**: Friendly micro-copy, emoji usage in empty states, "healing job search haven" concept

### Key Implementation Notes

#### Form Handling
- Forms use controlled components with React state
- Validation happens both client-side (required fields) and server-side (API calls)
- Form submission shows loading states and error handling

#### Error Handling
- AI API calls include try-catch blocks and user-friendly error messages
- LocalStorage operations have error handling for quota exceeded scenarios
- Network requests to external services (Jina Reader) include fallback mechanisms

#### Performance Considerations
- Lazy loading not currently implemented (consider for larger apps)
- Component memoization used sparingly
- LocalStorage operations are synchronous but data volumes are small

### Common Development Tasks

#### Adding a New Page
1. Create component in `src/pages/`
2. Add route in `src/App.tsx`
3. Update navigation in `src/components/Layout.tsx` if needed
4. Create any new types in `src/types/index.ts`

#### Adding AI Feature
1. Add function in `src/services/deepseek.ts` following existing patterns
2. Create appropriate system prompt and response parsing
3. Use `callDeepSeek()` and `parseAIJson()` helpers
4. Add UI integration in relevant page component

#### Modifying Storage Schema
1. Update type definitions in `src/types/index.ts`
2. Update `LocalStorageManager` usage in `src/lib/storage.ts`
3. Consider data migration for existing users

### Testing Notes
- No test framework currently configured in package.json
- Manual testing through UI is primary validation method
- TypeScript provides compile-time type checking

#### Email Monitoring Testing
1. **Configuration Test**:
   - Add test email account in Settings page
   - Verify encryption and storage of credentials
   - Test editing and deletion of accounts

2. **Monitoring Test**:
   - Start monitoring with configured interval
   - Verify API calls to `/api/check-emails`
   - Simulate email reception with test keywords

3. **Parsing Test**:
   - Test rule-based email parsing
   - Verify AI-powered parsing with DeepSeek API
   - Check automatic matching with existing applications

4. **Integration Test**:
   - Verify automatic updates to application records
   - Test error handling for invalid credentials
   - Verify monitoring can be stopped/started

### Troubleshooting

#### 1. **npm Installation Errors**
- **Error**: `npm error code EINVALIDTAGNAME` - Invalid tag name "#" of package "#"
- **Cause**: Invalid characters or comments in package.json
- **Solution**: 
  1. Ensure `package.json` has valid JSON format
  2. Remove any inline comments in `package.json`
  3. Run `npm cache clean --force` and `npm install` again
  4. Check for any special characters in dependency names

#### 2. **TypeScript Compilation Errors**
- **Error**: `Cannot find module '@/components/ui/select'`
  - **Solution**: Use native `<select>` element or install shadcn/ui Select component
  - Modified `EmailConfigForm.tsx` to use native select instead of shadcn/ui Select

- **Error**: `Cannot find module '@/components/ui/separator'`
  - **Solution**: Created basic `Separator` component at `src/components/ui/separator.tsx`

- **Error**: `Property 'env' does not exist on type 'ImportMeta'`
  - **Solution**: Created `src/env.d.ts` with environment variable type definitions

- **Error**: `'EmailConfig' is declared but never used`
  - **Solution**: Removed unused import from `src/lib/storage.ts`

- **Error**: `'accountId' is declared but its value is never read`
  - **Solution**: Renamed parameter to `_accountId` in `src/services/email-monitor.ts`

#### 3. **Encryption Compatibility Issues**
- **Problem**: Frontend (CryptoJS) and backend (Node.js crypto) encryption format mismatch
- **Solution**: Updated `src/utils/encryption.ts` to use `iv:encryptedText` hex format
- **Format**: Frontend now outputs `iv:encryptedText` (hex), backend expects same format

#### 4. **Environment Configuration**
- **Problem**: `.env` file not found or environment variables not loading
- **Solution**:
  1. Create `.env` file in project root with:
     ```
     VITE_ENCRYPTION_KEY=32-character-hex-key-here
     VITE_API_BASE_URL=/api
     ```
  2. Generate encryption key: `openssl rand -hex 32`
  3. Add `src/env.d.ts` for TypeScript support
  4. Restart development server after creating `.env`

#### 5. **Build Success Verification**
After fixing all issues, verify with:
```bash
npm run build  # Should complete without errors
npm run dev    # Should start development server
```

### Deployment

#### GitHub Pages (Frontend Only)
- Configured for GitHub Pages deployment (`base: '/claude_code_/'` in vite.config.ts)
- Build output goes to `dist/` directory
- Requires DeepSeek API key to be set by user in Settings page for AI features to work

#### Vercel (Full Stack with Email Monitoring)
- Deploy to Vercel for Serverless Functions support
- Email monitoring features require Vercel deployment
- Set environment variables in Vercel dashboard:
  - `VITE_ENCRYPTION_KEY`: 32-character encryption key
  - `VITE_API_BASE_URL`: Should be `/api` for same-origin API calls
- Configure `vercel.json` for proper routing of API functions
- Node.js 18+ runtime required for TypeScript support

### Email Monitoring and Calendar Integration

#### Overview
The system now includes email monitoring and calendar integration features:
- **Email Monitoring**: Automatically checks configured email accounts for interview invitations
- **AI-Powered Parsing**: Uses DeepSeek API to parse email content and extract interview details
- **Auto-Update**: Updates application records with interview times and changes status
- **Calendar Integration**: (Optional) Creates calendar events for interviews

#### Architecture

##### End-to-End Flow
```
用户配置邮箱 → 前端加密存储 → 定期监控 → API调用 → IMAP检查 → AI解析 → 更新应用状态
```

##### Component Architecture
- **Frontend UI** (`src/pages/Settings.tsx`): Email configuration interface integrated into Settings page
- **Configuration Form** (`src/components/EmailConfigForm.tsx`): Form for adding/editing email accounts
- **State Management** (`src/hooks/useEmailMonitor.ts`): React hook for monitoring state and control
- **Monitoring Service** (`src/services/email-monitor.ts`): Core service for email checking and AI parsing
- **Storage Layer** (`src/lib/storage.ts`): Encrypted storage for email credentials
- **API Layer** (`/api/check-emails/`): Vercel Serverless Functions for secure IMAP access
- **IMAP Client** (`/api/check-emails/imap-client.ts`): IMAP protocol handling and email fetching
- **Email Parser** (`/api/check-emails/email-parser.ts`): Rule-based content extraction
- **Crypto Utilities** (`/api/check-emails/utils/crypto.ts`): Password decryption on backend

##### Data Flow
1. User adds email account via Settings page
2. Password encrypted with AES-256-CBC and stored in localStorage
3. `useEmailMonitor` hook starts periodic polling based on configured interval
4. Frontend calls backend API with encrypted credentials
5. Backend decrypts password and connects to IMAP server
6. System searches for unread emails matching keywords
7. Email content parsed using rules + AI (DeepSeek API)
8. Extracted interview info matched with existing applications
9. Application records updated with interview times and status changes

#### New Files Added
- `src/components/EmailConfigForm.tsx` - Email account configuration form
- `src/utils/encryption.ts` - AES encryption utilities for sensitive data
- `src/types/index.ts` - Extended with email and calendar related types
- `src/lib/storage.ts` - Extended with email configuration storage manager
- `src/hooks/useEmailMonitor.ts` - React hook for email monitoring state and control
- `src/services/email-monitor.ts` - Email monitoring service with AI-powered parsing
- `/api/check-emails/index.ts` - Vercel Serverless Function API endpoint
- `/api/check-emails/imap-client.ts` - IMAP connection and email fetching logic
- `/api/check-emails/email-parser.ts` - Rule-based email content parsing
- `/api/check-emails/utils/crypto.ts` - Password decryption utilities

#### Key Components
1. **Email Configuration**:
   - Users can add multiple email accounts (QQ, 163, Gmail, Outlook)
   - Encrypted storage of IMAP credentials
   - Configurable polling intervals (5-1440 minutes)
   - Customizable keywords for interview invitation detection

2. **Email Monitoring**:
   - Automatic polling of configured email accounts
   - AI-powered parsing of interview details (company, position, time, link, etc.)
   - Automatic matching with existing job applications
   - Status updates and interview time population

3. **Security Features**:
   - AES encryption of email credentials
   - HTTPS-only transmission of sensitive data
   - No permanent storage of email content on backend
   - User-controlled monitoring activation

#### Configuration
1. **Environment Variables**:
   ```env
   VITE_ENCRYPTION_KEY=32-character-encryption-key-here
   VITE_API_BASE_URL=/api  # For Vercel deployment
   ```

2. **Dependencies**:
   Add the following to `package.json` for Serverless Functions:
   ```json
   "dependencies": {
     "@vercel/node": "^5.7.3",
     "imap-simple": "^5.1.0"
   },
   "devDependencies": {
     "@types/imap-simple": "^4.2.10"
   }
   ```

3. **TypeScript Configuration**:
   - API functions use TypeScript with Vercel's Node.js runtime
   - May require separate `tsconfig.json` for API directory or extending existing config
   - Ensure `@vercel/node` types are included in compilation

4. **Vercel Setup**:
   - Deploy to Vercel for Serverless Functions support
   - Configure environment variables in Vercel dashboard
   - Set up `vercel.json` for function routing
   - Ensure Node.js version is 18+ for full TypeScript support

#### Development Notes
- **Encryption**: Uses crypto-js for AES-256-CBC encryption in browser, Node.js crypto on backend
- **IMAP Access**: Backend uses imap-simple library for email access with connection pooling
- **AI Integration**: Leverages existing DeepSeek API integration for email parsing; also includes rule-based fallback
- **Error Handling**: Comprehensive error handling for network, IMAP, and parsing failures
- **TypeScript**: Full TypeScript support for both frontend and backend code
- **API Structure**: Serverless Functions follow Vercel's `/api/*.ts` convention
- **State Management**: React hooks provide clean abstraction for monitoring state
- **Automatic Updates**: Applications are automatically updated with parsed interview info

#### Security Considerations
- Email credentials are encrypted before storage in localStorage
- Backend functions don't store credentials permanently
- Only reads emails, doesn't send or modify anything
- Users can disable monitoring at any time
- Regular credential rotation recommended