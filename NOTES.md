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

## Lab 2

1. /movies: yes. The server builds the HTML with the titles already in it
/movies-client: no. The HTML only has "Loading movies...". The data is fetched later in the browser

2. Tomorrow's build time, and it never changes. The page is static so it is rendered once at build time

3. A page that shows data for the current user, like a shopping cart. It must be rendered on each request not once for everyone

4. The code runs on the server. In development Next.js copies server logs to the browser console. Proof: the same line is in the terminal and in production it is not in the browser console

5. The server-rendered static version with revalidate. It is fast good for SEO and it refreshes by itself

## Lab 3

1. Because Client Components can still be rendered on the server. usePathname() identifies the current route, and Next.js generates the initial HTML with aria-current="true"

2. URL parameters are strings, so we convert the movie ID to a string. /movies/42 returns 404 because dynamicParams = false only allows IDs returned by generateStaticParams

3. Both routes share the same layout, so Next.js keeps it mounted and preserves its state. Navigating to /about unmounts that layout, so the note is lost

4. In the server terminal. Next.js hides the detailed error from the browser to prevent exposing sensitive server information

5. /movies/2 is statically generated during the production build, so it doesn't need to show the loading fallback. /movies still uses dynamic rendering or data fetching, so its loading message can appear

## Lab 4, part 1

### 1. The 7 API calls during the build
One call to /api/movies from generateStaticParams, to get the list of ids,
and one call per movie (/api/movies/1 to /6) to prerender each movie page.
/movies is dynamic, so it makes no call at build time. generateMetadata and
the page both call getMovie with the same URL in the same render, and
Next.js reuses the first result, so there is only one call per movie.

### 2. Where MOVIES_API_KEY ended up
It was not in the JavaScript, but it was in the HTML of every movie page,
because the Client Component is also rendered on the server, where the
variable exists. Anyone who views the page source can read it. The key
should only be used in server code, like lib/movies.ts.

### 3. Why Next.js refuses these
Break 1: props sent to a Client Component must be turned into data. A
function is code, so it cannot be sent to the browser.
Break 2: lib/movies.ts is marked server-only because it uses server
secrets and the API address. A Client Component runs in the browser, so it
is not allowed to use it.

## Lab 4, part 2

### Strategies

| Page | fetch option | Build output I expect | Real build output |
|---|---|---|---|
| /movies | next: { revalidate: 10 } | ○ with 10s (ISR) | ○ /movies, Revalidate 10s, Expire 1y |
| /movies/[id] | cache: "force-cache" | ● one page per movie (SSG) | ● /movies/1 to /movies/6 |

### Home page timings (first byte / total)
| Version | First byte | Total |
|---|---|---|
| No Suspense, two awaits | 2.67 s | 2.67 s |
| Suspense, two awaits | 0.12 s | 2.65 s |
| Suspense, Promise.all | 0.12 s | 1.63 s |

### When the API is down

| Page | What you see | Why |
|---|---|---|
| /movies | The list still works | ISR: the last good version is served. The background regeneration fails (fetch failed in the terminal), so the old page stays |
| /movies/2 | The movie still works | SSG: the page was made at build time and never calls the API again |
| / | The title and "Counting the votes...", then the list fails | SSR: the votes are fetched on each request. The title was already sent with status 200 before the error |
| /movies-client | "Loading movies...", then the error message | CSR: the browser calls the API itself after the page loads, and the call fails |

A build with the API stopped fails with ECONNREFUSED, because the build fetches the data to prerender the pages.

### Questions

1. Strategies:
- /movies/[id] is SSG: movie details almost never change, so one page per movie at build time is fastest.
- /movies is ISR: the list can change, but being 10 seconds old is fine, and most visitors get a ready page.
- / is SSR with streaming: the votes change all the time, so they are fetched on each request, and the title is shown first.
- /movies-client is CSR: the browser fetches the list after the page loads. It is only there to compare.

2. The 8 calls after rm -rf .next/cache: /api/movies once for generateStaticParams (force-cache) and once for the /movies page (revalidate 10). They have different options, so they are two calls. Then /api/movies/1 to /6, one per movie page.

3. Timings:
- Suspense improves the first byte (2.67 s to 0.12 s): the page is sent right away, and the slow list comes later in the same response. The total does not change.
- Promise.all improves the total (2.65 s to 1.63 s): the two requests run at the same time, so the page waits for the slower one (1.5 s), not the sum of both (2.5 s)

## Lab 5, part 1

### 1. 400 or 404
"abc" is not a valid id, so the request itself is wrong: 400. 99 is a valid
id, but no movie has it: 404. A 400 tells the client to fix its request. A
404 tells it the movie does not exist.

### 2. Why TopMovies calls getVotes() directly
TopMovies already runs on the server, so it can read the data directly.
Calling its own API would mean the server sends a request to itself, which
is slower and needs the full address.

### 3. No NEXT_PUBLIC_ and no CORS any more
The page and the API are now on the same origin, so the page uses a
relative URL (/api/movies). It needs no public address, and CORS only
applies between different origins. A POST to /api/movies answers 405,
because the route only exports GET.