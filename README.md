# Atila Hatefi Portfolio

Personal portfolio built with Django REST Framework and React/Vite.

## Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r ../requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Use the standard Django admin at `http://127.0.0.1:8000/go-to-settings/`.
Certificates, contact tickets, and any future registered Django models appear in the same Django admin.

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173/`.

The frontend proxies `/api` and `/media` to the Django development server.
Contact form submissions post to `/api/tickets/` and appear in Django admin under contact tickets.
