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

name:						"golf:tripeaks",
kind:						"golf_common",
className:					"tripeaks",
cardWidth:					8,
relaxed:					true,

components: [
	{
		className:			"tableau",
		name:				"tableau",
		kind:				enyo.Control
	},
	{
		name:				"deck",
		offset:				[ 0, 0 ],
		kind:				"CardStack",
		bgsrc:				"blank.png",
		deck:				true,
		count:				true
	},
	{
		name:				"foundation",
		offset:				[ 10, 0 ],
		kind:				"CardStack",
		bgsrc:				"blank.png",
		count:				true
	}
],

tableauName: function(peak, column, row)
{
	return("tableau-" + peak + "-" + column + "-" + row);
},

getTableau: function(peak, column, row)
{
	var name;

	if ((name = this.tableauName(peak, column, row))) {
		return(this.$[name]);
	} else {
		return(null);
	}
},

create: function()
{
	this.inherited(arguments);

	this.rows	= 4;
	var width	= 10;

	/* Deal 3 small pyramids, but the bottom row merges */
	for (var p = 1; p <= 3; p++) {
		for (var r = 1; r <= this.rows; r++) {
			for (var c = 1; c <= r; c++) {
				var l;
				var stack;

				if (p < 3 && r == this.rows && c == r) {
					/*
						Don't add the last card, it will be shared with the left
						most card of the next peak.
					*/
					continue;
				}

				l = 48 - this.cardWidth;
				l -= (width * (r / 2));
				l += (width * c);

				/* Adjust the position for the peak */
				l += (width * (this.rows - 1) * (p - 2));

				stack = this.$.tableau.createComponent({
					kind:			"CardStack",
					name:			this.tableauName(p, c, r),
					inplay:			true,
					row:			r,
					column:			c,
					peak:			p,
					offset:			[ 0, 0 ],

					bgsrc:			"blank.png"
				}, { owner: this });
			}
		}
	}
},

getStackBounds: function(stack)
{
	var cardSize	= this.getCardSize();

	if (!this.cards || isNaN(cardSize[0]) || isNaN(cardSize[1])) {
		return(stack.getBounds());
	}

	var bounds		= this.getBounds();
	var w			= 10;
	var height		= this.height;

	if (height > this.width * 0.8) {
		height = this.width * 0.8;
	}

	if (!isNaN(stack.row) && !isNaN(stack.column) && !isNaN(stack.peak)) {
		var l = 48;
		l -= (w * (stack.row / 2));
		l += (w * stack.column);

		/* Adjust the position for the peak */
		l += (w * (this.rows - 1) * (stack.peak - 2));

		l = bounds.width * l / 100;

		var t = (stack.row + 1) * 7;
		t = height * t / 100;

		stack.applyStyle('position',		'absolute');
		stack.applyStyle('left',			(bounds.left + l - cardSize[0]) + 'px');
		stack.applyStyle('top',				(bounds.top + t) + 'px');
	} else {
		switch (stack.name) {
			case 'deck':
				stack.applyStyle('position','absolute');
				stack.applyStyle('left',	(bounds.left + cardSize[0]) + 'px');
				stack.applyStyle('top',		(bounds.top + (height * 0.25) + (cardSize[1] * 2)) + 'px');
				break;

			case 'foundation':
				stack.applyStyle('position','absolute');
				stack.applyStyle('left',	(bounds.left + (cardSize[0] * 2) + 10) + 'px');
				stack.applyStyle('top',		(bounds.top + (height * 0.25) + (cardSize[1] * 2)) + 'px');
				break;

			default:
				break;
		}
	}

	return(stack.getBounds());
},

deal: function(gamenum)
{
	this.inherited(arguments);

	/*
		Deal 1 cards to each tableau.  They should all be face down if any cards
		overlap them.
	*/
	var stack;
	var deck = this.deck.slice(0);

	for (var r = 1; r <= this.rows; r++) {
		for (var p = 1; p <= 3; p++) {
			for (var c = 1; c <= r; c++) {
				if ((stack = this.getTableau(p, c, r))) {
					this.moveCard(deck.shift(), stack, r < this.rows, r < this.rows);
				}
			}
		}
	}

	/* Deal one card to the foundation */
	this.moveCard(deck.shift(), this.$.foundation);

	/* Deal the remaining cards to the deck face down */
	this.moveCards(deck, this.$.deck, true, true);
},

moveCards: function()
{
	this.inherited(arguments);

	if (!this.history) {
		/* Don't autoplay while dealing, or while undoing history. */
		return;
	}

	/* Flip any cards that where exposed by the last move */
	var last;
	var from;
	var flipped = [];

	if ((last = this.history.slice(-1)[0]) && last.from &&
		(from = this.$[last.from])
	) {
		/*
			Check the cards that this was covering.  If they are no longer
			covered then flip them.

			a and b are the stacks that might need to be flipped, and x and y
			are the stacks that might still be covering them.
		*/
		var a = this.getTableau(from.peak, from.column - 1, from.row - 1);
		if (!a && from.row == this.rows) {
			a = this.getTableau(from.peak - 1, this.rows - 1, from.row - 1);
		}

		var b = this.getTableau(from.peak, from.column - 0, from.row - 1);
		if (!b && from.row == this.rows) {
			b = this.getTableau(from.peak + 1, 1, from.row - 1);
		}

		var x = this.getTableau(from.peak, from.column - 1, from.row);
		if (!x && from.row == this.rows) {
			x = this.getTableau(from.peak - 1, this.rows - 1, from.row);
		}

		var y = this.getTableau(from.peak, from.column + 1, from.row);
		if (!y && from.row == this.rows) {
			y = this.getTableau(from.peak + 1, 1, from.row);
		}

		if ((!x || x.cards.length == 0) && a && a.cards.length == 1) {
			this.flipCard(a.cards[0], false, this.delay);

			flipped.push([ a.cards[0][0], a.cards[0][1] ]);
		}

		if ((!y || y.cards.length == 0) && b && b.cards.length == 1) {
			this.flipCard(b.cards[0], false, this.delay);

			flipped.push([ b.cards[0][0], b.cards[0][1] ]);
		}

		if (flipped.length) {
			last.flipped	= flipped;
			last.safe		= false;

			this.highlightCards(true);
		}
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
	if ((last = this.history.slice(-1)[0]) && last.from &&
		(from = this.$[last.from]) && last.flipped
	) {
		for (var i = 0, f; f = last.flipped[i]; i++) {
			if ((card = this.findCard(f[0], f[1]))) {
				this.flipCard(card, true);
			}
		}
	}

	this.highlightCards(true);

	this.inherited(arguments);
},

/* Don't use the golf terminoligy for tri peaks */
scoreStr: function(e)
{
	if (!isNaN(e.score)) {
		s = e.score;
	} else if (!isNaN(e.online)) {
		s = -(e.online) - 52;
	}

	return($L("Score") + ": " + e.score);
},

scoreAdd: null,

/* Is this score a win? */
scoreWin: function(e)
{
	if (e.inplay == 0) {
		return(true);
	} else {
		return(false);
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


