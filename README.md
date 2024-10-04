# Shopify Customer Management App

A Shopify Admin app to manage customers using the Shopify Admin GraphQL API.

## Prerequisites

- **Node.js**: Ensure you have **Node.js v18.x** or later installed.
- **Shopify CLI**: Install the Shopify CLI and Theme Kit globally.
- **Shopify API Credentials**: You'll need a Shopify store and API access token.

## Setup

### 1. Clone the repository
```bash
git clone https://github.com/your-username/delfini-shop.git
cd delfini-shop
```

### 2. Install Shopify CLI and Theme Kit
```bash
npm install -g @shopify/cli @shopify/theme
```

### 3. Install dependencies
```bash
npm install
```

### 4. Create a `.env` file

In the root directory, create a `.env` file with your Shopify store credentials:
```bash
SHOPIFY_ACCESS_TOKEN=your-access-token
SHOPIFY_DOMAIN=your-store.myshopify.com
```

### 5. Start the development server
```bash
npm run dev
```

## Deployment

For production, build and run the app using:
```bash
npm run build
npm run start
```

## Troubleshooting

- Ensure correct Shopify API credentials are added to `.env`.
- Check for any API rate limits when making multiple requests.