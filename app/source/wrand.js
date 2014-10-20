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
	Mimick the random number generator used by windows in order to allow using
	the game numbers from the windows freecell.

	This Linear Congruential random generator is compatible with windows deals
	between 1 and 32000.
*/
WRand = function()
{
	return(WRand.randint());
};

WRand.LCRand = function()
{
	var seed = WRand.getSeed(NaN);

	seed = seed * 214013 + 2531011;
	seed = seed & 4294967295;
	var r = ((seed >> 16) & 32767);

	WRand.seed = seed;

	return(r);
};
WRand.randint = WRand.LCRand;

WRand.setSeed = function(seed)
{
	if (!isNaN(seed)) {
		WRand.seed = seed;
	}

	if (seed >= 0 && seed <= 32000) {
		WRand.randint	= WRand.LCRand;
		WRand.shuffle	= WRand.LCShuffle;
	} else {
		/* Mersenne Twister random number generator */
		init_genrand(seed);
		WRand.randint	= genrand_int32;
		WRand.shuffle	= WRand.MTShuffle;
	}
};

WRand.getSeed = function(seed)
{
	return(seed || WRand.seed || (new Date()).getTime());
};

WRand.LCShuffle = function(cards)
{
	var result	= [];
	var deck	= [];
	var r;

	for (var i = 0; i < cards.length; i++) {
		deck[i] = i;
	}

	for (var i = 0; i < cards.length; i++) {
		r = WRand() % (cards.length - i);

		result.push(cards[deck[r]]);
		deck[r] = deck[cards.length - 1 - i];
	}

	return(result);
};
WRand.shuffle = WRand.LCShuffle;

WRand.MTShuffle = function(cards)
{
	var a, b, r;

	for (var i = cards.length - 1; i > 0; i--) {
		r = Math.floor(genrand_res53() * (i + 1));

		a = cards[i];
		b = cards[r];

		cards[i] = b;
		cards[r] = a;
	}

	return(cards);
};

