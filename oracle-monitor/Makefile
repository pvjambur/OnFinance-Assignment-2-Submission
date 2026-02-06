.PHONY: setup test clean run-infra stop-infra

setup:
	pip install -r collectors/requirements.txt
	pip install -r api/requirements.txt
	pip install -r cli/requirements.txt
	pip install -e cli/

test:
	pytest tests/

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete

run-infra:
	docker-compose up -d

stop-infra:
	docker-compose down
