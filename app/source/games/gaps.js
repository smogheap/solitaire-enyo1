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

name:						"gaps_common",
className:					"gaps",
kind:						"Solitaire",

cardWidth:					7,
rows:						4,
columns:					13,

onDealDone:					"dealDone",

components: [
	{
		name:				"NoMoves",
		kind:				"ModalDialog",

		caption:			$L("No remaining moves"),

		components: [
			{
				kind:		"Button",
				name:		"ShuffleButton",
				caption:	$L("Shuffle Cards"),
				value:		"reshuffle",
				onclick:	"noMovesAction"
			},
			{
				kind:		"Button",
				caption:	$L("Undo last move"),
				value:		"undo",
				onclick:	"noMovesAction"
			},
			{
				kind:		"Button",
				caption:	$L("Restart this hand"),
				value:		"restart",
				onclick:	"noMovesAction"
			},
			{
				kind:		"Button",
				caption:	$L("Deal a new hand"),
				value:		"newdeal",
				onclick:	"noMovesAction"
			},
			{
				kind:		"Button",
				caption:	$L("Play a different game"),
				value:		"newgame",
				onclick:	"noMovesAction"
			}
		]
	}
],

getHelp: function()
{
	return([
		{
			caption:				"Goal",
			content: [
				"Sort the cards into sets of 12 cards ascending by suit from 2",
				"to king."
			].join(" ")
		},

		{
			caption:				"Layout",
			content: [
				"The cards are shuffled, then dealt into 4 equal rows with 13",
				"cards each.  The aces are then removed leaving 4 gaps."
			].join(" ")
		},

		{
			caption:				"Rules",
			content: [
				"A card may be moved to a gap if it is the same suit and one",
				"greater in rank as the card to the left of the gap.  The",
				"left most card must be filled with a 2.\n",

				"A gap can not be filled if it is to the right of a king",
				"because no card has a higher rank than a king.\n",

				"When there are no moves remaining you may shuffle all cards",
				"that are not in sequence.  The gaps will be placed at the end",
				"of each row.",

				"You may shuffle 2 times."
			].join(" ")
		},

		{
			caption:				"Variants",
			content: [
				"Spaces is exactly the same as Gaps, except that the aces are",
				"are put back into the deck when reshuffling, and then removed",
				"again afterwards.  This leaves the gaps in random locations",
				"instead of being at the end of the row.",

				"Addiction is exactly the same as Spaces, except that it",
				"allows 3 shuffles instead of 2.\n",

				"Spaces is exactly the same as Gaps, except that the gaps are",
				"placed randomly, making it more difficult.\n",

				"Relaxed Gaps and Relaxed Spaces allow unlimited shuffles."
			].join(" ")
		}
	]);
},

tableauName: function(column, row)
{
	return("tableau" + column + "-" + row);
},

getTableau: function(column, row)
{
	var name;

	if ((name = this.tableauName(column, row))) {
		return(this.$[name]);
	} else {
		return(null);
	}
},

create: function()
{
	this.inherited(arguments);

	this.shufflesUsed = 0;

	for (var r = 1; r <= this.rows; r++) {
		for (var c = 1; c <= this.columns; c++) {
			this.createComponent({
				kind:			"CardStack",
				name:			this.tableauName(c, r),
				inplay:			true,
				bgsrc:			"blank.png",
				row:			r,
				column:			c,

				offset:			[ 0, 0 ]
			}, { owner: this });
		}
	}

	this.createComponent({
		kind:		"CardStack",
		name:		"foundation",
		hidden:		true
	});
},

allowAddingCards: function(stack, cards)
{
	this.inherited(arguments);

	if (stack.name == "founcation") {
		return([]);
	}

	/*
		Rules for adding a card to a stack:
			- Stack must be empty (you can only move cards to a "gap")
			- The card in the stack to the left must be the same suit and one
			  lower in rank.  The left most gap can only be filled with a 2.
	*/
	var card;
	var left;

	if (!(card = cards.slice(-1)[0]) || stack.cards.length > 0) {
		return([]);
	}

	if (stack.column == 0 && card[1] == 2) {
		/* 2 can be added to the far left gap */
		return([ card ]);
	}

	if (stack.column > 1 &&
		(left = this.getTableau(stack.column - 1, stack.row).cards.slice(-1)[0]) &&
		(left[1] + 1) == card[1]
	) {
		return([ card ]);
	}

	return([]);
},

allowTakingCards: function(stack)
{
	this.inherited(arguments);

	if (stack.name == "founcation") {
		return([]);
	}

	/* There can never be more than one card in a stack */
	return(stack.cards.slice(-1));
},

tapOnCards: function(stack)
{
	var card;
	var left;
	var t;

	this.inherited(arguments);

	if (stack.name == "founcation") {
		return;
	}

	if (!(card = stack.cards.slice(-1)[0])) {
		/*
			Find the card that should go here, and move it here.

			If this is the left most column then find a 2 that isn't already in
			this column.
		*/
		while (stack.column > 1) {
			if ((t = this.getTableau(stack.column - 1, stack.row)) &&
				0 == t.cards.length
			) {
				stack = t;
			} else {
				break;
			}
		}

		if (stack.column == 1) {
			for (var i = 0; i < this.suits.length; i++) {
				if ((card = this.findCard(i, 2))) {
					if (card.stack.column != 1) {
						this.moveCard(card, stack);
						return;
					}
				}
			}

			return;
		}

		if ((t = this.getTableau(stack.column - 1, stack.row)) &&
			(left = t.cards.slice(-1)[0]) &&
			(card = this.findCard(left[0], left[1] + 1))
		) {
			this.moveCard(card, stack);
		}

		return;
	}

	if (card[1] == 2) {
		/* This card must go in the first column of any row */
		for (var r = 1; r <= this.rows; r++) {
			stack = this.getTableau(1, r);

			if (stack.cards.length == 0) {
				this.moveCard(card, stack);
				return;
			}
		}

		return;
	}

	if ((left = this.findCard(card[0], card[1] - 1))) {
		/* Find the stack to the right of the card */
		if ((stack = this.getTableau(left.stack.column + 1, left.stack.row)) &&
			stack.cards.length == 0
		) {
			this.moveCard(card, stack);
			return;
		}
	}
},

deal: function(gamenum)
{
	var cards;
	var card;

	this.inherited(arguments);

	cards = this.deck.slice(0);

	/*
		Deal 1 card to each tableau

		All aces should be removed from play, and the stacks that they would
		have been placed in are left empty, leaving a gap.

		Place the aces in a hidden foundation stack.

		Only animate the last 10 cards.
	*/
	for (var r = 1; r <= this.rows; r++) {
		for (var c = 1; c <= this.columns; c++) {
			card = cards.shift();

			if (card[1] != 1) {
				this.moveCard(card, this.getTableau(c, r),
					cards.length > 10, false);
			} else {
				this.moveCard(card, this.$.foundation);
			}
		}
	}
},

reshuffle: function()
{
	if (!this.history || this.moving) {
		/* Wait a gosh darn minute, I'm busy */
		return;
	}

	if (!isNaN(this.shuffleCount) && this.shuffleCount <= 0) {
		/* You are done! */
		return;
	}

	this.doBusyStart();

	setTimeout(enyo.bind(this, function() {
		this.shuffleCount--;

		/* Collect all cards that aren't in sequence */
		var cards = [];
		var stack;
		var card;
		var first;
		var c;

		for (var r = 1; r <= this.rows; r++) {
			first = null;

			for (c = 1; c <= this.columns; c++) {
				stack = this.getTableau(c, r);

				if (!(card = stack.cards.slice(-1)[0])) {
					/* Break it the cards, done */
					break;
				}

				if (card[1] != c + 1) {
					/* Rank not in sequence, done */
					break;
				}

				if (c == 1) {
					first = card;
				} else if (!first || first[0] != card[0]) {
					/* Suit doesn't match, done */
					break;
				}
			}

			/* The rest of the cards get shuffled */
			for (; c <= this.columns; c++) {
				stack = this.getTableau(c, r);

				if ((card = stack.cards.slice(-1)[0])) {
					cards.push(card);
				}
			}
		}

		/*
			Put the aces back in the deck before shuffling.  Then remove them again
			when redealing so leave random gaps, instead of gaps on the far right.
		*/
		if (this.movegaps) {
			for (var i = 0; card = this.$.foundation.cards[i]; i++) {
				cards.push(card);
			}
		}

		WRand.setSeed(this.gamenum + (++this.shufflesUsed));
		cards = WRand.shuffle(cards);

		/*
			Redeal the cards

			Move them all to the foundation to start, and then move them to their
			new shiny homes.

			Use multiple levels of beginMove/endMove to force the undo order to be
			correct.
		*/
		this.beginMove();

		this.beginMove();
		for (var i = 0; card = cards[i]; i++) {
			this.moveCard(card, this.$.foundation, true);
		}
		this.endMove();

		var columns = this.columns;

		if (!this.movegaps) {
			columns--;
		}

		this.highlightCards(false);
		this.reshuffling = true;

		this.beginMove();
		for (var r = 1; r <= this.rows; r++) {
			for (var c = 1; c <= columns; c++) {
				stack = this.getTableau(c, r);

				if (stack.cards.length) {
					continue;
				}

				card = cards.shift();

				if (card[1] != 1) {
					this.moveCard(card, stack, true, false);
				}
			}
		}
		this.endMove();

		this.reshuffling = false;
		this.highlightCards(true);

		this.endMove();
		this.history.slice(-1)[0].shuffled = true;

		this.doBusyEnd();
	}), 500);
},

countInPlay: function()
{
	/*
		Figure out how many cards are "in play".  Count cards from the stack of
		each row that are in sequence and subtract that from 48 (one deck minus
		the aces).
	*/
	var inplay = 48;
	var card, last;

	for (var r = 1; r <= this.rows; r++) {
		last = null;

		for (var c = 1; c <= this.columns; c++) {
			if (!(card = this.getTableau(c, r).cards.slice(-1)[0])) {
				break;
			}

			if (last && last[0] != card[0]) {
				break;
			}

			if (card[1] - 1 != c) {
				break;
			}

			inplay--;
			last = card;
		}
	}

	return(inplay);
},

doCardsMoved: function(e)
{
	var title = $L("Shuffle");

	if (!isNaN(this.shuffleCount)) {
		title += " (" + this.shuffleCount + ")";
	}

	e.inplay = this.countInPlay();
	e.actions.push({
		name:		"reshuffle",
		caption:	title,
		disabled:	(!isNaN(this.shuffleCount) && this.shuffleCount <= 0)
	});

	this.inherited(arguments);
},

isActive: function(e)
{
	if (this.countInPlay() <= 0) {
		return(false);
	}

	return(this.inherited(arguments));
},

undo: function()
{
	/*
		If the action being undone was a shuffle then give the user his shuffle
		back.  Wouldn't be nice to just take it away (and it would change the
		seed so it wouldn't be predictable from then on).
	*/
	if (!isNaN(this.shuffleCount) && this.history &&
		(last = this.history.slice(-1)[0]) && last.shuffled
	) {
		this.shuffleCount++;
		this.shufflesUsed--;
	}

	this.inherited(arguments);
},

dealDone: function()
{
	this.inherited(arguments);
	this.highlightCards(true);
},

moveCards: function()
{
	var cards;
	var c;

	if (!this.reshuffling) {
		this.highlightCards(false);
	}

	this.inherited(arguments);

	if (this.inplay && !this.reshuffling) {
		this.highlightCards(true);
	}
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
	var stack;
	var card;
	var count = 0;

	if (this.dealing()) {
		return;
	}

	for (var r = 1; r <= this.rows; r++) {
		for (var c = 1; c <= this.columns; c++) {
			if (!(stack = this.getTableau(c, r)) || stack.cards.length) {
				/* The stack is not empty, move along */
				continue;
			}

			if (!(stack = this.getTableau(c - 1, r))) {
				/* The previous stack wasn't there, so we need any 2 */
				for (var i = 0; i < this.suits.length; i++) {
					if ((card = this.findCard(i, 2))) {
						card.highlighted = show;
						this.placeCard(card);

						count++;
					}
				}
			} else if (!stack.cards.length) {
				/* The previous stack was empty too */
				continue;
			} else {
				if (!(card = stack.cards.slice(-1)[0])) {
					/* huh? */
					continue;
				}

				if (!(card = this.findCard(card[0], card[1] + 1))) {
					/* Couldn't find a card one higher in rank */
					continue;
				}

				card.highlighted = (show && this.prefs.highlight);
				this.placeCard(card);

				count++;
			}
		}
	}

	if (show && count == 0 && this.countInPlay() > 0) {
		/* There are no moves left */
		this.$.NoMoves.openAtCenter();

		this.$.ShuffleButton.setDisabled(!isNaN(this.shuffleCount) && this.shuffleCount <= 0);
	}
},

noMovesAction: function(sender, e)
{
	this.$.NoMoves.close();

	switch (sender.value) {
		case "undo":
			this.undo();
			break;

		case "reshuffle":
			this.reshuffle();
			break;

		default:
			/* Send the event back up a level */
			this.doGameDone(sender.value);
			break;
	}
},

getMaxAspectRatio: function()
{
	/*
		There are no tall stacks to worry about, but if the cards get spread out
		too far then the layout looks weird.
	*/
	return(2);
}

});

/* Alternate versions of gaps */
enyo.kind({
	name:							"gaps",
	kind:							"gaps_common",
	shuffleCount:					2
});

enyo.kind({
	name:							"gaps:relaxed",
	kind:							"gaps_common",
	shuffleCount:					NaN
});

/*
	Spaces is exactly the same as gaps, except that on a shuffle the gaps are
	moved to random positions.
*/
enyo.kind({
	name:							"gaps:spaces",
	kind:							"gaps_common",
	shuffleCount:					2,
	movegaps:						true
});

enyo.kind({
	name:							"gaps:relaxed spaces",
	kind:							"gaps_common",
	shuffleCount:					NaN,
	movegaps:						true
});


/*
	Addiction is exactly the same as gaps, except that on a shuffle the gaps are
	moved to random positions, and you get an extra round.
*/
enyo.kind({
	name:							"gaps:addiction",
	kind:							"gaps_common",
	shuffleCount:					3,
	movegaps:						true
});


