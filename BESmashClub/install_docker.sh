#!/bin/bash
# Script to install Docker and Docker Compose on Ubuntu
# Run this script on the target server

echo "Updating packages..."
sudo apt-get update -y
sudo apt-get install -y ca-certificates curl gnupg lsb-release

echo "Adding Docker's official GPG key..."
sudo mkdir -m 0755 -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo "Setting up the repository..."
echo \
  "deb [arch=dpkg --print-architecture signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  lsb_release -cs stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

echo "Installing Docker Engine..."
sudo apt-get update -y
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

echo "Configuring Docker data-root to /mnt/data/docker..."
sudo mkdir -p /mnt/data/docker
sudo tee /etc/docker/daemon.json > /dev/null <<EOF
{
  "data-root": "/mnt/data/docker"
}
EOF

echo "Starting Docker service..."
sudo systemctl enable docker
sudo systemctl start docker

# Add user to docker group (optional, requires re-login)
sudo usermod -aG docker $USER

echo "Creating data directories at /mnt/data/..."
sudo mkdir -p /mnt/data/mongodb
sudo mkdir -p /mnt/data/redis
sudo mkdir -p /mnt/data/mssql
sudo mkdir -p /mnt/data/minio
sudo mkdir -p /mnt/data/SmashClub

echo "Changing ownership of /mnt/data directories to current user ($USER)..."
sudo chown -R $USER:$USER /mnt/data/mongodb
sudo chown -R $USER:$USER /mnt/data/redis
sudo chown -R $USER:$USER /mnt/data/mssql
sudo chown -R $USER:$USER /mnt/data/minio
sudo chown -R $USER:$USER /mnt/data/SmashClub
sudo chown -R $USER:$USER /mnt/data/docker

echo "Docker installation and setup complete!"
docker --version
docker compose version
