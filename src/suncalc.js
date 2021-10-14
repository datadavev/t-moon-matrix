/* eslint-disable camelcase */
const _rad = Math.PI / 180.0;
const dayMs = ((1000 * 60) * 60) * 24;
const J1970 = 2440588;
const J2000 = 2451545;
const J0 = 0.0009;
const _times = [
    [-(0.833) * _rad, 'sunrise', 'sunset'], 
    [-(0.3) * _rad, 'sunriseEnd', 'sunsetStart'], 
    [-(6) * _rad, 'dawn', 'dusk'], 
    [-(12) * _rad, 'nauticalDawn', 'nauticalDusk'], 
    [-(18) * _rad, 'nightEnd', 'night'], 
    [6 * _rad, 'goldenHourEnd', 'goldenHour']
];
const _e = _rad * 23.4397;

function rightAscension(l, b) {
	return Math.atan2 (Math.sin (l) * Math.cos (_e) - Math.tan (b) * Math.sin (_e), Math.cos (l));
};
function declination(l, b) {
	return Math.asin (Math.sin (b) * Math.cos (_e) + (Math.cos (b) * Math.sin (_e)) * Math.sin (l));
};
function azimuth(H, phi, dec) {
	return Math.atan2 (Math.sin (H), Math.cos (H) * Math.sin (phi) - Math.tan (dec) * Math.cos (phi));
};
function altitude(H, phi, dec) {
	return Math.asin (Math.sin (phi) * Math.sin (dec) + (Math.cos (phi) * Math.cos (dec)) * Math.cos (H));
};
function siderealTime(d, lw) {
	return _rad * (280.16 + 360.9856235 * d) - lw;
};
function toJulian(date) {
	return ((date.toSeconds() * 1000) / dayMs - 0.5) + J1970;
};
function fromJulian(j) {
	return datetime.fromtimestamp ((((j + 0.5) - J1970) * dayMs) / 1000.0, {tz: timezone.utc});
};
function toDays(date) {
	return toJulian (date) - J2000;
};
function julianCycle(d, lw) {
	return Math.round ((d - J0) - lw / (2 * Math.PI));
};
function approxTransit(Ht, lw, n) {
	return (J0 + (Ht + lw) / (2 * Math.PI)) + n;
};
function solarTransitJ(ds, M, L) {
	return ((J2000 + ds) + 0.0053 * Math.sin (M)) - 0.0069 * Math.sin (2 * L);
};

function hourAngle(h, phi, d) {
	try {
		const ret = Math.acos ((Math.sin (h) - Math.sin (phi) * Math.sin (d)) / (Math.cos (phi) * Math.cos (d)));
		return ret;
	}
	catch (e) {
        console.error("hourAngle", h, phi, d);
        console.error('error', e);
    }
    return 0;
};
function observerAngle(height) {
	return ((-(2.076) * Math.sqrt (height)) / 60.0) * _rad;
};
function solarMeanAnomaly(d) {
	return _rad * (357.5291 + 0.98560028 * d);
};

function eclipticLongitude(M) {
	const C = _rad * ((1.9148 * Math.sin (M) + 0.02 * Math.sin (2 * M)) + 0.0003 * Math.sin (3 * M));
	const P = _rad * 102.9372;
	return ((M + C) + P) + Math.PI;
};

export function sunCoords(d) {
	const M = solarMeanAnomaly (d);
	const L = eclipticLongitude (M);
	return {dec: declination (L, 0), ra: rightAscension (L, 0)};
};

function getSetJ(h, lw, phi, dec, n, M, L) {
	const w = hourAngle (h, phi, dec);
	const a = approxTransit (w, lw, n);
	return solarTransitJ (a, M, L);
};

export function moonCoords(d) {
	const L = _rad * (218.316 + 13.176396 * d);
	const M = _rad * (134.963 + 13.064993 * d);
	const F = _rad * (93.272 + 13.22935 * d);
	const l = L + (_rad * 6.289) * Math.sin (M);
	const b = (_rad * 5.128) * Math.sin (F);
	const dt = 385001 - 20905 * Math.cos (M);
	return {ra: rightAscension (l, b), dec: declination (l, b), dist: dt};
};

export function getMoonIllumination(date) {
	const d = toDays (date);
	const s = sunCoords (d);
	const m = moonCoords (d);
	const sdist = 149598000;
	const phi = Math.acos (Math.sin (s.dec) * Math.sin (m.dec) + (Math.cos (s.dec) * Math.cos (m.dec)) * Math.cos (s.ra - m.ra));
	const inc = Math.atan2 (sdist * Math.sin (phi), m.dist - sdist * Math.cos (phi));
	const _angle = Math.atan2 (Math.cos (s.dec) * Math.sin (s.ra - m.ra), Math.sin (s.dec) * Math.cos (m.dec) - (Math.cos (s.dec) * Math.sin (m.dec)) * Math.cos (s.ra - m.ra));
	return {
        fraction: (1 + Math.cos (inc)) / 2, 
        phase: 0.5 + ((0.5 * inc) * (_angle < 0 ? -(1) : 1)) / Math.PI, 
        angle: _angle
    };
};

function getTimes(date, lat, lng, height) {
    let _height=height;
	if (typeof height === 'undefined') {;
		_height = 0.0;
	};
	if (height < 0.0) {
		_height = 0.0;
	}
	const obs_angle = observerAngle (_height);
	const lw = _rad * -(lng);
	const phi = _rad * lat;
	const d = toDays (date);
	const n = julianCycle (d, lw);
	const ds = approxTransit (0, lw, n);
	const M = solarMeanAnomaly (ds);
	const L = eclipticLongitude (M);
	const dec = declination (L, 0);
	const Jnoon = solarTransitJ (ds, M, L);
	const result = {};
	for (const tt of _times) {
		const Jset = getSetJ (tt [0] + obs_angle, lw, phi, dec, n, M, L);
		const Jrise = Jnoon - (Jset - Jnoon);
		result [tt [1]] = fromJulian (Jrise);
		result [tt [2]] = fromJulian (Jset);
	}
	return result;
};

export function getSunrise(date, lat, lng) {
	const ret = getTimes (date, lat, lng);
	return ret.sunrise;
};

function hoursLater(date, h) {
	return date + + (timedelta (__kwargtrans__ ({hours: h})));
};


export function getMoonPosition(date, lat, lng) {
	const lw = _rad * -(lng);
	const phi = _rad * lat;
	const d = toDays (date);
	const c = moonCoords (d);
	const H = siderealTime (d, lw) - c.ra;
	let h = altitude (H, phi, c.dec);
	h += (_rad * 0.017) / Math.tan (h + (_rad * 10.26) / (h + _rad * 5.1));
	return {azimuth: azimuth (H, phi, c.dec), altitude: h, distance: c.dist};
};

export function getMoonTimes(date, lat, lng) {
	const t = date.set({hour: 0, minute: 0, second: 0});
	const hc = 0.133 * _rad;
	const pos = getMoonPosition (t, lat, lng);
	let h0 = pos.altitude - hc;
	let rise = 0;
	let sett = 0;
    let x1;
    let x2;
    let ye
    for (let i = 1; i < 24; i += 2) {
		const h1 = getMoonPosition (hoursLater (t, i), lat, lng).altitude - hc;
		const h2 = getMoonPosition (hoursLater (t, i + 1), lat, lng).altitude - hc;
		const a = (h0 + h2) / 2 - h1;
		const b = (h2 - h0) / 2;
		const xe = -(b) / (2 * a);
		ye = (a * xe + b) * xe + h1;
		const d = b * b - (4 * a) * h1;
		let roots = 0;
		if (d >= 0) {
			const dx = Math.sqrt (d) / (Math.abs(a) * 2);
			x1 = xe - dx;
			x2 = xe + dx;
			if (Math.abs(x1) <= 1) {
				roots += 1;
			}
			if (Math.abs(x2) <= 1) {
				roots += 1;
			}
			if (x1 < -(1)) {
				x1 = x2;
			}
		}
		if (roots === 1) {
			if (h0 < 0) {
				rise = i + x1;
			}
			else {
				sett = i + x1;
			}
		}
		else if (roots === 2) {
			rise = i + (ye < 0 ? x2 : x1);
			sett = i + (ye < 0 ? x1 : x2);
		}
		if (rise && sett) {
			break;
		}
		h0 = h2;
	}
	const result = {};
	if (rise) {
		result.rise = hoursLater (t, rise);
	}
	if (sett) {
		result.set = hoursLater (t, sett);
	}
	if (!(rise) && !(sett)) {
		const value = (ye > 0 ? 'alwaysUp' : 'alwaysDown');
		result [value] = true;
	}
	return result;
};

export function getPosition(date, lat, lng) {
	const lw = _rad * -(lng);
	const phi = _rad * lat;
	const d = toDays (date);
	const c = sunCoords (d);
	const H = siderealTime (d, lw) - c.ra;
	return {azimuth: azimuth (H, phi, c.dec), altitude: altitude (H, phi, c.dec)};
};
