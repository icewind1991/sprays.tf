.PHONY: watch

node_modules: package.json
	npm install

watch: node_modules
	node_modules/.bin/grunt watch

.PHONY: build
build: node_modules
	node_modules/.bin/grunt

.PHONY: deploy
deploy: build
	scp -r build robin@icewind.nl:/var/www/html/sprays.tf
	scp index.html robin@icewind.nl:/var/www/html/sprays.tf

all: build
