#!/bin/bash

# Docker Installation Script for Linux Mint 22.1
# Run this script with: bash INSTALL_DOCKER_MINT.sh

echo "Installing Docker on Linux Mint 22.1..."

# Update package database
sudo apt update

# Install prerequisites
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository (using jammy for Mint 22.1 which is based on Ubuntu 24.04)
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu jammy stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Update package database again
sudo apt update

# Install Docker Engine
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Add current user to docker group
sudo usermod -aG docker $USER

echo ""
echo "Docker installation completed!"
echo ""
echo "IMPORTANT: You need to log out and log back in (or restart your computer)"
echo "for the group changes to take effect, then run:"
echo ""
echo "  docker --version"
echo "  docker compose version"
echo "  docker run hello-world"
echo ""
echo "After that, you can start the recipe application with:"
echo "  cd \"$(pwd)\""
echo "  docker compose up -d"
echo ""