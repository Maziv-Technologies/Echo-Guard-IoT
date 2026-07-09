# Deploy to Render.com

This project is configured for free deployment on Render.com.

## Deployment Steps

1. **Sign up at Render.com** (https://render.com) — free account, no credit card required

2. **Connect your GitHub repository:**
   - Log in to Render Dashboard
   - Click "New +" → "Web Service"
   - Select "Connect a repository"
   - Search for and select `Echo-Guard-IoT`
   - Click "Connect"

3. **Configure the service:**
   - **Name:** `echo-guard-iot` (or your preferred name)
   - **Runtime:** Docker
   - **Plan:** Free
   - Render will auto-detect the Dockerfile and environment from `render.yaml`

4. **Add persistent storage:**
   - Go to Service Settings → "Disks"
   - Click "Add Disk"
   - **Mount Path:** `/var/data`
   - **Size:** 10 GB (free tier)
   - This ensures your SQLite database persists across deployments

5. **Deploy:**
   - Click "Deploy"
   - Watch the build progress in the logs
   - Your app will be live at `https://echo-guard-iot.onrender.com`

## How It Works

- **Docker Deployment:** Render builds and deploys from the Dockerfile
- **Auto-Deploy:** Every push to your GitHub main branch redeploys automatically
- **Database:** SQLite database stored on persistent disk at `/var/data`
- **Free Tier Limits:**
  - 750 free compute hours/month
  - 10 GB persistent disk
  - Spins down after 15 min of inactivity (cold start ~30s)

## Environment Variables

The following are automatically set via `render.yaml`:
- `NODE_ENV=production`
- `PORT=4000`
- `DB_PATH=/var/data/echoguard.db`
- `VITE_API_BASE_URL=https://echo-guard-iot.onrender.com/api`

## Troubleshooting

**App shows blank page?**
- Check logs in Render Dashboard → "Logs"
- Ensure persistent disk is mounted at `/var/data`

**Database lost after redeploy?**
- Verify the disk is mounted and persistent
- Don't use the Free tier without a disk (data won't persist)

**Build failing?**
- Check the build logs in the Render Dashboard
- Ensure all dependencies are in `server/package.json` and root `package.json`

## Local Testing

Before deploying, test locally with Docker:
```bash
docker compose up --build
```

Visit http://localhost:4000

## More Info

- [Render Docs](https://render.com/docs)
- [Docker on Render](https://render.com/docs/deploy-docker)
