# Solitaire Universe
################################################################################

PKG			:= SolitaireUniverse
MANIFEST	:= manifest.json

include ../Makefile.mk

.tmp/appinfo.json:
	@mkdir -p .tmp
	@cat appinfo.json | sed -e s/autoversion/$(VERSION)/ > .tmp/appinfo.json

.tmp/$(MANIFEST):
	@mkdir -p .tmp
	@cat $(MANIFEST) | sed -e s/autoversion/$(VERSION)/ > .tmp/$(MANIFEST)

$(PKG): $(SRCS) .tmp/$(MANIFEST) .tmp/appinfo.json framework_config.json index.html
	@rm -rf $(PKG) 2>/dev/null || true
	@mkdir -p $(PKG)/enyo/framework
	@cp -r ../app/* $(PKG)
	@cp index.html $(PKG)
	@cp -r ../../enyo-1.0-r1/framework/build $(PKG)/enyo/framework/
	@cp -r ../../enyo-1.0-r1/framework/enyo.js $(PKG)/enyo/framework/
	@cp -r ../../enyo-1.0-r1/LICENSE-2.0.txt $(PKG)/enyo/
	@cp .tmp/appinfo.json framework_config.json $(PKG)/enyo/framework/
	@cp .tmp/appinfo.json framework_config.json $(PKG)/enyo/
	@cp .tmp/appinfo.json framework_config.json $(PKG)/
	@cp ../icon-16x16.png ../icon-128x128.png $(PKG)
	@cp .tmp/$(MANIFEST) $(PKG)
	@find $(PKG) -name .svn | xargs -L1 -I{} rm -rf {}

$(PKG).zip: $(PKG)
	zip $(PKG).zip $(PKG)/$(MANIFEST) $(PKG)/icon*

# TODO	Actually build the PKG

all: $(PKG)

install: $(PKG)
	@true

clean:
	@rm -rf $(PKG) $(PKG).crx $(PKG).zip .tmp 2>/dev/null || true

launch:
	@true

log:
	@true

test: launch log
	@true

.PHONY: clean install launch log test

