# Solitaire Universe
################################################################################

include ../Makefile.mk

ACTIVE		:=	$(shell cat .active)
APK			:=	SolitaireUniverse-$(ACTIVE).apk
APP			:=	AndroidManifest.xml		\
				build.xml				\
				project.properties		\
				local.properties		\
				ant.properties			\
				proguard.cfg			\
				phonegap				\
				src						\
				assets					\
				libs					\
				res

.active:
	@echo 'debug' > .active

debug: clean
	@echo 'debug' > .active

release: clean
	@echo 'release' > .active

# This line may need to be adjusted based on the right target. Run
# 'android list' to see all the avaliable targets.
project.properties:
	android update project -p . -t 1

.appinfo.json: appinfo.json
	@cat appinfo.json | sed -e s/autoversion/$(VERSION)/ > .appinfo.json

$(APK): project.properties .appinfo.json $(SRCS)
	@rm -rf .tmp 2>/dev/null || true
	@mkdir -p .tmp
	@cp -r $(APP) .tmp
	@cp -r ../app/* .tmp/assets/www/
	@mkdir -p .tmp/assets/www/enyo/framework
	@cp -r ../../enyo-1.0-r1/framework/build .tmp/assets/www/enyo/framework/
	@cp -r ../../enyo-1.0-r1/framework/enyo.js .tmp/assets/www/enyo/framework/
	@cp -r ../../enyo-1.0-r1/LICENSE-2.0.txt .tmp/assets/www/enyo/
	@cp index.html webintent.js phonegap-1.4.0.js .tmp/assets/www/
	@cp .appinfo.json .tmp/assets/www/appinfo.json
	@cp ../icon-128x128.png .tmp/res/drawable/icon.png
	@find .tmp -name .svn | xargs -L1 -I{} rm -rf {}
	@(cd .tmp && echo 'lgj9kl3ofb' | ant $(ACTIVE))
	@mv .tmp/bin/$(APK) .

all: $(APK)

install: $(APK)
	@adb install -r $(APK)

clean:
	@rm -rf .tmp .appinfo.json *.apk project.properties local.properties 2>/dev/null || true

launch:
	@adb shell am start -n $(APPID)/$(APPID).SolitaireUniverse

log:
	@adb logcat | grep -i PhoneGapLog

test: launch log
	true

.PHONY: clean install launch log test

