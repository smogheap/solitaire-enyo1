# Solitaire Universe
################################################################################

# Prevent trying to remake the Makefile
Makefile:
	@true

.active:
	@echo "Run one of the following"
	@echo "   make webos"
	@echo "   make android"
	@echo "   make playbook"
	@echo "   make chrome"
	@echo "   make air"
	@false

webos:
	@rm -rf .active 2>/dev/null || true
	@ln -s webos .active

android:
	@rm -rf .active 2>/dev/null || true
	@ln -s android .active

playbook:
	@rm -rf .active 2>/dev/null || true
	@ln -s playbook .active

chrome:
	@rm -rf .active 2>/dev/null || true
	@ln -s chrome .active

air:
	@rm -rf .active 2>/dev/null || true
	@ln -s air .active


%: .active
	@$(MAKE) -C .active $@

.PHONY: webos android playbook chrome air

