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

name:						"pyramid",
className:					"pyramid",
kind:						"Solitaire",

cardWidth:					12,
rows:						7,

onDealDone:					"dealDone",

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
				offset:		[ 0, 0 ],
				kind:		"CardStack",
				bgsrc:		"base.png",
				inplay:		true,
				count:		true
			},
			{
				name:		"foundation",
				offset:		[ 0, 0 ],
				kind:		"CardStack",
				bgsrc:		"base.png",
				style:		"position: absolute; right: 0px;"
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
			content: [
				"Move all cards to the foundation in pairs that add up to 13."
			].join(" ")
		},

		{
			caption:				"Layout",
			content: [
				"The cards are dealt to the tableau in 7 rows, starting with a",
				"single card and increasing by one card for each row.  Each",
				"row overlaps the one before it, so only the cards in the last",
				"row can be used at the start of the game.\n",

				"The remaining cards are left in the deck, and may be flipped",
				"one at a time to the waste.  The top card in the deck and the",
				"top card in the waste may be played at any time."
			].join(" ")
		},

		{
			caption:				"Rules",
			content: [
				"Drag any exposed card to another where the rank of the 2",
				"cards adds to a total of 13, and the 2 cards will be moved to",
				"the foundation.  Since a king has a value of 13 it can be",
				"placed in the foundation on it's own."
			].join(" ")
		},

		{
			caption:				"Variants",
			content: [
				"Double Pyramid uses 2 decks to make a pyramid with 9 rows.\n",

				"In the relaxed variant a card can be dragged to one below it,",
				"if no other card overlaps it.  The relaxed variant only",
				"requires clearing the pyramid to win, instead of clearing",
				"all cards."
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

	var width = (90 / this.rows);

	for (var r = 1; r <= this.rows; r++) {
		for (var c = 1; c <= r; c++) {
			var grr = this.$.tableau.createComponent({
				kind:			"CardStack",
				name:			this.tableauName(c, r),
				inplay:			true,
				row:			r,
				column:			c,
				offset:			[ 0, 0 ]
			}, { owner: this });
		}
	}

	if (this.relaxed) {
		this.$.deck.inplay = false;
		this.$.waste.inplay = false;
	}
},

getStackBounds: function(stack)
{
	var cardSize	= this.getCardSize();

	if (!this.cards || isNaN(cardSize[0]) || isNaN(cardSize[1])) {
		return(stack.getBounds());
	}

	var bounds		= this.getBounds();
	var w			= this.cardWidth;
	var height		= this.height;

	if (height > this.width * 0.9) {
		height = this.width * 0.9;
	}

	if (!isNaN(stack.row) && !isNaN(stack.column)) {
		var l = 48;
		var t = (90 / this.rows) * (stack.row - 1);

		l -= (w * (stack.row / 2));
		l += (w * stack.column);

		l = bounds.width * l / 100;
		t = height * t / 100;

		stack.applyStyle('position',		'absolute');
		stack.applyStyle('left',			(bounds.left + l - cardSize[0]) + 'px');
		stack.applyStyle('top',				(bounds.top + t) + 'px');
	}

	return(stack.getBounds());
},



allowAddingCards: function(stack, cards)
{
	this.inherited(arguments);

	if (this.onlymatch && stack != this.onlymatch) {
		return([]);
	}

	var a = cards.slice(-1)[0];
	var b = stack.cards.slice(-1)[0];

	if (stack.name == "foundation") {
		if (a && a[1] == 13) {
			return([ a ]);
		}
		return([]);
	}

	if (a && b && 13 == (a[1] + b[1])) {
		return([ a ]);
	}

	return([]);
},

/* Return a list of stacks that overlap this stack */
isStackFree: function(stack)
{
	var stacks = [];

	if (stack.container.name != "tableau") {
		/* All stacks except foundation allow taking one card at most */
		return([]);
	}

	/* Cards can not be moved if there are other cards overlapping them */
	var a = this.getTableau(stack.column + 0, stack.row + 1);
	var b = this.getTableau(stack.column + 1, stack.row + 1);

	if (a && a.cards.length) {
		stacks.push(a);
	}

	if (b && b.cards.length) {
		stacks.push(b);
	}
	return(stacks);
},

allowTakingCards: function(stack, allowrelaxed)
{
	this.inherited(arguments);

	if (allowrelaxed) {
		this.onlymatch = null;
	}

	if (stack.name == "foundation") {
		return([]);
	}

	if (stack.container.name == "tableau") {
		var stacks = this.isStackFree(stack);

		if (stacks.length > 0) {
			if (this.relaxed && allowrelaxed && stacks.length == 1 &&
				this.isStackFree(stacks[0]).length == 0
			) {
				/*
					In a relaxed game you can play a card with the one that is
					overlapping it, if there is only one overlapping it and
					nothing overlapping that.
				*/
				this.onlymatch = stacks[0];
				return(stack.cards.slice(-1));
			}
			return([]);
		}
	}

	/* All stacks except foundation allow taking one card at most */
	return(stack.cards.slice(-1));
},

tapOnCards: function(stack)
{
	this.inherited(arguments);

	var highlighted;
	var cards;
	var card;
	var move;

	if (this.highlighted) {
		highlighted = this.highlighted.cards.slice(-1)[0];
		this.highlighted = null;

		if (highlighted) {
			highlighted.highlighted = false;
			this.placeCard(highlighted);
		}
	}

	if ((cards = this.allowTakingCards(stack, false)) && cards.length > 0) {
		card = stack.cards.slice(-1)[0];

		if (card[1] == 13 && !this.onlymatch) {
			/* If it is a king then just play it */
			this.moveCard(card, this.$.foundation, false);
			return;
		}

		if (highlighted) {
			/* Try to play the previously selected card */
			if (highlighted == card) {
				return;
			}

			if (this.onlymove && this.onlymove != stack) {
				return;
			}

			if ((move = this.allowAddingCards(stack, [ highlighted ])) && move.length == 1) {
				this.beginMove();
				this.moveCards(move.slice(-1),			this.$.foundation, false);
				this.moveCards(stack.cards.slice(-1),	this.$.foundation, false);
				this.endMove();

				return;
			}
		}
	}

	switch (stack.name) {
		case "deck":
			this.draw();
			return;

		case "foundation":
			return;
	}

	if ((cards = this.allowTakingCards(stack, true)) && cards.length > 0) {
		card = stack.cards.slice(-1)[0];

		/* Select the card */
		card.highlighted = true;
		this.placeCard(card);

		this.highlighted = stack;
	}
},

draw: function()
{
	var card;

	/*
		Disable the special code in this.moveCards() which would prevent this
		move from happening.
	*/
	this.fromDeck = true;

	if ((card = this.$.deck.cards.slice(-1)[0])) {
		this.moveCard(card, this.$.waste, false, false, true);
	} else {
		/* Flip the cards in the waste back over */
		this.moveCards(this.$.waste.cards.slice(0), this.$.deck, true, false, true);
	}
},

deal: function(gamenum)
{
	var cards;

	this.inherited(arguments);

	cards = this.deck.slice(0);

	/* Deal 1 card to each tableau */
	for (var r = 1; r <= this.rows; r++) {
		for (var c = 1; c <= r; c++) {
			this.moveCard(cards.shift(), this.getTableau(c, r),
				r != this.rows, false);
		}
	}

	/* Deal 1 card to the waste */
	this.moveCard(cards.shift(), this.$.waste, false, false);

	/* Put the rest of the cards in the deck, face up */
	this.moveCards(cards, this.$.deck, true, false);
},

moveCards: function(cards, stack, instant, facedown, reverse)
{
	var fromDeck = this.fromDeck; this.fromDeck = false;
	var move;

	for (var i = 0, card; card = cards[i]; i++) {
		card.highlighted = false;
	}

	for (var i = 0, card; card = stack.cards[i]; i++) {
		if (card.highlighted) {
			card.highlighted = false;
			this.placeCard(card);
		}
	}

	if (!this.history || stack.name == "foundation") {
		this.inherited(arguments);
		return;
	}

	/* A king can just be sent right to the foundation on it's own */
	if (cards.length == 1 && cards[0][1] == 13) {
		this.moveCard(cards[0],					this.$.foundation, false);
		return;
	}

	if (fromDeck) {
		this.inherited(arguments);
		return;
	}

	/*
		In pyramid cards should never be added to any stack other than the
		foundation, but adding to the foundation requires 2 cards from
		different stacks.

		So, intercept any other moves and do the right move instead.
	*/
	if ((move = this.allowAddingCards(stack, cards.slice(0))) && move.length == 1) {
		this.beginMove();
		this.moveCards(move.slice(-1),			this.$.foundation, false);
		this.moveCards(stack.cards.slice(-1),	this.$.foundation, false);
		this.endMove();

		return;
	}
},

score: function(e)
{
	this.inherited(arguments);

	if (this.$.deck.cards.length > 0) {
		e.actions.push({
			name:		"draw",
			icon:		"images/toolbar-icon-draw1.png",
			wide:		true
		});
	} else {
		e.actions.push({
			name:		"draw",
			icon:		"images/toolbar-icon-flipdeck.png",
			wide:		true
		});
	}
}

});

/* Alternate versions of pyramid */

enyo.kind({
	name:							"pyramid:relaxed",
	kind:							"pyramid",
	relaxed:						true
});

enyo.kind({
	name:							"pyramid:double",
	kind:							"pyramid",
	className:						"doublePyramid",
	rows:							9,
	decks:							2,
	cardWidth:						8
});

enyo.kind({
	name:							"pyramid:relaxed double",
	kind:							"pyramid:double",
	relaxed:						true
});

