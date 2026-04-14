import { StoryMediaCarousel } from "@/components/story-media-carousel";
import { listStories, listSubmissions, syncMissingStoriesFromApprovedSubmissions } from "@/lib/data-store";

export const dynamic = "force-dynamic";

export default async function StoriesPage() {
  await syncMissingStoriesFromApprovedSubmissions();
  const stories = await listStories(true);
  const approvedSubmissions = await listSubmissions("approved");
  const submissionsById = new Map(approvedSubmissions.map((submission) => [submission.id, submission]));

  return (
    <main className="page-shell public-layout">
      <div className="container">
        <div className="section-heading text-center">
          <h1>Stories</h1>
          <p className="hero-message">Written memories and reflections.</p>
        </div>

        {stories.length === 0 ? (
          <p className="text-center empty-state">No stories have been shared yet.</p>
        ) : (
          <div className="stories-list">
            {stories.map((story) => (
              <article key={story.id} className="story-article panel">
                <StoryMediaCarousel media={story.sourceSubmissionId ? (submissionsById.get(story.sourceSubmissionId)?.files ?? []) : []} />
                <div className="story-content">
                  <h2>{story.title || "Shared Memory"}</h2>
                  <p className="story-meta">Shared by {story.authorName || "Family/Friends"}</p>
                  <div className="story-body" style={{ whiteSpace: "pre-wrap" }}>
                    {story.body}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
