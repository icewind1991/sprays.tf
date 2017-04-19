.PHONY: watch

node_modules: package.json
	npm install

watch: node_modules
	node_modules/.bin/grunt watch

.PHONY: build
build: node_modules
	node_modules/.bin/grunt

all: build
