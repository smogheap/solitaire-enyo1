APP			:= solitaire2
VENDOR		:= net.minego
APPID		:= $(VENDOR).$(APP)
VERSION		:= 2.21.09
SRCS		:= $(shell find ../app -name "*.js" && find ../app -name "*.css" && find ../app -name "*.html")

