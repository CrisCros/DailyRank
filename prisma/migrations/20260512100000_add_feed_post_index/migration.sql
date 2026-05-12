-- Add a composite index for the social feed visibility filter and newest-first ordering.
CREATE INDEX "Post_visibility_date_createdAt_idx" ON "Post"("visibility", "date", "createdAt");
