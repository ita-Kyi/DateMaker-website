
### Requirements

- Node + npm
### Install
just npm 


## Project layout

```
src/
├── components/
│   ├── Navbar.js
│   └── ChatWidget.js
├── pages/
│   ├── Profile.js
│   ├── Feed.js
│   ├── MapPage.js
│   ├── Calendar.js
│   ├── Chatbot.js
│   ├── Login.js
│   └── Register.js
├── styles/
│   ├── App.css
│   ├── index.css
│   ├── Navbar.css
│   ├── ChatWidget.css
│   ├── Profile.css
│   ├── Feed.css
│   ├── MapPage.css
│   ├── Calendar.css
│   ├── Chatbot.css
│   ├── Login.css
│   ├── Register.css
│   └── NotFound.css
├── services/
│   └── api.js
├── App.js
└── index.js
```

| Feature | Endpoints |
|---------|-----------|
| Auth | `POST /api/auth/login`, `POST /api/auth/register` |
| Profile | `GET/PUT /api/profiles/me`, `POST /api/profiles/me/photos` |
| Posts | `GET/POST /api/posts`, `POST /api/posts/{id}/like` |
| Plans | `GET /api/plans`, `POST /api/plans` |
| Chat | `POST /api/chat/ai` |
| Places | `GET /api/places` |

## Auth

- The app stores a token in `localStorage` as `authToken`.
- Every request adds `Authorization: Bearer <token>` (see `src/services/api.js`).
- If the backend returns 401, the UI clears the token and redirects to `/`.
- We already have a functioning login and registration system.

### Dates / Plans (Calendar)

Right now the calendar is just React state (`plannedDates`). We will match it with the app:

- Table: `date_plans`
	- `id` (PK)
	- `user_id` (FK)
	- `title`
	- `location`
	- `date` (ISO date)
	- `time` (string or time column)
	- `type` (romantic/adventure/cozy/special)
	- `created_at`

API:

- `GET /api/plans` -> returns list of plans for the logged-in user
- `POST /api/plans` -> create a new plan
- `DELETE /api/plans/{id}` -> delete a plan

The calendar page expects to insert a plan when the user clicks an unplanned idea, and delete it from the selected day when they click the X.

### “Unplanned ideas” (Chat + Feed)

Right now these are in `localStorage`:

- `datemakerChatImports`: ideas saved from the chat widget
- `datemakerFeedSavedIdeas`: ideas saved from the feed sidebar

Yea we might need another table for this.

- `saved_ideas`
	- `id` (PK)
	- `user_id` (FK)
	- `source` (chat|feed)
	- `title`
	- `details` (optional)
	- `image_url` (optional)
	- `created_at`

API:

- `GET /api/saved-ideas`
- `POST /api/saved-ideas`
- `DELETE /api/saved-ideas/{id}`
### Profiles

The profile page supports cover + avatar upload in the UI. Suggested fields:

- `profiles` table: `id`, `user_id`, `name`, `age`, `bio`, `cover_url`, `avatar_url`
- `profile_photos` table if you want a gallery

I kinda built this independently of the app, so there are bunch of things that are missing from here. Like phonenumber, reset password, etc. I need to take a look at the app to get a reminder. 

API:

- `GET /api/profiles/me`
- `PUT /api/profiles/me`
- `POST /api/profiles/me/photos` (multipart)

### Feed / Posts

Suggested tables:

- `posts` (id, user_id, partner_id, content, place, image_url, created_at)
- `post_likes` (post_id, user_id)
- `post_comments` (post_id, user_id, content, created_at)

API already listed above in the table; the UI expects `liked` and `saved` booleans on posts.

## Google Maps setup 

Free API expires after 90 days or 10k req (worried about the former), so we need to reset the key every once in a while. Luckily we have like 10 email accounts so we can just go through them. 

1) Go to https://console.cloud.google.com
2) Create or pick a project
3) Enable Maps JavaScript API + Places API
4) Make an API key
5) Put it in `.env`

## License

MIT
# DateMaker-website
# DateMaker-website
