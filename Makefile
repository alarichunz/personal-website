# Requires Hugo Extended (SCSS support). Install: https://gohugo.io/installation/
# macOS:  brew install hugo

.PHONY: run build clean new-notebook new-lab new-library

run:            ## Local dev server with drafts
	hugo server -D --noHTTPCache --disableFastRender

build:          ## Production build into ./public
	hugo --minify --gc

clean:
	rm -rf public resources/_gen

new-notebook:   ## make new-notebook name=my-essay
	hugo new content notebook/$(name).md --kind notebook

new-lab:        ## make new-lab name=my-experiment
	hugo new content laboratory/$(name).md --kind laboratory

new-library:    ## make new-library name=some-book
	hugo new content library/$(name).md --kind library
