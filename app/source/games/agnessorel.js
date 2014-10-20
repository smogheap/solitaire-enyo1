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

name:						"klondike:agnes sorel",
kind:						"klondike",
className:					"klondike",

cardWidth:					12,
drawcount:					1,
redeal:						0,
staggered:					true,
kingsOnly:					true,

rendered: function()
{
	/* There is no waste in agnes sorel */
	this.$.waste.bgsrc	= 'blank.png';
	this.$.waste.inplay	= false;
	this.$.waste.count	= false;

	this.inherited(arguments);
},

deal: function(gamenum)
{
	var autoplay;
	var base;

	autoplay = this.prefs.autoPlay;
	this.prefs.autoPlay = false;

	this.inherited(arguments);

	/*
		Deal the top card from the deck to one of the foundations.  It's rank
		sets the base rank for the game.
	*/
	base = this.$.deck.cards.slice(-1)[0];

	for (var i = 1, f; f = this.$["foundation" + i]; i++) {
		if (base[0] == f.suit) {
			this.moveCard(base, f, false, false);
		}

		f.setSrc(this.getCardSrc([ f.suit, base[1] ]));

		/*
			The foundations use a card image showing the base, so make them
			transparent.  (Just like in canfield.)
		*/
		f.applyStyle('opacity', '0.4');
	}
	this.startRank = base[1];

	this.prefs.autoPlay = autoplay;
},

/*
	In klondike cards must alternate in color, but in agnes sorel they must
	match, so negate the result of the normal colorMatch function.
*/
colorsMatch: function(carda, cardb)
{
	return(!this.inherited(arguments));
},

draw: function()
{
	if (this.dealing()) {
		return;
	}

	/*
		Deal one card to each tableau.

		This has to be done as a single operation.
	*/
	this.beginMove();
	for (var i = 1, to; to = this.$["tableau" + i]; i++) {
		this.moveCards(this.$.deck.cards.slice(-1), to, false, false);
	}
	this.endMove();
}

});

