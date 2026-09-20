# Requires Hugo Extended and Dart Sass: brew install hugo dart-sass

.PHONY: run build clean

run:            ## Local preview
	hugo server --noHTTPCache --disableFastRender

build: clean    ## Fresh output for GitHub Pages and Sites
	hugo --minify --gc
	cp -R public dist

clean:
	rm -rf public dist resources/_gen
