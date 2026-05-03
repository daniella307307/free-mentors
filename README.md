# Free Mentors

A mentorship platform with a **Django** + **GraphQL** API and a **React** (Vite) frontend. Users can discover mentors, request sessions, and leave reviews. **Role-based access** (`user`, `mentor`, `admin`) is enforced on the backend; the API exposes each user’s `role` for UI gating.

## Stack

| Layer    | Technology |
|----------|------------|
| API      | Django 6, Graphene-Django, PyJWT |
| Database | **MongoDB** ([django-mongodb-backend](https://www.mongodb.com/docs/languages/python/django-mongodb/current/); Atlas URI + DB name in `.env`) |
| Admin    | Django Admin (`/admin/`) |
| Frontend | React 19, Vite, MUI, Apollo Client / GraphQL |

## Repository layout

```
backend/          # Django project (manage.py, apps, GraphQL schema)
frontend/         # Vite + React SPA
requirements.txt  # Python dependencies
```

## Prerequisites

- **Python** 3.10+ (recommended for Django 6)
- **Node.js** 20+ (for the frontend)

## Backend setup

From the repository root:

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r ../requirements.txt
```

Create a `.env` file (see [.env.example](.env.example) for ideas). At minimum for local dev:

| Variable | Purpose |
|----------|---------|
| `MONGODB_URI` | MongoDB connection URI (e.g. Atlas `mongodb+srv://...`) |
| `MONGODB_DB` | Database name (default `freementors`; tests use `freementors_test`) |
| `DJANGO_SECRET_KEY` | Secret key (required in production) |
| `DEBUG` | `true` for local dev |
| `ALLOWED_HOSTS` | Comma-separated hosts |

Apply migrations and run the server:

```bash
python manage.py migrate
python manage.py runserver
```

- **GraphQL (GraphiQL in DEBUG):** [http://127.0.0.1:8000/graphql/](http://127.0.0.1:8000/graphql/)
- **Django Admin:** [http://127.0.0.1:8000/admin/](http://127.0.0.1:8000/admin/)

### Custom user model

- Email is the login field (`USERNAME_FIELD = "email"`).
- Roles: `user` (default), `mentor`, `admin`.

### Create an admin

**Option A — interactive superuser**

```bash
python manage.py createsuperuser
```

**Option B — seed from environment (only if no admin exists yet)**

Set variables, then run:

| Variable | Required | Description |
|----------|----------|-------------|
| `ADMIN_EMAIL` | Yes | Admin email |
| `ADMIN_PASSWORD` | Yes | Plain password (stored hashed by Django) |
| `ADMIN_USERNAME` | No | Defaults to `admin` |

```bash
python manage.py seed_admin
```

Do not expose this command or credentials via a public HTTP endpoint; run it during deploy or local setup only.

## Frontend setup

```bash
cd frontend
npm install
```

Copy [frontend/.env.example](frontend/.env.example) to `frontend/.env` and set:

```env
VITE_GRAPHQL_URL=http://127.0.0.1:8000/graphql/
```

Start the dev server (default Vite port **5173**, allowed by backend CORS):

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

## Authentication (GraphQL)

Protected operations expect a JWT in the `Authorization` header:

```http
Authorization: JWT <your_token>
```

Obtain a token using the login mutation defined in your schema (see `backend/users/schema.py`). Admin-only mutations (for example promoting users) return a GraphQL error if the caller is not an admin.

## Tests

Backend:

```bash
cd backend
python manage.py test
```

Frontend (when configured):

```bash
cd frontend
npm test
```

## Security notes

- Enforce roles and permissions **on the server**; frontend checks are for UX only.
- Use a strong `DJANGO_SECRET_KEY`, set `DEBUG=false`, and configure `ALLOWED_HOSTS` / HTTPS in production.
- Prefer environment variables or a secrets manager for passwords and keys; never commit real `.env` files.

## License

Specify your license here (for example MIT), or remove this section if the repo is private.
