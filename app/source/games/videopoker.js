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

// TODO	Much of the menu needs to be disabled for this game. It doesn't make
//		sense to restart the current hand or to deal by number. The option to
//		deal the next game after winning or loosing doesn't work either.
//
//		Even tapping on a game in the history is bad

// TODO	Do not allow restarting a hand

// TODO	The score must be recorded even if the user doesn't do anything

// TODO	Figure out scoring

// TODO	Add in lots of variants

// TODO	Add a method of changing how much is bet?

// TODO	Don't show the dialog until all the cards have been dealt

enyo.kind(
{

name:						"videopoker",
className:					"videopoker",
kind:						"Solitaire",

cardWidth:					12,
bet:						100,

components: [
	{
		name:				"deck",
		offset:				[ 0, 0 ],
		kind:				"CardStack",
		bgsrc:				"base.png",
		deck:				true,
		inplay:				true
	},

	{
		offset:				[ 0, 0 ],
		kind:				"CardStack",
		bgsrc:				"blank.png",
		inplay:				false
	},

	{
		className:			"tableau",
		name:				"tableau",
		kind:				enyo.Control,
		nodeTag:			"span",
		style:				"opacity: 0.4;",

		components: [
			{ kind:	"CardStack", name: "tableau1", bgsrc: "base.png" },
			{ kind:	"CardStack", name: "tableau2", bgsrc: "base.png" },
			{ kind:	"CardStack", name: "tableau3", bgsrc: "base.png" },
			{ kind:	"CardStack", name: "tableau4", bgsrc: "base.png" },
			{ kind:	"CardStack", name: "tableau5", bgsrc: "base.png" }
		]
	},

	{
		offset:				[ 0, 0 ],
		kind:				"CardStack",
		bgsrc:				"blank.png",
		inplay:				false
	},

	{
		offset:				[ 0, 0 ],
		kind:				"CardStack",
		bgsrc:				"blank.png",
		inplay:				false
	},

	{
		className:			"foundation",
		name:				"foundation",
		kind:				enyo.Control,
		nodeTag:			"span",
		style:				"opacity: 0.4;",

		components: [
			{ kind:	"CardStack", name: "foundation1", bgsrc: "base.png" },
			{ kind:	"CardStack", name: "foundation2", bgsrc: "base.png" },
			{ kind:	"CardStack", name: "foundation3", bgsrc: "base.png" },
			{ kind:	"CardStack", name: "foundation4", bgsrc: "base.png" },
			{ kind:	"CardStack", name: "foundation5", bgsrc: "base.png" }
		]
	},

	{
		name:				"DoneDialog",
		kind:				"ModalDialog",

		caption:			"",

		components: [
			{
				kind:		"Button",
				caption:	$L("Continue"),
				value:		"newdeal",
				onclick:	"gameDoneAction"
			},
			{
				kind:		"Button",
				caption:	$L("Play a different game"),
				value:		"newgame",
				onclick:	"gameDoneAction"
			}
		]
	}
],

gameDoneAction: function(sender, e)
{

	switch (sender.value) {
		case "newdeal":
			this.$.DoneDialog.close();

			/* Send the event back up a level */
			this.doGameDone(sender.value);
			break;

		case "newgame":
			/*
				Send the event back up a level, but do NOT close the dialog
				because the user isn't allowed to do that in this game.
			*/
			this.doGameDone(sender.value);
			break;
	}
},

getHelp: function()
{
	// TODO	Write me
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
	/* Any card may be added to any empty stack */
	if (!stack.container || stack.cards.length > 0) {
		return([]);
	}

	switch (stack.container.className) {
		case "foundation":
		case "tableau":
			return(cards.slice(0));
			break;
	}

	return([]);
},

allowTakingCards: function(stack)
{
	if (stack.cards && stack.cards.length &&
			!stack.cards[stack.cards.length -1][2]
	) {
		return(stack.cards.slice(0));
	}

	return([]);
},

tapOnCards: function(stack, card)
{
	var to;
	var i;
	var s;

	/* Any card may be added to any empty stack */
	switch (stack.container.className) {
		case "foundation":
			to = "tableau";
			break;

		case "tableau":
			to = "foundation";
			break;

		default:
			switch (stack.name) {
				case "deck":
					this.draw();
					break;
			}
			return;
	}

	/*
		The last digit of the stack name is the offset that we should try to
		move to.
	*/
	i = stack.name.charAt(stack.name.length - 1);
	s = this.$[to + i];

	if (s && !s.cards.length) {
		this.moveCard(card, s);
		return;
	}

	/*
		If the user has drug cards and the one we want isn't free then just find
		the first one that is free.
	*/
	for (var i = 1; s = this.$[to + i]; i++) {
		if (!s.cards.length) {
			this.moveCard(card, s);
			return;
		}
	}
},

draw: function()
{
	var from = this.$.deck.cards;

	for (var i = 1, s; s = this.$['foundation' + i]; i++) {
		if (s.cards.length == 0) {
			this.moveCards(from.slice(-1), s, false, false);
		}
	}

	// TODO	Move the dialog somewhere else so they can see the hand better...
	/* Okay, game is over, show the dialog */
	var hand = this.pokerHand();

	this.$.DoneDialog.openAtCenter();
	this.$.DoneDialog.setCaption(hand ? $L(hand) : $L("Sorry, you lose"));
	this.log(hand);
},

isActive: function(e)
{
	/*
		It doesn't really matter if you disrupt this game. The "are you sure"
		dialog does get in the way though, so never show it.
	*/
	return(false);
},

deal: function(gamenum)
{
	this.inherited(arguments);

	var deck = this.deck.slice(0);

	for (var i = 1, stack; stack = this.$['tableau' + i]; i++) {
		this.moveCard(deck.shift(), stack, false, false);
	}

	/* Put the rest of the cards in the deck face down */
	this.moveCards(deck, this.$.deck, true, true);

	/* Debug */
/*
	this.log("Rolay Flush",		this.pokerHand([ [ 1,  1 ], [ 1, 13 ], [ 1, 11 ], [ 1, 12 ], [ 1, 10 ] ] ));
	this.log("Straight Flush",	this.pokerHand([ [ 1, 11 ], [ 1, 12 ], [ 1, 13 ], [ 1,  1 ], [ 1,  2 ] ] ));
	this.log("Straight Flush",	this.pokerHand([ [ 1,  1 ], [ 1,  3 ], [ 1,  2 ], [ 1,  5 ], [ 1,  4 ] ] ));
	this.log("4 of a kind",		this.pokerHand([ [ 1,  1 ], [ 0,  1 ], [ 2,  1 ], [ 3,  1 ], [ 1,  4 ] ] ));
	this.log("Full House",		this.pokerHand([ [ 1,  1 ], [ 0,  1 ], [ 2,  1 ], [ 3,  4 ], [ 1,  4 ] ] ));
	this.log("Flush",			this.pokerHand([ [ 1,  1 ], [ 1,  2 ], [ 1,  7 ], [ 1,  6 ], [ 1,  4 ] ] ));
	this.log("Straight",		this.pokerHand([ [ 2,  1 ], [ 1,  2 ], [ 1,  3 ], [ 1,  4 ], [ 1,  5 ] ] ));
	this.log("3 of a kind",		this.pokerHand([ [ 1,  1 ], [ 0,  1 ], [ 2,  1 ], [ 3,  9 ], [ 1,  4 ] ] ));
	this.log("2 pair",			this.pokerHand([ [ 1,  1 ], [ 0,  1 ], [ 2,  9 ], [ 3,  4 ], [ 1,  4 ] ] ));
	this.log("1 pair",			this.pokerHand([ [ 1, 12 ], [ 0, 12 ], [ 2,  9 ], [ 3,  4 ], [ 1,  7 ] ] ));
	this.log("Nothing",			this.pokerHand([ [ 1, 12 ], [ 0, 11 ], [ 2,  9 ], [ 3,  4 ], [ 1,  4 ] ] ));
*/
},

pokerHand: function(cards)
{
	if (!cards) {
		cards = [];

		for (var i = 1, stack; stack = this.$['foundation' + i]; i++) {
			if (stack.cards.length == 1) {
				cards.push(stack.cards[0]);
			}
		}
	}

	if (cards.length != 5) {
		return(null);
	}
	card = cards.sort(function(a, b) {
		return(a[1] - b[1]);
	});

	var flush		= true;
	var straight	= true;
	var counts		= [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];

	for (var i = 1; cards[i]; i++) {
		if (cards[0][0] != cards[i][0]) {
			flush = false;
		}

		if (cards[i - 1][1] + 1 != cards[i][1] &&
			cards[i - 1][1] + 9 != cards[i][1]
		) {
			straight = false;
		}
	}

	if (flush && straight) {
		if (cards[0][1] == 1 && cards[1][1] == 10) {
			return("Royal Flush");
		} else {
			return("Straight Flush");
		}
	}

	/* Count the cards of each rank */
	for (var i = 0, card; card = cards[i]; i++) {
		counts[card[1] - 1]++;

		if (counts[card[1] - 1] == 4) {
			return("4 of a kind");
		}
	}

	/* Look for a full house */
	for (var i = 0; i < counts.length; i++) {
		if (counts[i] == 1) {
			/* Not a full house, counts should be 2 or 3 */
			break;
		}
	}
	if (i == counts.length) {
		return("Full House");
	}


	if (flush) {
		return("Flush");
	}

	if (straight) {
		return("Straight");
	}

	for (var i = 1, card; card = cards[i]; i++) {
		if (counts[card[1] - 1] == 3) {
			return("3 of a kind");
		}
	}

	var pairs = 0;
	for (var i = 0; i < counts.length; i++) {
		if (counts[i] == 2) {
			pairs++;
		}
	}
	if (pairs == 2) {
		return("2 pair");
	}

	for (var i = 11 - 1; i < counts.length; i++) {
		if (counts[i] == 2) {
			return("1 pair");
		}
	}
	if (counts[0] == 2) {
		return("1 pair");
	}

	return(null);
},

score: function(e)
{
	this.inherited(arguments);

	var score = -(this.bet);

	for (var i = 1, stack; stack = this.$["foundation" + i]; i++) {
		score += stack.cards.length * 5;
	}

	e.score		= score;
	e.online	= -score;
	e.str		= this.pokerHand();

	e.actions.push({
		name:		"draw",
		icon:		"images/toolbar-icon-draw1.png",
		wide:		true
	});
},

scoreStr: function(e, total)
{
	if (isNaN(e.score) && !isNaN(e.online)) {
		e.score = -e.online;
	}

	if (total) {
		return($L("Total") + ": $" + e.score);
	} else {
		var s = [];

		if (e.str) {
			s.push($L(e.str));
		}

		s.push($L("$") + e.score);

		if (this.total) {
			s.push($L("Total") + ": " + $L("$") + (this.total.score + e.score));
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
		}

		return(s.join(', '));
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
	if (e.str >= 0) {
		return(true);
	} else {
		return(false);
	}
}

});

