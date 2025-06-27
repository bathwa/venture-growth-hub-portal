# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/5a067fb5-3dbb-4951-bae6-227e8196c679

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/5a067fb5-3dbb-4951-bae6-227e8196c679) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/5a067fb5-3dbb-4951-bae6-227e8196c679) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Deterministic Rule Based Engine (DRBE)
- Located at `src/lib/drbe.ts`
- Centralizes all business logic, validation, and workflow rules
- Validates opportunities, milestones, payments, and post-processes AI outputs

## TensorFlow.js AI Integration
- Located at `src/lib/ai.ts`
- Loads and runs TensorFlow.js models for risk scoring and other AI tasks
- Models should be placed in `public/models/` (e.g., `public/models/risk_model/model.json`)
- Supports offline inference for PWA/desktop use

### Example Usage
```ts
import { DRBE } from './lib/drbe';
import { getRiskScore } from './lib/ai';

const { valid, errors } = DRBE.validateOpportunity(opportunity);
const riskScore = await getRiskScore([/* input features */]);
const safeScore = DRBE.validateAIOutput('risk_score', riskScore);
```
