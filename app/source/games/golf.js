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

// TODO	Show the score in the "game over" dialog

enyo.kind(
{

name:						"golf_common",
className:					"golf",
kind:						"Solitaire",

cardWidth:					12,

components: [
	{
		kind:				enyo.Control,
		nodeTag:			"div",

		components: [
			{
				name:		"deck",
				offset:		[ 0, 0 ],
				kind:		"CardStack",
				bgsrc:		"base.png",
				deck:		true,
				count:		true
			},
			{
				name:		"foundation",
				offset:		[ 10, 0 ],
				kind:		"CardStack",
				bgsrc:		"base.png",
				count:		true
			}
		]
	},

	{
		className:			"tableau",
		name:				"tableau",
		kind:				enyo.Control,

		components: [
			{ kind:			"CardStack", name: "tableau1", bgsrc: "base.png", inplay: true },
			{ kind:			"CardStack", name: "tableau2", bgsrc: "base.png", inplay: true },
			{ kind:			"CardStack", name: "tableau3", bgsrc: "base.png", inplay: true },
			{ kind:			"CardStack", name: "tableau4", bgsrc: "base.png", inplay: true },
			{ kind:			"CardStack", name: "tableau5", bgsrc: "base.png", inplay: true },
			{ kind:			"CardStack", name: "tableau6", bgsrc: "base.png", inplay: true },
			{ kind:			"CardStack", name: "tableau7", bgsrc: "base.png", inplay: true }
		]
	}

],

getHelp: function()
{
	return([
		{
			caption:				"Goal",
			content:				"Move all cards to the waste"
		},

		{
			caption:				"Rules",
			content: [
				"The game is started by dealing 35 cards to 7 tableaux, all",
				"face up.  The deck is placed in the top left corner, and one",
				"card is flipped to the waste.\n",

				"The top card of any tableau may be played on the waste if",
				"it's rank is one above or below the rank of the top card in",
				"the waste.\n",

				"Tapping on the deck will flip one card and play it on the",
				"waste.  This may be done repeatedly until the waste is empty"
			].join(" ")
		},

		{
			caption:				"Scoring",
			content: [
				"1 point is given for every card still in the tableaux.  If",
				"all cards are moved from the tableaux to the waste then a",
				"negative point is given for each card left in the deck.\n",

				"A low score is good.  A score of 5 or under is considered a",
				"win."
			].join(" ")
		},

		{
			caption:				"Variants",
			content: [
				"Relaxed Golf allows cards to wrap, meaing that an ace may be",
				"played on a king, and a king may be played on an ace.\n",

				"Dead King Golf does not allow any card to be played on a",
				"king.\n",

				"Tri Peaks and Black Hole behave just like relaxed golf, but",
				"deal the cards in different layout.  In both of these",
				"variants a card can not be played when it is being partially",
				"covered by another card."
			].join(" ")
		}
	]);
},

allowAddingCards: function(stack, cards)
{
	this.inherited(arguments);

	/* In Golf cards can only be added to the foundation */
	if (stack.name == "foundation") {
		var last;

		if (!cards || 1 != cards.length) {
			return([]);
		}

		if (stack.cards && stack.cards.length) {
			last = stack.cards[stack.cards.length - 1];
		} else {
			/* Umm... wtf?  This shouldn't happen */
			return(cards);
		}

		if (this.deadKing && last[1] == 13) {
			/* In dead king golf nothing can be played on a king */
			return([]);
		}

		if (cards[0][1] + 1 == last[1] ||
			cards[0][1] - 1 == last[1]
		) {
			return(cards);
		}

		if (this.relaxed) {
			if ((cards[0][1] == 13 && last[1] == 1) ||
				(cards[0][1] ==  1 && last[1] == 13)
			) {
				return(cards);
			}
		}
	}

	return([]);
},

allowTakingCards: function(stack)
{
	this.inherited(arguments);

	/* In Golf cards can only be dragged from the tableaux. */
	switch (stack.name) {
		case "foundation":
		case "deck":
			break;

		default:
			var card;

			/*
				Always allow a single card to be moved (unless it is facedown,
				which happens in some variants like tri-peaks).
			*/
			if ((card = stack.cards.slice(-1)[0]) && !card[2]) {
				return([ card ]);
			}
			break;
	}

	return([]);
},

tapOnCards: function(stack)
{
	var card;

	this.inherited(arguments);

	switch (stack.name) {
		case "deck":
		case "foundation":
			this.draw();
			break;

		default:
			/* If the top card of this stack can be moved to the foundation then do so */
			if ((card = stack.cards[stack.cards.length - 1]) && !card[2]) {
				var cards = this.allowAddingCards(this.$.foundation, [ card ]);

				for (var i = 0, card; card = cards[i]; i++) {
					this.moveCard(card, this.$.foundation);
				}
			}
			break;
	}
},

draw: function()
{
	var stack = this.$.deck;

	/* Flip one card from the deck to the foundation */
	if ((card = stack.cards[stack.cards.length - 1])) {
		this.moveCard(card, this.$.foundation, false, false);
	}
},

findPlayableCards: function()
{
	var cards	= [];
	var last	= this.$.foundation.cards.slice(-1)[0];
	var card;

	if (last) {
		for (var i = 0; i < this.suits.length; i++) {
			if ((card = this.findCard(i, last[1] + 1, undefined, false, true))) {
				cards.push(card);
			}

			if ((card = this.findCard(i, last[1] - 1, undefined, false, true))) {
				cards.push(card);
			}
		}
	}

	return(cards);
},

highlightCards: function(show)
{
	var cards, add, c;
	var count = 0;

	if (this.dealing()) {
		return;
	}

	for ((cards = this.findPlayableCards()); cards.length; cards.shift()) {
		if (!cards[0].stack) {
			continue;
		}

		if (show) {
			add = this.allowAddingCards(this.$.foundation, [ cards[0] ]);

			if (!add || !add.length) {
				continue;
			}

			if (cards[0].stack.name == "foundation") {
				/* Don't highlight cards in the foundation */
				continue;
			}

			if (!(c = this.allowTakingCards(cards[0].stack)) ||
				-1 == enyo.indexOf(cards[0], c)
			) {
				/* Only highlight cards that are playable */
				continue;
			}

			if (this.prefs.highlight) {
				cards[0].highlight = 'images/shadow.png';
				this.placeCard(cards[0]);
			}

			count++;
		} else if (cards[0].highlight) {
			/* Unhighlight */
			cards[0].highlight = null;
			this.placeCard(cards[0]);
		}
	}

	if (show) {
		this.possibleMoves = count;

		if (this.$.deck && this.$.deck.cards.length > 0) {
			this.possibleMoves++;
		}

		if (this.possibleMoves == 0) {
			/* Force the game to check the score again */
			this.cardsMoved();
		}
	}
},

noMoves: function()
{
	if (!this.$.NoMoves) {
		/* Create this here because some variants have different components */
		this.createComponent({
			name:					"NoMoves",
			kind:					"ModalDialog",

			caption:				$L("No remaining moves"),

			components: [
				{
					kind:			"Button",
					caption:		$L("Undo last move"),
					value:			"undo",
					onclick:		"gameDoneAction"
				},
				{
					kind:			"Button",
					caption:		$L("Restart this hand"),
					value:			"restart",
					onclick:		"gameDoneAction"
				},
				{
					kind:			"Button",
					caption:		$L("Deal a new hand"),
					value:			"newdeal",
					onclick:		"gameDoneAction"
				},
				{
					kind:			"Button",
					caption:		$L("Play a different game"),
					value:			"newgame",
					onclick:		"gameDoneAction"
				}
			]
		});
	}

	/* There are no moves left */
	this.$.NoMoves.openAtCenter();
},

isActive: function()
{
	return(	this.inplay > 0			&&
			this.history			&&
			this.history.length > 0	&&
			this.possibleMoves > 0);
},

gameDoneAction: function(sender, e)
{
	if (this.$.NoMoves) {
		this.$.NoMoves.close();
	}

	switch (sender.value) {
		case "undo":
			/*
				Make sure that the no moves dialog doesn't just pop up again.
				There had to be at least one move before, or else there would be
				nothing to undo.
			*/
			this.possibleMoves = 1;

			this.undo();
			break;

		default:
			/* Send the event back up a level */
			this.doGameDone(sender.value);
			break;
	}
},

moveCards: function()
{
	var cards;
	var c;

	this.highlightCards(false);
	this.inherited(arguments);
	if (this.inplay) {
		this.highlightCards(true);
	}
},

dealDone: function()
{
	this.inherited(arguments);
	this.highlightCards(true);
},

prefsChanged: function()
{
	var		highlight = this.prefs ? this.prefs.highlight : false;

	this.inherited(arguments);

	if (!this.prefs.highlight != highlight) {
		/* Re-highlight if the value changed */
		this.highlightCards(this.prefs.highlight);
	}
},

score: function(e)
{
	this.inherited(arguments);

	var score = [];

	if (this.inplay > 0) {
		e.score = this.inplay;
	} else {
		e.score = -this.indeck;
	}

	/* The online leaderboard ranks higher numbers first */
	e.online = 52 - e.score;

	e.actions.push({
		name:		"draw",
		icon:		"images/toolbar-icon-draw1.png",
		wide:		true,
		disabled:	this.$.deck.cards.length == 0
	});

	/*
		If the game is won then don't consider any cards inplay.  This will
		cause the game won dialog to be used instead of the no more moves dialog
		if there are no more moves.
	*/
	if (this.possibleMoves == 0) {
		if (this.scoreWin(e)) {
			/* Let the game won dialog be shown */
			e.inplay = 0;
		} else {
			this.noMoves();
		}
	}
},

scoreStr: function(e)
{
	var score	= [];
	var s;

	if (!isNaN(e.score)) {
		s = e.score;
	} else if (!isNaN(e.online)) {
		s = -(e.online) - 52;
	}

	if (undefined != e.wincount || undefined != e.losecount) {
		var w = e.wincount  || 0;
		var l = e.losecount || 0;

		return(w + " " + $L("out of") + " " + (w + l) + " " + $L("par games"));
	}

	score.push(s);

	/* par is 5 */
	s -= 5;

	score.push(" (");

	if (s <= 3) {
		switch (s) {
			case  3: score.push($L("Triple Bogey"));	break;
			case  2: score.push($L("Double Bogey"));	break;
			case  1: score.push($L("Bogey"));			break;
			case  0: score.push($L("Par"));				break;
			case -1: score.push($L("Birdie"));			break;
			case -2: score.push($L("Eagle"));			break;
			case -3: score.push($L("Albatross"));		break;
			case -4: score.push($L("Condor"));			break;
			case -5: score.push($L("Ostrich"));			break;

			default:
			case -6: score.push($L("Phoenix"));			break;
		}

		score.push(", ");
	}

	if (s > 0) {
		score.push( s + " " + $L("over par")  + ")");
	} else if (s < 0) {
		score.push(-s + " " + $L("under par") + ")");
	} else {
		score.push(")");
	}

	return(score.join(""));
},

scoreCmp: function(a, b)
{
	return(a.score - b.score);
},

scoreAdd: function()
{
	/*
		The total number of cards left isn't very useful, so we'll total up the
		number of gaems won instead.
	*/
	var wincount	= 0;
	var losecount	= 0;
	var a;

	for (var i = 0; i < arguments.length; i++) {
		if (!(a = arguments[i])) {
			continue;
		}

		if (a.wincount || a.losecount) {
			if (a.wincount) {
				wincount += a.wincount;
			}

			if (a.losecount) {
				losecount += a.losecount;
			}
		} else {
			/* A win is a game <= par, which is 5 */
			if (a.score <= 5) {
				wincount++;
			} else {
				losecount++;
			}
		}
	}

	return({ wincount: wincount, losecount: losecount });
},

/* Is this score a win? */
scoreWin: function(e)
{
	if (e.score <= 5) {
		return(true);
	} else {
		return(false);
	}
}

});

/* Alternate versions of golf */

enyo.kind({

name:							"golf",
kind:							"golf_common",

deal: function(gamenum)
{
	this.inherited(arguments);

	/* Deal 5 cards to each tableau */
	var i = 0;
	for (var c = 0; c < 5; c++) {
		for (var s = 1, stack; stack = this.$["tableau" + s]; s++) {
			this.moveCard(this.deck[i++], stack,  (c + 1) < 5);
		}
	}

	/* Deal one card to the foundation */
	this.moveCard(this.deck[i++], this.$.foundation);

	/* Deal the remaining cards to the deck face down */
	var cards = [];
	for (var card; card = this.deck[i]; i++) {
		card[2] = true;
		cards.push(card);
	}

	// this.log(this.dumpCards(cards));
	this.moveCards(cards, this.$.deck, true);
}

});


enyo.kind({
	name:							"golf:relaxed",
	kind:							"golf",
	relaxed:						true
});

enyo.kind({
	name:							"golf:dead king",
	kind:							"golf",
	deadKing:						true
});


/*
	The tableaux are laid out in a spiral around the foundation, thus the weird
	numbering and the dummy stacks.  Makes for a nice deal pattern.
*/
enyo.kind(
{

name:							"golf:blackhole",
kind:							"golf_common",
className:						"blackhole",
relaxed:						true,

offset:							[ 0, 0 ],

cardWidth:						10,

components: [
	{
		kind:					enyo.Control,
		style:					"padding-top: 20px;",

		components: [
			{ kind:				"CardStack", className: "dummy",bgsrc: "blank.png" },

			{ kind:				"CardStack", name: "tableau17",	bgsrc: "blank.png", inplay: true },
			{ kind:				"CardStack", name: "tableau6",	bgsrc: "blank.png", inplay: true },
			{ kind:				"CardStack", name: "tableau7",	bgsrc: "blank.png", inplay: true },
			{ kind:				"CardStack", name: "tableau8",	bgsrc: "blank.png", inplay: true }
		]
	},
	{
		kind:					enyo.Control,

		components: [
			{ kind:				"CardStack", name: "tableau16",	bgsrc: "blank.png", inplay: true },
			{ kind:				"CardStack", name: "tableau5",	bgsrc: "blank.png", inplay: true },

			{
				name:			"foundation",
				offset:			[ 0, 0 ],
				kind:			"CardStack",
				bgsrc:			"base.png"
			},

			{ kind:				"CardStack", name: "tableau1",	bgsrc: "blank.png", inplay: true },
			{ kind:				"CardStack", name: "tableau9",	bgsrc: "blank.png", inplay: true }
		]
	},
	{
		kind:					enyo.Control,

		components: [
			{ kind:				"CardStack", name: "tableau15",	bgsrc: "blank.png", inplay: true },
			{ kind:				"CardStack", name: "tableau4",	bgsrc: "blank.png", inplay: true },
			{ kind:				"CardStack", name: "tableau3",	bgsrc: "blank.png", inplay: true },
			{ kind:				"CardStack", name: "tableau2",	bgsrc: "blank.png", inplay: true },
			{ kind:				"CardStack", name: "tableau10",	bgsrc: "blank.png", inplay: true }
		]
	},
	{
		kind:					enyo.Control,

		components: [
			{ kind:				"CardStack", className: "dummy",bgsrc: "blank.png" },

			{ kind:				"CardStack", name: "tableau14",	bgsrc: "blank.png", inplay: true },
			{ kind:				"CardStack", name: "tableau13",	bgsrc: "blank.png", inplay: true },
			{ kind:				"CardStack", name: "tableau12",	bgsrc: "blank.png", inplay: true },
			{ kind:				"CardStack", name: "tableau11",	bgsrc: "blank.png", inplay: true }
		]
	}
],

deal: function(gamenum)
{
	this.inherited(arguments);

	var start	= null;
	var spades	= enyo.indexOf("spades", this.suits);
	var deck	= this.deck.slice(0);
	var i		= 1;
	var stack;
	var card;

	/* Deal all the cards to the tableaux */
	while ((card = deck.shift())) {
		if (card[0] == spades && card[1] == 1) {
			/* Deal the ace of spades to the foundation */
			start = card;
			continue;
		}

		if (!(stack = this.$["tableau" + i++])) {
			i = 1;
			stack = this.$["tableau" + i++];
		}

		this.moveCard(card, stack);
	}

	if (start) {
		this.moveCard(start, this.$.foundation);
	}
},

getOffset: function(stack, index, position)
{
	var o = this.inherited(arguments);
	var s = this.getCardSize();
	var x = 0;
	var y = 0;

	if (stack.name != "foundation") {
		switch (index) {
			case 0:
				x = -20 * s[0] / 100;
				y = -15 * s[1] / 100;
				break;

			case 1:
				x =  20 * s[0] / 100;
				y =   0;
				break;

			case 2:
				x =  -5 * s[0] / 100;
				y =  15 * s[1] / 100;
				break;
		}
	}

	o.left		+= x;
	o.right		+= x;
	o.top		+= y;
	o.bottom	+= y;

	return(o);
},

/* Don't use the golf terminoligy for black hole */
scoreStr: function(e)
{
	return($L("Score") + ": " + e.score);
},

scoreAdd: null,

/* Is this score a win? */
scoreWin: function(e)
{
	if (e.inplay == 0) {
		return(true);
	} else {
		return(false);
	}
}

});


