# BuildPK - Pakistan's Decentralized Physical Infrastructure Network

## Overview
BuildPK is a pioneering DePIN (Decentralized Physical Infrastructure Network) platform for Pakistan, leveraging the Solana blockchain and BUILD tokens. The project's vision is to empower Pakistani citizens to collaboratively build and earn from decentralized infrastructure across critical sectors including Community WiFi Networks, Logistics Data Collection, Agricultural Monitoring, Healthcare Data Networks, Government Taxation, and a gamified Power/EV Charging network. BuildPK aims to address infrastructural gaps, promote economic participation, and foster transparency through blockchain technology, with a focus on real-world utility for its BUILD token.

## User Preferences
_No specific user preferences recorded yet_

## System Architecture
BuildPK is primarily a frontend-only application built with **React 18** and **TypeScript**, using **Vite** for fast development and builds. **Tailwind CSS v3** (downgraded from v4 beta for stability) and **Radix UI** primitives, enhanced by **ShadCN UI** components, provide a modern and accessible user interface. Data visualization is handled by **Recharts**, and icons by **Lucide React**.

The system is designed for **Solana blockchain integration**, supporting real wallet connections (Phantom, Solflare, Backpack) via Solana Wallet Adapters and Web3.js, with Anchor Framework planned for smart contract development. While currently operating in a demo mode with **local storage** and a **mock API (localApi.ts)** for simulated backend interactions, the architecture is "on-chain ready" for full Solana smart contract deployment.

Key architectural patterns include a modular component structure, organized by feature and utility. UI/UX decisions prioritize clarity, with consistent modal visibility improvements (increased overlay opacity, backdrop blur, z-index management, solid backgrounds), and a strong emphasis on real-time data updates (e.g., event-driven token balance refresh without page reload). The project incorporates a comprehensive utility system for BUILD tokens, allowing bill payments, P2P transfers, and tracking of transaction history. Gamification elements, such as a Leaderboard system with badges and achievements, and a scarcity-driven plot ownership model for the EV charging infrastructure, are central to user engagement.

## External Dependencies
- **Solana Blockchain**: The core blockchain platform for transactions and smart contracts.
- **Solana Wallet Adapters**: Facilitates connection with popular Solana wallets like Phantom, Solflare, and Backpack.
- **Anchor Framework**: (Planned) For developing Solana smart contracts.
- **Recharts**: JavaScript charting library for data visualization.
- **Lucide React**: Icon library.
- **Sonner**: Toast notification library.
- **Netlify**: Used for production deployment and hosting.