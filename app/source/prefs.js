/*
	Copyright (c) 2010, Micah N Gorrell
	All rights reserved.

	THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR IMPLIED
	WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
	MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO
	EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
	SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
	PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
	OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
	WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
	OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
	ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

enyo.kind(
{

name:												"Prefs",

kind:												"net.minego.toaster",

events: {
	onChange:										"",
	onAction:										""
},

components: [
	{	className:									"enyo-sliding-view-shadow" },

	{
		kind:										enyo.VFlexBox,
		flex:										1,
		height:										"100%",

		components: [
			{
				kind:								"PageHeader",
				className:							"enyo-header-dark",

				components: [
					{
						kind:						"Button",
						className:					"prefsClose",
						onclick:					"close",
						content:					$L("Close")
					},
					{
						content:					$L("Game Options"),
						name:						"title",
						flex:						1
					}
				]
			},
			{
				kind:								enyo.FadeScroller,
				flex:								1,
				style:								"background-color: #f1f1f1;",
				components: [
					{
						kind:						"RowGroup",
						className:					"prefsGroup",
						caption:					$L("Game Play"),
						name:						"gameplay",
						components: [
							{
								kind:				"HFlexBox",
								align:				"center",
								tapHighlight:		false,
								components: [
									{ content:		$L("Auto Play") },
									{ kind:			"Spacer" },
									{
										name:		"autoPlay",

										kind:		enyo.ToggleButton,
										onLabel:	$L("ON"),
										offLabel:	$L("OFF"),
										style:		"padding: 0px;",

										state:		true,
										onChange:	"toggleChanged"
									}
								]
							},
							{
								kind:				"HFlexBox",
								align:				"center",
								tapHighlight:		false,
								components: [
									{ content:		$L("Timer") },
									{ kind:			"Spacer" },
									{
										name:		"showTimer",

										kind:		enyo.ToggleButton,
										onLabel:	$L("Show"),
										offLabel:	$L("Hide"),
										style:		"padding: 0px;",

										state:		true,
										onChange:	"toggleChanged"
									}
								]
							},
							{
								kind:				"HFlexBox",
								align:				"center",
								tapHighlight:		false,
								components: [
									{ content:		$L("Highlight Playable Cards") },
									{ kind:			"Spacer" },
									{
										name:		"highlight",

										kind:		enyo.ToggleButton,
										onLabel:	$L("On"),
										offLabel:	$L("Off"),
										style:		"padding: 0px;",

										state:		true,
										onChange:	"toggleChanged"
									}
								]
							},
							{
								kind:				"HFlexBox",
								align:				"center",
								tapHighlight:		false,
								components: [
									{ content:		$L("Warn about unsafe undo") },
									{ kind:			"Spacer" },
									{
										name:		"unsafeundo",

										kind:		enyo.ToggleButton,
										onLabel:	$L("On"),
										offLabel:	$L("Off"),
										style:		"padding: 0px;",

										state:		true,
										onChange:	"toggleChanged"
									}
								]
							}

						]
					},

					{
						kind:						"RowGroup",
						className:					"prefsGroup",
						caption:					$L("Card Appearance"),
						components: [
							{
								kind:				"HFlexBox",
								align:				"center",
								tapHighlight:		false,
								components: [
									{ content:		$L("Animate Cards") },
									{ kind:			"Spacer" },
									{
										kind:		"ListSelector",
										name:		"animations",
										onChange:	"listChanged",
										items: [
											{ caption:	$L("Off"),			value: 	0	},
											{ caption:	$L("Very Fast"),	value: 	75	},
											{ caption:	$L("Fast"),			value: 	150	},
											{ caption:	$L("Normal"),		value: 	300	},
											{ caption:	$L("Slow"),			value: 	450	},
											{ caption:	$L("Very Slow"),	value: 	700	}
										]
									}
								]
							},
							{
								kind:				"VFlexBox",
								tapHighlight:		false,
								components: [
									{
										kind:			"HFlexBox",
										components: [
											{ content:	$L("Neat")		},
											{ kind:		"Spacer"		},
											{ content:	$L("Sloppy")	}
										]
									},
									{
										name:		"sloppy",
										kind:		"Slider",
										minimum:	0,
										maximum:	24,
										position:	8,
										onChange:	"sloppyChanged",
										onChanging:	"sloppyChanged"
									}
								]
							},
							{
								kind:				"HFlexBox",
								align:				"center",
								tapHighlight:		false,
								components: [
									{
										content:	$L("Cardset"),
										flex:		1
									},
									{
										kind:		"ListSelector",
										name:		"cardset",
										onChange:	"cardsetChanged",
										items: [
											{ caption:	$L("Standard"),			value: "images/cardset/"			},
											{ caption:	$L("Vintage"),			value: "images/cardset-aged/"		},
											{ caption:	$L("Modern"),			value: "images/cardset-modern/"		},
											{ caption:	$L("Ornamental"),		value: "images/cardset-ornamental/"	},
											{ caption:	$L("High Visibility"),	value: "images/cardset-small/"		},
											{ caption:	$L("Zodiac"),			value: "images/cardset-zodiac/"		}
										]
									}
								]
							}
						]
					},

					{
						kind:						"RowGroup",
						className:					"prefsGroup",
						caption:					$L("Background"),
						components: [
							{
								kind:				"HFlexBox",
								align:				"center",
								tapHighlight:		false,
								components: [
									{
										content:	$L("Type"),
										flex:		1
									},
									{
										kind:		"ListSelector",
										name:		"bgType",
										onChange:	"bgTypeChanged"
									}
								]
							},
							{
								components: [
									{
										name:		"bgColorSection",
										kind:		"HFlexBox",
										align:		"center",
										tapHighlight:false,

										components: [
											{
												content:$L("Color"),
												flex:	1
											},
											{
												kind:	"CustomListSelector",
												name:	"bgColor",
												onChange:"listChanged",

												items: [
													{ caption:	$L("Green"),		value: "green",			className: "dark	green"			},
													{ caption:	$L("Black"),		value: "black",			className: "dark	black"			},
													{ caption:	$L("Red"),			value: "red",			className: "dark	red"			},
													{ caption:	$L("Blue"),			value: "blue",			className: "dark	blue"			},
													{ caption:	$L("Navy Blue"),	value: "navy",			className: "dark	navy"			},
													{ caption:	$L("Purple"),		value: "purple",		className: "dark	purple"			},
													{ caption:	$L("Olive"),		value: "olive",			className: "dark	olive"			},
													{ caption:	$L("Brown"),		value: "brown",			className: "dark	brown"			},
													{ caption:	$L("Grey"),			value: "darkgrey",		className: "light	darkgrey"		},
													{ caption:	$L("Orange"),		value: "orange",		className: "light	orange"			},
													{ caption:	$L("Yellow"),		value: "yellow",		className: "light	yellow"			},
													{ caption:	$L("Bright Yellow"),value: "brightyellow",	className: "light	brightyellow"	},
													{ caption:	$L("Coral"),		value: "coral",			className: "light	coral"			},
													{ caption:	$L("Aqua Marine"),	value: "aquamarine",	className: "light	aquamarine"		},
													{ caption:	$L("Pink"),			value: "pink",			className: "light	pink"			}
												]
											}
										]
									},

									{
										name:		"bgImageSection",
										kind:		"Button",
										caption:	$L("Change Wallpaper"),
										onclick:	"bgTypeChanged"
									},

									{
										name:		"bgPicker",
										kind:		"FilePicker",
										fileType:	[ "image" ],
										allowMultiSelect:false,
										onPickFile:	"bgImageChanged"
									}
								]
							}
						]
					},

					{
						kind:						"RowGroup",
						className:					"prefsGroup",
						caption:					$L("Layout"),

						/* Hide the layout option until it is being used */
						style:						"display: none;",

						components: [
							{
								kind:				"HFlexBox",
								align:				"center",
								tapHighlight:		false,
								components: [
									{
										content:	$L("Game Layout"),
										flex:		1
									},
									{
										kind:		"ListSelector",
										name:		"layout",
										onChange:	"listChanged",

										items: [
											{ caption: $L("Automatic"),		value: "auto"	},
											{ caption: $L("Small Screen"),	value: "small"	},
											{ caption: $L("Large Screen"),	value: "large"	}
										]
									}
								]
							}
						]
					}
				]
			},
			{
				kind:								"Toolbar",
				className:							"prefsToolbar",
				components: [{
					kind:							"GrabButton",
					onclick:						"close"
				}]
			}
		]
	},

	{
		name:										"AllOrOneDialog",
		kind:										"ModalDialog",

		caption:									$L("Apply to all games?"),
		components: [
			{
				kind:								"Button",
				caption:							$L("Use these settings for all games"),
				onclick:							"applyToAll"
			},
			{
				kind:								"Button",
				name:								"applyToOneButton",
				caption:							$L("Only use these settings for this game"),
				onclick:							"applyToOne"
			}
		]
	}
],

open: function()
{
	var wide = false;

	try {
		if (net.minego.playbook && window.innerHeight <= 600 && window.innerWidth >= 1024) {
			wide = true;
		}
	} catch (e) {
	}

	if (wide) {
		this.applyStyle("right",			"0px");
		this.applyStyle("top",				"0px");
		this.applyStyle("left",				"0px");
		this.applyStyle("bottom",			null);

		this.applyStyle("height",			"335px");
		this.applyStyle("width",			"100%");

		this.applyStyle("border-bottom",	"1px solid #999");

		this.setFlyInFrom("top");

		this.addClass("wide");
	} else {
		this.applyStyle("right",			"0px");
		this.applyStyle("top",				"0px");
		this.applyStyle("bottom",			"0px");
		this.applyStyle("left",				null);

		this.applyStyle("height",			"100%");
		this.applyStyle("width",			"320px");

		this.applyStyle("border-bottom",	null);

		this.setFlyInFrom("right");
		this.removeClass("wide");
	}

	this.inherited(arguments);
	this.dirty = false;
},

setGameName: function(name)
{
	this.gameName = name;

	this.$.title.setContent(name + " " + $L("Options"));
},

setBool: function(name, defaultValue)
{
	var c;
	var value = defaultValue;

	if (!(c = this.$[name])) {
		return;
	}

	if (undefined != this.prefs[name]) {
		value = this.prefs[name];
	} else {
		this.prefs[name] = defaultValue;
	}

	// this.log(value);
	c.setState(value);
},

setValue: function(name, defaultValue)
{
	var c;

	if (!(c = this.$[name])) {
		return;
	}

	var func;

	if (undefined != this.prefs[name]) {
		c.setValue(this.prefs[name]);
	} else {
		c.setValue(defaultValue);
		this.prefs[name] = defaultValue;
	}
},

load: function(gametype, readonly)
{
	if (gametype) {
		this.gametype = gametype;
	} else {
		gametype = this.gametype;
	}


	var player	= SolPlayers.getPlayer();

	var game	=	SolPlayers.getCookie(player, gametype + ":prefs") || {};
	var all		=	SolPlayers.getCookie(player, "all:prefs") || {};

	if ((game.timestamp || 0) > (all.timestamp || 0)) {
		this.prefs = game;
	} else {
		this.prefs = all;
	}
	game = all = null;

	/* If guest, or readonly was set */
	if (player < 0 || readonly) {
		this.prefs.readonly = true;
	}

	switch (gametype) {
		case "pyramid":
			/* These games don't have autoplay */
			this.$.autoPlay.setDisabled(true);
			this.$.highlight.setDisabled(true);
			this.$.unsafeundo.setDisabled(false);
			break;

		case "gaps":
		case "golf":
			/* These games don't have autoplay, but do have highlight */
			this.$.autoPlay.setDisabled(true);
			this.$.highlight.setDisabled(false);
			this.$.unsafeundo.setDisabled(false);
			break;

		case "freecell":
			/* No cards ever flip in freecell */
			this.$.unsafeundo.setDisabled(true);

			this.$.highlight.setDisabled(false);
			this.$.autoPlay.setDisabled(false);
			break;

		default:
			this.$.autoPlay.setDisabled(false);
			this.$.unsafeundo.setDisabled(false);

			/* Most games don't do (highlight) yet */
			this.$.highlight.setDisabled(true);
			break;
	}

	if (undefined == this.prefs.sloppy) {
		this.prefs.sloppy = 2;
	}
	/* The slider needs to be more accurate, so multiply by 4 */
	this.$.sloppy.setPosition((this.prefs.sloppy) * 4);

	var items = [
			{ caption:	$L("Felt"),			value: "felt"	},
			{ caption:	$L("Solid Color"),	value: "color"	}
	];

	if (window.PalmSystem) {
		items.push(
			{ caption:	$L("Wallpaper"),	value: "image"	}
		);
	}

	this.$.bgType.setItems(items);

	this.setBool(	"autoPlay",		true);
	this.setBool(	"showTimer",	true);
	this.setBool(	"highlight",	true);
	this.setBool(	"unsafeundo",	true);
	this.setValue(	"bgType",		"felt");
	this.setValue(	"bgColor",		"green");
	this.setValue(	"layout",		"auto");

	/* Set the default cardset based on the screen size */
	var cardset = "images/cardset-small/";
	try {
		if (window.innerHeight > 700 &&
			window.innerWidth  > 700
		) {
			cardset = "images/cardset/";
		}
	} catch (e) {}
	this.setValue("cardset", cardset);

	/* Animations was a boolean before, so handle old values */
	if ("boolean" == typeof this.prefs.animations) {
		if (this.prefs.animations) {
			delete this.prefs.animations;
		} else {
			this.prefs.animations = 0;
		}
	}

	this.setValue(	"animations",	150);

	this.bgTypeChanged();

	this.save();
	this.dirty = false;
	return(this.prefs);
},

_save: function(name)
{
	if (!name) {
		name = this.gametype;
	}

	if (!this.prefs.readonly) {
		/* Save the preferences whenever we notify the consumer of the change */
		this.prefs.timestamp = (new Date()).getTime();

		SolPlayers.setCookie(NaN, name + ":prefs", this.prefs);
	}
},

save: function(quiet)
{
	this.dirty = true;

	enyo.job("savePrefs", enyo.bind(this, "_save"), 1000);

	/* Let the consumer know about the new values */
	if (!quiet) {
		this.doChange(this.prefs);
	}
},

toggleChanged: function(sender, e)
{
	// this.log(sender.getState());
	this.prefs[sender.name] = sender.getState();

	this.save();
},

_sloppyChanged: function()
{
	this.prefs.sloppy = this.$.sloppy.getPosition() / 4;
	this.save();
},

sloppyChanged: function(sender, e)
{
	enyo.job("sloppyChanged", enyo.bind(this, "_sloppyChanged"), 300);
},

listChanged: function(sender, e)
{
	this.prefs[sender.name] = sender.getValue();

	this.save();
},

bgTypeChanged: function(sender, e)
{
	this.listChanged(this.$.bgType, e);

	switch (this.prefs.bgType) {
		case "felt":
		case "color":
			this.$.bgColorSection.show();
			this.$.bgImageSection.hide();
			break;

		case "image":
			this.$.bgColorSection.hide();
			this.$.bgImageSection.show();

			if (sender) {
				this.$.bgPicker.pickFile();
			}
			break;
	}
},

bgImageChanged: function(sender, e)
{
	// this.log(sender, e);

	if (e && e.length > 0) {
		this.prefs.bgSrc = e[0].fullPath;
	}

	this.save();
},

cardsetChanged: function(sender, e)
{
	this.listChanged(this.$.cardset, e);
},

close: function()
{
	this.inherited(arguments);

	if (this.dirty) {
		this.$.AllOrOneDialog.openAtCenter();
		this.$.applyToOneButton.setCaption($L("Only use these settings for") + " " + this.gameName);
		this.dirty = false;
	}
},

applyToAll: function()
{
	this._save("all");
	this.$.AllOrOneDialog.close();
	this.dirty = false;
},

applyToOne: function()
{
	this.save();
	this.$.AllOrOneDialog.close();
	this.dirty = false;
}

});


