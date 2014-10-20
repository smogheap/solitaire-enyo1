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

name:						"ChooseDeal",
kind:						"ModalDialog",

caption:					$L("Deal game by number"),

published: {
	number:					1
},

events: {
	onDeal:					""
},

components: [
	{
		kind:				"Input",
		name:				"num",
		selectAllOnFocus:	true,
		spellcheck:			false,
		autocorrect:		false,
		autoKeyModifier:	"num-lock",
		autoWordComplete:	false
	},
	{
		layoutKind:			"VFlexLayout",
		pack:				"center",
		components: [
			{
				caption:	$L("Deal"),
				kind:		"Button",
				onclick:	"deal"
			},
			{
				caption:	$L("Deal next game"),
				kind:		"Button",
				onclick:	"dealnext"
			},
			{
				caption:	$L("Cancel"),
				kind:		"Button",
				onclick:	"close"
			}
		]
	}
],

setNumber: function(value)
{
	if (this.$.num) {
		this.$.num.setValue(value);
	}

	this.number = value;
},

deal: function()
{
	this.close();
	this.doDeal({ gamenum: this.$.num.getValue() });
},

dealnext: function()
{
	this.close();
	this.doDeal({ gamenum: (1 * this.$.num.getValue()) + 1 });
},

rendered: function()
{
	this.inherited(arguments);

	this.$.num.setValue(this.number);
	this.$.num.forceFocus();
}

});

