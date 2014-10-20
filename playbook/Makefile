# Solitaire Universe
################################################################################

include ../Makefile.mk

BBWP		:= /Developer/SDKs/Research\ In\ Motion/BlackBerry\ WebWorks\ SDK\ for\ TabletOS\ 2.2.0.5/bbwp/bbwp
RIMSDK		:= /Developer/SDKs/Research\ In\ Motion/blackberry-tablet-sdk-2.0.0/bin
PKG			:= SolitaireUniverse
BAR			:= $(PKG).bar
ZIP			:= $(PKG).zip
# BUILDID	:= $(shell date -u +"%s")
BUILDID		:= 15
DEVICE		:= 10.10.10.135
PASS		:= lgj9kl3ofb


debug: clean
	@rm -rf .active 2>/dev/null || true
	@ln -s debug .active

release: clean
	@rm -rf .active 2>/dev/null || true
	@ln -s release .active

trial: clean
	@rm -rf .active 2>/dev/null || true
	@ln -s trial .active

################################################################################

.active:
	@ln -s invalid .active

.active/Makefile: .active
	@true

appinfo.json: .active/appinfo.json
	@cat .active/appinfo.json | sed -e s/autoversion/$(VERSION)/ > appinfo.json

.config.xml: config.xml
	@cat config.xml | sed -e s/autoversion/$(VERSION)/ > .config.xml

.tmp: .config.xml appinfo.json $(SRCS)
	@rm -rf .tmp 2>/dev/null || true
	@mkdir -p .tmp/enyo/framework
	@cp -r ../app/* .tmp/
	@cp -r ../../enyo-1.0-r1/framework/build .tmp/enyo/framework/
	@cp -r ../../enyo-1.0-r1/framework/enyo.js .tmp/enyo/framework/
	@cp -r ../../enyo-1.0-r1/LICENSE-2.0.txt .tmp/enyo/
	@cp index.html framework_config.json appinfo.json .tmp/
	@cp index.html framework_config.json appinfo.json .tmp/enyo/framework/
	@cp .config.xml .tmp/config.xml
	@cp ../icon-*.png .tmp/
	@find .tmp -name .svn | xargs -L1 -I{} rm -rf {}

$(ZIP): .tmp
	@rm -rf $(ZIP) 2>/dev/null || true
	@(cd .tmp && zip -r ../$(ZIP) *)

all: $(BAR)

install: $(BAR)
	$(RIMSDK)/blackberry-deploy -installApp $(DEVICE) -password $(PASS) $(BAR)

clean:
	@rm -rf .config.xml appinfo.json .tmp $(ZIP) $(BAR) 2>/dev/null || true

launch:
	@echo launch does not work yet

log:
	@echo log does not work yet

test: .tmp
	@echo test does not work yet

connect:
	$(RIMSDK)/bin/blackberry-connect $(DEVICE) -password $(PASS) -sshPublicKey id_rsa.pub

.PHONY: clean install launch log test debug release trial

# The rule to build the actual bar is defined in .active/Makefile
include .active/Makefile

