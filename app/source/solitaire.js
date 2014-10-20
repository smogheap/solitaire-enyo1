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

/*
	The Solitaire Game
	============================================================================

	This kind should be extended by other kinds that wish to implement a
	specific type of solitaire.  The extending kind must override specific
	functions to apply the rules for that specific variant of solitaire.
*/
enyo.kind(
{

name:				'Solitaire',
kind:				enyo.Control,

/* How long should each action animate for (in ms) */
duration:			300,

/* How long between card animations (in ms) */
delay:				300,

/* Should the cards jump while being drug? */
// TODO	Move this to prefs?
jumpingCards:		false,

published:			{
						prefs:				{},
						scrollOffset:		[ 0, 0 ],
						stacks:				[]
					},

events:				{
						'onDealing':		'',
						'onDealt':			'',
						'onShuffleDone':	'',
						'onUnsafeUndo':		'',

						'onDragStart':		'',
						'onDragEnd':		'',
						'onDragging':		'',

						'onCardsMoved':		'',

						'onGameDone':		'',

						'onBusyStart':		'',
						'onBusyEnd':		''
					},

/* The width of a card as a percentage of the screen size */
cardWidth:			10,

/*
	The suits used in this game.  A game may specify any set of suits in any
	order.
*/
suits:				[ 'clubs',	'diams',	'hearts',	'spades'	],

/*
	The number of decks that should be used for the game.  If the list of suits
	contains 4 items then there will be 52 cards per deck.
*/
decks:				1,

/*
	The horizontal and vertical offset that should be added to each card in a
	stack.

	The values should be the percentage of the height or width of the card.

	This may be set on a CardStack to override the game default.
*/
offset:				[ 0, 20, 0, 8 ],

/*
	How sloppy should the cards be?  A value of 0 will result in perfectly clean
	cards.  Anything higher will cause the cards to be shifted vertically and
	horizontally by a small amount, and even rotated by a small amount.

	The default is 2, which produces a nice effect.  A very large value may be
	used to make it appear that the cards have been strewn about.

	This may be set on a CardStack to override the user's configured value.
*/

/*
	This should be overridden by an extending kind to implement the rules of
	that specific solitaire variant.

	Return the portion of the cards array that the user may legally add to the
	specified stack at this point in the game.

	The card the user actually touched will be passed as 'first'.  If the game
	has multiple possible moves then that should help decide which move to make.
*/
allowAddingCards: function(stack, cards, from, first)
{
	return([]);
},


/*
	This should be overridden by an extending kind to implement the rules of
	that specific solitaire variant.

	Return an array of cards that the user may legally remove from the specified
	stack at this point in the game.
*/
allowTakingCards: function(stack)
{
	return([]);
},

/*
	This should be overridden by an extending kind to implement the rules of
	that specific solitaire variant.

	Do any actions that are appropriate when the user taps on a stack without
	dragging it.
*/
tapOnCards: function(stack)
{
	// this.log('User tapped on: ', stack.name);
},


newDeck: function(suits, decks, ranks)
{
	var result = [];

	if (isNaN(decks)) {
		decks = 1;
	}

	if (isNaN(ranks)) {
		ranks = 13;
	}

	if (!suits) {
		suits = [ 'clubs', 'diams', 'hearts', 'spades' ];
	}

	for (; decks > 0; decks--) {
		for (var i = 1; i <= ranks; i++) {
			for (var s = 0; s < suits.length; s++) {
				result.push([ s, i ]);
			}
		}
	}

	return(result);
},

/*
	This should be overridden by an extending kind.  Once "this.inherited" is
	called "this.deck" will contain a freshly shuffled deck, ready to be placed
	into the appropriate stacks.

	Cards should NOT be removed from this.deck when dealing.  Each card can be
	placed by calling this.moveCards(), which will set the card's stack.
*/
shuffle: function()
{
	var deck;

	/* Keep track of how many cards are "in play", and in the deck */
	this.inplay	= 0;
	this.indeck	= 0;

	this.gamenum = this.gamenum * 1;

	if (isNaN(this.gamenum)) {
		/* Choose a random game */
		this.gamenum = Math.floor(Math.random() * 32000);
	}

	this.doDealing({ gamenum: this.gamenum });

	/* Shuffle the cards */
	switch (this.gamenum) {
		case -99:
			/* Test game (cards then suits) */
			deck = [];

			for (var a = 0; a < this.decks; a++) {
				for (var b = 13; b > 0; b--) {
					for (var c = 0; c < this.suits.length; c++) {
						deck.push([ c, b ]);
					}
				}
			}

			break;

		case -100:
			/* Test game (suits then cards) */
			deck = [];

			for (var a = 0; a < this.decks; a++) {
				for (var c = 0; c < this.suits.length; c++) {
					for (var b = 13; b > 0; b--) {
						deck.push([ c, b ]);
					}
				}
			}

			break;

		case -101:
			/* Same as -100, but with aces in the middle */
			deck = [];

			for (var a = 0; a < this.decks; a++) {
				for (var c = 0; c < this.suits.length; c++) {
					for (var b = 13; b > 1; b--) {
						deck.push([ c, b ]);

						if (b == 7) {
							deck.push([ c, 1 ]);
						}
					}
				}
			}

			break;

		case -102:
			/* Test game (suits then reversed cards) */
			deck = [];

			for (var a = 0; a < this.decks; a++) {
				for (var c = 0; c < this.suits.length; c++) {
					for (var b = 1; b <= 13; b++) {
						deck.push([ c, b ]);
					}
				}
			}

			break;

		case -103:
			/* Same as -102, but with aces in the middle */
			deck = [];

			for (var a = 0; a < this.decks; a++) {
				for (var c = 0; c < this.suits.length; c++) {
					for (var b = 2; b <= 13; b++) {
						deck.push([ c, b ]);

						if (b == 7) {
							deck.push([ c, 1 ]);
						}
					}
				}
			}

			break;

		case -999:
			/* Don't shuffle at all (used by demo game) */
			deck = this.newDeck(this.suits, this.decks, this.ranks);
			break;

		default:
			if (!isNaN(this.gamenum)) {
				this.log('Dealing game #', this.gamenum);
				WRand.setSeed(this.gamenum);

				deck = WRand.shuffle(this.newDeck(this.suits, this.decks, this.ranks));
			} else {
				deck = [];
			}

			break;
	}

	this.deck = deck;

	/* Rendering will take care of creating the cards and dealing */
	this.beginGame();
},

/*
	Restore the cards to a previous state

	Do all the same work that shuffle does, except don't actually shuffle.
*/
restore: function()
{
	var deck;

	/* Keep track of how many cards are "in play", and in the deck */
	this.inplay	= 0;
	this.indeck	= 0;

	this.gamenum = this.gamenum * 1;

	this.doDealing({ gamenum: this.gamenum });

	deck = [];

	for (var i = 0, stack; stack = this.state.stacks[i]; i++) {
		for (var c = 0, card; card = stack.cards[c]; c++) {
			deck.push(card);
		}

		try {
			this.stacks[i].offsetIgnore = stack.offsetIgnore;
		} catch (e) {};
	}

	this.deck = deck;

	/* Rendering will take care of creating the cards and dealing */
	this.beginGame();
},


/* This should be overridden by each game */
deal: function()
{
},

dealing: function()
{
	if (!this.finishedDeal) {
		return(true);
	} else {
		return(false);
	}
},

dealDone: function()
{
	this.doDealt({ gamenum: this.gamenum });

	this.timer.start();
	this.resizeHandler();
},

autoPlay: function(stack, card, destinations, human, greedy)
{
	var pos;
	var cards	= this.allowTakingCards(stack);
	var allowed	= [];
	var best	= -1;

	if (!card || -1 == (pos = enyo.indexOf(card, cards))) {
		if (!greedy) {
			cards = cards.slice(-1);
		}
	} else {
		cards = cards.slice(pos);
	}

	for (var i = 0, d; d = destinations[i]; i++) {
		allowed.push(this.allowAddingCards(d, cards.slice(0)) || []);

		if (!allowed[best] || allowed[i].length > allowed[best].length) {
			best = i;
		}
	}

	if (allowed[best] && allowed[best].length > 0) {
		this.moveCards(allowed[best], destinations[best], false);
		return(true);
	}

	return(false);
},

/* Move the specified card to the specified stack */
moveCard: function(card, stack, instant, facedown)
{
	return(this.moveCards([ card ], stack, instant, facedown));
},

/*
	Move cards to a new stack

	instant:		If true then the cards will not be animated.  If not true
					then each card will be animated in turn.

	facedown:		If undefined then the original value from each card will be
					used.  If set to true or false then all cards being moved
					will be set to match.

	reverse:		If true then the cards will be reversed when they are put in
					the new stack.  It is important to pass reverse to ensure
					that the history knows to reverse it back on an undo.
*/
moveCards: function(cards, stack, instant, facedown, reverse)
{
	var safe = true;

	if (!cards || !cards.length) {
		return;
	}

	if (reverse) {
		cards.reverse();
	}

	/* Keep track of the number of cards "in play" */
	if (cards[0].stack) {
		if (cards[0].stack.inplay) {
			this.inplay -= cards.length;
		}

		if (cards[0].stack.deck) {
			this.indeck -= cards.length;
		}

		if (cards[0].stack.count) {
			cards[0].stack.count.setContent((cards[0].stack.cards.length - cards.length));
		}
	}

	if (stack.inplay) {
		this.inplay += cards.length;
	}
	if (stack.deck) {
		this.indeck += cards.length;
	}
	if (stack.count) {
		stack.count.setContent((stack.cards.length + cards.length));
	}

	/* Did any cards get flipped over? */
	if (facedown != undefined && !facedown) {
		for (var i = 0, card; card = cards[i]; i++) {
			if (card[2]) {
				safe = false;
				break;
			}
		}
	}

	if (this.history) {
		this.recordMove(this.history, {
			from:		cards[0].stack.name,
			to:			stack.name,
			cards:		this.stripCards(cards),
			safe:		safe,
			facedown:	facedown,
			reverse:	reverse ? true : false,
			instant:	instant
		});
	}

	if (!stack.cards) {
		stack.cards = [];
	}

	for (var i = 0, card; card = cards[i]; i++) {
		if (facedown !== undefined) {
			card[2] = facedown;
		}

		if (card.stack && card.stack.cards) {
			enyo.remove(card, card.stack.cards);

			this.placeCounter(card.stack);
		}

		card.stack = stack;
		stack.cards.push(card);

		/*
			If a card is moved from one stack to another then it's image MUST be
			removed and re-added to the DOM.  This is REQUIRED to ensure proper
			stacking without having to resort to zIndex hell.
		*/
		this.reinsertCard(card);
		this.setCardImage(card);

		if (instant) {
			this.placeCard(card, undefined, undefined, undefined, true);
		}

		this.placeCounter(card.stack);
	}

	if (!instant) {
		if (!this.moving) {
			this.moving = [ cards ];

			/*
				There are no cards being moved right now, so trigger the event
				to get the ball rolling.
			*/
			if (this.animateTimeout) {
				clearTimeout(this.animateTimeout);
			}
			this.animateTimeout = setTimeout(this.animateNextCard, this.delay);
		} else {
			/* Add the cards to the queue of cards that need to be animated. */
			this.moving.push(cards);
		}
	}

	this.cardsMoved();
},

getMoving: function()
{
	if (this.moving && this.moving.length > 0) {
		return(true);
	} else {
		return(false);
	}
},

/* An overriding kind can override this and set whatever score they want */
score: function(e)
{
	e.inplay	= this.inplay;
	e.indeck	= this.indeck;

	/*
		The number of cards not in play is used as the online score, since it is
		sorted highest first.
	*/
	e.online	= (13 * this.suits.length * (this.decks || 1)) - this.inplay;

	/* Let the caller know if it is okay to throw away this game or not */
	if (this.inplay && this.history && this.history.length) {
		this.active = true;
	} else {
		this.active = false;
	}
},

/* Return a pretty version of a score for human consumption */
scoreStr: function(e)
{
	if (isNaN(e.inplay) && !isNaN(e.online)) {
		e.inplay = (13 * this.suits.length * (this.decks || 1)) - e.online;
	}

	if (undefined != e.wincount || undefined != e.losecount) {
		var w = e.wincount  || 0;
		var l = e.losecount || 0;

		return(w + " " + $L("out of") + " " + (w + l) + " " + $L("games won"));
	}

	if (e.inplay > 0) {
		return(e.inplay + " " + $L("cards left"));
	} else {
		return($L("Game Won"));
	}
},

/* Is this score a win? */
scoreWin: function(e)
{
	if (e.inplay == 0) {
		return(true);
	} else {
		return(false);
	}
},

/* Compare to scores */
scoreCmp: function(a, b)
{
	return(a.inplay - b.inplay);
},

/* Add 2 scores together for showing the total */
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
			if (a.inplay == 0) {
				wincount++;
			} else {
				losecount++;
			}
		}
	}

	return({ wincount: wincount, losecount: losecount });
},

isActive: function(e)
{
	return(this.active);
},

cardsMoved: function()
{
	/* Let the consumer know that stuff has changed */
	var count;
	var h = this.history || this.nothistory || [];

	while (h.up) {
		h = h.up;
	}

	count = (h || []).length;

	var e = {
		undocount:			count,

		actions: [
			{
				name:		"tryUndo",
				// caption:	$L("Undo") + " (" + count + ")",
				icon:		"images/toolbar-icon-undo.png",
				disabled:	(count == 0)
			}
		]
	};

	this.score(e);
	this.doCardsMoved(e);

	if (this.timer) {
		/*
			Mark the time of the last move, since that will be used for the
			statistics.
		*/
		this.timer.mark();
	}
},

/*
	Calling beginMove() and endMove() around a set of calls to moveCard() or
	moveCards() will cause them to be undone as one action.
*/
beginMove: function()
{
	var history = [];

	history.up = this.history;
	this.history = history;
},

endMove: function()
{
	var history	= this.history;
	var safe	= true;

	for (var i = 0, h; h = history[i]; i++) {
		if (undefined != h.safe && !h.safe) {
			safe = false;
			break;
		}
	}

	if (history.up) {
		this.history = history.up;

		this.history.push({
			items:	history,
			safe:	safe
		});
	}

	this.cardsMoved();
},

/*
	Calling mergeMoves() will merge the 2 most recent moves into one action so
	that a call to undo will do both.  This should be used if an automatic
	action was triggered by a user action, and it is required.
*/
mergeMoves: function()
{
	var b = this.history.pop();
	var a = this.history.pop();

	this.history.push({
		items: [ a, b ]
	});
},

/* Return true if it is safe to undo the provided item */
undoSafe: function(item)
{
	item = item || this.history.slice(-1)[0];

	if (!item) {
		return(true);
	}

	if (undefined != item.safe) {
		return(item.safe);
	}

	return(false);
},

tryUndo: function()
{
	if (this.undoSafe() || !this.prefs.unsafeundo) {
		this.undo();
	} else {
		this.log('Stop trying to cheat you horrible person you');
		this.doUnsafeUndo();
	}
},

alwaysUndo: function()
{
	this.prefs.unsafeundo = false;
	this.undo();
},

undo: function(history)
{
	/*
		Remove the history while undoing to prevent adding the undo to the
		history.
	*/
	if (!history) {
		history = this.history;
		this.nothistory = history;

		this.history = null;
	}

	var last;

	if ((last = history.pop())) {
		if (!last.items) {
			/*
				The cards should match those at the end of the stack that they
				are currently sitting in.  They may be reversed though.
			*/
			var from	= this.$[last.to];
			var cards	= last.cards.slice(0);
			var real;
			var move	= [];

			if (last.reverse) {
				cards.reverse();
			}

			for (var i = 0, card; card = cards[i]; i++) {
				if ((real = this.findCard(card[0], card[1], from.cards, true))) {
					real[2] = card[2];
					move.push(real);
				} else {
					this.log("Could not find card: ", card);
				}
			}

			this.moveCards(move, this.$[last.from], last.instant);
		} else {
			/*
				This action consisted of more than one action.  They need to be
				undone together.
			*/
			while (last.items.length) {
				this.undo(last.items);
			}
		}
	}

	if (this.nothistory == history) {
		this.history = history;
		this.nothistory = null;
	}

	this.cardsMoved();
},

/* Insert an item into the history for undo */
recordMove: function(history, move)
{
	history.push(move);
},

reinsertCard: function(card)
{
	var width;

	// this.log(card);

	/*
		Move the card to the end of the list of children so it will be rendered
		on top of the other cards in the same stack.
	*/
	try {
		this.cards.hasNode().removeChild(card.img);
	} catch (e) {
	}

	if (true) {
		/* Just move the node */
		try {
			this.cards.hasNode().appendChild(this.setCardImage(card));
		} catch (e) {
			this.log('Ummm, shit', this.cards, card, card.img);
		}
	} else {
		/* Recreate the node entirely */
		card.img = null;

		this.cards.hasNode().appendChild(this.setCardImage(card));
		this.styleCard(card);
	}
},

animateNextCard: function(sender, e)
{
	var cards = null;

	if (!this.cards) {
		return;
	}

	if (this.moving && (cards = this.moving.shift())) {
		for (var i = 0, card; card = cards[i]; i++) {
			this.placeCard(card);
		}

		if (this.animateTimeout) {
			clearTimeout(this.animateTimeout);
		}
		this.animateTimeout = setTimeout(this.animateNextCard, this.delay);
	} else {
		/* All done */
		this.moving = null;

		/* Only call once after dealing */
		if (!this.finishedDeal) {
			this.finishedDeal = true;
			this.dealDone();
		}

		this.cardsMoved();
	}
},

getCardSize: function()
{
	if (!this.cardSize) {
		this.resizeHandler();
	}

	return(this.cardSize);
},

getCardOffset: function(stack, index, position, full)
{
	if (isNaN(index)) {
		index = 0;

		if (stack.cards && stack.cards.length > 1) {
			index = stack.cards.length - 1;
		}
	}

	if (!isNaN(stack.offsetIgnore)) {
		/*
			If offsetIgnore is set then any card with an index below that should
			NOT get the offset applied.
		*/
		if (index >= stack.offsetIgnore) {
			index -= stack.offsetIgnore;
		} else {
			index = 0;
		}
	}

	var size	= this.getCardSize();
	var offset	= stack.offset || this.offset;
	var o		= { left: 0, top: 0 };
	var card;

	if (!full && stack.cards && offset.length >= 4) {
		/* Show face down cards a bit closer together */
		for (var i = 0; i < index; i++) {
			if ((card = stack.cards[i]) && card[2]) {
				o.left += offset[2] * size[0] / 100;
				o.top  += offset[3] * size[1] / 100;
			} else {
				o.left += offset[0] * size[0] / 100;
				o.top  += offset[1] * size[1] / 100;
			}
		}
	} else {
		o.left	= offset[0] * index * size[0] / 100;
		o.top	= offset[1] * index * size[1] / 100;
	}

	o.right		= o.left + size[0];
	o.bottom	= o.top  + size[1];

	if (position) {
		o.left		+= position.left;
		o.right		+= position.left;

		o.top		+= position.top;
		o.bottom	+= position.top;
	}

	o.left		= Math.round(o.left);
	o.right		= Math.round(o.right);
	o.top		= Math.round(o.top);
	o.bottom	= Math.round(o.bottom);

	return(o);
},

placeCard: function(card, pos, zIndex, index, instant, full)
{
	if (!card || !card.stack) {
		return;
	}

	var s = card.stack.sloppy || this.sloppy || this.prefs.sloppy;

	if (isNaN(index)) {
		index = enyo.indexOf(card, card.stack.cards);
	}

	card.offset	= this.getCardOffset(card.stack, index, null, full);

	if (s != 0) {
		var r	= card.stack.rotate || 0;

		/*
			Generate a random number based on the card's rank and suit so that
			it gets nudged the same amount for this whole game.  The seed will
			use the game number so that this will be reset when the game changes
		*/
		if (!card.slop) {
			WRand.setSeed(this.gamenum * card[1] * (card[0] + 1) + (index + 1));

			/* Move the card by a random amount */
			card.slop = {
				r: (((WRand() % 100) / 100) * 2),
				x: (((WRand() % 100) / 100) * 2),
				y: (((WRand() % 100) / 100) * 2)
			};
		}

		r		+= Math.round((card.slop.r * s) - s);

		card.nudge = {
			rotate:		r,
			left:		Math.round((card.slop.x * s) - s),
			top:		Math.round((card.slop.y * s) - s)
		};
	}

	if (card.stack.hidden) {
		card.img.className = 'card hidden';
	} else if (card.highlight) {
		card.img.className = 'card highlight';
	} else {
		card.img.className = 'card';
	}

	card.img.style.width = this.cardWidth + '%';

	if (isNaN(zIndex)) {
		zIndex = 0;
	}
	this.nudgeCard(card, pos || this.getStackBounds(card.stack), zIndex, instant);
},

/*
	Use nudgeCard() to apply a change in position AFTER calling placeCard().

	nudgeCard() will NOT apply all styles.  Just enough to change the position.
*/
nudgeCard: function(card, pos, zIndex, instant, hideeffects)
{
	var x = pos.left;
	var y = pos.top;

	if (card.offset) {
		x += card.offset.left;
		y += card.offset.top;
	}

	if (!hideeffects && card.nudge) {
		x += card.nudge.left;
		y += card.nudge.top;
	}

	if (this.prefs.animations && !instant) {
		card.img.style.webkitTransitionProperty = this.transitionStr;
		card.img.style.webkitTransitionDuration = (this.duration / 1000) + "s";
	} else {
		card.img.style.webkitTransitionProperty = null;
		card.img.style.webkitTransitionDuration = null;
	}

	if (!isNaN(zIndex)) {
		card.img.style.zIndex = zIndex;
	}

	card.x = x;
	card.y = y;

	this.styleCard(card, hideeffects);
},

styleCard: function(card, hideeffects)
{
	var transforms = [];

	if (this.transformStr) {
		transforms.push(this.transformStr);
	}

	if (!isNaN(card.x) && !isNaN(card.y)) {
		transforms.push('translate(' + card.x + 'px,' + card.y + 'px)');
	}

	if (!hideeffects && card.nudge) {
		transforms.push('rotate(' + card.nudge.rotate + 'deg)');
	}

	if (card.highlight && !hideeffects && !net.minego.android) {
		/*
			Don't scale the highlighted cards on android, because it causes
			weird rendering glitches.
		*/
		transforms.push('scale(1.05)');
	}

	// this.log(transforms.join(' '));
	card.img.style.webkitTransform = transforms.join(' ');
},

/* Get the proper image for a card */
getCardSrc: function(card)
{
	var src = card.cardset || this.prefs.cardset;

	if (!card[2]) {
		switch (card[1]) {
			default: src += card[1];	break;
			case 10: src += 'x';		break;
			case 11: src += 'j';		break;
			case 12: src += 'q';		break;
			case 13: src += 'k';		break;
		}

		src += this.suits[card[0]].charAt(0) + '.png';
	} else {
		src += 'back.png';
	}

	return(src);
},

flipCard: function(card, facedown, delay)
{
	var src, old;

	if (!card) {
		return;
	}

	old = card.img.getAttribute('src');

	if (undefined === facedown) {
		card[2] = !card[2];
	} else {
		card[2] = facedown;
	}

	if (delay && this.moving) {
		delay = delay * (1 + this.moving.length);
	}

	setTimeout(enyo.bind(this, function()
	{
		this.setCardImage(card);
	}), delay);
},

findCard: function(suit, rank, cards, reverse, wrap)
{
	if (!cards) {
		cards = this.deck;
	}

	if (reverse) {
		cards = cards.slice(0).reverse();
	}

	if (wrap) {
		while (rank < 1) {
			rank += 13;
		}

		while (rank > 13) {
			rank -= 13;
		}
	}

	if (suit < 0 || suit >= this.suits.length || rank < 1 || rank > 13) {
		return(null);
	}

	for (var i = 0, card; card = cards[i]; i++) {
		if (card[0] == suit && card[1] == rank) {
			return(card);
		}
	}

	return(null);
},

dumpCards: function(cards, small)
{
	var out = "";

	for (var i = 0, card; card = cards[i]; i++) {
		if (i != 0) {
			out += ", ";
		}

		switch (card[1]) {
			case 1:		out += " A"; break;
			case 11:	out += " J"; break;
			case 12:	out += " Q"; break;
			case 13:	out += " K"; break;
			default:	out += " " + card[1]; break;
		}

		if (!small) {
			out += " " + this.suits[card[0]];
		} else {
			out += this.suits[card[0]].charAt(0).toUpperCase();
		}
	}

	return(out);
},

stripCards: function(cards)
{
	var out = [];

	for (var i = 0, card; card = cards[i]; i++) {
		out.push([ card[0], card[1], card[2] || false ]);
	}

	return(out);
},


colorsMatch: function(carda, cardb)
{
	/* Allow a suit offset, or card to be passed in */
	var suita	= isNaN(carda) ? this.suits[carda[0]] : this.suits[carda];
	var suitb	= isNaN(cardb) ? this.suits[cardb[0]] : this.suits[cardb];
	var blacka	= false;
	var blackb	= false;

	switch (suita) {
		case "clubs":
		case "spades":
			blacka = true;
			break;
	}

	switch (suitb) {
		case "clubs":
		case "spades":
			blackb = true;
			break;
	}

	// this.log(suita, blacka, suitb, blackb, this.dumpCards([ carda, cardb ]));
	return(blacka == blackb);
},

/* This should be overridden by individual games */
highlightCards: function(show)
{
},

adjustMouseEvent: function(e)
{
/*
	this.log(
		this.scrollOffset,
		"e.real:",		e.realX, e.realY,
		"e.xy:",		e.x, e.y,
		"e.screen:",	e.screenX, e.screenY,
		"e.layer:",		e.layerX, e.layerY,
		"e.offset:",	e.offsetX, e.offsetY,
		"e.page:",		e.pageX, e.pageY,
		"e.d:",			e.dx, e.dy
	);
*/
/*
	this.log(
		"page:",		e.pageX, e.pageY,
		"scroll:",		this.scrollOffset[0], this.scrollOffset[1]
	);
*/

	e.realX = e.pageX + this.scrollOffset[0];
	e.realY = e.pageY + this.scrollOffset[1];

	if (this.dragging && this.dragging.last) {
		e.dx = e.realX - this.dragging.last.x;
		e.dy = e.realY - this.dragging.last.y;

		this.dragging.last.x = e.realX;
		this.dragging.last.y = e.realY;
	}
},

mousedownHandler: function(sender, e, target)
{
	var stack	= null;
	var card	= target ? target.card : e.target.card;
	var when	= (new Date()).getTime();

	/* Ignore double clicks */
	if (!target && !isNaN(this.lastClickTime) && (this.lastClickTime + 300 > when)) {
		// this.log('Ignoring double click');
		return(false);
	}
	this.lastClickTime = when;


	this.adjustMouseEvent(e);
	this.delayedDown = null;

	if (card && card.img && card.highlight && !target) {
		/*
			Remove the highlight so that we can figure out which card was really
			tapped on.
		*/
		card.highlight = false;
		this.placeCard(card);

		this.delayedDown = e;

		enyo.nextTick(this, function()
		{
			/* Figure out what card was really tapped on */
			target = document.elementFromPoint(e.realX, e.realY);
			// this.log(target, e.realX, e.realY);

			/* Restore the highlight */
			card.highlight = true;
			this.placeCard(card);

			this.mousedownHandler(sender, e, target);
			if (this.delayedUp) {
				this.mouseupHandler(sender, this.delayedUp);
			}
		});

		return(false);
	}

	if (card) {
		stack = card.stack;
	}

	/* Don't allow interaction while an animation is happening */
	if (this.getMoving()) {
		return(false);
	}

	/* Ignore right click */
	if (e.which !== undefined && e.which != 1) {
		return(false);
	}

	/* Don't allow dragging multiple stacks at once */
	if (this.dragging) {
		this.mouseupHandler(sender, e);
	}

	if (!card) {
		/*
			Try to figure out which stack was clicked on

			The stacks are under the play area, so figure it out based on the
			position of the pointer.
		*/
		for (var i = 0; stack = this.stacks[i]; i++) {
			var s = this.getCardOffset(stack, 0, this.getStackBounds(stack));

			if (e.realX >= s.left && e.realX <= s.right &&
				e.realY >= s.top  && e.realY <= s.bottom
			) {
				break;
			}
		}
	}

	if (!stack) {
		/* Ignore the event */
		return(true);
	}

	e.preventDefault();
	e.cancelBubble = true;
	e.stopPropagation();

	this.dragging = {
		x:			e.realX,
		y:			e.realY,

		last: {
			x:		e.realX,
			y:		e.realY
		},

		card:		card,
		cardCount:	1,

		from:		stack,
		to:			null,

		take:		this.allowTakingCards(stack) || [],
		add:		[],

		traveled:	0,

		stackBounds:this.getStackBounds(stack)
	};

	/*
		Cache the bounds of each stack so that we don't have to calculate it
		again while dragging.
	*/
	for (var i = 0, s; s = this.stacks[i]; i++) {
		var index;

		if (s.cards && s.cards.length > 0) {
			index = s.cards.length;

			if (s == stack && index > 0) {
				index--;
			}
		} else {
			index = 0;
		}

		s.dragBounds = this.getCardOffset(s, index, this.getStackBounds(s), false);
	}

	if (card) {
		/*
			Calculate how far away from the center the user's finger/mouse
			is so that the center of the card can be used when calculating
			which stack is the closest.
		*/
		var size	= this.getCardSize();
		var offsetX	= card.x;
		var offsetY	= card.y;

		offsetX -= e.realX;
		offsetY -= e.realY;

		offsetX += (size[0] / 2);
		offsetY += (size[1] / 2);

		if (!this.jumpingCards && card.highlight && this.prefs.highlight) {
			offsetX += 25;
			offsetY += 25;
		}

		this.dragging.offsetX = offsetX;
		this.dragging.offsetY = offsetY;

		/* How many cards is the user dragging? */
		this.dragging.cardCount = stack.cards.length - enyo.indexOf(card, stack.cards);
	}

	/* Turn on the cursor */
	var size = this.getCardSize();

	this.dragCursor({ left: -100, top: -100 });
	this.cursor.applyStyle('width',		size[0] + 'px');
	this.cursor.applyStyle('height',	size[1] + 'px');

	this.cursor.applyStyle('display', 'block');
	this.cursor.applyStyle('position', 'absolute');
	this.cursor.addClass('highlight');

	/* Disable the scroller */
	this.doDragStart({});
	this.doDragStart(e);

	return(false);
},

mouseupHandler: function(sender, e)
{
	// this.log(e.realX, e.realY);
	// this.log(this.dragging.traveled);

	if (this.delayedDown) {
		/*
			There is a delayed mousedown event still being processed. It will
			restart this event when it is complete.
		*/
		this.delayedUp = e;
		return(false);
	} else {
		this.delayedUp = null;
	}


	if (!this.dragging) {
		return(true);
	}

	e.preventDefault();
	e.cancelBubble = true;
	e.stopPropagation();

	this.cursor.applyStyle('display', 'none');

	if (this.getMoving()) {
		return(false);
	}

	this.adjustMouseEvent(e);

	/* Turn the scroller back on */
	this.doDragEnd({});

	if (this.dragging.traveled <= this.dragRadius) {
		this.tapOnCards(this.dragging.from, this.dragging.card);
		this.dragging = null;

		return(false);
	}

	if (!this.dragging.add) {
		this.dragging.add = [];
	}

	if (this.dragging.add.why) {
		if (this.hintTimeout) {
			clearTimeout(this.hintTimeout);
		}

		this.log(this.dragging.add.why);
		this.$.hint.applyStyle("opacity", 0.7);

		this.$.hint.setContent(this.dragging.add.why);

		this.hintTimeout = setTimeout(enyo.bind(this, function() {
			this.$.hint.applyStyle("opacity", 0);
		}), 3000);
	}

	/* Restore the cards to their original location */
	for (var i = 0, card; card = this.dragging.from.cards[i]; i++) {
		if (-1 == enyo.indexOf(this.dragging.add, card)) {
			this.nudgeCard(card, this.dragging.stackBounds, 0, true);
		}
	}

	/* Move cards to their final destination */
	if (this.dragging.add && this.dragging.add.length) {
		this.moveCards(this.dragging.add, this.dragging.to, true);
	}

	this.dragging = null;
	this.doDragEnd(e);

	return(false);
},

mousemoveHandler: function(sender, e)
{
	var changed = false;
	var closest	= null;

	e.preventDefault();
	e.cancelBubble = true;
	e.stopPropagation();

	if (!this.dragging) {
		return(true);
	}
// this.log(e);

	this.adjustMouseEvent(e);

	this.dragging.traveled += (e.dx * e.dx);
	this.dragging.traveled += (e.dy * e.dy);
	// this.log(this.dragging.traveled);

	for (var i = 0, stack; stack = this.stacks[i]; i++) {
		var x = 0;
		var y = 0;

		var s = stack.dragBounds;
		var m = {
			x:	e.realX,
			y:	e.realY
		};

		if (!isNaN(this.dragging.offsetX)) {
			m.x += this.dragging.offsetX;
		}
		if (!isNaN(this.dragging.offsetY)) {
			m.y += this.dragging.offsetY;
		}

		if (m.y < s.top) {
			/* The mouse is above the stack */
			y = s.top - m.y;
		} else if (m.y > s.bottom) {
			/* The mouse is below this stack */
			y = m.y - s.bottom;
		} else {
			/* The mouse is directly to the left or right of this stack */
			y = 0;
		}

		if (m.x < s.left) {
			/* The mouse is left of this stack */
			x = s.left - m.x;
		} else if (m.x > s.right) {
			/* The mouse is right of this stack */
			x = m.x - s.right;
		} else {
			/* The mouse is directly above or below this stack */
			x = 0;
		}

		stack.distance = (x * x) + (y * y);

		if (!closest || stack.distance < closest.distance) {
			closest = stack;
		}

		// this.log(stack.name, "distance: ", Math.floor(Math.sqrt(stack.distance)), stack.distance, x, y);
	}

	var cards = [];

	if (this.dragging.to != closest) {
		this.dragging.to = closest;

		/* The cards need to be redrawn instead of just moved */
		changed = true;

		for (var i = 0, card; card = this.dragging.take[i]; i++) {
			cards[i] = card;
		}

		if (closest && closest != this.dragging.from) {
			this.dragging.add = this.allowAddingCards(closest, cards,
									this.dragging.from, this.dragging.card);
		} else {
			this.dragging.add = [];
		}

		if (this.jumpingCards) {
			var pos = {
				left:	closest.dragBounds.left,
				top:	closest.dragBounds.top
			};

			/*
				Adjust the offset so that the stack beign drug is relative to
				the top of the stack it is being drug from.
			*/
			var offset	= this.dragging.from.offset || this.offset;
			var size	= this.getCardSize();
			var count	= this.dragging.from.cards.length - this.dragging.add.length;

			pos.left -= (offset[0] * size[0] / 100) * count;
			pos.top  -= (offset[1] * size[1] / 100) * count;

			this.dragCards(pos, false, true, false);
		} else {
			this.dragCursor(closest.dragBounds);

			if (!this.prefs.highlight || this.dragging.add.length > 0) {
				this.cursor.addClass('highlight');
			} else {
				this.cursor.removeClass('highlight');
			}
		}
	}

	/* Actually position the cards that are being dragged */
	if (!this.jumpingCards) {
		var pos = {
			left:	e.realX - this.dragging.x + this.dragging.stackBounds.left,
			top:	e.realY - this.dragging.y + this.dragging.stackBounds.top
		};

		/* Adjust the offset based on the number of cards being drug */
		if (this.dragging.add.length > 0 &&
			this.dragging.add.length != this.dragging.cardCount
		) {
			var offset	= this.dragging.from.offset || this.offset;
			var size	= this.getCardSize();

			pos.left += (offset[0] * size[0] / 100) * (this.dragging.add.length - this.dragging.cardCount);
			pos.top  += (offset[1] * size[1] / 100) * (this.dragging.add.length - this.dragging.cardCount);
		}

		/* Turn off sloppy while cards are being drug */
		this.dragCards(pos, true, changed, true);
	} else {
		/*
			Place the cursor where the card would be if a card was actually
			being drug. With jumping cards turned on the cursor is just there to
			show the user that dragging is in fact doing something.
		*/
		var size = this.getCardSize();

		this.dragCursor({
			left:	(e.realX - this.left) + this.dragging.offsetX - (size[0] / 2),
			top:	(e.realY - this.top)  + this.dragging.offsetY
		}, true);

	}

	return(false);
},

/* Position cards while dragging */
dragCards: function(pos, keepfirst, changed, hideeffects)
{
	/*
		If keepfirst is true then ensure that at least one card is being drug
		at all times even if it can't be played.
	*/
	var havefirst = false;

	for (var i = 0, card; card = this.dragging.from.cards[i]; i++) {
		if (!havefirst && card == this.dragging.card) {
			havefirst = true;
		}

		if (-1 != enyo.indexOf(card, this.dragging.add) ||
			(keepfirst && havefirst && 0 == this.dragging.add.length && -1 != enyo.indexOf(card, this.dragging.take))
		) {
			/* Turn off rotation and any other effects while dragging */
			this.nudgeCard(card, pos, changed ? 1 : NaN, !this.jumpingCards, hideeffects);
		} else {
			/* Put the card in it's normal position */
			this.nudgeCard(card, this.dragging.stackBounds, changed ? 0 : NaN, true);
		}
	}
},

dragCursor: function(pos)
{
	this.cursor.applyStyle('-webkit-transform',
		'translate(' + pos.left + 'px,' + pos.top + 'px)');

	if (!isNaN(pos.right) && !isNaN(pos.bottom)) {
		this.cursor.applyStyle('width',		(pos.right  - pos.left) + 'px');
		this.cursor.applyStyle('height',	(pos.bottom - pos.top)  + 'px');
	}
},



/*
	Handle touch events just for the same of preventing the default on android
	because it seems to prevent very weird issues that occur if I do not, such
	as sluggishness and missing events.
*/
touchstartHandler: function(sender, e)
{
	// this.log();
	e.preventDefault();
},

touchendHandler: function(sender, e)
{
	// this.log();
	e.preventDefault();
},

touchmoveHandler: function(sender, e)
{
	// this.log();
	e.preventDefault();
},


/* An extending kind may override this to detect when user preferences change */
prefsChanged: function()
{
	var src;

	/* Update the screen size */
	this.getScreenSize();

	this.cardSize	= [];

	this.cardSize.push((this.width * this.cardWidth) / 100);
	this.cardSize.push(this.cardSize[0] * 1.4);

	if (!this.oldcardset || this.oldcardset != this.prefs.cardset) {
		this.oldcardset = this.prefs.cardset;
		this.cacheImages();
	}

	if (this.deck) {
		for (var i = 0, card; card = this.deck[i]; i++) {
			this.placeCard(card, undefined, undefined, undefined, true);
		}
	}

	this.duration	= this.prefs.animations;
	this.delay		= this.prefs.animations;
},


placeCounter: function(stack)
{
	var o;

	if (!stack || !stack.count || !(o = this.getCardOffset(stack, NaN, this.getStackBounds(stack)))) {
		return;
	}

	// this.log(o);

	o.width		= o.right - o.left;
	o.height	= o.bottom - o.top;

	stack.count.applyStyle('left', (o.left + o.width - 16) + 'px');
	stack.count.applyStyle('top',  (o.top - 16) + 'px');
},

getMaxAspectRatio: function()
{
	return(1.5);
},

getScreenSize: function()
{
	var bounds;
	var offset;

	if (this.cards) {
		bounds = this.cards.getBounds();
		offset = this.cards.getOffset();
	} else {
		bounds = this.getBounds();
		offset = { left: 0, top: 0 };
	}

	/*
		If the screen is too wide then the cards will go off the bottom, so
		contrain the aspect ratio.
	*/
	this.applyStyle('max-width', (bounds.height * this.getMaxAspectRatio()) + 'px');
	if (this.cards) {
		this.cards.applyStyle('max-width', (bounds.height * this.getMaxAspectRatio()) + 'px');
	}

	/*
		Set the margins to auto so that everything will be centered if the
		max-width style is used.
	*/
	this.applyStyle('margin-left',	'auto');
	this.applyStyle('margin-right',	'auto');

	this.width	= bounds.width;
	this.height	= bounds.height;

	this.top	= offset.top;
	this.left	= offset.left;

	return(bounds);
},

/*
	This function may be overridden by a game that needs to position it's stacks
	using some method other than CSS for a complex layout.
*/
getStackBounds: function(stack)
{
	return(stack.getBounds());
},

resizeHandler: function()
{
	var		loaded = true;

	/* Update the screen size */
	this.getScreenSize();

	this.cardSize	= [];

	this.cardSize.push((this.width * this.cardWidth) / 100);
	this.cardSize.push(this.cardSize[0] * 1.4);

	if (this.stacks) {
		var b;

		for (var i = this.stacks.length - 1; i >= 0; i--) {
			var stack = this.stacks[i];

			if (!stack || stack.destroyed) {
				this.stacks.splice(i, 1);
				continue;
			}

			if ((b = this.getStackBounds(stack)) && b.height == 0) {
				/* This stack has not finished rendering */

				this.log('Waiting for stack to load', stack.name);
				loaded = false;
			}
			this.placeCounter(stack);
		}
	}

	if (this.deck) {
		for (var i = 0, card; card = this.deck[i]; i++) {
			if (card.img) {
				this.placeCard(card, undefined, undefined, undefined, true);
			}
		}
	}

	if (!loaded) {
		setTimeout(enyo.bind(this, this.resizeHandler), 500);
	} else {
		/*
			Some devices do weird things with the resize handler, so just for
			good measure trigger it again.
		*/
		if (!this.getMoving() && this.finishedDeal &&
			 ++this.resizeCounter < 3
		) {
			setTimeout(enyo.bind(this, this.resizeHandler), 100);
		} else {
			this.resizeCounter = 0;
		}
	}
},

/*
	Make sure that all of the card stacks are loaded, and then start dealing the
	game.  If we start dealing before they are loaded then bad things happen.
*/
loadGame: function()
{
	var components = this.getComponents();

	this.stacks = [];
	for (var i = 0, c; c = components[i]; i++) {
		var node;

		if (c.kind != "CardStack" || c.destroyed) {
			continue;
		}
		this.stacks.push(c);

		if (!c.set) {
			if (!c.bgsrc) {
				c.bgsrc = 'blank.png';
			}

			c.set = true;

			c.setSrc(this.prefs.cardset + c.bgsrc);
		}

		if (true === c.count) {
			c.count = this.createComponent({
				kind:		enyo.Control,
				className:	'count'
			}, { owner: this });

			c.count.render();
		}

		if ((node = c.hasNode())) {
			node.stack = c;
		}
	}

	if (this.deck) {
		return;
	}

	for (var i = 0, stack; stack = this.stacks[i]; i++) {
		var b;

		if (!(b = this.getStackBounds(stack)) ||
			undefined == b.left		||
			undefined == b.top		||
			undefined == b.width	|| 0 == b.width		||
			undefined == b.height	|| 0 == b.height
		) {
			this.log('Game not ready', b, stack.name);

			enyo.job("loadGame", enyo.bind(this, this.loadGame), 300);
			return;
		}
	}

	if (!this.state) {
		this.log('Shuffling...');
		this.shuffle();
	} else {
		this.log('Restoring...');
		this.restore(this.state);
	}
},

cacheImages: function()
{
	var img;
	var other	= [
		'back.png',
		'base.png',
		'clubs.png',
		'hearts.png',
		'basefree.png',
		'blank.png',
		'diams.png'
	];

	this.images = [];

	/* Get all the card images first */
	for (var r = 1; r <= 13; r++) {
		for (var s = 0; s < this.suits.length; s++) {
			img = new Image();

			img.src = this.getCardSrc([ s, r ]);
			this.images.push(img);
		}
	}

	/* And all the other images in the cardset */
	for (var i = 0; i < other.length; i++) {
		img = new Image();
		img.src = this.prefs.cardset + other[i];
		this.images.push(img);
	}

	/* And the shadow for highlight */
	img = new Image();
	img.src = 'images/shadow.png';
	this.images.push(img);

	/*
		And the no shadow for regular cards (needed to work around rendering
		issue in chrome.)
	*/
	img = new Image();
	img.src = 'images/noshadow.png';
	this.images.push(img);

	/* Check the progress */
	var check = function() {
		var progress = this.checkImages();

		this.doBusyStart({ 'progress': progress });

		if (progress === 1) {
			/* Done, apply the new images */
			if (this.deck) {
				for (var i = 0, card; card = this.deck[i]; i++) {
					this.setCardImage(card);
				}
			}

			if (this.stacks) {
				for (var i = 0, stack; stack = this.stacks[i]; i++) {
					if (stack.bgsrc) {
						stack.setSrc(this.prefs.cardset + stack.bgsrc);
					}
				}
			}

			this.doBusyEnd();

			if (!this.history) {
				/* Start loading again now that we have images cached */
				this.beginGame();
			}
		} else {
			enyo.nextTick(this, check);
		}
	};

	enyo.nextTick(this, check);
	this.doBusyStart({ progress: 0 });
},

checkImages: function()
{
	if (!this.images) {
		return(0);
	}

	var		total	= 0;
	var		loaded	= 0;

	total = this.images.length;

	for (var i = 0, img; img = this.images[i]; i++) {
		if (img.complete) {
			loaded++;
		}
	}

	// this.log('Caching images', loaded, total, loaded / total);
	return(loaded / total);
},

create: function()
{
	this.inherited(arguments);

	this.resizeCounter = 0;

	/* Defaults */
	this.transformStr	= 'translate3d(0, 0, 0)';
	this.transitionStr	= "-webkit-transform";

	if (net.minego.android) {
		/*
			A 3D transform is used for most platforms before the rotate because
			it forces the browser to use the accelerated path.

			Android 2.x does not support 3D transforms though, and android 3.x
			and 4.x have many rendering issues when they are used.
		*/
		this.transformStr = null;
	}

	/* Set a default drag radius */
	if (net.minego.desktop || net.minego.android) {
		this.dragRadius = 10;
	} else {
		this.dragRadius = 100;
	}

	/* Bind items functions that are being manually set as event listeners */
	this.animateNextCard	= enyo.bind(this, this.animateNextCard);

	/*
		Set the orientation back to free whenever starting a game.  Some games
		require one orientation or another, and will set it to what they need.

		So, we need to clean up after those games.
	*/
	enyo.setAllowedOrientation('free');

	/* Create a container to hold the cards */
	this.cards = this.createComponent({
		kind:			enyo.Control,
		name:			'cards',
		className:		'playArea'
	}, { owner: this });

	this.cursor = this.createComponent({
		kind:			enyo.Control,
		name:			'cursor',
		className:		'cursor',

		style:			'display: none;'
	}, { owner: this });

	if (!this.timer) {
		this.timer = this.createComponent({
			kind:		'GameTimer',
			name:		'timer'
		}, { owner: this });
	}

	/* Create an array to show a message */
	this.hint = this.createComponent({
		kind:			enyo.Control,
		name:			'hint',
		className:		'hint'
	}, { owner: this });
},

destroy: function()
{
	this.record();

	this.inherited(arguments);
},

/* Add an entry to the history for statistics */
record: function()
{
	var streak;
	var e;

	if (!this.history) {
		return;
	}

	if (!this.restarted && !this.history.length) {
		/*
			No point in saving a record for a game where nothing happened,
			unless this game has already been restarted.
		*/
		return;
	}

	if (this.recorded) {
		/* Only add a record once per game */
		return;
	}
	this.recorded = true;

	e = { actions: [] };

	this.score(e);

	/* We don't need the actions list here */
	delete e.actions;

	/* Keep track of the length of the winning streak (or reset it) */
	streak = SolPlayers.getCookie(0, 'streak') || {};

	if (this.scoreWin(e)) {
		if (isNaN(streak[this.kind])) {
			streak[this.kind] = 0;
		}

		streak[this.kind]++;
	} else {
		streak[this.kind] = 0;
	}

	SolPlayers.setCookie(0, 'streak', streak);


	if (!this.prefs.readonly) {
		// TODO	Keep track of the number of undos, and the number of undos that
		//		hide a card (ie cheating)

		/* Insert the new record */
		SolPlayers.getDB().transaction(enyo.bind(this, function(tx) {
			tx.executeSql("INSERT INTO stats (player, timestamp, type, gamenum, duration, score, moves) VALUES (?, ?, ?, ?, ?, ?, ?)", [
				SolPlayers.getPlayer(),			/* Player		*/
				(new Date()).getTime(),			/* Timestamp	*/

				this.kind,						/* Game Type	*/
				this.gamenum,					/* Deal Number	*/
				this.timer.getElapsed(true),	/* Elapsed Time	*/
				enyo.json.stringify(e),			/* Score		*/
				this.history.length				/* Moves		*/
			], function(tx, result) {}, function(tx, e) {
				console.log('Error: ' + e.message);
			});
		}));
	}
},

setCardImage: function(card)
{
	var src	= this.getCardSrc(card);
	var p;

	if (card.img && -1 != card.img.src.indexOf(src) && card.img.complete) {
		/* Already set */
		return(card.img);
	}

	if (!card.img) {
		card.img = new Image();

		card.img.card						= card;
		card.img.style.position				= 'absolute';
		this.styleCard(card);

		this.cards.hasNode().appendChild(card.img);
	}

	card.img.src = src;

	if (card.stack && card.stack.hidden) {
		card.img.className = 'card hidden';
	} else if (card.highlight) {
		card.img.className = 'card highlight';
	} else {
		card.img.className = 'card';
	}

	return(card.img);
},

beginGame: function()
{
	var bounds	= this.getScreenSize();
	var created	= 0;

	if (!this.hasRendered) {
		return;
	}

	if (!this.deck) {
		/* Start the shuffle */
		this.loadGame();
		return;
	}

	/* Ensure the cards are all loaded before we deal */
	for (var i = 0, card; card = this.deck[i]; i++) {
		if (!card.img) {
			card.x = (bounds.width / 2);
			card.y = (bounds.height - 2);

			this.setCardImage(card);

			created++;
		}
	}

	if (created) {
		this.resizeHandler();
		enyo.nextTick(this, this.beginGame);
		return;
	}

	if (this.history) {
		return;
	}

	/* This will cause the images to be cached */
	this.prefsChanged();

	if (1 != this.checkImages()) {
		return;
	}

	/* Finish the deal */
	this.doShuffleDone();

	if (!this.state) {
		/* All done, let the deal happen */
		this.deal();

		if (!this.getMoving()) {
			this.finishedDeal = true;
			this.dealDone();
		}

		/*
			Start the history AFTER the deal is complete.  You can't undo the
			deal itself.
		*/
		this.history = [];
	} else {
		/* Restore the previous state */
		for (var i = 0; i < this.stacks.length; i++) {
			this.moveCards(this.state.stacks[i].cards, this.stacks[i], true);
		}

		this.timer.stop();
		this.timer.start(this.state.elapsed);

		this.finishedDeal = true;
		this.dealDone();

		this.history = this.state.history;

		this.state = null;
		this.cardsMoved();
	}
},

rendered: function()
{
	this.inherited(arguments);

	this.hasRendered = true;

	setTimeout(enyo.bind(this, this.beginGame), 300);
}

});
