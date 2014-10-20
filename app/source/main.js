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

name:							"net.minego.solitaire2",
kind:							enyo.VFlexBox,

menu: [
	{
		caption:				$L("Change Game"),
		onclick:				"newgame",
		showOn:					[ "AppMenu" ]
	},

	{
		name:					"gameMenu",
		caption:				$L("Game"),
		showOn:					[ "AppMenu" ],
		needs:					"needsGameName",
		components: [
			{
				caption:		$L("Restart current hand"),
				onclick:		"restart"
			},
			{
				caption:		$L("Deal new hand"),
				onclick:		"newdeal"
			},
			{
				caption:		$L("Deal hand by number"),
				onclick:		"choosedeal"
			},
			{
				caption:		$L("Game Options"),
				onclick:		"options"
			},
			{
				caption:		$L("High Scores"),
				onclick:		"scores"
			},
			{
				caption:		$L("Quit Game"),
				onclick:		"giveup"
			},
/*
			{
				needs:			"needsGameName",
				caption:		$L("Current Game") + ":"
			},
*/
			{
				needs:			"needsGameNum",
				caption:		$L("Current Deal") + ":"
			}
		]
	},

	{
		caption:				$L("Player Profiles"),
		onclick:				"players",
		showOn:					[ "AppMenu" ]
	},

	{
		caption:				$L("Share"),
		showOn:					[ "AppMenu" ],

		needs:					"needsShareItems"
	},

	{
		caption:				$L("Help"),
		showOn:					[ "AppMenu" ],

		components: [
			{
				caption:		$L("How to play"),
				onclick:		"howtoplay",
				needs:			"needsGame"
			},

			{
				caption:		$L("E-Mail"),
				showOn:			[ "AppMenu" ],
				onclick:		"openEmail",
				to:				"support@minego.net",
				needs:			"needsNotPlaybook"
			},

			{
				caption:		$L("Twitter"),
				showOn:			[ "AppMenu" ],
				onclick:		"openURL",
				value:			"https://twitter.com/#!/webossolitaire"
			},

			{
				caption:		$L("Leave a review"),
				showOn:			[ "AppMenu" ],
				onclick:		"openURL",
				value:			"https://developer.palm.com/appredirect/?packageid=net.minego.solitaire2",
				needs:			"needsWebOS"
			},

			{
				caption:		$L("Visit Homepage"),
				showOn:			[ "AppMenu" ],
				onclick:		"openURL",
				value:			"http://goo.gl/LlJuE"
				// value:			"http://www.minego.net/universe"
			},

			{
				caption:		$L("Version") + " ",
				needs:			"needsVersion"
			},

			{
				caption:		$L("Debug Info"),
				onclick:		"openDebugDialog"
			}
		]
	},

	{
		kind:					"ToolButtonGroup",
		needs:					"needsGame",
		name:					"gamebuttons",
		showOn:					[ "Toolbar" ],
		components: [
			{
				// caption:		$L("New Game"),
				icon:			"images/toolbar-icon-change.png",
				onclick:		"newgamemenu",
				className:		"enyo-radiobutton-dark enyo-grouped-toolbutton-dark"
			},
			{
				// caption:		$L("Options"),
				icon:			"images/toolbar-icon-options.png",
				onclick:		"options",
				name:			"optionsButton",
				className:		"enyo-radiobutton-dark enyo-grouped-toolbutton-dark"
			},
			{
				// caption:		$L("High Scores"),
				icon:			"images/toolbar-icon-history.png",
				onclick:		"scores",
				name:			"scoresButton",
				className:		"enyo-radiobutton-dark enyo-grouped-toolbutton-dark"
			}
		]
	},


	{
		kind:					enyo.Control,
		name:					"status",
		className:				"status enyo-text-ellipsis",
		showOn:					[ "Toolbar" ],
		flex:					1
	},

	/* We need a spacer if the status is in the bottom toolbar */
	{
		kind:					enyo.Control,
		name:					"notstatus",
		showOn:					[ "Toolbar" ],
		flex:					1
	},

	{
		kind:					"ToolButtonGroup",
		showOn:					[ "Toolbar" ],
		name:					"actions",
		components:				[ ],
		needs:					"needsActions"
	}
],

components: [
	{
		kind:					"ApplicationEvents",
		onWindowActivated:		"activated",
		onWindowDeactivated:	"deactivated",
		onWindowShown:			"activated",
		onWindowHidden:			"deactivated",
		onOpenAppMenu:			"openAppMenu",
		onCloseAppMenu:			"closeAppMenu",
		onKeypress:				"keyPress",
		onBack:					"backHandler"
	},

	{
		name:					"AppMenu",
		kind:					"AppMenu",
		onBeforeOpen:			"beforeMenu"
	},

	{
		kind:					"Menu",
		name:					"newgamemenu",
		components: [
			{
				caption:		$L("Change Game"),
				onclick:		"newgame"
			},
			{
				caption:		$L("Restart current hand"),
				onclick:		"restart"
			},
			{
				caption:		$L("Deal new hand"),
				onclick:		"newdeal"
			}
		]
	},

	{
		name:					"ChooseGameToaster",
		kind:					"net.minego.toaster",
		onClose:				"backHandler",
		dismissWithClick:		false,

		components: [
			{	className:		"enyo-sliding-view-shadow" },
			{
				kind:			enyo.VFlexBox,
				flex:			1,
				height:			"100%",
				width:			"320px",

				components: [
					{
						content:		"New Game",
						kind:			"PageHeader",
						layoutKind:		"VFlexLayout",
						className:		"enyo-header-dark"
					},
					{
						name:			"ChooseGame",
						kind:			"ChooseGame",
						onSelected:		"selectGame",
						onFavsChanged:	"favsChanged",
						flex:			1
					},
					{
						kind:			"Toolbar",

						components: [
							{
								name:	"ChooseGameGrab",
								style:	"display: none;",
								kind:	"GrabButton",
								onclick:"backHandler"
							},

							{ kind:		"Spacer" },

							{
								kind:	"ListSelector",
								name:	"choosePlayerMenu",
								style:	"color: white",
								onChange:
										"choosePlayer"
							}
						]
					}
				]
			}
		]
	},

	{
		name:					"prefs",
		kind:					"Prefs",
		onChange:				"prefsChanged",
		onAction:				"prefsAction",
		onClose:				"backHandler"
	},

	{
		name:					"scores",
		kind:					"HighScores",
		onSelected:				"selectGame",
		onClose:				"backHandler"
	},

	{
		name:					"players",
		kind:					"ChoosePlayer",
		onSelected:				"choosePlayer",
		onClose:				"backHandler"
	},


	{
		name:					"howtoplay",
		kind:					"SolitaireHelp",
		onClose:				"backHandler"
	},

	{
		name:					"GameWonDialog",
		kind:					"ModalDialog",

		caption:				$L("You Won"),
		components: [
			/*
			{
				kind:			"Button",
				caption:		$L("Deal a new hand"),
				onclick:		"newdeal"
			},
			*/
			{
				kind:			"Button",
				name:			"DealNextHand",
				caption:		$L("Deal next hand"),
				onclick:		"nextdeal"
			},
			{
				kind:			"Button",
				caption:		$L("Play a different game"),
				onclick:		"newgame"
			},
			{
				kind:			"Button",
				caption:		$L("Brag about winning this hand"),
				onclick:		"bragGame",

				style:			"margin-top: 15px;"
			},
			{
				name:			"bragstreak",
				kind:			"Button",
				caption:		$L("Brag about my winning streak"),
				onclick:		"bragStreak"
			}
		]
	},

	{
		name:					"share",
		kind:					"Share"
	},

	{
		name:					"SureDialog",
		kind:					"ModalDialog",

		caption:				$L("A game is in progress.  Are you sure you want to start a new game?"),

		components: [
			{
				kind:			"Button",
				caption:		$L("Yes"),
				onclick:		"selectGame"
			},
			{
				kind:			"Button",
				caption:		$L("No"),
				onclick:		"backHandler"
			}
		]
	},

	{
		name:					"CantBeUnseen",
		kind:					"ModalDialog",

		caption:				$L("What has been seen can not be unseen.  Are you sure you want to undo this move?"),

		components: [
			{
				name:			"undo",
				kind:			"Button",
				caption:		$L("Yes, undo anyway"),
				onclick:		"gameAction"
			},
			{
				name:			"alwaysUndo",
				kind:			"Button",
				caption:		$L("Yes, and stop warning me"),
				onclick:		"gameAction"
			},
			{
				kind:			"Button",
				caption:		$L("No, that would be cheating"),
				onclick:		"backHandler"
			}
		]
	},

	{
		name:					"DebugDialog",
		kind:					"ModalDialog",

		caption:				$L("Loading..."),

		components: [
			{
				kind:			"Button",
				caption:		$L("Close"),
				onclick:		"backHandler"
			}
		]
	},

	{
		name:					"ChooseDeal",
		kind:					"ChooseDeal",

		onDeal:					"newdeal"
	},

	{
		name:					"spinner",
		kind:					"Scrim",
		layoutKind:				"VFlexLayout",

		align:					"center",
		pack:					"center",

		caption:				$L("Shuffling"),
		onclick:				"gameAction",

		components: [
			{
				kind:			"SpinnerLarge",
				showing:		true
			},
			{
				content:		$L("Shuffling")
			}
		]
	},

	{
		name:					"progress",
		kind:					"Scrim",
		layoutKind:				"VFlexLayout",

		align:					"center",
		pack:					"center",

		caption:				$L("Loading"),
		onclick:				"gameAction",

		components: [
			{
				name:			"ProgressBar",
				kind:			"ProgressBar",
				showing:		true,
				style:			"width: 400px;"
			},
			{
				content:		$L("Loading")
			}
		]
	},

	/*
		Create 2 toolbars.

		The main toolbar will be used for the action buttons, and for showing
		the current status.

		The second toolbar is normally hidden, but if the screen is not very
		wide then it is turned on and the status is put there instead.
	*/
	{
		name:					"Toolbar",
		kind:					"Toolbar",
		style:					"display: none; text-align: center;"
	},

	{
		kind:					enyo.Scroller,
		flex:					1,
		onScroll:				"scroll",
		horizontal:				false,
		autoHorizontal:			false,

		className:				"TableTopScroller",

		components: [{
			name:				"TableTop",
			className:			"TableTop"
		}]
	},

	{
		name:					"StatusToolbar",
		kind:					"Toolbar",
		style:					"display: none; text-align: center;"
	}
],

create: function()
{
	var state = null;

	this.inherited(arguments);

	enyo.keyboard.setResizesWindow(false);

	if (!window.PalmSystem) {
		/* Catch the phonegap pause and resume events */
		document.addEventListener("pause",	enyo.bind(this, this.deactivated),	false);
		document.addEventListener("resume",	enyo.bind(this, this.activated),	false);

		/* Catch the webworks events too */
		try {
			/* Show options on a swipe down */
			blackberry.app.event.onSwipeDown(enyo.bind(this, this.options));

			blackberry.app.event.onBackground(enyo.bind(this, this.deactivated));
			blackberry.app.event.onForeground(enyo.bind(this, this.activated));

			/*
				The background event only gets fired when another application
				goes fullscreen, so get the exit event as well for suspending
				the game.
			*/
			blackberry.app.event.onExit(enyo.bind(this, this.deactivated));
		} catch (e) {
			// console.log('Failed to register for the blackberry events');
		}

		/*
			Allow opening the app menu using the menu button for phonegap
			platforms that have a menu button such as android.

			It looks nicer showing the menu in the center of the screen on
			android than showing it in the corner.
		*/
		document.addEventListener("menubutton", enyo.bind(this, function() {
			if (!this.$.AppMenu.getShowing()) {
				this.$.AppMenu.open();
			} else {
				this.$.AppMenu.close();
			}
		}), false);

		document.addEventListener("searchbutton", enyo.bind(this, function() {
			if (!this.$.ChooseGameToaster.getShowing()) {
				this.$.ChooseGameToaster.open();

				enyo.nextTick(this, function() {
					this.$.ChooseGame.$.searchBox.focus();
				});
			} else {
				this.$.ChooseGameToaster.close();
			}
		}), false);
	}

	try {
		// alert(window.localStorage.getItem("inprogress"));
		state = enyo.json.parse(window.localStorage.getItem("inprogress"));
	} catch (e) {
		// console.log(e.message);
		state = null;
	}

	this.beforeMenu(this.$.Toolbar);
	this.beforeMenu(this.$.StatusToolbar);

	if (state) {
		/* Resume the previous game */
		this.startGame(null, state, state);
	} else {
		/* Start the demo game */
		this.giveup(true);
	}
},

/* App Menu */
backHandler: function(sender, e)
{
	var count = 0;
	var popups = [
		'prefs',
		'scores',
		'howtoplay',

		'GameWonDialog',
		'SureDialog',
		'CantBeUnseen',
		'ChooseDeal',
		'DebugDialog'
	];

	if (this.$.game) {
		popups.push('ChooseGameToaster');
	}

	this.beforeMenu(this.$.Toolbar);
	this.beforeMenu(this.$.StatusToolbar);

	for (var i = 0, p; p = this.$[popups[i]]; i++) {
		if (p.getShowing()) {
			p.close();
			count++;
		}
	}

	if (count > 0) {
		if (this.$.game && this.$.game.timer) {
			/* Some dialogs pause the timer */
			this.$.game.timer.start();
		}

		if (e && e.preventDefault) {
			/* Don't deactivate the app if a popup was closed */
			e.preventDefault();
		}
	}

	this.warnGame = null;
},

newdeal: function(sender, e)
{
	enyo.nextTick(this, function() {
		this.backHandler();
		this.startGame(this, {
			id:			this.selectedGame,
			gamenum:	e ? e.gamenum : NaN
		});
	});
},

nextdeal: function(sender, e)
{
	enyo.nextTick(this, function() {
		this.backHandler();

		this.startGame(this, {
			id:			this.selectedGame,
			type:		this.selectedType,
			gamenum:	this.gamenum + 1
		});
	});
},

restart: function()
{
	enyo.nextTick(this, function() {
		this.backHandler();

		if (this.$.game) {
			/*
				Prevent recording the history for this game because it is being
				restarted, so it shouldn't be counted as a loss (yet).

				Because 'restarted' is true below the new game will get recorded
				even if the player doesn't touch anything.
			*/
			this.$.game.history = null;
		}

		this.startGame(this, {
			id:			this.selectedGame,
			type:		this.selectedType,
			gamenum:	this.gamenum,

			restarted:	true
		});
	});
},

options: function()
{
	if (!this.upAndRunning) {
		return;
	}

	enyo.nextTick(this, function() {
		if (this.$.optionsButton.getDepressed()) {
			this.backHandler();
			return;
		}

		this.backHandler();

		if (this.$.game && this.$.game.timer) {
			this.$.game.timer.pause();
		}

		this.$.optionsButton.setDepressed(true);
		this.$.prefs.open();

		this.$.prefs.setGameName(this.selectedType);
	});
},

scores: function()
{
	enyo.nextTick(this, function() {
		if (this.$.scoresButton.getDepressed()) {
			this.backHandler();
			return;
		}

		this.backHandler();

		if (this.$.game && this.$.game.timer) {
			this.$.game.timer.pause();
		}

		this.$.scoresButton.setDepressed(true);
		this.$.scores.open(this.selectedGame, this.selectedName, this.$.game);
	});
},

players: function()
{
	enyo.nextTick(this, function() {
		this.backHandler();

		if (this.$.game && this.$.game.timer) {
			this.$.game.timer.pause();
		}

		this.$.players.open(this.selectedGame, this.selectedName, this.$.game);
	});
},

newgamemenu: function(sender, e)
{
	if (!net.minego.desktop && !net.minego.android) {
		this.$.newgamemenu.openAtEvent(e);
	} else {
		this.$.AppMenu.open();
	}
},

newgame: function()
{
	enyo.nextTick(this, function() {
		this.backHandler();
		this.$.ChooseGameToaster.open();
	});
},

giveup: function()
{
	this.upAndRunning = false;

	this.$.ChooseGameGrab.applyStyle("display", "none");
	this.$.Toolbar.applyStyle("display", "none");
	this.$.StatusToolbar.applyStyle("display", "none");

	if (window.localStorage) {
		window.localStorage.removeItem("inprogress");
	}

	enyo.nextTick(this, function() {
		var game = enyo.getCookie("selectedGame");
		var p;

		if (this.$.game) {
			this.$.game.destroy();
		}
		this.$.TableTop.destroyControls();


		try {
			/* Load the preferences from the most recent game played */
			p = this.$.prefs.load(game.replace(/:.*/, ""), true);
		} catch (e) {
			p = this.$.prefs.load("demo", true);
		}

		p.readonly		= true;
		p.animations	= 300;
		p.timer			= false;

		this.$.TableTop.createComponent({
			kind:			"DemoGame",
			prefs:			p
		}, { owner: this });

		this.render();
		this.newgame();

		this.prefsChanged(null, p);
	});
},

bragGame: function(sender, e)
{
	var msg = [];

	msg.push($L("I won"));
	msg.push(this.selectedName);
	msg.push($L("deal #") + this.gamenum);

	if (this.$.game.timer) {
		/* Get the time of the last move */
		msg.push($L("in"));
		msg.push(this.$.game.timer.getStr(true, true));

		this.$.game.timer.pause();
	}

	if (this.$.game && this.$.game.history) {
		msg.push($L("with"));
		msg.push(this.$.game.history.length);
		msg.push($L("moves"));
	}

	this.$.share.openMenu(e, msg.join(" ") + ". Can you do better?");
},

bragStreak: function(sender, e)
{
	var streak	= SolPlayers.getCookie(0, "streak") || {};
	var msg		= [];

	msg.push($L("I've won"));
	msg.push(streak[this.selectedGame]);
	msg.push($L("games of"));
	msg.push(this.selectedName);
	msg.push($L("in a row!"));

	msg.push($L("Can you do better?"));

	this.$.share.openMenu(e, msg.join(" "));
},

share: function(sender, e)
{
	this.$.share.setMsg('Try Solitaire Universe for the HP TouchPad! ' +
						'Over 50 types of solitaire to enjoy.');
	this.$.share[sender.value]();
},

choosedeal: function()
{
	enyo.nextTick(this, function() {
		this.backHandler();

		this.$.ChooseDeal.setNumber(this.gamenum);
		this.$.ChooseDeal.openAtCenter();
	});
},

howtoplay: function()
{
	enyo.nextTick(this, function() {
		this.backHandler();

		if (this.selectedGame && this.$.game) {
			this.$.howtoplay.open(this.$.game.getHelp(), this.selectedType);
		}
	});
},

openDebugDialog: function()
{
	enyo.nextTick(this, function() {
		this.backHandler();

		this.$.DebugDialog.open();
		this.$.DebugDialog.setCaption(
			"screen.width: " + screen.width + ",\n" +
			"screen.availWidth: " + screen.availWidth + ",\n" +
			"window.outerWidth: " + window.outerWidth + ",\n" +
			"window.innerWidth: " + window.innerWidth + ",\n" +
			"document.body.clientWidth: " + document.body.clientWidth + ",\n" +
			"document.body.offsetWidth: " + document.body.offsetWidth + ",\n" +
			"screen.height: " + screen.height + ",\n" +
			"screen.availHeight: " + screen.availHeight + ",\n" +
			"window.outerHeight: " + window.outerHeight + ",\n" +
			"window.innerHeight: " + window.innerHeight + ",\n" +
			"document.body.clientHeight: " + document.body.clientHeight + ",\n" +
			"document.body.offsetHeight: " + document.body.offsetHeight + ",\n" +
			"window.orientation: " + window.orientation + ",\n");
	});
},

openEmail: function(sender)
{
	try {
		blackberry.invoke.invoke(blackberry.invoke.APP_MESSAGES,
			new blackberry.invoke.MessageArguments(sender.to, sender.subject, sender.body));
	} catch (e) {
		var url		= 'mailto:';
		var args	= [];

		if (sender.to) {
			email += to;
		}

		if (sender.subject) {
			args.push('subject=' + encodeURIComponent(sender.subject));
		}
		if (sender.body) {
			args.push('body=' + encodeURIComponent(sender.body));
		}

		if (args.length > 0) {
			url += '?' + args.join('&');
		}

		sender.value = url;
		this.openURL(sender);
	}
},

openURL: function(sender)
{
	try {
		blackberry.invoke.invoke(blackberry.invoke.APP_BROWSER,
			new blackberry.invoke.BrowserArguments(sender.value));
	} catch (e) {
		window.open(sender.value, '_blank');
	}
},

beforeMenu: function(sender, e)
{
	var count = 0;

	sender.destroyControls();

	var beforeItem = enyo.bind(this, function(item)
	{
		if (item.showOn && -1 == enyo.indexOf(sender.name, item.showOn)) {
			return(false);
		}

		if (item.needs && this[item.needs]) {
			item.disabled = enyo.bind(this, this[item.needs])(item);
		}

		if (item.components) {
			for (var i = 0, c; c = item.components[i]; i++) {
				beforeItem(c);
			}
		} else if (!item.onclick) {
			item.disabled = true;
		}

		return(true);
	});

	var menu = enyo.cloneArray(this.menu);

	for (var i = 0, item; item = menu[i]; i++) {
		if (beforeItem(item)) {
			if (item.name && this.$[item.name]) {
				this.$[item.name].destroy();
			}

			sender.createComponent(item, { owner: this });
			count++;
		}
	}

	sender.render();

	if (count && this.upAndRunning) {
		sender.applyStyle("display", null);
	} else {
		sender.applyStyle("display", "none");
	}
},

needsGame: function(item)
{
	if (!this.selectedGame) {
		return(true);
	} else {
		return(false);
	}
},

needsWebOS: function(item)
{
	if (!window.PalmSystem) {
		return(true);
	} else {
		return(false);
	}
},

needsNotPlaybook: function(item)
{
	/* The playbook does not have an email client (yet) */
	if (net.minego.playbook) {
		return(true);
	} else {
		return(false);
	}
},

needsGameName: function(item)
{
	var i;

	if (-1 != (i = item.caption.indexOf(':'))) {
		item.caption = item.caption.slice(0, i);
		item.caption += ": " + this.selectedName;
	} else {
		if (!this.selectedGame) {
			item.caption = $L("Game");
		} else {
			item.caption = this.selectedName;
		}
	}

	if (!this.selectedGame) {
		return(true);
	} else {
		return(false);
	}
},

needsGameNum: function(item)
{
	if (!this.selectedGame) {
		return(true);
	} else {
		item.caption = item.caption.slice(0, item.caption.indexOf(':'));
		item.caption += ": #" + this.gamenum;

		return(false);
	}
},

needsVersion: function(item)
{
	var info;

	if ((info = enyo.fetchAppInfo())) {
		if (enyo.isString(info)) {
			info = JSON.parse(info);
		}
	}

	if (info) {
		item.caption = $L("Version") + " " + info.version;
		item.needs = null;
	}

	return(true);
},

needsActions: function(item)
{
	item.components = [];

	if (!this.actions) {
		/* The item is not disabled */
		return(false);
	}

	/*
		Add a menu item for each action the game provided.  When clicked
		a function in the game should be called.
	*/
	for (var c = 0, a; a = this.actions[c]; c++) {
		a.onclick	= "gameAction";
		a.className	= "enyo-radiobutton-dark enyo-grouped-toolbutton-dark";

		if (a.wide) {
			a.className += " wideButton";
		}

		item.components.push(a);
	}

	/* The item is not disabled */
	return(false);
},

needsShareItems: function(item)
{
	if (this.$.share) {
		if (net.minego.android) {
			item.onclick = "androidShare";
		} else {
			item.components = this.$.share.getMenuItems();
		}
	}
},

androidShare: function(sender, e)
{
	this.$.share.openMenu(e, "Try Solitaire Universe!");
},

openAppMenu: function(sender, e)
{
	this.$.AppMenu.open();
},

closeAppMenu: function()
{
	this.$.AppMenu.close();
},

keyPress: function(sender, e)
{
	// TODO	Get keyboard input working?

	// console.log(e.keyCode);

	switch (e.keyCode) {
		case 37: case 104:	/* left		*/
			if (!e.shiftKey) {
				console.log('stack left');
			} else {
				console.log('select top card');
			}
			break;

		case 38: case 107:	/* up		*/
			if (!e.shiftKey) {
				console.log('stack up');
			} else {
				console.log('select one more card');
			}
			break;

		case 39: case 108:	/* right	*/
			if (!e.shiftKey) {
				console.log('stack right');
			} else {
				console.log('select all cards');
			}
			break;

		case 40: case 106:	/* down		*/
			if (!e.shiftKey) {
				console.log('stack down');
			} else {
				console.log('select one fewer card');
			}
			break;


		case 13:			/* enter	*/
			console.log('tap the selected stack');
			break;

		case 32:			/* space	*/
			console.log('select or drop the selected stack');
			break;

	}
},

resizeHandler: function()
{
	this.inherited(arguments);

	var b = this.getBounds();

	if (b.width < b.height) {
		this.$.TableTop.addClass("vert");
		this.$.TableTop.removeClass("horiz");
	} else {
		this.$.TableTop.addClass("horiz");
		this.$.TableTop.removeClass("vert");
	}

	if (window.innerWidth < 550 || window.innerHeight < 550) {
		this.addClass("skinny");
	} else {
		this.addClass("remove");
	}

	var skinny = false;

	if (window.innerWidth < 550 && window.innerWidth < window.innerHeight) {
		skinny = true;
	}

	/*
		Move the status text to the right toolbar based on the screen width.

		There is also a "notstatus" field that is just a dummy to keep the
		alignment right in the toolbar when the status is not there.
	*/
	for (var i = 0, m; m = this.menu[i]; i++) {
		switch (m.name) {
			case "status":
				m.showOn = [ !skinny ? "Toolbar" : "StatusToolbar" ];
				break;

			case "notstatus":
				m.showOn = skinny ? [ "Toolbar" ] : [ ];
				break;
		}
	}

	/* And redraw the toolbars of course */
	this.beforeMenu(this.$.Toolbar);
	this.beforeMenu(this.$.StatusToolbar);
},

rendered: function()
{
	this.inherited(arguments);

	this.refreshPlayers();
	this.resizeHandler();
},

/* The user choose a game from the list */
selectGame: function(sender, e)
{
	enyo.nextTick(this, function() {
		this.startGame(sender, e);
	});
},

startGame: function(sender, e, state)
{
	this.$.ChooseGameToaster.setDismissWithClick(true);
	this.$.ChooseGameGrab.applyStyle("display", null);
	this.$.Toolbar.applyStyle("display", null);

	this.$.TableTop.container.setScrollTop(0);

	if (!state && !this.warnGame && this.$.game && this.$.game.isActive()) {
		/* Warn the user that they may be doing something dumb */
		this.warnGame = e;
		this.$.SureDialog.openAtCenter();

		return;
	}

	if (this.warnGame) {
		e = this.warnGame;
		this.warnGame = null;
	}

	this.upAndRunning = true;

	this.backHandler();
	this.$.ChooseGameToaster.close();

	this.$.spinner.show();

	this.actions		= null;
	this.selectedGame	= e.id		|| this.selectedGame;
	this.selectedType	= e.type	|| this.selectedType;
	this.selectedName	= e.caption || this.selectedName;

	this.log("Starting", this.selectedGame);
	enyo.setCookie("selectedGame", this.selectedGame);

	if (this.$.game) {
		this.$.game.destroy();
	} else {
		this.$.TableTop.destroyControls();
	}

	enyo.nextTick(this, function() {
		this.$.TableTop.createComponent({
			name:			"game",
			kind:			this.selectedGame,
			gamenum:		e.gamenum,
			restarted:		e.restarted,

			state:			state,

			prefs:			this.$.prefs.load(this.selectedGame.replace(/:.*/, "")),
			scores:			this.$.scores,

			onDealing:		"dealing",
			onShuffleDone:	"busyEnd",
			onDealt:		"dealDone",
			onUnsafeUndo:	"unsafeUndo",
			onCardsMoved:	"updateStatus",
			onDragStart:	"dragStart",
			onDragEnd:		"dragEnd",
			onGameDone:		"gameDone",

			onBusyStart:	"busyStart",
			onBusyEnd:		"busyEnd"
		}, { owner: this });

		this.$.TableTop.render();
		this.beforeMenu(this.$.Toolbar);
		this.beforeMenu(this.$.StatusToolbar);
	});
},

dealing: function(sender, e)
{
	this.gamenum = e.gamenum;
	this.log(sender, e);
},

busyStart: function(sender, e)
{
	if (e && e.progress) {
		this.$.spinner.hide();
		this.$.progress.show();
		this.$.ProgressBar.setPosition(e.progress * 100);
	} else {
		this.$.progress.hide();
		this.$.spinner.show();
	}
},

busyEnd: function(sender, e)
{
	this.$.progress.hide();
	this.$.spinner.hide();
},

dealDone: function()
{
},

activated: function()
{
	if (this.$.game && this.$.game.timer) {
		this.$.game.timer.start();
	}
},

deactivated: function()
{
	if (this.$.game && !this.$.game.recorded) {
		var stacks	= this.$.game.getStacks();
		var s		= [];

		for (var i = 0, stack; stack = stacks[i]; i++) {
			s.push({
				cards:			stack.cards,
				offsetIgnore:	stack.offsetIgnore
			});
		}

		if (this.$.game.timer) {
			this.$.game.timer.pause();
		}

		if (window.localStorage) {
			window.localStorage.setItem("inprogress", enyo.json.stringify({
				stacks:			s,
				history:		this.$.game.history,
				elapsed:		this.$.game.timer.getElapsed(),

				id:				this.selectedGame,
				type:			this.selectedType,
				caption:		this.selectedName,
				gamenum:		this.gamenum
			}));
		}
	} else {
		// TODO	Remove the inprogress item when a game is finished
		//		as well...
		if (window.localStorage) {
			window.localStorage.removeItem("inprogress");
		}
	}
},

updateStatus: function(sender, e)
{
	var status	= [];

	if (!this.interval) {
		this.interval = window.setInterval(enyo.bind(this, this.updateStatus), 1000);
	}

	/* Keep track of the score so we can update the timer */
	if (e) {
		this.lastStatus = e;

		this.actions = e.actions;
		this.beforeMenu(this.$.Toolbar);
		this.beforeMenu(this.$.StatusToolbar);
	} else {
		e = this.lastStatus;
	}
	if (!e) {
		return;
	}

	if (this.$.game && this.$.game.timer && this.$.game.prefs &&
		this.$.game.prefs.showTimer && this.$.game.timer.getElapsed()
	) {
		status.push(this.$.game.timer.getStr(false));
	}

	if (this.$.game) {
		status.push(this.$.game.scoreStr(e));
	}

	this.$.status.setContent(status.join(", "));

	if (e.inplay == 0) {
		if (this.interval) {
			/* The game is over, no need to update the timer again */
			window.clearInterval(this.interval);
		}

		if (!this.$.game || this.$.game.getMoving() || this.$.game.dealing()) {
			/* Wait until the animation has finished */
			return;
		}

		var msg = [];

		msg.push($L('You finished game #'));
		msg.push(this.gamenum);

		if (this.$.game.timer) {
			/* Get the time of the last move */
			msg.push($L('in'));
			msg.push(this.$.game.timer.getStr(true, true));

			this.$.game.timer.pause();
		}

		if (this.$.game && this.$.game.history) {
			msg.push($L('with'));
			msg.push(this.$.game.history.length);
			msg.push($L('moves'));
		}

		msg = msg.join(' ') + '. ';


		var streak = SolPlayers.getCookie(0, "streak") || {};
		if (streak[this.selectedGame] > 0) {
			msg += 'You have won ' + (streak[this.selectedGame] + 1) + ' games in a row!';
		}

		this.$.GameWonDialog.openAtCenter();
		this.$.GameWonDialog.setCaption(msg);
		this.$.DealNextHand.setCaption($L("Deal next hand") +
			" (#" + (this.gamenum + 1) + ")");


		if (streak[this.selectedGame] > 0) {
			this.$.bragstreak.setDisabled(false);
		} else {
			this.$.bragstreak.setDisabled(true);
		}

		/* Add an entry to the history for statistics */
		this.$.game.record();
	}
},

prefsChanged: function(sender, e)
{
	if (this.$.game) {
		this.$.game.setPrefs(e);
	}

	var colors = [
		'green', 'blue', 'black', 'orange', 'red', 'yellow', 'brightyellow',
		'brown', 'coral', 'aquamarine', 'olive', 'purple', 'pink', 'navy'
	];

	if (!e.bgColor) {
		e.bgColor = 'green';
	}

	for (var i = 0, color; color = colors[i]; i++) {
		if (e.bgColor != color) {
			this.$.TableTop.container.removeClass(color);
		}
	}

	this.$.TableTop.container.addClass(e.bgColor);

	this.$.TableTop.container.removeClass("small");
	this.$.TableTop.container.removeClass("large");
	switch (e.layout) {
		case "auto":
			// TODO	Auto detect the layout to use...
			this.$.TableTop.container.addClass("large");
			break;

		case "small":
			this.$.TableTop.container.addClass("small");
			break;

		case "large":
			this.$.TableTop.container.addClass("large");
			break;
	}

	if ('image' == e.bgType) {
		this.$.TableTop.container.applyStyle("background-image", "url(file://" + e.bgSrc + ")");
	} else {
		this.$.TableTop.container.applyStyle("background-image", null);
	}

	if ('felt' == e.bgType) {
		this.$.TableTop.container.addClass('felt');
	} else {
		this.$.TableTop.container.removeClass('felt');
	}
},

prefsAction: function(sender, e)
{
	if (this[e]) {
		this[e]();
	}
},

gameAction: function(sender, e)
{
	enyo.nextTick(this, function() {
		this.backHandler();

		if (sender && this.$.game) {
			if (sender.name && this.$.game[sender.name]) {
				this.$.game[sender.name]();
			}
		}
	});
},

unsafeUndo: function(sender, e)
{
	enyo.nextTick(this, function() {
		this.$.CantBeUnseen.openAtCenter();
	});
},

scroll: function(sender, e)
{
	if (this.$.game) {
		this.$.game.setScrollOffset([ sender.getScrollLeft(), sender.getScrollTop() ]);
	}
},

dragStart: function(sender, e)
{
	this.$.TableTop.container.setHorizontal(false);
	this.$.TableTop.container.setAutoHorizontal(false);
	this.$.TableTop.container.setVertical(false);
	this.$.TableTop.container.setAutoVertical(false);
},

dragEnd: function(sender, e)
{
	/* Never allow horizontal scrolling */
	this.$.TableTop.container.setHorizontal(false);
	this.$.TableTop.container.setAutoHorizontal(false);
	this.$.TableTop.container.setAutoVertical(false);

	/* Do allow vertical in case a game needs it */
	this.$.TableTop.container.setVertical(true);
},

gameDone: function(sender, e)
{
	if (this[e]) {
		this[e]();
	}
},

refreshPlayers: function(menu)
{
	var choose = SolPlayers.getComponents({ onclick: "choosePlayer" });

	choose.unshift({
		caption:		$L("Manage Players"),
		onclick:		"players",
		value:			"manage"
	});

	choose.push({
		caption:		$L("Guest"),
		value:			-1,
		onclick:		"choosePlayer"
	});

	this.$.choosePlayerMenu.setItems(choose);
	this.$.choosePlayerMenu.setValue(SolPlayers.getPlayer());

	if (menu) {
		menu.destroyControls();
		menu.createComponents([
			{
				caption:		$L("Play As"),
				components:		choose
			},

			{
				caption:		$L("Delete Player"),
				components:		SolPlayers.getComponents({ onclick: "delPlayer" })
			},

			{
				caption:		$L("Rename Player"),
				components:		SolPlayers.getComponents({ onclick: "renamePlayer" })
			}
		], { owner: this });
	}
},

choosePlayer: function(sender)
{
	if (sender.getValue() == "manage") {
		this.players();
		return;
	}

	SolPlayers.setPlayer(sender.getValue());

	this.$.ChooseGame.refreshFavs();

	if (this.$.game) {
		this.$.game.setPrefs(this.$.prefs.load());
	}

	this.refreshPlayers();
}

});

