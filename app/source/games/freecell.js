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

name:								"freecell_common",
className:							"freecell",
kind:								"Solitaire",

cardWidth:							10,
tableaux:							8,
createFoundations:					true,

components: [
	{
		kind:						enyo.Control,
		nodeTag:					"div",

		components: [
			{
				className:			"foundation",
				name:				"foundleft",
				kind:				enyo.Control,
				nodeTag:			"span"
			},
			{
				className:			"free",
				name:				"free",
				kind:				enyo.Control,
				nodeTag:			"span",

				components: [
					{ kind:			"CardStack", bgsrc: "basefree.png", name: "free1", inplay: true, offset: [ 0, 0 ] },
					{ kind:			"CardStack", bgsrc: "basefree.png", name: "free2", inplay: true, offset: [ 0, 0 ] },
					{ kind:			"CardStack", bgsrc: "basefree.png", name: "free3", inplay: true, offset: [ 0, 0 ] },
					{ kind:			"CardStack", bgsrc: "basefree.png", name: "free4", inplay: true, offset: [ 0, 0 ] }
				]
			},
			{
				className:			"foundation",
				name:				"foundright",
				kind:				enyo.Control,
				nodeTag:			"span"
			}
		]
	},

	{
		className:					"tableau",
		name:						"tableau",
		kind:						enyo.Control,

		components: [
			{ kind:					"CardStack", name: "tableau1", inplay: true },
			{ kind:					"CardStack", name: "tableau2", inplay: true },
			{ kind:					"CardStack", name: "tableau3", inplay: true },
			{ kind:					"CardStack", name: "tableau4", inplay: true },
			{ kind:					"CardStack", name: "tableau5", inplay: true },
			{ kind:					"CardStack", name: "tableau6", inplay: true },
			{ kind:					"CardStack", name: "tableau7", inplay: true },
			{ kind:					"CardStack", name: "tableau8", inplay: true }
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
				"The playing field is split into 3 areas.  The 4 cells on the",
				"top left are the free cells that give the game it's name.",
				"The 4 cells on the top right are the foundations.  The rest",
				"are the tableaux."
			].join(" ")
		},
		{
			caption:				"Rules",
			content: [
				"The game is started by dealing one deck to the tableaux, with",
				"all cards face up.\n",

				"Sequences can be built in the tableaux by building down by",
				"alternate color.  An empty tableau may be filled with any",
				"card.\n",

				"Any one card may be placed in each free cell as a temporary",
				"storage area.\n",

				"The foundations are built up, starting with ace in suit."
			].join(" ")
		},
		{
			caption:				"Moving Cards",
			content: [
				"The number of cards that can be moved as a sequence is",
				"limited by the number of empty tableaux and free cells.",
				"A sequence may only be moved if it is possible to perform the",
				"same move one card at a time."
			].join(" ")
		},
		{
			caption:				"Variants",
			content: [
				"Relaxed FreeCell removes the restriction on the number of",
				"cards that can be moved in a sequence to make the game",
				"easier.\n",

				"Baker's Game is exactly like FreeCell, except that sequences",
				"in the tableaux are built in suit instead of by alternating",
				"colors.\n",

				"Kings Only Baker's game is exactly like Baker's game except",
				"an empty tableau may only be filled by a king.\n",

				"Seahaven Towers is exactly like Baker's game, but with 10",
				"tableaux.\n",

				"ForeCell is exactly like FreeCell, except that the last four",
				"cards of the deck are dealt to the free cells, and an empty",
				"tableau may only be filled by a king.\n",

				"Challenge FreeCell attempts to make the game more difficult",
				"by taking the aces and duces out of the deck before the",
				"shuffle and dealing them first.\n",

				"Super Challenge FreeCell is exactly the same as Challenge",
				"FreeCell except that it also adds the rule that an empty",
				"tableau may only be filled by a king."
			].join(" ")
		}
	]);
},

create: function()
{
	this.inherited(arguments);

	/* Create the foundations (because they are different in some games) */
	if (this.createFoundations) {
		this.$.foundright.createComponents([
			{ kind: "CardStack", bgsrc: "clubs.png",  name: "foundation1", offset: [ 0, 0 ], "suit": 0 },
			{ kind: "CardStack", bgsrc: "diams.png",  name: "foundation2", offset: [ 0, 0 ], "suit": 1 },
			{ kind: "CardStack", bgsrc: "hearts.png", name: "foundation3", offset: [ 0, 0 ], "suit": 2 },
			{ kind: "CardStack", bgsrc: "spades.png", name: "foundation4", offset: [ 0, 0 ], "suit": 3 }
		], { owner: this });
	}

	this.render();
},

allowAddingCards: function(stack, cards, from, first)
{
	var why = null;

	switch (stack.container.className) {
		case "free":
			if (!cards || !cards.length) {
				return([]);
			}

			if (stack.cards.length > 0) {
				/* A free cell can only contain one card at a time */
				return([]);
			}

			return([ cards.pop() ]);

		case "foundation":
			/*
				- First card must be an ace
				- Cards must match the suit of the foundation stack
				- Card ranks be ascending in sequential order
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
				/* A foundation must begin with an ace */
				if (card[1] != 1) {
					return([]);
				}
			}

			return([ cards.pop() ]);

		case "tableau":
			/*
				- Cards must alternate in colour (Except in Baker's game, where
				they must be in the same suit).

				- Card ranks must decend sequentially

				- There must be enough empty freecells and tableaux to allow the
				move.  A stack of cards can only be moved if that same stack can
				be moved one at a time.


				The rules to take cards from a stack will require that they be
				alternating in color (or in suit depending on the variant) and
				be increasing sequentially.  Since that is already checked there
				is no need to verify that again, but we do need to verify that
				the top existing card and the new cards follow those rules.
			*/
			var s		= 0;
			var card	= null;

			if (!cards || !cards.length) {
				return([]);
			}

			if (!this.relaxed) {
				/*
					Calculate the maximum number of cards that can be moved to
					this stack at once.  In freecell a stack of cards can be
					moved if that same move can be acomplished one card at a
					time.

					This can be calculated easily.  1 card is always alowed,
					plus 1 for each empty free cell.  The value is then doubled
					for each empty tableau since it can be used as a temporary
					storage spot for a portion of a stack.

					If the variant of freecell uses the 'kingsonly' rule then
					empty tableaux can not be used.

					The destination stack can not be used to double the count.
				*/
				var count = 1;

				for (var i = 1, s; s = this.$["free" + i]; i++) {
					if (s.cards.length == 0) {
						count++;
					}
				}

				if (!this.kingsOnly) {
					for (var i = 1, s; s = this.$["tableau" + i]; i++) {
						if (s != stack && s.cards.length == 0) {
							count = count * 2;
						}
					}
				}

				if (cards.length > count) {
					why = $L("There are not enough empty cells for that move.");
				}

				cards = cards.slice(-count);
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
					if (last[1] - 1 != cards[0][1]) {
						/* Card ranks should increase sequentially */
						cards.shift();
						continue;
					}

					if (!this.inSuit) {
						if (this.colorsMatch(last, cards[0])) {
							/* Colours should be alternating */
							cards.shift();
							continue;
						}
					} else {
						if (last[0] != cards[0][0]) {
							/* Cards should be suited */
							cards.shift();
							continue;
						}
					}

					break;
				}
			} else if (this.kingsOnly) {
				/* In some variants an empty tableau must start with a king */
				while (cards.length > 0) {
					if (cards[0][1] != 13) {
						cards.shift();
					} else {
						break;
					}
				}
			} else if (first) {
				/* Only move the cards that the user drug */
				var f;

				if (-1 != (f = enyo.indexOf(first, cards))) {
					cards = cards.slice(f);
				}
			}

			if (why && !cards.length) {
				cards.why = why;
			}

			return(cards);
	}

	return([]);
},

allowTakingCards: function(stack)
{
	switch (stack.container.className) {
		case "free":
			if (stack.cards.length >= 1) {
				/* A card in a free cell may always be removed */
				return([ stack.cards[stack.cards.length - 1] ]);
			}
			break;

		case "foundation":
			/* Cards can not be moved out of a foundation */
			break;

		case "tableau":
			/*
				Start from the last card and add cards that follow the rules to
				form a valid stack.  The cards must alternate colours and must
				ascend in rank sequentially.
			*/
			var cards = [];

			for (var i = stack.cards.length - 1, card; i >= 0 && (card = stack.cards[i]); i--) {
				if (!cards.length) {
					/* We always get at least one card */
					cards.unshift(card);
					continue;
				}

				if (card[1] != cards[0][1] + 1) {
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
	}

	return([]);
},

tapOnCards: function(stack, card)
{
	switch (stack.container.className) {
		case "free":
		case "tableau":
			enyo.job.stop("autoPlay");

			this.autoPlay(stack, card, null, true);
			break;
	}
},

isCardFree: function(card)
{
	if (card[1] <= 2) {
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

		Foundations are prefered, followed by tableaux with cards, empty free
		cells, and finally empty tableaux.

		An empty tableau allows making much larger moves, so avoid filling them.
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
				if (s.cards.length > 0) {
					destinations.push(s);
				}
			}

			/*
				If moving more than one card then an empty tableau is preferable
				to an empty freecell, since the freecell can only hold one card.
			*/
			if (card && card != last) {
				for (var i = 1, s; s = this.$["tableau" + i]; i++) {
					if (s.cards.length == 0) {
						destinations.push(s);
						break;
					}
				}
			}

			/*
				If the card is not "free" then the foundations should only be
				tried AFTER other tableaux have been tried.
			*/
			if ((!card || last == card) && !this.isCardFree(last)) {
				for (var i = 1, s; s = this.$["foundation" + i]; i++) {
					destinations.push(s);
				}
			}

			/*
				Only include the first empty free cell, and do not include any
				free cells if the source is a free cell.  There is no reason to
				jump back and forth from one to another.
			*/
			if ("free" != stack.container.className) {
				for (var i = 1, s; s = this.$["free" + i]; i++) {
					if (s.cards.length == 0) {
						destinations.push(s);
						break;
					}
				}
			}

			/*
				Finally allow moving to the first empty tableau.  This is last
				because it makes the biggest impact on the number of cards a
				player can move.
			*/
			if (!card || card == last) {
				for (var i = 1, s; s = this.$["tableau" + i]; i++) {
					if (s.cards.length == 0) {
						destinations.push(s);
						break;
					}
				}
			}
		}
	}

	return(this.inherited(arguments));
},

moveCards: function()
{
	this.highlightCards(false);
	this.inherited(arguments);

	if (this.inplay) {
		this.highlightCards(true);
	}

	if (this.history) {
		enyo.job("autoPlay", enyo.bind(this, this.tryAutoPlay), this.delay);
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


highlightCards: function(show)
{
	var card, last;

	if (this.dealing()) {
		return;
	}

	if (show && !this.prefs.highlight) {
		return;
	}

	/* Find the lowest card in play of each suit */
	for (var i = 1, s; s = this.$["foundation" + i]; i++) {
		if (s.cards && (last = s.cards.slice(-1)[0])) {
			card = this.findCard(last[0], last[1] + 1);
		} else {
			card = this.findCard(s.suit, 1);
		}

		if (card) {
			if (show) {
				card.highlight = 'images/highlight.png';
			} else {
				card.highlight = null;
			}
			this.placeCard(card);
		}
	}
},

tryAutoPlay: function()
{
	if (!this.history) {
		/* Don't autoplay while dealing, or while undoing history. */
		return;
	}

	if (this.prefs.autoPlay) {
		for (var i = 1, stack; stack = this.$["free" + i]; i++) {
			if (this.autoPlay(stack, null, null, false)) {
				return;
			}
		}
		for (var i = 1, stack; stack = this.$["tableau" + i]; i++) {
			if (this.autoPlay(stack, null, null, false)) {
				return;
			}
		}
	}
}

});

/* Alternate versions of freecell */

/*
	Like freecell, but any number of cards can be moved in a sequence even if
	there are not enough empty freecells and tableaux to allow the move.
*/
enyo.kind({
name:							"freecell",
kind:							"freecell_common",

/* Take the specified card out of the deck, and return it */
getCard: function(suitname, rank, deck)
{
	var suit	= enyo.indexOf(suitname, this.suits);
	var pos		= enyo.indexOf(this.findCard(suit, rank, deck), deck);

	return(deck.splice(pos, 1)[0]);
},

deal: function(gamenum)
{
	this.inherited(arguments);

	var deck = this.deck.slice(0);
	var top;
	var card;
	var t;

	if (isNaN(this.saveCards)) {
		this.saveCards = 0;
	}

	/*
		In Challenge and Super Challenge freecell the duces and aces should
		be dealt to the tableaux before any other cards.  This is intended
		to make the game harder.

		They should be dealt in a specific order: clubs, spades, hearts, diams
	*/
	if (this.challenge) {
		this.moveCard(this.getCard("clubs",	 1, deck), this.$.tableau1, true);
		this.moveCard(this.getCard("spades", 1, deck), this.$.tableau2, true);
		this.moveCard(this.getCard("hearts", 1, deck), this.$.tableau3, true);
		this.moveCard(this.getCard("diams",	 1, deck), this.$.tableau4, true);

		this.moveCard(this.getCard("clubs",	 2, deck), this.$.tableau5, true);
		this.moveCard(this.getCard("spades", 2, deck), this.$.tableau6, true);
		this.moveCard(this.getCard("hearts", 2, deck), this.$.tableau7, true);
		this.moveCard(this.getCard("diams",	 2, deck), this.$.tableau8, true);
	}

	/* Deal the cards to the tableaux */
	t = 0;
	while ((card = deck.shift())) {
		if (deck.length - this.saveCards < this.tableaux) {
			top = true;
		} else {
			top = false;
		}

		this.moveCard(card, this.$["tableau" + ((t++ % this.tableaux) + 1)], !top);

		if (deck.length <= this.saveCards) {
			/* Save the last x cards for a variant's deal */
			break;
		}
	}
}

});

enyo.kind({
	name:							"freecell:relaxed",
	kind:							"freecell",
	relaxed:						true
});


/*
	Like freecell, but the tableaux are built down in sequence in matching suit
	instead of alternating colors.
*/
enyo.kind({
	name:							"freecell:bakers",
	kind:							"freecell",
	inSuit:							true
});

enyo.kind({
	name:							"freecell:kings bakers",
	kind:							"freecell",
	inSuit:							true,
	kingsOnly:						true
});

enyo.kind({
	name:							"freecell:seahaven",
	kind:							"freecell:kings bakers",
	className:						"seahaven",
	cardWidth:						8,
	tableaux:						10,
	createFoundations:				false,

	create: function()
	{
		this.inherited(arguments);

		/* Reorganize the foundations to make them look nice */
		this.$.foundleft.destroyComponents();
		this.$.foundright.destroyComponents();

		this.$.foundleft.createComponents([
			{ kind: "CardStack", bgsrc: "clubs.png", name: "foundation1", offset: [ 0, 0 ], "suit": 0 },
			{ kind: "CardStack", bgsrc: "diams.png", name: "foundation2", offset: [ 0, 0 ], "suit": 1 },
			{ kind: "CardStack", bgsrc: "blank.png", name: "dummyleft"								}
		], { owner: this });

		this.$.foundright.createComponents([
			{ kind: "CardStack", bgsrc: "blank.png", name: "dummyright"							},
			{ kind: "CardStack", bgsrc: "hearts.png", name: "foundation3", offset: [ 0, 0 ], "suit": 2 },
			{ kind: "CardStack", bgsrc: "spades.png", name: "foundation4", offset: [ 0, 0 ], "suit": 3 }
		], { owner: this });

		/* Add the extra tableaux needed */
		this.$.tableau.createComponents([
			{ kind: "CardStack", name: "tableau9",	inplay: true },
			{ kind: "CardStack", name: "tableau10",	inplay: true }
		], { owner: this });
	},

	saveCards:						2,
	deal: function()
	{
		this.inherited(arguments);

		/* Move the last 2 cards to free cells */
		for (var i = this.deck.length - this.saveCards, t = 1, card; card = this.deck[i]; i++) {
			this.moveCard(card, this.$["free" + ++t]);
		}
	}
});




/*
	Like freecell, but the free cells are filled at the start with the last four
	cards in the deck, and empty tableaux can only be filled with a king.
*/
enyo.kind({
	name:							"freecell:forecell",
	kind:							"freecell",
	kingsOnly:						true,

	saveCards:						4,
	deal: function()
	{
		this.inherited(arguments);

		/* In forecell the last four cards should be be dealt to the free cells */
		for (var i = this.deck.length - this.saveCards, t = 0, card; card = this.deck[i]; i++) {
			this.moveCard(card, this.$["free" + ++t]);
		}
	}
});


/*
	Normal freecell, but the duces and aces are dealt before any other card to
	make it harder.
*/
enyo.kind({
	name:							"freecell:challenge",
	kind:							"freecell",
	challenge:						true
});


/* Like Challenge FreeCell, but with the kings only rule as well. */
enyo.kind({
	name:							"freecell:super",
	kind:							"freecell",
	challenge:						true,
	kingsOnly:						true
});

/*
	Relaxes freecell using 2 decks with 8 foundations, and 8 free cells.  The
	deal pattern is also different.  Each pile is started with a king.
*/
enyo.kind({

name:							"freecell:kings",
kind:							"freecell_common",
decks:							2,
relaxed:						true,
createFoundations:				false,

create: function()
{
	this.inherited(arguments);

	/* This game does not work in a horizontal layout - too many cards */
	enyo.setAllowedOrientation('left');

	/* Add the extra stacks that are required to deal with 2 decks */
	this.$.free.createComponents([
		{ kind: "CardStack", bgsrc: "basefree.png", name: "free5", inplay: true },
		{ kind: "CardStack", bgsrc: "basefree.png", name: "free6", inplay: true },
		{ kind: "CardStack", bgsrc: "basefree.png", name: "free7", inplay: true },
		{ kind: "CardStack", bgsrc: "basefree.png", name: "free8", inplay: true }
	], { owner: this });

	this.$.foundright.createComponents([
		{ kind: "CardStack", bgsrc: "clubs.png",  name: "foundation1", offset: [ 0, 0 ], "suit": 0 },
		{ kind: "CardStack", bgsrc: "diams.png",  name: "foundation2", offset: [ 0, 0 ], "suit": 1 },
		{ kind: "CardStack", bgsrc: "hearts.png", name: "foundation3", offset: [ 0, 0 ], "suit": 2 },
		{ kind: "CardStack", bgsrc: "spades.png", name: "foundation4", offset: [ 0, 0 ], "suit": 3 },
		{ kind: "CardStack", bgsrc: "clubs.png",  name: "foundation5", offset: [ 0, 0 ], "suit": 0 },
		{ kind: "CardStack", bgsrc: "diams.png",  name: "foundation6", offset: [ 0, 0 ], "suit": 1 },
		{ kind: "CardStack", bgsrc: "hearts.png", name: "foundation7", offset: [ 0, 0 ], "suit": 2 },
		{ kind: "CardStack", bgsrc: "spades.png", name: "foundation8", offset: [ 0, 0 ], "suit": 3 }
	], { owner: this });
},

deal: function(gamenum)
{
	this.inherited(arguments);

	var deck = this.deck.slice(0);
	var card;
	var stack;
	var t;
	var top;

	/* Find the first king */
	while (deck[0][1] != 13) {
		deck.push(deck.shift());
	}

	t = 0;
	while ((card = deck.shift())) {
		if (card[1] == 13) {
			/* Shift to the next tableau */
			stack = this.$["tableau" + (++t)];
		}

		if (deck.length < 1 || deck[0][1] == 13) {
			/* The next card is a king */
			top = true;
		} else {
			top = false;
		}

		this.moveCard(card, stack, !top);
	}
}

});

