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

SolPlayers = {

player:		NaN,
db:			null,

setPlayer: function(id)
{
	var v;

	SolPlayers.player = id;

	if (id >= 0) {
		SolPlayers.setCookie(0, "player", id);
	}
},

getPlayer: function()
{
	if (!isNaN(SolPlayers.player)) {
		return(SolPlayers.player);
	}

	return(SolPlayers.getCookie(0, "player") || 0);
},

getPlayers: function()
{
	var players		= SolPlayers.getCookie(0, "players") || [];

	if (!players.length) {
		players.push({
			name:		"Player",
			id:			0
		});
	}

	return(players);
},

getName: function(id)
{
	var players		= SolPlayers.getPlayers();

	for (var i = 0, p; p = players[i]; i++) {
		if (id == p.id) {
			return(p.name);
		}
	}

	return($L("Unknown"));
},

getComponents: function(fields)
{
	var players		= SolPlayers.getPlayers();
	var components	= [];

	for (var i = 0, p; p = players[i]; i++) {
		components.push({
			caption:		p.name,
			value:			p.id
		});
	}

	if (fields) {
		for (var i = 0, c; c = components[i]; i++) {
			enyo.mixin(c, fields);
		}
	}

	return(components);
},

add: function(name)
{
	var players		= SolPlayers.getPlayers();
	var id			= (new Date()).getTime();

	players.push({
		name:		name,
		id:			id
	});

	SolPlayers.setCookie(0, "players", players);

	return(id);
},

rename: function(id, name)
{
	if (SolPlayers.set(id, { name: name })) {
		return(id);
	} else {
		return(SolPlayers.add(name));
	}
},

del: function(id)
{
	var players		= SolPlayers.getPlayers();

	for (var i = 0, p; p = players[i]; i++) {
		if (p.id == id) {
			players.splice(i, 1);

			SolPlayers.setCookie(0, "players", players);
			return;
		}
	}
},

set: function(id, options)
{
	var players		= SolPlayers.getPlayers();

	for (var i = 0, p; p = players[i]; i++) {
		if (p.id == id) {
			if (options.name) {
				p.name = options.name;
			}

			SolPlayers.setCookie(0, "players", players);
			return(true);
		}
	}

	return(false);
},

getCookie: function(id, name)
{
	var		value;
	var		key;

	if (isNaN(id)) {
		id = SolPlayers.getPlayer();
	}

	if (!name || isNaN(id) || id < 0) {
		return(null);
	}

	if (id == 0) {
		/* ID 0 gets all the old values */
		key = name;
	} else {
		key = name + "_" + id;
	}

	/* Try reading from local storage first */
	try {
		value = window.localStorage.getItem(key);
	} catch (e) {
		value = null;
	}

	/* Fall back on cookies */
	if (!value) {
		value = enyo.getCookie(key);
	}

	try {
		return(enyo.json.parse(value));
	} catch (e) {
		// console.log(e.message);
	}

	return(null);
},

setCookie: function(id, name, value)
{
	var json;
	var key;

	if (isNaN(id)) {
		id = SolPlayers.getPlayer();
	}

	if (!name || isNaN(id) || id < 0) {
		return;
	}

	json = enyo.json.stringify(value);
	if (id == 0) {
		key = name;
	} else {
		key = name + "_" + id;
	}

	/* Store it in local storage and as a cookie (just in case) */
	if (window.localStorage) {
		window.localStorage.setItem(key, json);
	}
	enyo.setCookie(key, json);
},

getDB: function()
{
	var db		= SolPlayers.db;
	var query	= 'CREATE TABLE stats (' + [
						'player		REAL',
						'timestamp	REAL',
						'type		TEXT',
						'gamenum	REAL',
						'duration	REAL',
						'score		TEXT',
						'moves		REAL'
					].join(', ') + ')';

	if (!db) {
		db = openDatabase('ext:solitaire', '', 'Solitaire Statistics', 200000);
	}

	if (db) {
		db.transaction(function(tx) {
			tx.executeSql('SELECT COUNT(*) FROM stats', [], function(result) {

			}, function(tx, error) {
				tx.executeSql(query, [],
					function(tx, result) {},
					function(tx, e) {
						console.log('Error: ' + e.message);
					}
				);
			});
		});
    }

	return((SolPlayers.db = db));
}

};

