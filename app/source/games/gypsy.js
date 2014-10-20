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

name:						"klondike:gypsy",
kind:						"klondike",
className:					"gypsy",

decks:						2,

cardWidth:					9,
drawcount:					1,
redeal:						0,
staggered:					false,
kingsOnly:					false,
tableaucount:				8,

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
				className:	"foundation",
				name:		"foundation",
				kind:		enyo.Control,
				nodeTag:	"span",

				components: [
					{ kind:	"CardStack", bgsrc: "clubs.png",  name: "foundation1", offset: [ 0, 0 ], "suit": 0 },
					{ kind:	"CardStack", bgsrc: "diams.png",  name: "foundation2", offset: [ 0, 0 ], "suit": 1 },
					{ kind:	"CardStack", bgsrc: "hearts.png", name: "foundation3", offset: [ 0, 0 ], "suit": 2 },
					{ kind:	"CardStack", bgsrc: "spades.png", name: "foundation4", offset: [ 0, 0 ], "suit": 3 },
					{ kind:	"CardStack", bgsrc: "clubs.png",  name: "foundation5", offset: [ 0, 0 ], "suit": 0 },
					{ kind:	"CardStack", bgsrc: "diams.png",  name: "foundation6", offset: [ 0, 0 ], "suit": 1 },
					{ kind:	"CardStack", bgsrc: "hearts.png", name: "foundation7", offset: [ 0, 0 ], "suit": 2 },
					{ kind:	"CardStack", bgsrc: "spades.png", name: "foundation8", offset: [ 0, 0 ], "suit": 3 }
				]
			}
		]
	},

	{
		className:			"tableau",
		name:				"tableau",
		kind:				enyo.Control,

		components: [
			{
				name:		"dummy2",
				offset:		[ 0, 0 ],
				kind:		"CardStack",
				bgsrc:		"blank.png",
				inplay:		false,

				style:		"width: 3%;"
			},

			{ kind:			"CardStack", name: "tableau1", inplay: true },
			{ kind:			"CardStack", name: "tableau2", inplay: true },
			{ kind:			"CardStack", name: "tableau3", inplay: true },
			{ kind:			"CardStack", name: "tableau4", inplay: true },
			{ kind:			"CardStack", name: "tableau5", inplay: true },
			{ kind:			"CardStack", name: "tableau6", inplay: true },
			{ kind:			"CardStack", name: "tableau7", inplay: true },
			{ kind:			"CardStack", name: "tableau8", inplay: true }
		]
	}
],

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

