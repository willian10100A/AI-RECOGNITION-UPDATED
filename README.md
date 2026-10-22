# Foresight

This is a face recognition Next.js application.

## Setup

1. Clone the repository and run:
   ```bash
   npm install
   ```
   The `postinstall` script will automatically download the required face-api
   model files into `public/models`.

   The admin password is read from the `ADMIN_PASSWORD` environment variable.
   In development the code falls back to a default of `admin` if the variable
   is not defined, but you can set it to anything you like before starting the
   server:
   ```bash
   ADMIN_PASSWORD=secret npm run dev
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

Models are served statically from `/models` and **must be present locally**.
The client code does **not** attempt to download them from external hosts; this
avoids potential security/harm issues. If the files are missing the app will
show an error and you should re-run `npm install` to fetch the weights.
# AI-RECOGNITION-UPDATED
