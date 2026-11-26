import { serverError } from "@/lib/http";
import { getVotes } from "@/lib/movies";

// GET /api/votes: the current votes, with the time they were counted
export async function GET() {
  try {
    return Response.json(await getVotes());
  } catch (err) {
    return serverError(err);
  }
}
