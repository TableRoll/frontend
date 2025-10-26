# D&D Campaign Management System - Docker Makefile

.PHONY: help build up down logs clean dev prod restart status

# Default target
help: ## Show this help message
	@echo "D&D Campaign Management System - Docker Commands"
	@echo "================================================"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

# Production commands
prod: ## Start production environment
	@echo "🚀 Starting production environment..."
	docker-compose up -d
	@echo "✅ Production environment started!"
	@echo "📱 Frontend: http://localhost:3000"
	@echo "🔧 API: http://localhost:3001"

# Development commands
dev: ## Start development environment
	@echo "🔧 Starting development environment..."
	docker-compose -f docker-compose.dev.yml up -d
	@echo "✅ Development environment started!"
	@echo "🗄️  Database: localhost:5432"
	@echo "🔧 API: http://localhost:3001"

# Build commands
build: ## Build all Docker images
	@echo "🔨 Building Docker images..."
	docker-compose build

build-no-cache: ## Build all Docker images without cache
	@echo "🔨 Building Docker images (no cache)..."
	docker-compose build --no-cache

# Management commands
up: prod ## Alias for production start

down: ## Stop all services
	@echo "🛑 Stopping all services..."
	docker-compose down
	docker-compose -f docker-compose.dev.yml down
	@echo "✅ All services stopped."

restart: ## Restart all services
	@echo "🔄 Restarting all services..."
	docker-compose restart
	@echo "✅ All services restarted."

# Logging commands
logs: ## Show logs for all services
	@echo "📋 Showing logs (Press Ctrl+C to exit)..."
	docker-compose logs -f

logs-api: ## Show API logs
	@echo "📋 Showing API logs..."
	docker-compose logs -f api

logs-frontend: ## Show frontend logs
	@echo "📋 Showing frontend logs..."
	docker-compose logs -f frontend

logs-db: ## Show database logs
	@echo "📋 Showing database logs..."
	docker-compose logs -f database

# Status commands
status: ## Show status of all services
	@echo "📊 Service Status:"
	@docker-compose ps

ps: status ## Alias for status

# Database commands
db-shell: ## Access database shell
	@echo "🗄️  Accessing database shell..."
	docker-compose exec database psql -U postgres -d dnd_campaign_db

db-backup: ## Backup database
	@echo "💾 Creating database backup..."
	docker-compose exec database pg_dump -U postgres dnd_campaign_db > backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "✅ Backup created: backup_$(shell date +%Y%m%d_%H%M%S).sql"

# Cleanup commands
clean: ## Clean up containers and volumes
	@echo "🧹 Cleaning up containers and volumes..."
	@read -p "⚠️  This will delete all data. Are you sure? (y/N): " confirm && [ "$$confirm" = "y" ]
	docker-compose down -v --remove-orphans
	docker-compose -f docker-compose.dev.yml down -v --remove-orphans
	docker system prune -f
	@echo "✅ Cleanup completed."

clean-images: ## Remove unused Docker images
	@echo "🧹 Removing unused Docker images..."
	docker image prune -f
	@echo "✅ Unused images removed."

# Health check commands
health: ## Check health of all services
	@echo "🏥 Checking service health..."
	@echo "Frontend: $$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/health || echo 'DOWN')"
	@echo "API: $$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3001/health || echo 'DOWN')"
	@echo "Database: $$(docker-compose exec -T database pg_isready -U postgres -d dnd_campaign_db > /dev/null 2>&1 && echo 'UP' || echo 'DOWN')"

# Development helpers
install: ## Install frontend dependencies
	@echo "📦 Installing frontend dependencies..."
	npm install

start-frontend: ## Start frontend in development mode
	@echo "🎨 Starting frontend development server..."
	npm start

# Quick start commands
quick-start: build prod ## Build and start production environment
	@echo "🎉 Quick start completed!"

quick-dev: dev install ## Start development environment and install dependencies
	@echo "🎉 Development environment ready!"
	@echo "📝 Run 'make start-frontend' to start the frontend development server."
