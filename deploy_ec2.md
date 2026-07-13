# AWS EC2 (Ubuntu) Docker Deployment Guide

This guide explains how to deploy the College FAQ Chatbot to an AWS EC2 instance running Ubuntu using Docker and Docker Compose.

---

## Step 1: Launch an AWS EC2 Instance

1. Open the [AWS EC2 Console](https://console.aws.amazon.com/ec2/).
2. Click **Launch Instance**.
3. Configure the instance:
   * **Name**: `college-chatbot`
   * **Application and OS Image (AMI)**: Choose **Ubuntu** (Ubuntu 24.04 LTS or 22.04 LTS recommended).
   * **Instance Type**: Select `t2.medium` or higher (2 vCPUs and 4GB RAM is recommended to handle builds, though `t2.micro` can work if swap space is enabled, but builds might be slow).
   * **Key Pair**: Select or create a key pair for SSH access.
4. **Configure Security Group (Inbound Rules)**:
   Add the following inbound rules to allow traffic:
   
   | Port Range | Protocol | Source | Description |
   | :--- | :--- | :--- | :--- |
   | `22` | TCP | My IP / Anywhere | SSH Access |
   | `80` | TCP | Anywhere (`0.0.0.0/0`) | Frontend Web Access (HTTP) |
   | `8000` | TCP | Anywhere (`0.0.0.0/0`) | Backend FastAPI Docs / API |

5. Click **Launch Instance** to start the server.

---

## Step 2: Connect to the EC2 Instance and Clone Code

1. Connect to your instance via SSH:
   ```bash
   ssh -i "your-key-pair.pem" ubuntu@<YOUR-EC2-PUBLIC-DNS-OR-IP>
   ```
2. Install git (usually pre-installed on Ubuntu):
   ```bash
   sudo apt-get update && sudo apt-get install -y git
   ```
3. Clone your repository:
   ```bash
   git clone https://github.com/Mohittttt24/college_chatbot.git
   cd college_chatbot
   ```

---

## Step 3: Run the Automated Deployment Script

We have provided a script `setup-ec2.sh` in the root of the repository. This script automatically:
* Installs the official Docker Engine and Docker Compose plugins.
* Starts and configures the Docker services.
* Creates the `.env` configuration template.
* Prompts you to configure credentials and builds the containers.

Run the script:
```bash
chmod +x setup-ec2.sh
./setup-ec2.sh
```

---

## Step 4: Configure Environment Variables

When the script pauses, it will ask you to configure the `.env` file. 

1. Open a new terminal tab, connect to the EC2 instance, and open the `.env` file:
   ```bash
   nano .env
   ```
2. Update the credentials with your actual cloud keys:
   * Add your JWT security `SECRET_KEY`.
   * Add your Supabase `DATABASE_URL`.
   * Add your Qdrant Cloud `QDRANT_URL` and `QDRANT_API_KEY`.
   * Add your Groq API `GROQ_API_KEY`.
   * **Crucial:** Set `VITE_API_URL` to point to your EC2 public IP or domain name:
     ```env
     VITE_API_URL=http://<YOUR-EC2-PUBLIC-IP>:8000
     ```
3. Save the file (`Ctrl+O`, `Enter`, `Ctrl+X`).
4. Return to your original terminal tab running the script and press **Enter** to continue the build and deployment.

---

## Step 5: Verify Deployment

Once the build is complete, you can check that the containers are running:
```bash
sudo docker compose ps
```

You should see two active containers:
* `college_chatbot-backend-1` (running FastAPI on port `8000`)
* `college_chatbot-frontend-1` (running Nginx on port `80`)

### Accessing the Web Apps
* **Frontend Chat Interface**: `http://<YOUR-EC2-PUBLIC-IP>`
* **FastAPI Backend Docs**: `http://<YOUR-EC2-PUBLIC-IP>:8000/docs`

### Viewing Logs
To tail logs for troubleshooting:
```bash
sudo docker compose logs -f
```
