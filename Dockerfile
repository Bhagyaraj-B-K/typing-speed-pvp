# Use the official Node.js image as the base image
FROM node:18

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install the application dependencies
RUN npm ci

# Copy the rest of the application files into the working directory
COPY . .

# Expose port 3000
EXPOSE 3000

# Define the entry point for the container
CMD ["npm", "run", "start"]
