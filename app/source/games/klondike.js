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

name:						"klondike",
kind:						"Solitaire",

/* klondike base card is an ace */
startRank:					1,

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
				inplay:		true,
				count:		true
			},

			{
				name:		"waste",
				offset:		[ 30, 0 ],
				kind:		"CardStack",
				bgsrc:		"base.png",
				inplay:		true,
				count:		true
			},

			{
				name:		"dummy",
				offset:		[ 0, 0 ],
				kind:		"CardStack",
				bgsrc:		"blank.png",
				inplay:		false
			},

			{
				className:	"foundation",
				name:		"foundation",
				kind:		enyo.Control,
				nodeTag:	"span",

				components: [
					{ kind:	"CardStack", bgsrc: "clubs.png",  name: "foundation1", offset: [ 0, 0 ], "suit": 0 },
					{ kind:	"CardStack", bgsrc: "diams.png",  name: "foundation2", offset: [ 0, 0 ], "suit": 1 },
					{ kind:	"CardStack", bgsrc: "hearts.png", name: "foundation3", offset: [ 0, 0 ], "suit": 2 },
					{ kind:	"CardStack", bgsrc: "spades.png", name: "foundation4", offset: [ 0, 0 ], "suit": 3 }
				]
			}
		]
	},

	{
		className:			"tableau",
		name:				"tableau",
		kind:				enyo.Control,

		components: [
			{ kind:			"CardStack", name: "tableau1", inplay: true },
			{ kind:			"CardStack", name: "tableau2", inplay: true },
			{ kind:			"CardStack", name: "tableau3", inplay: true },
			{ kind:			"CardStack", name: "tableau4", inplay: true },
			{ kind:			"CardStack", name: "tableau5", inplay: true },
			{ kind:			"CardStack", name: "tableau6", inplay: true },
			{ kind:			"CardStack", name: "tableau7", inplay: true },
			{ kind:			"CardStack", name: "tableau8", inplay: true },
			{ kind:			"CardStack", name: "tableau9", inplay: true },
			{ kind:			"CardStack", name: "tableau10",inplay: true }
		]
	}
],

getHelp: function()
{
	return([
		{
			caption:				"Goal",
			content:				"Move all cards to the foundations"
		},

		{
			caption:				"Layout",
			content: [
				"The 4 cells on the top right are the foundations.  28 cards",
				"are dealt to the tableaux, and the remaining cards are left",
				"in the deck and placed in the top left corner."
			].join(" ")
		},

		{
			caption:				"Rules",
			content: [
				"Sequences can be built in the tableaux by building down by",
				"alternate color.\n",

				"An empty tableau may be filled with a king.\n",

				"The foundations are built up, starting with ace in suit.\n",

				"Tapping on the deck will flip a card and place it in a pile",
				"next to the deck called the waste.  The top card of the waste",
				"may be played on the foundations or the tableaux."
			].join(" ")
		},

		{
			caption:				"Variants",
			content: [
				"In draw 3 tapping on the deck will will deal 3 cards to the",
				"waste instead of just one.\n",

				"In Thoughtful Klondike all cards dealt to the tableaux are",
				"face up.\n",

				"Westcliff uses 10 tableaux, allows any card to be played on",
				"an emtpy space and does not allow any redeals.  Westcliff",
				"also prohibits moving cards out of the foundations.\n",

				"Gypsy uses 2 decks, and 8 tableaux.  Any card may be played",
				"an empty space.  There is no waste in this game.  Instead",
				"tapping on the deck will deal one card to each of the",
				"tableaux."
			].join(" ")
		},

		{
			caption:				"Agnes Sorel",
			content: [
				"The Agnes Sorel variant uses the same layout as regular",
				"klondike, but does not have a waste.  Instead tapping on the",
				"deck deals one card to each of the tableaux.\n",

				"When a new game is dealt one card is placed in the foundation",
				"and that card sets the starting rank for the game.  The first",
				"card placed on the 3 remaining foundations must match the",
				"rank of that card.\n",

				"Cards in the tableaux build down by matching color instead of",
				"alternating color."
			].join(" ")
		}
	]);
},

create: function()
{
	this.points = 0;

	this.inherited(arguments);

	if (this.$.waste && this.drawcount <= 1) {
		this.$.waste.offset = [ 0, 0 ];
	}
},

allowAddingCards: function(stack, cards)
{
	switch (stack.container.className) {
		case "foundation":
			/*
				To add a stack to a foundation the following rules must be met:
					- First card must be an ace (or match the base for that game)
					- Cards must all match the suit of the foundation
					- Cards must be ascending sequentially in rank

				Only one card can be dropped on a foundation at a time because
				the tableaux use alternating colours in their sequences.
			*/
			if (!cards || !cards.length) {
				return([]);
			}
			var card = cards[cards.length - 1];

			if (card[0] != stack.suit) {
				return([]);
			}

			if (stack.cards && stack.cards.length > 0) {
				/*
					The rank of the new card must be one larger than the top
					card on the stack.
				*/
				if (stack.cards[stack.cards.length - 1][1] != card[1] - 1) {
					return([]);
				}
			} else {
				/* A foundation must begin with an ace (or the game's base) */
				if (this.startRank != card[1]) {
					return([]);
				}
			}

			return([ cards.pop() ]);

		case "tableau":
			/*
				To add cards to a tableau the following rules must be met:
					- First card must be a king (or be one below the game's base)
					- Cards must alternate in colour
					- Cards must decend sequentially in rank
			*/
			var s		= 0;
			var card	= null;

			if (!cards || !cards.length) {
				return([]);
			}

			if (stack.cards && stack.cards.length) {
				/*
					Verify that the stack can be added to the existing cards.

					The rules have already been applied to the stack of cards
					being passed in, so just invalidate the last card until one
					is found that is legal.
				*/
				var	last = stack.cards[stack.cards.length - 1];

				while (cards.length > 0) {
					var match = last[1] - 1;

					while (match < 1) {
						match += 13;
					}

					if (match != cards[0][1]) {
						/* Card ranks should increase sequentially */
						cards.shift();
						continue;
					}

					if (this.colorsMatch(last, cards[0])) {
						/* Colours should be alternating */
						cards.shift();
						continue;
					}

					break;
				}
			} else {
				/* In some variants an empty tableau must start with a king */
				if (this.kingsOnly) {
					while (cards.length > 0) {
						var match = this.startRank - 1;

						while (match < 1) {
							match += 13;
						}

						if (cards[0][1] != match) {
							cards.shift();
						} else {
							break;
						}
					}
				}
			}

			return(cards);

		default:
			break;
	}

	return([]);
},

allowTakingCards: function(stack)
{
	switch (stack.container.className) {
		case "foundation":
			if (stack.cards.length >= 1 && !this.foundationsfixed) {
				return([ stack.cards[stack.cards.length - 1] ]);
			}
			break;

		case "tableau":
			/*
				Start from the last card and add cards that follow the rules to
				form a valid stack.  The cards must alternate colours and must
				ascend in rank sequentially.
			*/
			var cards = [];

			for (var i = stack.cards.length - 1, card; i >= 0 && (card = stack.cards[i]); i--) {
				/* No face down cards allowed */
				if (card[2]) {
					break;
				}

				if (!cards.length) {
					/* We always get at least one card */
					cards.unshift(card);
					continue;
				}

				var match = card[1] - 1;

				while (match < 1) {
					match += 13;
				}

				if (match != cards[0][1]) {
					break;
				}

				if (!this.inSuit) {
					/* Cards must alternate in colour */
					if (this.colorsMatch(card, cards[0])) {
						break;
					}
				} else {
					/* Cards must match suit */
					if (card[0] != cards[0][0]) {
						break;
					}
				}

				cards.unshift(card);
			}

			return(cards);

		default:
			switch (stack.name) {
				case "deck":
					break;

				case "waste":
					if (stack.cards.length >= 1) {
						return([ stack.cards[stack.cards.length - 1] ]);
					}
					break;
			}
			break;
	}

	return([]);
},

tapOnCards: function(stack, card)
{
	enyo.job.stop("autoPlay");

	switch (stack.container.className) {
		case "foundation":
			break;

		case "tableau":
			this.autoPlay(stack, card, null, true);
			break;

		default:
			switch (stack.name) {
				case "deck":
					this.draw();
					break;

				case "waste":
					this.autoPlay(stack, null, null, true);
					break;
			}
			break;
	}
},

draw: function()
{
	var from;

	if (!this.$.waste) {
		/* Some variants don't have a waste */
		return;
	}

	if ((from = this.$.deck.cards) && from.length) {
		/*
			The cards that are already in the waste should not be fanned out.
			Only the new cards should be.
		*/
		if (this.drawcount > 1) {
			this.$.waste.wasteIgnore	= this.$.waste.offsetIgnore;
			this.$.waste.offsetIgnore	= this.$.waste.cards.length;

			for (var i = 0, card; card = this.$.waste.cards[i]; i++) {
				card.moving = false;
				this.placeCard(card, undefined, undefined, undefined, true);
			}
		}

		this.moveCards(from.slice(-this.drawcount),
			this.$.waste, false, false, true);
	} else if (this.redeal != 0 && (from = this.$.waste.cards)) {
		this.redeal--;

		/* Flip the cards in the waste back over */
		this.moveCards(from.slice(0), this.$.deck, true, true, true);
	}
},

isCardFree: function(card)
{
	if ((card[1] - this.startRank + 1) <= 2) {
		/*
			There is no reason not to play an A or a 2.  Sure an A could be
			played on a 2, but the A can always go to the foundation, so who
			cares.  Just play it.
		*/
		return(true);
	}

	/*
		Are there any cards with the opposite colour that are lower and still in
		play?  If so then this card may be needed still, so it shouldn't be
		played without the user choosing to do so.
	*/
	var suits = [];

	if (!this.inSuit) {
		for (var i = 0; i < this.suits.length; i++) {
			if (!this.colorsMatch(card, i)) {
				suits.push(i);
			}
		}
	} else {
		suits.push(card[0]);
	}

	var c;
	for (var i = 0; i < suits.length; i++) {
		if ((c = this.findCard(suits[i], card[1] - 1))) {
			/* If the card is in a stack that is in play then it is not free */
			if (c.stack.inplay) {
				return(false);
			}
		}
	}

	return(true);
},

autoPlay: function(stack, card, destinations, human)
{
	/*
		Try to automatically play a single card.

		Foundations are prefered, followed by tableaux with cards, and finally
		empty tableaux.

		For most variants of klondike an empty tableau can only be filled with a
		king.
	*/
	var last;

	if (!stack || !stack.cards || !stack.cards.length) {
		return(false);
	}
	last = stack.cards[stack.cards.length - 1];

	if (!destinations) {
		destinations = [];

		if ((!card || last == card) && this.isCardFree(last)) {
			for (var i = 1, s; s = this.$["foundation" + i]; i++) {
				destinations.push(s);
			}
		}

		if (human) {
			for (var i = 1, s; s = this.$["tableau" + i]; i++) {
				destinations.push(s);
			}

			/*
				A human tapping on a card should move it to a foundation but
				only if the tableaux have already been tried.
			*/
			if ((!card || last == card) && !this.isCardFree(last)) {
				for (var i = 1, s; s = this.$["foundation" + i]; i++) {
					destinations.push(s);
				}
			}
		}
	}

	return(this.inherited(arguments));
},

rendered: function()
{
	/* Destroy any unneeded tableaux */
	for (var i = (this.tableaucount || 7) + 1, t; t = this.$["tableau" + i]; i++) {
		t.destroy();
	}

	this.inherited(arguments);
},


deal: function(gamenum)
{
	this.inherited(arguments);

	var deck = this.deck.slice(0);
	var card;
	var top;

	if (this.staggered) {
		/* Deal the cards to the tableaux */
		var stacks = [];

		for (var i = 1, t; t = this.$["tableau" + i]; i++) {
			stacks.unshift(t);
		}

		for (var c = 0; c < stacks.length; c++) {
			for (var i = 0, t; i <= c && (t = stacks[i]); i++) {
				card = deck.shift();

				/*
					Place all but the top card in each tableau face down (unless
					this is a "thoughtful" game).
				*/
				if ((c + 1) < stacks.length) {
					top = false;
				} else {
					top = true;
				}

				this.moveCard(card, t, !top, !top && !this.thoughtful);

			}
		}
	} else {
		for (var c = 1; c <= 3; c++) {
			for (var i = 1, stack; stack = this.$["tableau" + i]; i++) {
				card = deck.shift();

				if (!this.thoughtful && c != 3) {
					card[2] = true;
				}

				this.moveCard(card, stack);
			}
		}
	}

	if (this.prefs.autoPlay && this.$.waste) {
		/*
			Flip the first 3 cards from the deck.  Move them to the deck first
			so that they appear to flip from the deck instead of being dealt
			from the bottom of the screen.
		*/
		for (var i = 0; i < this.drawcount; i++) {
			card = deck.pop();

			this.moveCard(card, this.$.deck, true);
			this.moveCard(card, this.$.waste, false);
		}
	}

	/* Put the rest of the cards in the deck face down */
	this.moveCards(deck, this.$.deck, true, true);
},

moveCards: function()
{
	this.inherited(arguments);

	if (!this.history) {
		/* Don't autoplay while dealing, or while undoing history. */
		return;
	}

	if (this.prefs.autoPlay) {
		/* Attempt to autoplay any free cards */
		enyo.job("autoPlay", enyo.bind(this, function()
		{
			if (this.$.waste && this.autoPlay(this.$.waste, null, null, false)) {
				return;
			}

			for (var i = 1, stack; stack = this.$["tableau" + i]; i++) {
				if (this.autoPlay(stack, null, null, false)) {
					return;
				}
			}
		}), this.delay);
	}
},

undo: function()
{
	var last;

	/*
		Normally the history doesn't undo secondary actions, like flipping a
		card.  It needs to be flipped back on an undo though.
	*/
	if ((last = this.history.slice(-1)[0])) {
		if (last.flipped && last.from) {
			var stack	= this.$[last.from];
			var card;

			if ((card = stack.cards.slice(-1)[0])) {
				this.flipCard(card, true);
			}
		}

		if (last.wasteIgnore && this.$.waste) {
			this.$.waste.offsetIgnore = last.wasteIgnore;

			for (var i = 0, card; card = this.$.waste.cards[i]; i++) {
				this.placeCard(card);
			}
		}

		this.points -= last.points;
	}

	this.inherited(arguments);
},

getStackType: function(stack)
{
	if ("string" == (typeof stack)) {
		stack = this.$[stack];
	}

	if (!stack) {
		return(null);
	}

	if (stack.container && stack.container.className) {
		switch (stack.container.className) {
			case "foundation":
			case "tableau":
				return(stack.container.className);

			default:
				break;
		}
	}

	return(stack.name);
},

recordMove: function(history, move)
{
	var		points = 0;

	if (move) {
		var from	= this.getStackType(move.from);
		var to		= this.getStackType(move.to);

		/* Flip the top card of the tableau if it is hidden */
		var card;
		var stack;

		if (this.$.waste && move &&
			"waste" == to && this.$.waste.wasteIgnore > 0
		) {
			move.wasteIgnore = this.$.waste.wasteIgnore;
		}

		/*
			Does a card need to be flipped?  Keep in mind the move hasn't
			actually been done yet.
		*/
		if (from == "tableau" && (stack = this.$[move.from]) &&
			(card = stack.cards.slice(-(1 + move.cards.length))[0]) && card[2]
		) {
			this.flipCard(card, false, this.delay * 2);

			/*
				Mark the record in the history so that we know to unflip on an
				undo.
			*/
			if (move) {
				move.flipped	= true;
				move.safe		= false;
			}
		}

		/*
			Set the score based on the last move

			Waste to Tableau			5
			Any to Foundation			10
			Turn over Tableau card		5
			Foundation to Tableau		-15
		*/
		if (from == "waste" && to == "tableau") {
			points += 5;
		}

		if (to == "foundation") {
			points += 10;
		}

		if (move.flipped) {
			points += 5;
		}

		if (from == "foundation") {
			points -= 15;
		}
		// this.log(from, to, points);
	}

	move.points = points;
	this.points += points;

	this.inherited(arguments);
},

score: function(e)
{
	this.inherited(arguments);

	if (!this.vegas) {
		e.score = (this.points || 0);
		e.online = e.score;
	} else {
		var score = -52;

		for (var i = 1, stack; stack = this.$["foundation" + i]; i++) {
			score += stack.cards.length * 5;
		}

		e.score = score;
		e.online = -score;
	}

	var icon;
	switch (this.drawcount) {
		default:
		case 1:		icon = "images/toolbar-icon-draw1.png";	break;
		case 3:		icon = "images/toolbar-icon-draw3.png";	break;
	}


	if (this.$.deck.cards.length > 0) {
		e.actions.push({
			name:		"draw",
			wide:		true,
			icon:		icon
		});
	} else {
		e.actions.push({
			name:		"draw",
			icon:		"images/toolbar-icon-flipdeck.png",
			wide:		true,
			disabled:	(this.redeal == 0)
		});
	}
},

scoreStr: function(e, total)
{
	var score = '';

	if (isNaN(e.score) && !isNaN(e.online)) {
		if (!vegas) {
			e.score = e.online;
		} else {
			e.score = -e.online;
		}
	}

	if (total) {
		score = $L("Total") + " ";
	}

	if (!this.vegas) {
		if (total) {
			return($L("Total Score") + ": " + e.score);
		} else {
			return($L("Score") + ": " + e.score);
		}
	} else {
		if (total) {
			return($L("Total") + ": $" + e.score);
		} else {
			if (this.total) {
				return($L("$") + e.score + ", " +
						$L("Total") + ": $" + (this.total.score + e.score));
			} else {
				/*
					We don't know the total yet, so ask the stats view to load
					it so that we can display it once we do.

					If we still don't get a total, then just give up.
				*/
				if (!this.loadedTotal) {
					this.loadedTotal = true;

					this.scores.loadStats(this.kind, this, enyo.bind(this, function(total) {
						this.total = total;
						this.cardsMoved();
					}));
				}

				return($L("$") + e.score);
			}
		}
	}
},

scoreCmp: function(a, b)
{
	return(b.score - a.score);
},

scoreAdd: function(a, b)
{
	if (!a) a = { score: 0 };
	if (!b) b = { score: 0 };

	return({ score: a.score + b.score });
},

scoreWin: function(e)
{
	if (this.vegas) {
		if (e.score >= 0) {
			return(true);
		} else {
			return(false);
		}
	} else {
		if (e.inplay == 0) {
			return(true);
		} else {
			return(false);
		}
	}
}

});

/* Alternate versions of klondike */

// TODO	Should any of these have a fixed number of deals?
enyo.kind({
	name:							"klondike:draw 1",
	kind:							"klondike",
	className:						"klondike",
	cardWidth:						12,
	drawcount:						1,
	redeal:							-1,
	staggered:						true,
	kingsOnly:						true
});

enyo.kind({
	name:							"klondike:draw 3",
	kind:							"klondike",
	className:						"klondike",
	cardWidth:						12,
	drawcount:						3,
	redeal:							-1,
	staggered:						true,
	kingsOnly:						true
});

/* Vegas style scoring */
enyo.kind({
	name:							"klondike:vegas draw 1",
	kind:							"klondike",
	className:						"klondike",
	cardWidth:						12,
	drawcount:						1,
	redeal:							-1,
	staggered:						true,
	kingsOnly:						true,
	vegas:							true
});

enyo.kind({
	name:							"klondike:vegas draw 3",
	kind:							"klondike",
	className:						"klondike",
	cardWidth:						12,
	drawcount:						3,
	redeal:							-1,
	staggered:						true,
	kingsOnly:						true,
	vegas:							true
});

/* Exactly like regular draw three, except that all cards start out face up */
enyo.kind({
	name:							"klondike:thoughtful",
	kind:							"klondike",
	className:						"klondike",
	cardWidth:						12,
	drawcount:						3,
	thoughtful:						true,
	redeal:							-1,
	staggered:						true,
	kingsOnly:						true
});

/*
	Westcliff is a variant of Klondike, with 10 tableaux, anything can go on an
	empty space and no redeal.
*/
enyo.kind({
	name:							"klondike:wc draw 1",
	className:						"westcliff",
	kind:							"klondike",
	cardWidth:						8,
	drawcount:						1,
	tableaucount:					10,
	redeal:							0,
	staggered:						false,
	foundationsfixed:				true
});

enyo.kind({
	name:							"klondike:wc draw 3",
	className:						"westcliff",
	kind:							"klondike",
	cardWidth:						8,
	drawcount:						3,
	tableaucount:					10,
	redeal:							0,
	staggered:						false,
	foundationsfixed:				true
});

enyo.kind({
	name:							"klondike:thoughtful wc",
	className:						"westcliff",
	kind:							"klondike",
	cardWidth:						8,
	drawcount:						1,
	tableaucount:					10,
	thoughtful:						true,
	redeal:							0,
	staggered:						false,
	foundationsfixed:				true
});


