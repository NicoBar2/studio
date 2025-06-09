# Galapagos DataLens

Welcome to Galapagos DataLens, a platform to visualize and manage statistical data for the iconic species of the Galapagos Islands.

## Overview

This Next.js application allows users to:
- Explore data for 10 representative Galapagos species.
- View interactive charts and visualizations (for authenticated researchers).
- Edit species data (for authenticated administrators and researchers).
- Gain AI-generated insights about species.

## Tech Stack

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- ShadCN UI Components
- Genkit (for AI features - mocked in current version)

## Getting Started

The main public page is `src/app/page.tsx`, which displays a list of species.
Individual species details can be found under `src/app/species/[id]/page.tsx`.

The protected dashboard for data management and visualization is under `src/app/dashboard/`.

## Roles

The application simulates three user roles:
- **Tourist**: Default role, can browse public species information.
- **Researcher**: Can view detailed visualizations and edit data.
- **Admin**: Full control over data editing.

You can switch roles using the simulator in the site header.
