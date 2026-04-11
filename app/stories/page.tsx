import { listStories } from "@/lib/data-store";

export const dynamic = "force-dynamic";

export default async function StoriesPage() {
  const stories = await listStories(true);

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
                {story.coverImage && (
                  <img src={story.coverImage} className="story-cover" alt="" />
                )}
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
