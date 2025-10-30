.PHONY: help build up down restart logs clean clean-all migrate seed reset-db

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

build: ## Build all Docker images
	COMPOSE_BAKE=true docker-compose build

up: ## Start all services
	docker-compose up -d
	@echo "🚀 Services starting..."
	@echo "API:           http://localhost:3000"
	@echo "Customer PWA:  http://localhost:5173"
	@echo "Dashboard:     http://localhost:5174"
	@echo ""
	@echo "Run 'make logs' to see logs"

down: ## Stop all services
	docker-compose down

restart: ## Restart all services
	docker-compose restart

logs: ## Follow logs from all services
	docker-compose logs -f

logs-api: ## Follow API logs
	docker-compose logs -f api

logs-customer: ## Follow Customer PWA logs
	docker-compose logs -f customer

logs-dashboard: ## Follow Dashboard logs
	docker-compose logs -f dashboard

migrate: ## Run database migrations
	docker-compose exec api pnpm --filter @inkwave/db drizzle:migrate

seed: ## Seed the database
	docker-compose exec api pnpm --filter @inkwave/db seed

seed-superadmin: ## Seed super admin users
	docker-compose exec api pnpm --filter @inkwave/db seed:superadmin

reset-db: ## Reset database (migrate + seed)
	@echo "🔄 Resetting database..."
	docker-compose exec api pnpm --filter @inkwave/db drizzle:migrate
	docker-compose exec api pnpm --filter @inkwave/db seed
	@echo "✅ Database reset complete"

clean: ## Remove containers and images (keeps database data)
	docker-compose down --rmi all
	@echo "✅ Containers and images removed (database preserved)"

clean-all: ## ⚠️  DANGER: Remove everything including database data
	@echo "⚠️  WARNING: This will delete ALL data including the database!"
	@echo "Press Ctrl+C within 5 seconds to cancel..."
	@sleep 5
	docker-compose down -v --rmi all
	@echo "🗑️  Everything removed including database volumes"

ps: ## Show running containers
	docker-compose ps

shell-api: ## Open shell in API container
	docker-compose exec api sh

shell-db: ## Open PostgreSQL shell
	docker-compose exec postgres psql -U postgres -d inkwave

rebuild: down build up ## Rebuild and restart all services

