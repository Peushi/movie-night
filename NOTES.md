# Notes

## Lab 1
1. It's in the app/layout.tsx

2. It's in the app/page.tsx

3. The public/ folder. Files in it are served from the root URL so public/next.svg is referenced as /next.svg

4. It is the TypeScript configuration. It sets the compiler options used for type checking and defines the @/* import alias

5. It maps @/ to the project root, so imports do not need long relative paths.
import { getMovies } from "@/lib/movies"

6. It imports the Geist and Geist_Mono fonts. At build time Next.js downloads the font files and serves them from the app itself, so the browser makes no request to Google when a visitor loads the page

7. Page.tsx is the content of one specific route. layout.tsx wraps pages and stays in place when navigating between them

8. In app/layout.tsx, inside the body, above {children}

9. It holds the global styles and imports Tailwind CSS. It is imported in app/layout.tsx

10. It is a guide for coding agents so they write up-to-date Next.js code. The app does not need it to run