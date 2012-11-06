# To run this makefile, you must do the following.
#
# 1.)  sudo make tools -B
#

# Create the list of files
files =	src/allplayers.date.js\
	src/allplayers.event.js\
	src/allplayers.group.js\
	src/allplayers.location.js\
	src/allplayers.calendar.js

docfiles = drupal.api.js/src/drupal.api.js\
	drupal.api.js/src/drupal.system.js\
	drupal.api.js/src/drupal.entity.js\
	drupal.api.js/src/drupal.node.js\
	drupal.api.js/src/drupal.user.js\
	src/allplayers.date.js\
	src/allplayers.event.js\
	src/allplayers.group.js\
	src/allplayers.location.js\
	src/allplayers.calendar.js

.DEFAULT_GOAL := all

all: makecore jslint js

makecore:
	cd drupal.api.js; make -B; cd ..;

# Perform a jsLint on all the files.
jslint: ${files}
	gjslint $^

# Create an aggregated js file and a compressed js file.
js: ${files}
	@echo "Generating aggregated bin/allplayers.js"
	@cat > bin/allplayers.js $^
	@echo "Generating compressed bin/allplayers.compressed.js"
	curl -s \
	  -d compilation_level=SIMPLE_OPTIMIZATIONS \
	  -d output_format=text \
	  -d output_info=compiled_code \
	  --data-urlencode "js_code@bin/allplayers.js" \
	  http://closure-compiler.appspot.com/compile \
	  > bin/allplayers.compressed.js
	@echo "Generating compressed bin/allplayers.loader.js"
	curl -s \
	  -d compilation_level=SIMPLE_OPTIMIZATIONS \
	  -d output_format=text \
	  -d output_info=compiled_code \
	  --data-urlencode "js_code@src/allplayers.loader.js" \
	  http://closure-compiler.appspot.com/compile \
	  > bin/allplayers.loader.js

# Create the documentation from source code.
jsdoc: ${docfiles}
	@echo "Generating documetation."
	@java -jar tools/jsdoc-toolkit/jsrun.jar tools/jsdoc-toolkit/app/run.js -a -t=tools/jsdoc-toolkit/templates/jsdoc -d=doc $^

# Fix the js style on all the files.
fixjsstyle: ${files}
	fixjsstyle $^

# Install the necessary tools.
tools:
	apt-get install python-setuptools
	apt-get install unzip
	easy_install http://closure-linter.googlecode.com/files/closure_linter-latest.tar.gz
	wget http://jsdoc-toolkit.googlecode.com/files/jsdoc_toolkit-2.4.0.zip -P tools
	unzip tools/jsdoc_toolkit-2.4.0.zip -d tools
	mv tools/jsdoc_toolkit-2.4.0/jsdoc-toolkit tools/jsdoc-toolkit
	rm -rd tools/jsdoc_toolkit-2.4.0
	rm tools/jsdoc_toolkit-2.4.0.zip
