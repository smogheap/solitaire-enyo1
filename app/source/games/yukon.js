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

name:						"yukon",
className:					"yukon",
kind:						"Solitaire",

cardWidth:					12,

buildDown:					true,
buildUp:					false,
suited:						false,
offsuit:					false,

components: [
	{
		kind:				enyo.Control,
		nodeTag:			"div",

		components: [
			{
				className:	"dummy",
				name:		"dummy",
				kind:		enyo.Control,
				nodeTag:	"span",

				components: [
					{ kind:	"CardStack", bgsrc: "blank.png", name: "dummy1", offset: [ 0, 0 ] },
					{ kind:	"CardStack", bgsrc: "blank.png", name: "dummy2", offset: [ 0, 0 ] },
					{ kind:	"CardStack", bgsrc: "blank.png", name: "dummy3", offset: [ 0, 0 ] }
				]
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
			{ kind:			"CardStack", name: "tableau7", inplay: true }
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
				"Foundations are built up in suit from ace to king.  Cards can",
				"not be moved out of the foundations.\n",

				"Tableaux are built up by alternating colors."
			].join(" ")
		},

		{
			caption:				"Rules",
			content: [
				"Any face up card can be moved from one tableau to another",
				"with all cards on top of it, even if they are not in",
				"sequence.  Only a king can be placed on an empty stack."
			].join(" ")
		},

		{
			caption:				"Variants",
			content: [
				"In Relaxed Yukon you are allowed to remove cards from the",
				"foundation.\n",

				"Russian Solitaire is just like Yukon, except the tableaux",
				"build down by suit instead of alternating colors.\n",

				"Alaska is just like Russian Solitaire, except the tableaux",
				"build up or down by suit.\n",

				"Moose Hide is just like Yukon, except that the tableaux build",
				"down by any suit that does not match."
			].join(" ")
		}
	]);
},

closestCard: function(cards, first, offset)
{
	var f;

	if (-1 == (f = enyo.indexOf(first, cards))) {
		/* first wasn't there... just return the offset */
		return(offset);
	}

	if (offset == 0) {
		return(f);
	}

	if (0 != (offset % 2)) {
		/* odd */
		return(f + ((offset + 1) / 2));
	} else {
		/* even */
		return(f - ((offset + 0) / 2));
	}
},

allowAddingCards: function(stack, cards, from, first)
{
	switch (stack.container.className) {
		case "foundation":
			/*
				To add a stack to a foundation the following rules must be met:
					- First card must be an ace
					- Cards must all match the suit of the foundation
					- Cards must be ascending sequentially in rank

				Only one card can be dropped on a foundation at a time because
				the tableaus use alternating colours in their sequences.
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
				To add cards to a tableau the following rules must be met:
					- First card must be a king if the tableau is empty

					- First card being added must NOT match the color of the
					  last card already in the stack.

					- Rank of the first card added must be one below the rank of
					  the last card already in the stack.

				The rules are much like klondike, except that cards do NOT have
				to be in sequence to be drug.  Only the first card matters.
			*/
			var s		= 0;
			var card	= null;

			if (!cards || !cards.length) {
				return([]);
			}

			if (!stack.cards || !stack.cards.length) {
				/*
					Find the first king that we can play.

					Use the one closest to the user's finger on the stack, which
					is on 'first'.
				*/
				for (var i = 0; i < (cards.length * 2); i++) {
					var next = this.closestCard(cards, first, i);

					if (!cards[next] || cards[next][2]) {
						continue;
					}

					if (cards[next][1] == 13) {
						return(cards.slice(next));
					}
				}
				return([]);
			}

			/* Verify that the stack can be added to the existing cards.  */
			var	last = stack.cards[stack.cards.length - 1];

			for (var i = 0; i < (cards.length * 2); i++) {
				var next = this.closestCard(cards, first, i);

				if (!cards[next] || cards[next][2]) {
					continue;
				}

				switch (last[1] - cards[next][1]) {
					case -1:
						/* The new card is one above the old one */
						if (!this.buildUp) {
							continue;
						}
						break;

					default:
						continue;

					case +1:
						/* The new card is one below the old one */
						if (!this.buildDown) {
							continue;
						}
						break;
				}

				if (this.suited) {
					if (last[0] != cards[next][0]) {
						continue;
					}
				} else if (this.offsuit) {
					if (last[0] == cards[next][0]) {
						continue;
					}
				} else {
					/* Default, require alternating colour */
					if (this.colorsMatch(last, cards[next])) {
						continue;
					}
				}

				/* Looks like we have a match */
				return(cards.slice(next));
			}

			break;

		default:
			break;
	}

	return([]);
},

allowTakingCards: function(stack)
{
	switch (stack.container.className) {
		case "foundation":
			if (stack.cards.length >= 1 && this.relaxed) {
				return(stack.cards.slice(-1));
			}
			break;

		case "tableau":
			/*
				All faceup cards can be moved, regardless of the sequence of
				and suit.  Anything goes.
			*/
			for (var i = stack.cards.length - 1, card; i >= 0 && (card = stack.cards[i]); i--) {
				if (card[2]) {
					/* Don't include the face down card */
					return(stack.cards.slice(i + 1));
				}
			}

			/* Nothing was face down */
			return(stack.cards.slice(0));
	}

	return([]);
},

tapOnCards: function(stack, card)
{
	switch (stack.container.className) {
		case "foundation":
			break;

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

	var deck = enyo.cloneArray(this.deck);
	var card;
	var top;

	/* Deal the cards to the tableaus */
	var stacks = [];

	for (var i = 1, t; t = this.$["tableau" + i]; i++) {
		stacks.push(t);
	}

	for (var c = 0; c < stacks.length; c++) {
		for (var i = stacks.length - 1 - c, t; t = stacks[i]; i++) {
			card = deck.shift();

			if ((c + 1) < stacks.length) {
				top = false;
			} else {
				top = true;
			}

			this.moveCard(card, t, true, !top);

		}
	}

	/* Deal the remaining cards to the tableaus (except the first) */
	while (deck.length > 0) {
		for (var i = 1; i < stacks.length; i++) {
			this.moveCard(deck.shift(), stacks[i],
				deck.length >= (stacks.length - 1));
		}
	}
},

moveCards: function()
{
	this.inherited(arguments);

	if (!this.history) {
		/* Don't autoplay while dealing, or while undoing history. */
		return;
	}

	/* Flip the top card of the tableau if it is hidden */
	var card;
	var last = this.history.slice(-1)[0];

	for (var i = 1, t; t = this.$["tableau" + i]; i++) {
		if ((card = t.cards.slice(-1)[0]) && card[2]) {
			this.flipCard(card, false, this.delay * 2);

			/*
				Mark the record in the history so that we know to unflip on an
				undo.
			*/
			if (last) {
				last.flipped	= card;
				last.safe		= false;
			}
		}
	}

	if (this.prefs.autoPlay) {
		/* Attempt to autoplay any free cards */
		enyo.job("autoPlay", enyo.bind(this, function()
		{
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
		if (last.flipped) {
			this.flipCard(last.flipped, true);
		}
	}

	this.inherited(arguments);
}

});

/* Alternate versions of yukon */

/* Exactly like yukon, but you can move cards out of a foundation */
enyo.kind({
	name:							"yukon:relaxed",
	kind:							"yukon",

	relaxed:						true,
	buildDown:						true,
	buildUp:						false
});

enyo.kind({
	name:							"yukon:russian",
	kind:							"yukon",

	suited:							true,
	buildDown:						true,
	buildUp:						false
});

enyo.kind({
	name:							"yukon:alaska",
	kind:							"yukon",

	suited:							true,
	buildDown:						true,
	buildUp:						true
});

enyo.kind({
	name:							"yukon:moosehide",
	kind:							"yukon",

	offsuit:						true,
	buildDown:						true,
	buildUp:						false
});


