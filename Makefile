run-server:
	@echo "Starting server..."
	@cd apps/backend && \
		npm run dev

run-client:
	@echo "Starting client..."
	@cd apps/client && \
		npm run dev

run-test:
	@echo "Running tests..."
	@cd packages/test && \
		npm run test