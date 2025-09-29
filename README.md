# SeedSage: Your AI Onboarding Assistant for Stacks

SeedSage is a Next.js web application designed to safely and intelligently onboard new users into the Stacks ecosystem. It addresses the critical "first mile" of a user's journey, transforming the often intimidating initial steps of setting up a wallet and making the first transaction into a guided, educational, and secure experience.

This project was built for the **Stacks Vibe Coding Hackathon**, leveraging AI-powered tools to accelerate development and create a polished, user-centric application.

## Core Mission: Unlocking the Bitcoin Economy

The primary goal of SeedSage is to lower the barrier to entry for Stacks, thereby helping to grow the entire ecosystem. By making Stacks more accessible, we contribute to its core mission of unlocking the Bitcoin economy for a broader audience.

## Features

- **Wallet Setup Guidance**: Guides new users through setting up a Stacks wallet with a strong emphasis on seed phrase security, using a client-side wizard that ensures no sensitive information ever touches the server.
- **AI-Powered Transaction Explainer**: Integrates with the Gemini API to provide simple, human-readable explanations of complex Stacks transactions, breaking down details like amount, fee, and addresses.
- **Dynamic Onboarding Missions**: A gamified mission system that encourages users to learn by doing. Missions are verified on-chain (e.g., sending STX, interacting with a contract).
- **On-Chain Badge Claim**: Upon completing all missions, users can claim a real, on-chain NFT badge on the Stacks testnet by calling a Clarity smart contract.
- **Contextual AI Chat Assistant**: A helpful AI chatbot that has access to the user's live (read-only) wallet context. It can answer questions like "Explain my last transaction" or "How do I get testnet tokens?" with personalized, accurate information.
- **Live Blockchain Data**: The dashboard is powered by real-time data fetched directly from the Stacks blockchain via the Hiro API, including STX balance and transaction history.
- **Theme Switching**: A fully functional light/dark mode toggle to enhance user experience.

## Technical Overview & Judging Criteria Alignment

- **Built on Stacks**: The application is built entirely on Stacks, using:
  - **`@stacks/connect`** for wallet connection and authentication.
  - **Stacks API (Hiro)** for fetching live on-chain data.
  - **Clarity** for the `seedsage-badge` smart contract, enabling on-chain rewards.
- **Technical Quality & AI Tooling**: This project was built with the assistance of AI coding tools, demonstrating a significant increase in productivity. The codebase is clean, organized, and follows modern React/Next.js best practices. The AI features are not gimmicks but core components of the user experience.
- **Security**: Security is a central theme. The app educates users on best practices and is designed to be non-custodial. The "Seed Phrase Education" wizard is a prime example, teaching vital security concepts without ever having access to secrets.
- **Ease of Use**: The application has a live, functioning demo. The user interface is intuitive, guiding non-technical users through their first steps in a decentralized world.

## Tech Stack

- **Framework**: Next.js (App Router) & React
- **Styling**: Tailwind CSS & shadcn/ui
- **Blockchain Integration**: `@stacks/connect`, `@stacks/transactions`
- **AI**: Google Gemini via Genkit
- **Deployment**: Firebase App Hosting (or any Next.js compatible platform)

This project demonstrates how AI can be used to build high-quality, production-ready dApps on Stacks, fulfilling the vision of the Vibe Coding Hackathon.