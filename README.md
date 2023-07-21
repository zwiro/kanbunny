# kanbunny

A web application for creating kanban boards.

## Technologies used

- React
- TypeScript
- Tailwind
- Next.js
- Next Auth with GitHub OAuth
- Prisma
- tRPC
- dnd kit
- Framer Motion

## Demo

[Live Site](https://kanbunny.vercel.app/)

## Features

- Adding projects, boards, lists and tasks
- Reordering items by dragging and droping
- Moving tasks between different lists
- Filtering tasks by their assignment or due to date
- Hiding empty lists while filtering tasks
- Searching for specifc tasks
- Inviting other users to participate in projects
- Assigning users to specific tasks
- Adding deadline date for tasks
- Changing boards, lists and tasks colors
- Authorization with GitHub OAuth

## Screenshots

![Inital page](/public/screenshot.png)
![Dashboard](/public/screenshot2.png)
![Filters menu](/public/screenshot3.png)
![New task form](/public/screenshot4.png)

## Installation

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

### Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

### Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

### Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`DATABASE_URL`

`GITHUB_ID`

`GITHUB_SECRET`

`NEXTAUTH_SECRET`

`NEXTAUTH_URL` / `NEXTAUTH_URL_INTERNAL`
