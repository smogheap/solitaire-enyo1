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

name:								"ChooseGame",
kind:								enyo.VFlexBox,
className:							"ChooseGame",

events: {
	onSelected:						""
},

favorites:							[ ],

data: [
	{
		caption: "FreeCell",
		id: "freecell",
		items: [
			[  "FreeCell",					'freecell'				],
			[  "Relaxed FreeCell",			'freecell:relaxed'		],
			[  "Baker's Game",				'freecell:bakers'		],
			[  "Kings Only Baker's Game",	'freecell:kings bakers'	],
			[  "Seahaven Towers",			'freecell:seahaven'		],
			[  "ForeCell",					'freecell:forecell'		],
			[  "Challenge FreeCell",		'freecell:challenge'	],
			[  "Super Challenge FreeCell",	'freecell:super'		]

//			[  "Kings",						'freecell:kings'		]
		]
	},

	{
		caption: "Klondike",
		id: "klondike",
		items: [
			[  "Klondike (Draw 1)",			'klondike:draw 1'		],
			[  "Klondike (Draw 3)",			'klondike:draw 3'		],
			[  "Vegas Klondike (Draw 1)",	'klondike:vegas draw 1'	],
			[  "Vegas Klondike (Draw 3)",	'klondike:vegas draw 3'	],
			[  "Thoughtful Klondike",		'klondike:thoughtful'	],
			[  "Westcliff (Draw 1)",		'klondike:wc draw 1'	],
			[  "Westcliff (Draw 3)",		'klondike:wc draw 3'	],
			[  "Thoughtful Westcliff",		'klondike:thoughtful wc'],
			[  "Gypsy",						'klondike:gypsy'		],
			[  "Agnes Sorel",				'klondike:agnes sorel'	]
		]
	},

	{
		caption: "Canfield",
		id: "canfield",
		items: [
			[  "Canfield",					'canfield'				],
			[  "Superior Canfield",			'canfield:superior'		],
			[  "Canfield (Draw 1)",			'canfield:draw 1'		],
			[  "Rainfall",					'canfield:rainfall'		],
			[  "Storehouse",				'canfield:storehouse'	],
			[  "Rainbow",					'canfield:rainbow'		]
		]
	},

	{
		caption: "Spider",
		id: "spider",
		items: [
			[  "Spider",					'spider:4 suits'		],
			[  "Spider (2 suits)",			'spider:2 suits'		],
			[  "Spider (1 suits)",			'spider:1 suit'			],

			[  "Relaxed Spider",			'spider:relaxed'		],
			[  "Easy Spider",				'spider:easy'			],

			[  "Grounds for a divorce",		'spider:divorce 4 suits'],
			[  "Grounds for a divorce (2 suits)",
											'spider:divorce 2 suits'],
			[  "Grounds for a divorce (1 suits)",
											'spider:divorce 1 suit'	],


			[  "Spiderette",				'spiderette:4 suits'	],
			[  "Spiderette (2 suits)",		'spiderette:2 suits'	],
			[  "Spiderette (1 suits)",		'spiderette:1 suit'		],
			[  "Relaxed Spiderette",		'spiderette:relaxed'	],
			[  "Easy Spiderette",			'spiderette:easy'		]
		]
	},

	{
		caption: "Golf",
		id: "golf",
		items: [
			[  "Golf",						'golf'					],
			[  "Relaxed Golf",				'golf:relaxed'			],
			[  "Dead King Golf",			'golf:dead king'		],
			[  "Tri Peaks",					'golf:tripeaks'			]
			// [  "Black Hole",				'golf:blackhole'		]
		]
	},

	{
		caption: "Pyramid",
		id: "pyramid",
		items: [
			[  "Pyramid",					'pyramid'				],
			[  "Relaxed Pyramid",			'pyramid:relaxed'		],
			[  "Double Pyramid",			'pyramid:double'		],
			[  "Relaxed Double Pyramid",	'pyramid:relaxed double']
		]
	},

	{
		caption: "Gaps",
		id: "gaps",
		items: [
			[  "Gaps (Montana)",			'gaps'					],
			[  "Relaxed Gaps",				'gaps:relaxed'			],
			[  "Spaces",					'gaps:spaces'			],
			[  "Relaxed Spaces",			'gaps:relaxed spaces'	],
			[  "Addiction",					'gaps:addiction'		]
		]
	},

	{
		caption: "Aces Up",
		id: "acesup",
		items: [
			[  "Aces Up",					'aces up'				],
			[  "Aces Up (2 suits)",			'aces up:2 suits'		],
			[  "Aces Up 5",					'aces up:5'				],
			[  "Aces Up 5 (2 suits)",		'aces up:5 - 2 suits'	],
			[  "Aces Up 6",					'aces up:6'				],
			[  "Aces Up 6 (2 suits)",		'aces up:6 - 2 suits'	]
		]
	},

/*
	{
		caption: "Video Poker",
		id: "videopoker",
		items: [
			[  "Jacks or Better",			'videopoker'			]
		]
	},
*/

	{
		caption: "Yukon",
		id: "yukon",
		items: [
			[  "Yukon",						'yukon'					],
			[  "Relaxed Yukon",				'yukon:relaxed'			],
			[  "Russian Solitaire",			'yukon:russian'			],
			[  "Alaska",					'yukon:alaska'			],
			[  "Moosehide",					'yukon:moosehide'		]
		]
	}
],

components: [
	{
		name:								"searchBox",
		className:							"enyo-box-input",
		kind:								enyo.SearchInput,
		hint:								$L("Search"),

		onchange:							"doSearch",
		onCancel:							"doSearch",
		changeOnInput:						true
	},

	{
		kind:								enyo.FadeScroller,
		horizontal:							false,
		name:								"scroll",
		flex:								1

	}
],

getItemComponents: function(items, prefix)
{
	var c = [];

	for (var i = 0; i < items.length; i++) {
		/* Is it a favorite? */
		if (this.favorites) {
			items[i][2] = (-1 != enyo.indexOf(items[i][1], this.favorites));
		}

		c[c.length] = {
			kind:					"enyo.Item",
			onclick:				"selectGame",
			name:					prefix + ":" + items[i][1],
			caption:				items[i][0],
			value:					items[i][1],

			components: [
				{
					content:		$L(items[i][0])
				},
				{
					className:		"StarIcon",
					kind:			enyo.CustomButton,
					onclick:		"toggleFavorite"
				}
			]
		};

		var classNames = [];

		if (items[i][2]) {
			classNames.push("Favorite");
		}

		if (classNames.length) {
			c[c.length - 1].className = classNames.join(" ");
		}
	}

	return(c);
},

toggleDrawer: function(sender, e)
{
	/*
		Save the open state since the user toggled the drawer.  The search will
		open drawers, but it should close them again if the user didn't open it.
	*/
	if (!this.filter) {
		this.$["group:" + sender.getCaption()].userOpened = sender.getOpen();
	}
},

toggleFavorite: function(sender, e)
{
	var game = sender.container;

	if (game.hasClass("Favorite")) {
		this.delFav(game.value);
	} else {
		this.addFav(game.value);
	}

	this.log(this.favorites);
	enyo.stopEvent(e);
},

selectGame: function(sender, e)
{
	try {
		sender.container.setOpen(true);
	} catch(ex) {};

	var type = '';

	for (var i = 0, group; !item && (group = this.data[i]); i++) {
		for (var c = 0, item; item = group.items[c]; c++) {
			if (item[1] == sender.value) {
				type = group.caption;
				break;
			}
		}
	}

	this.doSelected({
		id:			sender.value,
		caption:	sender.caption,
		type:		type
	});
},

create: function()
{
	this.inherited(arguments);

	var info;

	/* Create the items for all the games based on this.data */
	this.$.scroll.createComponent({
		kind:		enyo.DividerDrawer,
		caption:	$L("FAVORITES"),
		name:		"favorites",

		components:	[{
			name:	"favs"
		}]
	}, { owner: this });

	for (var i = 0; i < this.data.length; i++) {
		this.$.scroll.createComponent({
			kind:			"enyo.DividerDrawer",
			name:			"group:" + $L(this.data[i].caption),
			caption:		$L(this.data[i].caption),
			open:			false,
			onOpenChanged:	"toggleDrawer",
			components:		this.getItemComponents(this.data[i].items, "game")
		}, { owner: this });
	}

	/* Update the list of favorites */
	this.refreshFavs();
},

select: function(selected)
{
	selected = selected || this.favorites[0] || "freecell";

	this.selectGame(this.$["fav:" + selected] || this.$["game:" + selected]);
},

addFav: function(id, quiet)
{
	var item;

	if (!(this.$["game:" + id])) {
		return;
	}

	if (-1 == enyo.indexOf(id, this.favorites)) {
		this.favorites[this.favorites.length] = id;
	}

	if ((!this.$["fav:" + id]) && (item = this.$["game:" + id])) {
		this.$.favs.createComponents(this.getItemComponents([[
			item.caption, item.value, true
		]], "fav"), { owner: this });
	}

	this.$.favs.render();
	this.$["game:" + id].addClass("Favorite");

	if (!quiet) {
		this.saveFavs();
	}
},

delFav: function(id, quiet)
{
	var item;

	enyo.remove(id, this.favorites);

	if ((item = this.$["fav:" + id])) {
		item.destroy();
	}

	this.$["game:" + id].removeClass("Favorite");

	if (!quiet) {
		this.saveFavs();
	}
},

updateFavs: function()
{
	this.$.favs.destroyControls();

	for (var i = 0; i < this.favorites.length; i++) {
		this.addFav(this.favorites[i], true);
	}
},

refreshFavs: function()
{
	var favs;

	if ((favs = SolPlayers.getCookie(NaN, "favorites:2")) &&
		enyo.isArray(favs)
	) {
		this.favorites = favs;
	} else {
		/* default favorites */
		this.favorites = [
			'klondike:draw 3',
			'klondike:vegas draw 3',
			'freecell',
			'golf:tripeaks'
		];

		if (net.minego.desktop) {
			this.favorites.shift();
			this.favorites.unshift('klondike:vegas draw 1');
			this.favorites.push('spider:4 suits');
		}
	}

	// this.log(this.favorites);

	this.updateFavs();
},

setFavs: function(favorites)
{
	for (var i = 0, v; v = this.favorites[i]; i++) {
		this.delFav(v, true);
	}

	for (var i = 0, v; v = favorites[i]; i++) {
		this.addFav(v, true);
	}
},

saveFavs: function()
{
	SolPlayers.setCookie(NaN, "favorites:2", this.favorites);
},


/*
	The favorites list just contains the IDs of the favorite games.  This
	function gets the other data needed to show the list of favorites.
*/
doSearch: function(sender, e)
{
	if ((this.filter = this.$.searchBox.getValue())) {
		this.filter = this.filter.toLowerCase();
	}

	if (this.filter) {
		this.$.favorites.hide();
	} else {
		this.$.favorites.show();
	}

	enyo.forEach(this.data, enyo.bind(this, function(group)
	{
		var match = false;

		this.$["group:" + group.caption].hide();

		enyo.forEach(group.items, enyo.bind(this, function(game)
		{
			if (!this.filter || -1 != game[0].toLowerCase().indexOf(this.filter)) {
				this.$["game:" + game[1]].show();
				match = true;
			} else {
				this.$["game:" + game[1]].hide();
			}
		}));

		if (match) {
			this.$["group:" + group.caption].show();

			/*
				If there is a filter string then any matching group should
				be open.  If not then it should only be open if the user had
				actually tapped on that group.
			*/
			if (this.filter) {
				this.$["group:" + group.caption].setOpen(true);
			} else {
				this.$["group:" + group.caption].setOpen(
					this.$["group:" + group.caption].userOpened || false);
			}
		}
	}));
}

});


