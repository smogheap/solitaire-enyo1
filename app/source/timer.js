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

name:							"GameTimer",
kind:							enyo.Control,

create: function()
{
	try {
		this.fullFmt	= new enyo.g11n.DurationFmt({ style: "full" });
		this.shortFmt	= new enyo.g11n.DurationFmt({ style: "short" });
	} catch (e) {
		this.fullFmt	= {
			format:		enyo.bind(this, function(e) {
				var r = [];

				if (e.hours > 0) {
					r.push(e.hours + ' hours');
				}

				if (e.minutes > 0) {
					r.push(e.minutes + ' minutes');
				}

				if (e.seconds > 0) {
					r.push(e.seconds + ' seconds');
				}

				if (r.length > 1) {
					var end = r.pop();

					return(r.join(',') + ' & ' + end);
				} else {
					return(r.join(','));
				}
			})
		};
		this.shortFmt	= {
			format:		enyo.bind(this, function(e) {
				var r = [];

				if (e.hours > 0) {
					r.push(e.hours);

					if (e.minutes >= 10) {
						r.push(e.minutes);
					} else {
						r.push("0" + e.minutes);
					}
				} else {
					r.push(e.minutes);
				}

				if (e.seconds >= 10) {
					r.push(e.seconds);
				} else {
					r.push("0" + e.seconds);
				}

				return(r.join(':'));
			})
		};

	}
},

getElapsed: function(mark)
{
	var elapsed = 0;

	if (this.prevTime && !isNaN(this.prevTime)) {
		elapsed += this.prevTime;
	}

	if (this.startTime) {
		var now = new Date();

		elapsed += Math.floor((now - this.startTime) / 1000);
	}

	if (mark && !isNaN(this.markTime) &&
		this.markTime > 0 && this.markTime < elapsed
	) {
		return(this.markTime);
	}

	return(elapsed);
},

getStr: function(verbose, mark)
{
	var elapsed	= this.getElapsed(mark);
	var e		= {};

	e.seconds = (elapsed % 60);
	elapsed -= e.seconds;

	e.minutes = (elapsed / 60) % 60;
	elapsed -= (e.minutes * 60);

	e.hours = (elapsed / (60 * 60)) % 60;
	elapsed -= (e.hours * 60 * 60);

	if (verbose) {
		return(this.fullFmt.format(e));
	} else {
		return(this.shortFmt.format(e));
	}
},

pause: function()
{
	this.prevTime		= this.getElapsed();
	this.startTime		= null;
},

start: function(elapsed)
{
	if (elapsed !== undefined) {
		this.prevTime	= elapsed;
	}

	if (!this.startTime) {
		this.startTime	= new Date();
	}
},

stop: function()
{
	this.pause();

	this.prevTime		= 0;
	this.startTime		= null;
},

restart: function()
{
	this.stop();
	this.start();
},

mark: function()
{
	this.markTime		= this.getElapsed();
}

});

