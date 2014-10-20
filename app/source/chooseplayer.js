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

name:								"ChoosePlayer",

kind:								"net.minego.toaster",

events: {
	onSelected:						""
},

published: {
	value:							-1
},

components: [
	{
		name:						"PlayerNameDialog",
		kind:						"ModalDialog",

		caption:					$L("Player Name"),

		components: [
			{
				kind:				"Input",
				name:				"PlayerName",
				selectAllOnFocus:	true
			},
			{
				kind:				"Button",
				caption:			$L("Ok"),
				onclick:			"setPlayer"
			},
			{
				kind:				"Button",
				caption:			$L("Cancel"),
				onclick:			"backHandler"
			}
		]
	},

	{	className:					"enyo-sliding-view-shadow" },
	{
		kind:						enyo.VFlexBox,
		flex:						1,
		height:						"100%",
		width:						"320px",

		components: [
			{
				content:			$L("Player Profiles"),
				kind:				"PageHeader",
				layoutKind:			"VFlexLayout",
				className:			"enyo-header-dark"
			},
			{
				name:				"list",
				kind:				"VirtualList",
				flex:				1,
				style:				"background-color: #f1f1f1;",

				onSetupRow:			"setupRow",
				components: [{
					name:			"row",

					kind:			"SwipeableItem",
					layoutKind:		"VFlexLayout",

					onConfirm:		"deleteItem",
					onclick:		"options",

					components: [
						{ name:		"player" }
					]
				}]
			},
			{
				kind:				"Toolbar",
				components: [
					{
						kind:		"GrabButton",
						onclick:	"close"
					},
					{
						kind:		"Spacer"
					},
					{
						kind:		"ToolButton",
						onclick:	"newPlayer",
						icon:		"images/toolbar-icon-new.png"
					}
				]
			}
		]
	},
	{
		name:						"menu",
		kind:						"Menu",
		components: [
			{
				name:				"playerMenuItem",
				caption:			$L("Play as this player"),
				onclick:			"choosePlayer"
			},
			{
				name:				"renameMenuItem",
				caption:			$L("Rename"),
				onclick:			"renamePlayer"
			},
			{
				name:				"deleteMenuItem",
				caption:			$L("Delete"),
				onclick:			"deletePlayer"
			}
		]
	}
],

create: function()
{
	this.inherited(arguments);
},

open: function(type, name, game)
{
	this.players = SolPlayers.getPlayers() || [];

	this.players.push({
		name:		$L("Guest"),
		id:			-1
	});

	this.inherited(arguments);

	this.$.list.refresh();
},

setupRow: function(sender, index)
{
	var player;

	if (!this.players || !(player = this.players[index])) {
		return(false);
	}

	this.$.player.setContent(player.name);

	if (-1 == player.id || this.players.length <= 2) {
		/* You can't delete guest or the last player */
		this.$.row.setSwipeable(false);
	} else {
		this.$.row.setSwipeable(true);
	}
	return(true);
},

deleteItem: function(sender, index)
{
	SolPlayers.del(this.players[index].id);
	this.open();
},

options: function(sender, e, index)
{
	this.selectedID = this.players[index].id;

	this.$.menu.openAtEvent(e);

	if (-1 == this.selectedID) {
		/* You can't rename or delete the guest player */
		this.$.renameMenuItem.setDisabled(true);
		this.$.deleteMenuItem.setDisabled(true);
	} else if (this.players.length <= 2) {
		/* You can't delete the last player, but you can rename it */
		this.$.renameMenuItem.setDisabled(false);
		this.$.deleteMenuItem.setDisabled(true);
	} else {
		this.$.renameMenuItem.setDisabled(false);
		this.$.deleteMenuItem.setDisabled(false);
	}

	this.$.playerMenuItem.setCaption($L("Play as") + " " + this.players[index].name);
},

setPlayer: function()
{
	SolPlayers.rename(this.selectedID, this.$.PlayerName.getValue());
	this.backHandler();
	this.open();
},

newPlayer: function()
{
	this.selectedID = NaN;

	this.$.PlayerNameDialog.openAtCenter();
	this.$.PlayerName.setValue('');
	this.$.PlayerName.forceFocus();
},

renamePlayer: function()
{
	this.$.PlayerNameDialog.openAtCenter();
	this.$.PlayerName.setValue(SolPlayers.getName(this.selectedID));
	this.$.PlayerName.forceFocus();
},

deletePlayer: function()
{
	SolPlayers.del(this.selectedID);
	this.open();
},

choosePlayer: function()
{
	SolPlayers.setPlayer(this.selectedID);
	this.close();

	this.doSelected(this.selectedID);
},

backHandler: function()
{
	this.$.PlayerNameDialog.close();
},

getValue: function()
{
	return(this.selectedID);
}


});


