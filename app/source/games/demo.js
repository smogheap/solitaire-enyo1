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

// TODO	Add a link to the home page in the bottom corner

// TODO	Add a link to follow @webossolitaire or @_minego in the bottom corner

// TODO	Show one card with each cardset fanned out and if a user selects one
//		then change to that cardset, and use it for the next game started

enyo.kind(
{

name:								"DemoGame",
className:							"DemoGame",
kind:								"Solitaire",

cardWidth:							15,

components: [{
	name:							"stack",
	kind:							"CardStack",
	style: [
		"position:					absolute;",
		"left:						50%;",
		"top:						50%;",
		"margin-left:				-160px;"
	].join("")
}],

deal: function(gamenum)
{
	this.inherited(arguments);

	/* Put all the cards into one sloppy stack */
	for (var i = 0, card; card = this.deck[i]; i++) {
		if (0 == (i % 5)) {
			/* Make a few cards face down */
			card[2] = true;
		}

		this.moveCard(card, this.$.stack);
	}
},

rendered: function()
{
	/* Throw the cards all over the place */
	this.sloppy	= (this.getBounds().width - 320) / 2;
	this.offset	= [ 0, 0, 0, 0 ];
	this.decks	= 1;

	this.inherited(arguments);
},

/* Only create a few cards, a whole deck is a bit much for the demo screen */
newDeck: function(suits, decks, ranks)
{
	var deck = this.inherited(arguments);

	for (var i = deck.length - 1; i >= 0; i--) {
		if (Math.floor(Math.random() * 5) != 0) {
			deck.splice(i, 1);
		}
	}

	this.log(deck.length);
	return(deck);
},

/* Ignore the user's settings for animation speed here */
prefsChanged: function()
{
	this.inherited(arguments);

	/* Deal the cards slowly on the demo screen */
	this.duration	= 700;
	this.delay		= 2000;
}

});



