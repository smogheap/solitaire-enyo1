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

name:								"HighScores",

kind:								"net.minego.toaster",

events: {
	onSelected:						""
},

components: [
	{	className:					"enyo-sliding-view-shadow" },
	{
		kind:						enyo.VFlexBox,
		flex:						1,
		height:						"100%",
		width:						"320px",

		components: [
			{
				name:				"title",
				content:			$L("Scores"),
				kind:				"PageHeader",
				layoutKind:			"VFlexLayout",
				className:			"enyo-header-dark"
			},
			{
				name:				"list",
				kind:				"VirtualList",
				flex:				1,
				style:				"background-color: #f1f1f1;",

				onSetupRow:			"setupRow",
				components: [{
					kind:			"SwipeableItem",
					layoutKind:		"VFlexLayout",

					onConfirm:		"deleteItem",
					onclick:		"playGame",

					components: [
						{ name:		"player"	},
						{ name:		"when"		},

						{ name:		"score"		},
						{ name:		"duration"	},

						{ name:		"moves"		},
						{ name:		"gamenum"	}
					]
				}]
			},
			{
				kind:				enyo.Control,
				name:				"total",
				className:			"totalScore"
			},
			{
				kind:				"Toolbar",
				components: [
					{
						kind:		"GrabButton",
						onclick:	"close"
					},
					{
						kind:		"Spacer"
					},

					{
						name:		"players",
						kind:		"ListSelector",
						style:		"color: white",
						onChange:	"filter",

						items: [
							{ caption: $L("All Players"),	value: -1	}
						]
					},

					{
						kind:		"Spacer"
					},

					{
						name:		"sort",
						kind:		"ListSelector",
						style:		"color: white",
						onChange:	"sort",

						items: [
							{ caption: $L("High Score"),	value: "highscore"	},
							{ caption: $L("Low Score"),		value: "lowscore"	},
							{ caption: $L("Date"),			value: "recent"		},
							{ caption: $L("Fastest Game"),	value: "fastest"	},
							{ caption: $L("Slowest Game"),	value: "slowest"	},
							{ caption: $L("Fewest Moves"),	value: "fewest"		},
							{ caption: $L("Most Moves"),	value: "most"		},
							{ caption: $L("Game Number"),	value: "numeric"	}
						]
					}
				]
			}
		]
	}
],

create: function()
{
	this.inherited(arguments);

	try {
		this.dateFmt		= new enyo.g11n.DateFmt({ time: "short", date: "short" });
		this.durationFmt	= new enyo.g11n.DurationFmt({ style: "short" });
	} catch (e) {
		this.dateFmt		= {
			format:		enyo.bind(this, function(date) {
				return(date.toString());
			})
		};

		this.durationFmt	= {
			format:		enyo.bind(this, function(e) {
				var r = [];

				if (e.hours > 0) {
					r.push(e.hours);

					if (e.minutes >= 10) {
						r.push(e.minutes);
					} else {
						r.push("0" + e.minutes);
					}
				} else {
					r.push(e.minutes);
				}

				if (e.seconds >= 10) {
					r.push(e.seconds);
				} else {
					r.push("0" + e.seconds);
				}

				return(r.join(':'));
			})
		};

	}
},

upgrade: function()
{
	var stats	= SolPlayers.getCookie(0, "stats:" + this.kind);

	/*
		Statistics used to be stored in a cookie, which caused issues when the
		JSON exceeded the size limit. If the user still has any stats that are
		stored in the cookie then upgrade them to the DB.
	*/
	if (stats) {
		SolPlayers.getDB().transaction(enyo.bind(this, function(tx) {
			if (stats && stats.length > 0) {
				for (var i = 0, s; s = stats[i]; i++) {
					tx.executeSql("INSERT INTO stats (player, timestamp, type, gamenum, duration, score, moves) VALUES (?, ?, ?, ?, ?, ?, ?)", [
						SolPlayers.getPlayer(),			/* Player		*/
						s.when,							/* Timestamp	*/

						this.kind,						/* Game Type	*/
						s.gamenum,						/* Deal Number	*/
						s.duration,						/* Elapsed Time	*/
						enyo.json.stringify(s.score),	/* Score		*/
						s.moves							/* Moves		*/
					], function(tx, result) {}, function(tx, e) {
						console.log('Error: ' + e.message);
					});
				}
			}
		}));

		/* Remove the old style records */
		SolPlayers.setCookie(0, "stats:" + this.kind, null);
	}
},

loadStats: function(type, game, donecb)
{
	var total		= null;
	var player		= this.$.players.getValue();
	var query		= 'SELECT * FROM stats';
	var where		= [];
	var ans			= [];
	var data		= [];

	this.game		= game || this.game;
	this.type		= type || this.type;

	this.players	= this.players || [];

	this.upgrade();

	if (this.type) {
		where.push('type=?');
		ans.push(this.type);

		if (player >= 0) {
			where.push('player=?');
			ans.push(player);
		}

		if (where.length > 0) {
			query += ' WHERE ' + where.join(' AND ');
		}

		SolPlayers.getDB().transaction(enyo.bind(this, function(tx) {
			tx.executeSql(query, ans, enyo.bind(this, function(tx, result) {
				for (var i = 0; i < result.rows.length; i++) {
					var row = result.rows.item(i);

					// console.log('Got record: ' + enyo.json.stringify(row));

					row.s = enyo.json.parse(row.score);

					if (this.game.scoreAdd) {
						total = this.game.scoreAdd(total, row.s);
					}

					data.push(row);

					if (-1 == this.players.indexOf(row.player)) {
						this.players.push(row.player);
					}
				}

				this.data = data;

				if (donecb) {
					donecb(total);
				}
			}), function(tx, e) {
				console.log('Error: ' + e.message);
			});
		}));
	}
},

open: function(type, name, game)
{
	this.inherited(arguments);
	if (name) {
		this.$.title.setContent(name + " " + $L("Scores"));
	}

	this.loadStats(type, game, enyo.bind(this, function(total)
	{
		if (total) {
			this.$.total.show();
			this.$.total.setContent(this.game.scoreStr(total, true));
		} else {
			this.$.total.hide();
			this.$.total.setContent('');
		}


		/* Build a list of players for filtering */
		var playername;
		var items = [{
			caption:	$L("All Players"),
			value:		-1
		}];

		for (var i = 0, id; !isNaN(id = this.players[i]); i++) {
			if (!(playername = SolPlayers.getName(id))) {
				continue;
			}

			items.push({
				caption:	playername,
				value:		id
			});
		}

		this.$.players.setItems(items);

		/* Actually render the records */
		this.sort();
	}));
},

setupRow: function(sender, index)
{
	var row;

	if (!this.data || !(row = this.data[index])) {
		return(false);
	}

	this.$.player.setContent(SolPlayers.getName(row.player));

	this.$.when.setContent(this.dateFmt.format(new Date(row.timestamp)));

	if (row.duration && this.durationFmt) {
		this.$.duration.setContent(this.durationFmt.format({ seconds: row.duration }));
	} else {
		this.$.duration.setContent('');
	}

	this.$.score.setContent(enyo.bind(this.game, this.game.scoreStr)(row.s));

	if (!this.game.scoreWin) {
		this.$.score.setClassName('unknown');
	} else if (this.game.scoreWin(row.s)) {
		this.$.score.setClassName('win');
	} else {
		this.$.score.setClassName('lose');
	}

	this.$.moves.setContent(row.moves + " moves");
	this.$.gamenum.setContent(row.gamenum);

	return(true);
},

deleteItem: function(sender, index)
{
	var query	= 'DELETE FROM stats WHERE timestamp=?';

	SolPlayers.getDB().transaction(enyo.bind(this, function(tx) {
		tx.executeSql(query, [ this.data[index].timestamp ],
			enyo.bind(this, function(tx, result) {
				this.data.splice(index, 1);
				this.$.list.refresh();
			}),

			function(tx, e) {
				console.log('Error: ' + e.message);
			}
		);
	}));
},

playGame: function(sender, e, index)
{
	this.log(index, this.data, this.data[index]);

	this.doSelected({
		gamenum:	this.data[index].gamenum
	});
},


sort: function()
{
	this.sortfunc = this.$.sort.getValue();

	this.data.sort(enyo.bind(this, this[this.sortfunc]));
	this.$.list.refresh();
},

filter: function()
{
	this.open();
},

/* Sort functions */
highscore: function(a, b)
{
	var r;

	if ((r = this.game.scoreCmp(a.score, b.score))) {
		return(r);
	} else {
		return(a.when - b.when);
	}
},

lowscore: function(a, b)
{
	var r;

	if ((r = this.game.scoreCmp(b.score, a.score))) {
		return(r);
	} else {
		return(a.when - b.when);
	}
},

recent: function(a, b)
{
	var r;

	if ((r = (a.when - b.when))) {
		return(r);
	} else {
		return(this.highscore(a, b));
	}
},

fastest: function(a, b)
{
	var r;

	if ((r = (a.duration - b.duration))) {
		return(r);
	} else {
		return(this.highscore(a, b));
	}
},

slowest: function(a, b)
{
	var r;

	if ((r = (b.duration - a.duration))) {
		return(r);
	} else {
		return(this.highscore(a, b));
	}
},

fewest: function(a, b)
{
	var r;

	if ((r = (a.moves - b.moves))) {
		return(r);
	} else {
		return(this.highscore(a, b));
	}
},

most: function(a, b)
{
	var r;

	if ((r = (b.moves - a.moves))) {
		return(r);
	} else {
		return(this.highscore(a, b));
	}
},

numeric: function(a, b)
{
	var r;

	if ((r = (a.gamenum - b.gamenum))) {
		return(r);
	} else {
		return(this.highscore(a, b));
	}
}

});


