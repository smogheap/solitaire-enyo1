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

// TODO	Check to see if the apps are installed... or, if the app isn't installed
//		just send the user to the app catalog for that app?

enyo.kind(
{

name:						"Share",
kind:						enyo.Control,

published: {
	msg:					'',
	menuItems:				''
},

components: [
	{
		name:				"launchApp",
		kind:				"PalmService",
		service:			"palm://com.palm.applicationManager/",
		method:				"open",
		onSuccess:			"close",
		onFailure:			"catalog",
		subscribe:			false
	}
],

getMenuItems: function()
{
	var items = [];

	if (!net.minego.playbook) {
		/* The playbook does not have an email client (yet) */
		items.push({
			caption:			$L("E-Mail"),
			onclick:			"share",
			value:				"email"
		});
	}

	items.push({
		caption:			$L("twitter"),
		onclick:			"share",
		value:				"twitter"
	});

	if (window.PalmSystem) {
		items.push({
			caption:			$L("Spaz HD"),
			onclick:			"share",
			value:				"spaz"
		});

		items.push({
			caption:			$L("Glimpse"),
			onclick:			"share",
			value:				"glimpse"
		});

		items.push({
			caption:			$L("Facebook"),
			onclick:			"share",
			value:				"facebookApp"
		});
	}

	return(items);
},

openMenu: function(e, msg, subject, force)
{
	if (msg) {
		this.setMsg(msg);
	}

	if (!force && net.minego.android) {
		/*
			Let android show it's own intent menu instead of trying to build our
			own list.
		*/
		var extras = {};

		extras[WebIntent.EXTRA_SUBJECT]	= subject || 'Solitaire Universe';
		extras[WebIntent.EXTRA_TEXT]	= this.getTweet();

		window.plugins.webintent.startActivity({
				action:		WebIntent.ACTION_SEND,
				type:		'text/plain',
				extras:		extras
			},
			function() {},
			function() {
				this.openMenu(e, msg, subject, true);
			}
		);

		return;
	}

	if (!this.$.menu) {
		this.createComponent({
			kind:			"Menu",
			components:		this.getMenuItems()
		});
	}

	this.$.menu.openAtEvent(e);
},

getTweet: function()
{
	var msg = [];

	// msg.push('@webossolitare');
	msg.push(this.msg);
	msg.push('http://solitaireuniverse.net');
	msg.push('#SolitaireUniverse');

	return(msg.join(' '));
},

email: function()
{
	this.openEmail(null, this.msg,
		'Try Solitaire Universe! http://solitaireuniverse.net');
},

twitter: function()
{
	if (navigator.userAgent.match(/Chrome/)) {
		window.open(
			'http://sparrow.appstuh.com/chromebeta/compose.html?tweetText=' +
			encodeURIComponent(this.getTweet()) + '&failRedirect=' +
			encodeURIComponent(
				'http://twitter.com/share?url=www.minego.net/universe&text=' +
				encodeURIComponent(this.getTweet())
			), '_share', 'width=500,height=500,status=1');
	} else {
		this.openURL(
			'http://twitter.com/share?url=www.minego.net/universe&text=' +
			encodeURIComponent(this.getTweet()));
	}
},

spaz: function()
{
	this.appid = 'com.funkatron.app.spaz-hd';

	this.$.launchApp.call({
		id:				this.appid,
		params: {
			action:		'prePost',
			msg:		this.getTweet(),
			tweet:		this.getTweet()
		}
	});
},

glimpse: function()
{
	this.appid = 'com.ingloriousapps.glimpse';

	this.$.launchApp.call({
		id:				this.appid,
		params: {
			query:		'tweet/' + this.getTweet()
		}
	});
},

facebookApp: function()
{
	this.appid = 'com.palm.app.enyo-facebook';

	this.$.launchApp.call({
		id:				this.appid,
		params: {
			type:		'status',
			statusText:	this.msg + ' http://goo.gl/LlJuE'
		}
	});
},

share: function(sender, e)
{
	if (this[sender.value]) {
		this[sender.value]();
	}
},

catalog: function()
{
	if (this.appid) {
		this.openURL("https://developer.palm.com/appredirect/?packageid=" + this.appid);
	}
},

openEmail: function(to, subject, body)
{
	try {
		blackberry.invoke.invoke(blackberry.invoke.APP_MESSAGES,
			new blackberry.invoke.MessageArguments(to, subject, body));
	} catch (e) {
		var url		= 'mailto:';
		var args	= [];

		if (to) {
			email += to;
		}

		if (subject) {
			args.push('subject=' + encodeURIComponent(subject));
		}
		if (body) {
			args.push('body=' + encodeURIComponent(body));
		}

		if (args.length > 0) {
			url += '?' + args.join('&');
		}

		this.openURL(url);
	}
},

openURL: function(url)
{
	try {
		blackberry.invoke.invoke(blackberry.invoke.APP_BROWSER,
			new blackberry.invoke.BrowserArguments(url));
	} catch (e) {
		window.open(url, '_blank');
	}
},

close: function()
{
	this.msg = '';
	this.inherited(arguments);
}

});

