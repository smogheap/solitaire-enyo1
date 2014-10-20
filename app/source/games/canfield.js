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

name:						"canfield",
className:					"canfield",
kind:						"Solitaire",

cardWidth:					12,
startRank:					1,
redeal:						-1,
drawcount:					3,
fillempty:					true,

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
				style:		"opacity: 0.4;",

				components: [
					{ kind:	"CardStack", name: "foundation1", offset: [ 0, 0 ], "suit": 0 },
					{ kind:	"CardStack", name: "foundation2", offset: [ 0, 0 ], "suit": 1 },
					{ kind:	"CardStack", name: "foundation3", offset: [ 0, 0 ], "suit": 2 },
					{ kind:	"CardStack", name: "foundation4", offset: [ 0, 0 ], "suit": 3 }
				]
			}
		]
	},

	{
		kind:				enyo.Control,
		nodeTag:			"div",

		components: [
			{
				name:		"reserve",
				offset:		[ 0, 10 ],
				kind:		"CardStack",
				bgsrc:		"base.png",
				inplay:		true
			},

			{
				offset:		[ 0, 0 ],
				kind:		"CardStack",
				bgsrc:		"blank.png",
				inplay:		false
			},

			{
				offset:		[ 0, 0 ],
				kind:		"CardStack",
				bgsrc:		"blank.png",
				inplay:		false
			},

			{
				className:			"tableau",
				name:				"tableau",
				kind:				enyo.Control,
				nodeTag:			"span",

				components: [
					{ kind:			"CardStack", name: "tableau1", inplay: true, bgsrc: "base.png" },
					{ kind:			"CardStack", name: "tableau2", inplay: true, bgsrc: "base.png" },
					{ kind:			"CardStack", name: "tableau3", inplay: true, bgsrc: "base.png" },
					{ kind:			"CardStack", name: "tableau4", inplay: true, bgsrc: "base.png" }
				]
			}
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
				"The game is started by dealing 13 cards to the reserve, 1",
				"card face up to each tableau, and 1 card to the foundation.",
				"The remaining cards are left in the deck.\n",

				"The 1 card that was played to the foundation sets the",
				"starting rank for the game.  The first card played on the 3",
				"remaining foundations must match the rank of that card."
			].join(" ")
		},

		{
			caption:				"Rules",
			content: [
				"Sequences can be built in the tableaux by building down by",
				"alternate color.\n",

				"The foundations are built up by suit.  The starting card is",
				"determined by the rank of the card that is automatically",
				"dealt to the foundation at the beginning of the game.\n",

				"Tapping the deck will flip 3 cards and place them face up in",
				"a pile next to the deck called the waste.  The top card of",
				"the waste may be played on the foundations or the tableaux.\n",

				"The 13 cards below the deck make up the reserve.  The top",
				"card of the reserve may be played to the foundations or the",
				"tableaux."
			].join(" ")
		},

		{
			caption:				"Scoring",
			content: [
				"The game is started by buying a deck for $52.  Ever card",
				"placed into the foundation earns you $5.  Since one card is",
				"automatically placed in the founcation when the game is dealt",
				"you begin each game with $-47."
			].join(" ")
		}
	]);
},

allowAddingCards: function(stack, cards, from)
{
	switch (stack.container.className) {
		case "foundation":
			var card;
			var last;

			if (!(card = cards.slice(-1)[0]) || card[0] != stack.suit) {
				break;
			}

			if (!(last = stack.cards.slice(-1)[0])) {
				/*
					The first card in each foundation must match the value of
					the card that was flipped during the deal.
				*/
				if (this.startRank == card[1]) {
					return([ card ]);
				}
				break;
			}

			/* Card ranks must ascend, and may wrap */
			if (((last[1] + 1) % 13) == (card[1] % 13)) {
				return([ card ]);
			}
			break;

		case "tableau":
			if (!(last = stack.cards.slice(-1)[0])) {
				/*
					An empty tableau will automatically be filled from the
					reserve. If the reserve is empty then any card may be added.
				*/
				if (0 == this.$.reserve.cards.length ||
					(from && from.name == "reserve")
				) {
					return(cards);
				}
				break;
			}

			/*
				To be moved cards must already been in the right order, so just
				throw away cards until a match is found and the rest can be
				assumed to be a match.
			*/
			for (cards = cards.slice(0); cards.length; cards.shift()) {
				if (this.cardsMatch(last, cards[0]) &&
					((last[1] - 1) % 13) == (cards[0][1] % 13)
				) {
					/* We found a match */
					return(cards);
				}
			}

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
			var cards = stack.cards.slice(0).reverse();

			for (var i = 0, a, b; (a = cards[i]) && (b = cards[i + 1]); i++) {
				if (b[2]) {
					/* Ignore cards that are face down */
					break;
				}

				if (!this.cardsMatch(a, b)) {
					break;
				}

				if ((a[1] % 13) != ((b[1] - 1) % 13)) {
					break;
				}
			}

			return(cards.slice(0, i + 1).reverse());

		default:
			switch (stack.name) {
				case "deck":
					break;

				case "reserve":
				case "waste":
					return(stack.cards.slice(-1));
			}
			break;
	}

	return([]);
},

tapOnCards: function(stack, card)
{
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
				case "reserve":
					this.autoPlay(stack, card, null, true);
					break;
			}
			break;
	}
},

draw: function()
{
	var from;

	if ((from = this.$.deck.cards) && from.length) {
		/*
			The cards that are already in the waste should not be fanned out.
			Only the new cards should be.
		*/
		this.$.waste.wasteIgnore	= this.$.waste.offsetIgnore;
		this.$.waste.offsetIgnore	= this.$.waste.cards.length;

		for (var i = 0, card; card = this.$.waste.cards[i]; i++) {
			card.moving = false;
			this.placeCard(card, undefined, undefined, undefined, true);
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
			There is no useful reason to keep a card around if it is the base or
			one off from it.
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
			if (this.cardsMatch(card, i)) {
				suits.push(i);
			}
		}
	} else {
		suits.push(card[0]);
	}

	var c;
	var rank = card[1] - 1;

	/* Wrap */
	if (rank == 0) {
		rank = 13;
	}

	for (var i = 0; i < suits.length; i++) {
		if ((c = this.findCard(suits[i], rank))) {
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

		Foundations are prefered, followed by tableaus with cards, and finally
		empty tableaus.

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
				if (s.cards.length > 0) {
					destinations.push(s);
				}
			}

			if (!this.kingsOnly || last[1] == 13) {
				for (var i = 1, s; s = this.$["tableau" + i]; i++) {
					if (s.cards.length == 0) {
						destinations.push(s);
						break;
					}
				}
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

deal: function(gamenum)
{
	this.inherited(arguments);

	var deck = this.deck.slice(0);
	var base;

	/* Pull one card off the end for the foundation */
	base = deck.shift();

	/* Deal 12 cards to the reserve, the last should be face up */
	this.moveCards(deck.splice(0, 12), this.$.reserve, true, true);
	this.moveCard(deck.shift(), this.$.reserve, true, false);

	/* Deal 1 card to each tableau (backwards) */
	for (var i = 4, t; t = this.$["tableau" + i]; i--) {
		this.moveCard(deck.shift(), t);
	}

	if (this.prefs.autoPlay) {
		this.moveCards(deck.splice(0, this.drawcount), this.$.waste);
	}

	/* Put the rest of the cards in the deck face down */
	this.moveCards(deck.reverse(), this.$.deck, true, true, true);

	for (var i = 1, f; f = this.$["foundation" + i]; i++) {
		if (base[0] == f.suit) {
			this.moveCard(base, f);
		}

		f.setSrc(this.getCardSrc([ f.suit, base[1] ]));
	}
	this.startRank = base[1];
},

moveCards: function()
{
	this.inherited(arguments);

	if (!this.history) {
		/* Don't autoplay while dealing, or while undoing history. */
		return;
	}

	var card;

	/* Fill any empty tableaus from the reserve */
	if (this.fillempty) {
		for (var i = 1, t; t = this.$["tableau" + i]; i++) {
			if (0 == t.cards.length && (card = this.$.reserve.cards.slice(-1)[0])) {
				this.moveCard(card, t, false, false);

				/*
					The user is not allowed to undo this without undoing the move
					that caused it.
				*/
				this.mergeMoves();
			}
		}
	}

	/* Flip the top card of the reserve if it is facedown */
	if ((card = this.$.reserve.cards.slice(-1)[0])) {
		this.flipCard(card, false, this.delay * 2);

		/* Mark this in the history so we can undo it */
		this.history.slice(-1)[0].flipped	= [ "reserve" ];
		this.history.slice(-1)[0].safe		= false;
	}

	if (this.prefs.autoPlay) {
		// TODO Autoplay
	}
},

undo: function()
{
	var last;
	var from;
	var card;

	/*
		Normally the history doesn't undo secondary actions, like flipping a
		card.  It needs to be flipped back on an undo though.
	*/
	if (this.history && (last = this.history.slice(-1)[0])) {
		if (last.flipped && (from = this.$[last.flipped])) {
			if ((card = from.cards.slice(-1)[0])) {
				this.flipCard(card, true);
			}
		}

		if (last.wasteIgnore) {
			this.$.waste.offsetIgnore = last.wasteIgnore;

			for (var i = 0, card; card = this.$.waste.cards[i]; i++) {
				this.placeCard(card);
			}
		}
	}

	this.inherited(arguments);
},

cardsMatch: function(carda, cardb)
{
	/* In rainbow color and suit don't matter */
	if (this.rainbow) {
		return(true);
	}

	if (this.bysuit) {
		return(carda[0] == cardb[0]);
	}

	/* By default colors should alternate */
	return(!this.colorsMatch(carda, cardb));
},

score: function(e)
{
	this.inherited(arguments);

	/*
		In canfield a deck costs $52, and the player gets $5 for each card
		played to a foundation.
	*/
	var score = -52;

	for (var i = 1, stack; stack = this.$["foundation" + i]; i++) {
		score += stack.cards.length * 5;
	}

	e.score = score;
	e.online = -score;

	var icon;
	switch (this.drawcount) {
		default:
		case 1:		icon = "images/toolbar-icon-draw1.png";	break;
		case 3:		icon = "images/toolbar-icon-draw3.png";	break;
	}

	if (this.$.deck.cards.length > 0) {
		e.actions.push({
			name:		"draw",
			// caption:	$L("Draw") + " " + this.drawcount,
			icon:		icon,
			wide:		true
		});
	} else {
		e.actions.push({
			name:		"draw",
			// caption:	$L("Flip Deck"),
			icon:		"images/toolbar-icon-flipdeck.png",
			wide:		true,
			disabled:	(this.redeal == 0)
		});
	}
},

scoreStr: function(e, total)
{
	if (isNaN(e.score) && !isNaN(e.online)) {
		e.score = -e.online;
	}

	if (total) {
		return($L("Total") + ": $" + e.score);
	} else {
		if (this.total) {
			return($L("$") + e.score + ", " +
					$L("Total") + ": $" + (this.total.score + e.score));
		} else {
			/*
				We don't know the total yet, so ask the stats view to load it so
				that we can display it once we do.

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

/* Is this score a win? */
scoreWin: function(e)
{
	if (e.score >= 0) {
		return(true);
	} else {
		return(false);
	}
}

});

/* Alternate versions of canfield */
enyo.kind({
	name:							"canfield:draw 1",
	kind:							"canfield",
	drawcount:						1
});

enyo.kind({
	name:							"canfield:rainfall",
	kind:							"canfield",
	drawcount:						1,
	redeal:							2
});

enyo.kind({
	name:							"canfield:rainbow",
	kind:							"canfield",

	drawcount:						1,
	redeal:							0,
	rainbow:						true
});

enyo.kind({
	name:							"canfield:storehouse",
	kind:							"canfield",

	drawcount:						1,
	redeal:							2,
	bysuit:							true
});

enyo.kind({
	name:							"canfield:superior",
	kind:							"canfield",

	fillempty:						false,
	viewreserve:					true
});

// TODO	Add the variants to the help

