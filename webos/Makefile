# Solitaire Universe
################################################################################

include ../Makefile.mk

ARCH		:=	all
IPK			:=	$(APPID)_$(VERSION)_$(ARCH).ipk
APP			:=	appinfo.json						\
				.active/framework_config.json		\
				../app/*							\
				../icon.png ../icon-256x256.png

beta: clean
	@rm -rf .active 2>/dev/null || true
	@ln -s beta .active

debug: clean
	@rm -rf .active 2>/dev/null || true
	@ln -s debug .active

release: clean
	@rm -rf .active 2>/dev/null || true
	@ln -s release .active

################################################################################

.active:
	@echo "Run one of the following"
	@echo "   make beta"
	@echo "   make debug"
	@echo "   make release"
	@false


appinfo.json:
	@cat .active/appinfo.json | sed -e s/autoversion/$(VERSION)/ > appinfo.json

$(IPK): index.html appinfo.json $(SRCS)
	@rm -rf .tmp 2>/dev/null || true
	@mkdir -p .tmp/enyo/framework
	@cp -r $(APP) .tmp
	@cp -r ../../enyo-1.0-r1/framework/build .tmp/enyo/framework/
	@cp -r ../../enyo-1.0-r1/framework/enyo.js .tmp/enyo/framework/
	@cp -r ../../enyo-1.0-r1/LICENSE-2.0.txt .tmp/enyo/
	@cp index.html .tmp/
	@palm-package .tmp

all: $(IPK)

install: $(IPK)
	@palm-install *.ipk

clean:
	@rm *.ipk .tmp appinfo.json Packages Packages.gz 2>/dev/null || true

launch:
	@palm-launch -i $(APPID)

log:
	-palm-log -f $(APPID) | sed -u										\
		-e 's/\[[0-9]*-[0-9]*:[0-9]*:[0-9]*\.[0-9]*\] [a-zA-Z]*: //'	\
		-e 's/indicated new content, but not active./\n\n\n/'

test: launch log
	true

# Build a Packages file to use in the preware feed

Packages:
	@echo "Creating Packages file for preware feed"
	@echo "Package: "$(APPID)										>  Packages
	@echo "Version: "$(VERSION)										>> Packages
	@echo "Section: Games"											>> Packages
	@echo "Description: Solitaire Universe Beta"					>> Packages
	@echo "Architecture: all"										>> Packages
	@echo "Maintainer: Micah N Gorrell <support@minego.net>"		>> Packages
	@echo "Filename: $(IPK)"										>> Packages
	@echo "Size: `cat $(IPK) | wc -c`"								>> Packages
	@echo "MD5Sum: `cat $(IPK) | md5sum | sed 's/ *-//'`"			>> Packages
	@echo 	"Source: { "													\
			"\"Feed\":\"solitaire-universe\", "								\
			"\"Title\":\"Solitaire Universe Beta\", "						\
			"\"HomePage\":\"http://solitaireuniverse.net/universe\", "		\
			"\"Icon\":\"http://solitaireuniverse.net/universe/icon.png\", "	\
			"\"Type\":\"Application\", "									\
			"\"Category\":\"Games\", "										\
			"\"License\":\"Closed Source\", "								\
			"\"LastUpdated\":\"`date -u +%s`\", "							\
			"\"MinWebOSVersion\":\"1.4.0\", "								\
			"\"Screenshots\":["												\
			"	\"http://solitaireuniverse.net/universe/screenshot1.png\","	\
			"	\"http://solitaireuniverse.net/universe/screenshot2.png\","	\
			"	\"http://solitaireuniverse.net/universe/screenshot3.png\" "	\
			"], "															\
			"\"FullDescription\":\"Solitaire Universe Beta\""				\
			"}"														>> Packages
	@echo ""														>> Packages
	@rm -rf Packages.gz 2>/dev/null || true
	@gzip -c Packages > Packages.gz

Packages.gz: Packages

.PHONY: beta debug release clean install launch test log

