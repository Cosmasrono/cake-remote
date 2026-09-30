This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## User access

In **Admin Dashboard → Staff & User Directory**, use **Disable** to block an
account or **Enable** to allow it to sign in again. Disabling revokes existing
sessions; re-enabling requires a fresh login. Older accounts remain enabled.

**Delete** removes the account from the directory and permanently blocks its
login. This is a soft deletion: the account record is retained so sales, payment
and enrolment history remain linked. Its email is replaced with an internal
archive address so you can create a new account using the original email.
New accounts do not inherit the deleted account's history. Use Disable if
you expect to restore access. You cannot change your own account's access, and
only a super admin can manage another super admin.

Creating an account in the directory emails its login URL, email and password
using the server's `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`,
`MAIL_FROM_ADDRESS`, and `MAIL_ENCRYPTION` settings. `APP_URL` must point to the
website users can access. SMTP uses TLS. See the [Nodemailer SMTP guide](https://nodemailer.com/smtp).
The creation notification reports whether the email server accepted the message.
If email fails, the account remains created; share the credentials directly and
check the SMTP settings. Passwords are stored as hashes, never as readable text.

After updating this schema, stop the development server, run
`npx prisma generate`, and restart it to load the new account fields.

## Recording expenses

Sign in as an admin and open **Admin Dashboard → Expenses** (`/admin/expenses`).
Record the date, amount in KSh, category, description and payment method. Supplier
and receipt references are optional. Use the date filters to review spending,
category totals, and sales minus recorded expenses. This balance excludes any
costs that have not been recorded.

**Get insights** uses Groq to summarize the selected period and suggest ways to
manage spending. It sends totals and the ten largest expenses' amounts,
categories, descriptions and dates. Avoid personal details in descriptions.
Customer records, supplier names and receipt references are excluded.

Configure `GROQ_API_KEY` in the server environment to enable AI. Optionally set
`GROQ_MODEL` to override the model in `app/lib/ai.ts`. Restart the server after
changing environment variables. Expense recording works without an AI key.

After schema changes, run `npx prisma generate` and restart the development
server. This project uses MongoDB; expense documents use the `expenses`
collection. Apply schema indexes with `npx prisma db push` when provisioning
the database, after reviewing other pending schema changes.

Run expense validation and report date tests with:

```bash
npx tsx --test tests/expenses.test.ts tests/pos-report-range.test.ts
```

## Next.js resources

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
