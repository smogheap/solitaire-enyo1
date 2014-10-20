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

name:						"aces up",
className:					"acesup",
kind:						"Solitaire",

cardWidth:					15,
columns:					4,

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
				inplay:		true
			},
			{
				name:		"foundation",
				offset:		[ 0, 0 ],
				kind:		"CardStack",
				bgsrc:		"base.png"
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
			{ kind:			"CardStack", name: "tableau6", bgsrc: "base.png", inplay: true }
		]
	}
],

getHelp: function()
{
	return([
		{
			caption:				"Goal",
			content: [
				"Discard as many cards as possible.  In a perfect game all",
				"cards except the aces will be discarded, thus the name."
			].join(" ")
		},

		{
			caption:				"Rules",
			content: [
				"The game is started by dealing 1 card face up to each of the",
				"4 tableaux.  The top card of a tableau may be discarded if",
				"it has a lower rank than another visible card of the same",
				"suit.\n",

				"The top card of any tableau may be moved to any empty",
				"tableau.\n",

				"Tapping on the deck will deal 1 card face up to each tableau."
			].join(" ")
		},

		{
			caption:				"Variants",
			content: [
				"In order to make the game easier it may be played with 2",
				"suits.  The total number of cards is not changed.\n",

				"Aces Up 5 and Aces Up 6 add additional tableaux to make the",
				"game easier."
			].join(" ")
		}
	]);
},

create: function()
{
	this.inherited(arguments);

	/* Hide any columns not needed for this variant */
	for (var i = this.columns + 1, stack; stack = this.$["tableau" + i]; i++) {
		stack.destroy();
	}
},

allowAddingCards: function(stack, cards)
{
	this.inherited(arguments);

	if (stack.container.name == "tableau") {
		/*
			Cards can only be moved to an empty tableau.  There are no sequences
			built in the tableaus.
		*/
		if (0 == stack.cards.length) {
			return(cards.slice(-1));
		}
	} else if (stack.name == "foundation") {
		/*
			A card may be moved to the foundation if it is lower in rank than
			another top card of the same suit.

			Ace ranks high.
		*/
		var a;
		var b;

		if ((a = cards.slice(-1)[0])) {
			for (var i = 1, t; t = this.$["tableau" + i]; i++) {
				if ((b = t.cards.slice(-1)[0]) &&
					a[0] == b[0] &&
					(a[1] < b[1] || (a[1] > 1 && b[1] == 1))
				) {
					return([ a ]);
				}
			}
		}
	}

	return([]);
},

allowTakingCards: function(stack)
{
	this.inherited(arguments);

	if (stack.container.name == "tableau") {
		/* Only 1 card can be moved at a time */
		return(stack.cards.slice(-1));
	}

	return([]);
},

tapOnCards: function(stack)
{
	this.inherited(arguments);

	if (stack.container.name == "tableau") {
		var cards;

		if ((cards = this.allowTakingCards(stack)) && cards.length > 0 &&
			(cards = this.allowAddingCards(this.$.foundation, cards)) &&
			cards.length > 0
		) {
			this.moveCards(cards, this.$.foundation);
		}
	} else if (stack.name == "deck") {
		/* Deal one card to each foundation */
		this.beginMove();
		for (var i = 1, to; to = this.$["tableau" + i]; i++) {
			this.moveCards(stack.cards.slice(-1), to, false, false);
		}
		this.endMove();
	}
},

deal: function(gamenum)
{
	this.inherited(arguments);

	var deck = this.deck.slice(0);

	/* Deal 1 cards to each tableau */
	for (var i = 1, stack; stack = this.$["tableau" + i]; i++) {
		this.moveCard(deck.shift(), stack);
	}

	/* Deal the remaining cards to the deck face down */
	this.moveCards(deck, this.$.deck, true, true);
},

moveCards: function()
{
	this.inherited(arguments);

	if (this.history && this.inplay == 4 && this.indeck == 0) {
		/* Move the aces to the foundation to trigger winning */
		var card;

		this.beginMove();
		for (var i = 1, stack; stack = this.$["tableau" + i]; i++) {
			if ((card = stack.cards.slice(-1)[0]) && card[1] == 1) {
				this.moveCard(card, this.$.foundation);
			}
		}
		this.endMove();
	}
}

});

/* Alternate versions of aces up */

enyo.kind({
	name:							"aces up:2 suits",
	kind:							"aces up",
	suits:							[ 'hearts',	'spades' ]
});

enyo.kind({
	name:							"aces up:5",
	className:						"acesup5",
	kind:							"aces up",
	columns:						5
});

enyo.kind({
	name:							"aces up:5 - 2 suits",
	className:						"acesup5",
	kind:							"aces up",
	columns:						5,
	suits:							[ 'hearts',	'spades' ]
});
enyo.kind({
	name:							"aces up:6",
	className:						"acesup6",
	kind:							"aces up",
	columns:						6,
	cardWidth:						12
});

enyo.kind({
	name:							"aces up:6 - 2 suits",
	className:						"acesup6",
	kind:							"aces up",
	columns:						6,
	cardWidth:						12,
	suits:							[ 'hearts',	'spades' ]
});

