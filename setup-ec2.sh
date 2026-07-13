#!/usr/bin/env bash

# =========================================================================
# College FAQ Chatbot - AWS EC2 (Ubuntu) Setup and Deploy Script
# =========================================================================
# This script automates Docker and Docker Compose installation on a fresh
# Ubuntu EC2 instance, configures environment variables, and launches the app.

set -o errexit

echo "=========================================================="
echo "Starting AWS EC2 Ubuntu Deployment for College Chatbot"
echo "=========================================================="

# 1. Update system packages
echo "--> Updating packages..."
sudo apt-get update -y
sudo apt-get upgrade -y

# 2. Install prerequisites
echo "--> Installing prerequisites..."
sudo apt-get install -y ca-certificates curl gnupg lsb-release

# 3. Add Docker's official GPG key
echo "--> Adding Docker GPG key..."
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg --yes

# 4. Set up the stable repository
echo "--> Setting up Docker repository..."
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 5. Install Docker Engine and Docker Compose
echo "--> Installing Docker and Docker Compose..."
sudo apt-get update -y
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 6. Verify installation and start service
echo "--> Starting and enabling Docker service..."
sudo systemctl start docker
sudo systemctl enable docker

# 7. Add current user to docker group (requires logout/login to take effect, using sudo for now)
sudo usermod -aG docker "$USER"
echo "--> Docker installed successfully!"

# 8. Setup Environment File
if [ ! -f .env ]; then
  echo "--> Copying .env.example to .env..."
  cp .env.example .env
  
  echo "=========================================================="
  echo "⚠️ ACTION REQUIRED: A new '.env' file has been created."
  echo "Please edit the '.env' file using your credentials."
  echo "Specifically, set VITE_API_URL to: http://<YOUR-EC2-PUBLIC-IP>:8000"
  echo "=========================================================="
  
  # Allow the user to edit immediately
  read -p "Press [Enter] after you have configured the '.env' file to continue with the deployment..."
else
  echo "--> Existing .env file detected."
fi

# 9. Build and Launch Containers
echo "--> Building and starting Docker containers..."
sudo docker compose up --build -d

echo "=========================================================="
echo "🎉 DEPLOYMENT COMPLETE!"
echo "Your College Chatbot services are now starting up."
echo "=========================================================="
echo "Access the application:"
echo "- Frontend: http://<YOUR-EC2-PUBLIC-IP>"
echo "- Backend API Docs: http://<YOUR-EC2-PUBLIC-IP>:8000/docs"
echo "=========================================================="
echo "To view logs, run:"
echo "  sudo docker compose logs -f"
echo "=========================================================="
