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

name:						"spidercommon",
kind:						"Solitaire",

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
				className:	"dummy",
				name:		"dummy",
				kind:		enyo.Control,
				nodeTag:	"span"
			},

			{
				className:	"foundation",
				name:		"foundation",
				kind:		enyo.Control,
				nodeTag:	"span"
			}
		]
	},

	{
		className:			"tableau",
		name:				"tableau",
		kind:				enyo.Control
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
			caption:				"Rules",
			content: [
				"54 cards are dealt from 2 decks to 10 tableaux, with the top",
				"card of each face up.  The remaining cards are left in the",
				"deck and placed in the top left corner.\n",

				"Sequence in the tableaux can be built down by rank regardless",
				"of suit.  Cards may be moved as a sequence if they are all of",
				"the same suit.  An empty tableau may be filled with any",
				"card.\n",

				"When a sequence of 13 cards of the same suit (from king to",
				"ace) is built it may be moved to a foundation.\n",

				"Tapping on the deck will deal one card to each tableau.  If",
				"there are any empty tableaux then they must be filled before",
				"additional cards can be dealt form the deck."
			].join(" ")
		},

		{
			caption:				"Variants",
			content: [
				"In order to make the game easier it may be played with 1 or 2",
				"suits.  The total number of cards is not changed.\n",

				"Spiderette uses the exact same rules, but with 1 deck and 7",
				"tableaux.  Each tableau is dealt one more card than the one",
				"before it.\n",

				"Relaxed mode allows moving a stack of cards as long as they",
				"are all the same color.  Easy mode goes one step further and",
				"allows moving any stack of cards regardless of their color or",
				"suit."
			].join(" ")
		}
	]);
},

create: function()
{
	this.inherited(arguments);

	/*
		Create the right number of foundations, (8 for spider and 4 for
		spiderette) and set the correct suit images and values
	*/
	for (var i = 1; i <= this.count.foundation; i++) {
		var suit	= (i - 1) % this.suits.length;

		this.$.foundation.createComponent({
			kind:		"CardStack",
			bgsrc:		this.suits[suit] + ".png",
			name:		"foundation" + i,
			offset:		[ 0, 0 ],
			"suit":		suit
		}, { owner: this });
	}

	/* Create the correct number of tableaux (10 for spider, 7 for spiderette) */
	for (var i = 1; i <= this.count.tableau; i++) {
		this.$.tableau.createComponent({
			kind:		"CardStack",
			inplay:		true,
			name:		"tableau" + i
		}, { owner: this });
	}

	/* Create the correct number of dummy stacks too */
	for (var i = 1; i <= this.count.dummy; i++) {
		this.$.dummy.createComponent({
			kind:		"CardStack",
			inplay:		false,
			name:		"dummy" + i,
			offset:		[ 0, 0 ]
		}, { owner: this });
	}
},

allowAddingCards: function(stack, cards, from, first)
{
	switch (stack.container.className) {
		case "foundation":
			/*
				Cards can only be moved to a foundation as a full suite, meaning
				king through ace of the same suit.
			*/
			if (stack.cards.length > 0) {
				/* This foundation is already full */
				return([]);
			}

			cards = cards.slice(-13);

			if (cards.length != 13) {
				return([]);
			}

			var card;
			var match = cards[0][1];

			if (cards[0][0] != stack.suit) {
				return([]);
			}

			for (var i = 1; i < 13; i++) {
				match--;

				while (this.allowWrap && match < 1) {
					match += 13;
				}

				if (cards[i][1] != match || cards[i][0] != stack.suit) {
					return([]);
				}
			}

			return(cards);

		case "tableau":
			/*
				Just check that the last card of the existing stack matches the
				first card of the stack being added.  Everything else has
				already been checked.
			*/
			var last;

			if (!(last = stack.cards.slice(-1)[0])) {
				/* Any cards can be added to an empty tableau */
				if (first) {
					/* Only move the cards that the user drug */
					var f;

					if (-1 != (f = enyo.indexOf(first, cards))) {
						cards = cards.slice(f);
					}
				}

				return(cards);
			}

			var match = last[1] - 1;

			while (this.allowWrap && match < 1) {
				match += 13;
			}

			while (cards.length > 0) {
				if (match != cards[0][1]) {
					cards.shift();
					continue;
				}

				break;
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
			break;

		case "tableau":
			/*
				Cards must be decending sequentially in rank, and must be of the
				same suit.
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

				if (this.easy) {
					/* Allow taking any cards, regardless of suit or color */
					;
				} else if (this.relexed) {
					/* Allow taking cards with matching colours */
					if (!colorsMatch(card, cards[0])) {
						break;
					}
				} else if (card[0] != cards[0][0]) {
					/* Cards must match suit */
					break;
				}

				var match = card[1] - 1;

				while (this.allowWrap && match < 1) {
					match += 13;
				}

				if (match != cards[0][1]) {
					break;
				}

				cards.unshift(card);
			}

			return(cards);

		default:
			break;
	}

	return([]);
},

tapOnCards: function(stack, card)
{
	this.inherited(arguments);

	switch (stack.container.className) {
		case "tableau":
			this.autoPlay(stack, card, null, true);
			break;

		default:
			if (stack.name == "deck") {
				this.draw();
			}
			break;
	}
},

draw: function()
{
	if (this.dealing()) {
		return;
	}

	/*
		Deal one card to each tableau.  This is not allowed if there
		are any empty tableaux.

		This has to be done as a single operation.
	*/
	var to;

	if (!this.drawOnEmpty) {
		for (var i = 1; to = this.$["tableau" + i]; i++) {
			if (to.cards.length == 0) {
				return;
			}
		}
	}

	this.beginMove();
	for (var i = 1; to = this.$["tableau" + i]; i++) {
		if (to.cards.length > 0) {
			this.moveCards(this.$.deck.cards.slice(-1), to, false, false);
		}
	}
	this.endMove();
},

moveCards: function(cards, stack)
{
	this.inherited(arguments);

	var topcard;

	if (!this.history || !this.history.length) {
		/* Don't autoplay while dealing, or while undoing history. */
		return;
	}

	/* Flip the top card of the tableau if it is hidden */
	for (var i = 1, t; t = this.$["tableau" + i]; i++) {
		if ((topcard = t.cards.slice(-1)[0]) && topcard[2]) {
			this.flipCard(topcard, false, this.delay);

			/*
				Mark the record in the history so that we know to unflip on
				an undo.
			*/
			this.history[this.history.length - 1].flipped	= true;
			this.history[this.history.length - 1].safe		= false;
		}
	}

	if (this.prefs.autoPlay) {
		/*
			Attempt to move any complete stacks to the foundations.  This call
			must be greedy since a specific card isn't specified, meaning that
			the we should attempt to move the whole stack.
		*/
		this.autoPlay(stack, null, null, false, true);
	}
},

autoPlay: function(stack, card, destinations, human, greedy)
{
	var last	= stack.cards[stack.cards.length - 1];
	var cards	= this.allowTakingCards(stack);
	var topcard;

	if (!destinations) {
		destinations = [];

// TODO	Why isn't auto play to a foundation working (at least in divorce)?
		/* Try moving a whole stack to a foundation first */
		for (var i = 1, s; s = this.$["foundation" + i]; i++) {
			destinations.push(s);
		}

		if (human) {
			/* Start with any tableaux where the top is the same suit */
			for (var i = 1, s; s = this.$["tableau" + i]; i++) {
				if ((topcard = s.cards.slice(-1)[0]) &&
					topcard[0] == (card || last)[0]
				) {
					destinations.push(s);
				}
			}

			/* Next try any tableaux where the top does not match suit */
			for (var i = 1, s; s = this.$["tableau" + i]; i++) {
				if ((topcard = s.cards.slice(-1)[0]) &&
					topcard[0] != (card || last)[0]
				) {
					destinations.push(s);
				}
			}

			/* Finally try any empty tableaux */
			for (var i = 1, s; s = this.$["tableau" + i]; i++) {
				if (s.cards.length == 0) {
					destinations.push(s);
				}
			}
		}
	}

	return(this.inherited(arguments));
},

undo: function()
{
	var last;

	/*
		Normally the history doesn't undo secondary actions, like flipping a
		card.  It needs to be flipped back on an undo though.
	*/
	if (this.history && (last = this.history.slice(-1)[0]) &&
		last.flipped && last.from
	) {
		var stack	= this.$[last.from];
		var card;

		if (stack.cards && stack.cards.length &&
			(card = stack.cards[stack.cards.length - 1 ])
		) {
			this.flipCard(card, true);
		}
	}

	this.inherited(arguments);
},

score: function(e)
{
	this.inherited(arguments);

	var nodraw = false;

	if (this.$.deck.cards.length > 0) {
		if (!this.drawOnEmpty) {
			for (var i = 1, to; to = this.$["tableau" + i]; i++) {
				if (to.cards.length == 0) {
					nodraw = true;
					break;
				}
			}
		}
	} else {
		nodraw = true;
	}

	e.actions.push({
		name:		"draw",
		icon:		"images/toolbar-icon-draw1.png",
		wide:		true,
		disabled:	nodraw
	});
}



});

/* Alternate versions of spider */

enyo.kind(
{

name:							"spider",
kind:							"spidercommon",
className:						"spider",

count: {
	tableau:					10,
	foundation:					8,
	dummy:						1
},
decks:							2,
cardWidth:						8,

deal: function(gamenum)
{
	this.inherited(arguments);

	var deck = this.deck.slice(0);

	/* Deal 1 card to every 3rd tableau */
	for (var i = 0; i < 4; i++) {
		this.moveCard(deck.shift(), this.$["tableau" + ((i * 3) + 1)], true, true);
	}

	/* Deal 40 more cards to the tableaux face down */
	for (var i = 0; i < 40; i++) {
		this.moveCard(deck.shift(), this.$["tableau" + ((i % 10) + 1)], true, true);
	}

	/* Deal 10 more cards to the tableaux face up */
	for (var i = 0; i < 10; i++) {
		this.moveCard(deck.shift(), this.$["tableau" + ((i % 10) + 1)], false, false);
	}

	/* Put the remaining 50 cards in the deck face down */
	this.moveCards(deck, this.$.deck, true, true);
}

});

enyo.kind({
	name:							"spider:4 suits",
	kind:							"spider"
});


enyo.kind({
	name:							"spider:2 suits",
	kind:							"spider",

	decks:							4,
	suits:							[ 'hearts',	'spades' ]
});

enyo.kind({
	name:							"spider:1 suit",
	kind:							"spider",

	decks:							8,
	suits:							[ 'spades' ]
});

enyo.kind({
	name:							"spider:relaxed",
	kind:							"spider",
	relaxed:						true
});


enyo.kind({
	name:							"spider:easy",
	kind:							"spider",
	easy:							true
});


/*
	Grounds for a divorce is just like spider, but allows cards to wrap, and
	allows drawing with an empty tableau (which won't get a card).
*/
enyo.kind({
	name:							"spider:divorce 4 suits",
	kind:							"spider",

	drawOnEmpty:					true,
	allowWrap:						true
});

enyo.kind({
	name:							"spider:divorce 2 suits",
	kind:							"spider",

	decks:							4,
	suits:							[ 'hearts',	'spades' ],

	drawOnEmpty:					true,
	allowWrap:						true
});

enyo.kind({
	name:							"spider:divorce 1 suit",
	kind:							"spider",

	decks:							8,
	suits:							[ 'hearts' ],

	drawOnEmpty:					true,
	allowWrap:						true
});



/*
	Spiderette behaves exactly like spider, except with 7 tableaux with a
	klondike like deal pattern and a single deck.
*/
enyo.kind(
{
name:							"spiderette",
className:						"spiderette",
kind:							"spidercommon",

cardWidth:						12,
decks:							1,

count: {
	tableau:					7,
	foundation:					4,
	dummy:						2
},

deal: function()
{
	this.inherited(arguments);

	var deck = enyo.cloneArray(this.deck);
	var card;

	/* Deal the cards to the tableaux */
	var stacks = [];

	for (var i = 1, t; t = this.$["tableau" + i]; i++) {
		stacks.push(t);
	}

	for (var c = stacks.length - 1; c >= 0; c--) {
		for (var i = c, t; t = stacks[i]; i++) {
			card = deck.shift();

			/*
				Place all but the top card in each tableau face down (unless
				this is a "thoughtful" game).
			*/
			if (!this.thoughtful && c > 0) {
				card[2] = true;
			}

			this.moveCard(card, t, card[2]);
		}
	}

	/* Put the rest of the cards in the deck face down */
	this.moveCards(deck, this.$.deck, true, true);
}
});


enyo.kind({
	name:							"spiderette:4 suits",
	kind:							"spiderette"
});

enyo.kind({
	name:							"spiderette:2 suits",
	kind:							"spiderette",

	decks:							2,
	suits:							[ 'hearts',	'spades' ]
});

enyo.kind({
	name:							"spiderette:1 suit",
	kind:							"spiderette",

	decks:							4,
	suits:							[ 'hearts' ]
});

enyo.kind({
	name:							"spiderette:relaxed",
	kind:							"spiderette",
	relaxed:						true
});


enyo.kind({
	name:							"spiderette:easy",
	kind:							"spiderette",
	easy:							true
});


