# Solitaire Universe
################################################################################

include ../Makefile.mk

AIRSDK		:=	../../air
OUT			:=	SolitaireUniverse.air

.target:
	@echo 'air' > .target

native: clean
	@echo 'native' > .target

air: clean
	@echo 'air' > .target


.appinfo.json: appinfo.json
	@cat appinfo.json | sed -e s/autoversion/$(VERSION)/ > .appinfo.json

.descriptor.xml: descriptor.xml
	@cat descriptor.xml | sed -e s/autoversion/$(VERSION)/ > .descriptor.xml

.tmp: .descriptor.xml .appinfo.json $(SRCS)
	@rm -rf .tmp 2>/dev/null || true
	@mkdir -p .tmp/enyo/framework
	@cp -r ../app/* .tmp/
	@cp -r ../../enyo-1.0-r1/framework/build .tmp/enyo/framework/
	@cp -r ../../enyo-1.0-r1/framework/enyo.js .tmp/enyo/framework/
	@cp -r ../../enyo-1.0-r1/LICENSE-2.0.txt .tmp/enyo/
	@cp index.html framework_config.json .tmp/
	@cp .descriptor.xml .tmp/descriptor.xml
	@cp .appinfo.json .tmp/appinfo.json
	@cp $(AIRSDK)/frameworks/libs/air/AIRAliases.js .tmp
	@cp ../icon-*.png .tmp/
	@find .tmp -name .svn | xargs -L1 -I{} rm -rf {}

$(OUT): .tmp .target
	@(cd .tmp && ../$(AIRSDK)/bin/adt -package -storetype pkcs12 -keystore ../SolitaireUniverse.pfx -storepass lgj9kl3ofb -target `cat ../.target` ../SolitaireUniverse.air descriptor.xml *)

all: $(OUT)

install: $(OUT)
	@echo install does not work yet

clean:
	@rm -rf .tmp $(OUT) 2>/dev/null || true

launch:
	@echo launch does not work yet

log:
	@echo log does not work yet

test: .tmp
	@$(AIRSDK)/bin/adl .tmp/descriptor.xml

.PHONY: clean install launch log test

