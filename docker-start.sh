#!/bin/bash

# D&D Campaign Management System - Docker Startup Script

set -e

echo "🎲 Starting D&D Campaign Management System with Docker..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose is not installed. Please install Docker Compose."
    exit 1
fi

# Function to display usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  dev     Start in development mode (database + API only)"
    echo "  prod    Start in production mode (all services)"
    echo "  stop    Stop all services"
    echo "  logs    Show logs"
    echo "  clean   Clean up containers and volumes"
    echo "  help    Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 prod    # Start production environment"
    echo "  $0 dev     # Start development environment"
    echo "  $0 stop    # Stop all services"
    echo "  $0 logs    # Show logs"
}

# Function to start production environment
start_production() {
    echo "🚀 Starting production environment..."
    docker-compose up -d
    
    echo ""
    echo "✅ Services started successfully!"
    echo ""
    echo "📱 Frontend: http://localhost:3000"
    echo "🔧 API: http://localhost:3001"
    echo "🗄️  Database: localhost:5432"
    echo ""
    echo "📊 Health checks:"
    echo "   Frontend: http://localhost:3000/health"
    echo "   API: http://localhost:3001/health"
    echo ""
    echo "📋 To view logs: $0 logs"
    echo "🛑 To stop: $0 stop"
}

# Function to start development environment
start_development() {
    echo "🔧 Starting development environment..."
    docker-compose -f docker-compose.dev.yml up -d
    
    echo ""
    echo "✅ Development services started!"
    echo ""
    echo "🗄️  Database: localhost:5432"
    echo "🔧 API: http://localhost:3001"
    echo ""
    echo "📝 To start the frontend locally:"
    echo "   npm install"
    echo "   npm start"
    echo ""
    echo "📋 To view logs: $0 logs"
    echo "🛑 To stop: $0 stop"
}

# Function to stop services
stop_services() {
    echo "🛑 Stopping all services..."
    docker-compose down
    docker-compose -f docker-compose.dev.yml down
    echo "✅ All services stopped."
}

# Function to show logs
show_logs() {
    echo "📋 Showing logs (Press Ctrl+C to exit)..."
    docker-compose logs -f
}

# Function to clean up
clean_up() {
    echo "🧹 Cleaning up containers and volumes..."
    read -p "⚠️  This will delete all data. Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker-compose down -v --remove-orphans
        docker-compose -f docker-compose.dev.yml down -v --remove-orphans
        docker system prune -f
        echo "✅ Cleanup completed."
    else
        echo "❌ Cleanup cancelled."
    fi
}

# Main script logic
case "${1:-prod}" in
    "dev")
        start_development
        ;;
    "prod")
        start_production
        ;;
    "stop")
        stop_services
        ;;
    "logs")
        show_logs
        ;;
    "clean")
        clean_up
        ;;
    "help"|"-h"|"--help")
        show_usage
        ;;
    *)
        echo "❌ Unknown option: $1"
        echo ""
        show_usage
        exit 1
        ;;
esac
