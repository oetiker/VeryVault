# Copyright (C) 2011 Tobias Oetiker
#
# This program is free software; you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation; either version 2 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program; if not, write to the Free Software
# Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA 02111-1307, USA.

AUTOMAKE_OPTIONS =  foreign

EXTRA_DIST = config.json Manifest.json source/index.html $(shell find source/class/ -name "*.js") $(wildcard source/translation/*.po source/resource/*/*.png  source/resource/*/*.gif)

if BUILD_QOOXDOO_APP

GENTARGETS := lint pretty migration translation api source-ios source-android info

.PHONY: $(GENTARGETS) source source-full

source: source/script/vv.js source/index.html

$(GENTARGETS):
	$(QOOXDOO_PATH)/tool/bin/generator.py -m QOOXDOO_PATH:$(QOOXDOO_PATH) -m CACHE:./cache $@
	
source/script/vv.js: $(shell find source/class/ -name "*.js")
	$(QOOXDOO_PATH)/tool/bin/generator.py -m QOOXDOO_PATH:$(QOOXDOO_PATH) -m CACHE:./cache source-hybrid

source-full: source/index.html
	$(QOOXDOO_PATH)/tool/bin/generator.py -m QOOXDOO_PATH:$(QOOXDOO_PATH) -m CACHE:./cache source
        
endif

clean-local:
	test -d ./cache && rm -r ./cache || true
	test -f source/script/vv.js && rm source/script/* || true
