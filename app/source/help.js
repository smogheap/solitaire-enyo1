enyo.kind({

name:							"SolitaireHelp",
kind:							"net.minego.toaster",

components: [
	{	className:				"enyo-sliding-view-shadow" },
	{
		kind:					enyo.VFlexBox,
		flex:					1,
		height:					"100%",
		width:					"320px",

		components: [
			{
				name:			"title",
				content:		$L("How to Play"),
				kind:			"PageHeader",
				layoutKind:		"VFlexLayout",
				className:		"enyo-header-dark"
			},

			{
				kind:			enyo.FadeScroller,
				flex:			1,
				style:			"background-color: #f1f1f1;",

				components: [{
					name:		"howtoplay",
					style:		"margin: 10px;"
				}]
			},
			{
				kind:			"Toolbar",
				components: [{
					kind:		"GrabButton",
					onclick:	"close"
				}]
			}
		]
	}
],

open: function(help, name)
{
	this.inherited(arguments);

	if (this.$.howtoplay) {
		this.$.howtoplay.destroyControls();
	}

	this.$.title.setContent($L("How to play") + " " + name);

	/*
		Replace the components with the proper elements needed to make the help
		render nicely.
	*/
	if (help) {
		for (var i = 0, c; c = help[i]; i++) {
			if (c.caption) {
				this.$.howtoplay.createComponent({
					nodeTag:			"h3",
					className:			"enyo-text-ellipsis enyo-text-subheader",

					content:			c.caption
				});
			}

			if (c.content) {
				var lines = c.content.split('\n');
				var line;

				while ((line = lines.shift())) {
					this.$.howtoplay.createComponent({
						nodeTag:		"p",
						className:		"enyo-text-body",

						content:		line
					});
				}
			}
		}
	}

	this.$.howtoplay.render();
}

});
