---
description: Describe when these instructions should be loaded by the agent based on task context
# applyTo: 'Describe when these instructions should be loaded by the agent based on task context' # when provided, instructions will automatically be added to the request context when the pattern matches an attached file
---

<!-- Tip: Use /create-instructions in chat to generate content with agent assistance -->

# MediaVerse Backend Instructions

## Stack

Backend uses:

* Bun runtime
* Elysia framework
* Drizzle ORM
* PostgreSQL

The API is a REST API that powers the MediaVerse frontend.

## Project Structure

src/

server.ts

routes/
media.ts
reviews.ts
users.ts
lists.ts

db/
db.ts
schema/

All database schemas live in:

src/db/schema

Each table must be defined in its own file.

All schemas must be exported through:

src/db/schema/index.ts

## Database Conventions

Use Drizzle ORM for schema definitions.

Rules:

* UUID primary keys
* snake_case for column names
* created_at timestamp in all tables

Core tables:

users
media
user_media
reviews
lists
list_items
follows

Relationships:

users → user_media → media

reviews reference user_media instead of media directly.

## API Design

Use REST style endpoints.

Examples:

GET /media
GET /media/:id
POST /reviews
GET /trending
GET /lists

Routes should be grouped by domain.

## Performance

Avoid N+1 queries.

Use joins when fetching relational data.

Add indexes for:

* media_id
* user_id
* review queries

Use pagination for lists and reviews.
