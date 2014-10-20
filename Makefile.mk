APP			:= solitaire2
VENDOR		:= net.minego
APPID		:= $(VENDOR).$(APP)
VERSION		:= $(shell (cd .. && svn info) | grep "Last Changed Rev:" | sed "s/.*: \([0-9]*\)\([0-9][0-9]\)/2.\1.\2/")
SRCS		:= $(shell find ../app -name "*.js" && find ../app -name "*.css" && find ../app -name "*.html")

