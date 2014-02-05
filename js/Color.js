///------ Color.Delta (E94)
// via http://colrd.com
//
if (!window.Color) Color = {};

Color.Accessibility = { // W3C specs
    brightness: function (a, b) { // color brightness >= 125.
        var aa = ((a.R * 299) + (a.G * 587) + (a.B * 114)) / 1000;
        var bb = ((b.R * 299) + (b.G * 587) + (b.B * 114)) / 1000;
        return Math.abs(aa - bb);
    },
    difference: function (a, b) { // color difference >= 500
        var r = Math.max(a.R, b.R) - Math.min(a.R, b.R);
        var g = Math.max(a.G, b.G) - Math.min(a.G, b.G);
        var b = Math.max(a.B, b.B) - Math.min(a.B, b.B);
        return r + g + b;
    }
};

///------ Color.Delta (E94)

if (!window.Color) Color = {};
if (!window.Color.Delta) Color.Delta = {};

Color.Delta.E94 = function (a, b) { 
//	var KL = 2, KC = 1, KH = 1, K1 = 0.048, K2 = 0.014; // Textiles
	var KL = 1, KC = 1, KH = 1, K1 = 0.045, K2 = 0.015; // Graphic Arts
	var C1 = Math.sqrt(a.a * a.a + a.b * a.b);
	var C2 = Math.sqrt(b.a * b.a + b.b * b.b);
	var DL = a.L - b.L;
	var DC = C1 - C2;
	var dA = Math.pow(a.a - b.a, 2);
	var dB = Math.pow(a.b - b.b, 2);
	var DH = Math.sqrt(dA + dB - (DC * DC));
	DL /= KL;
	DC /= KC * (1 + K1 * C1);
	DH /= KH * (1 + K2 * C1);
	return Math.sqrt(DL * DL + DC * DC + DH * DH);
};

///------ Color.Space (STRING/HEX/RGB/XYZ/Lab)

if (!window.Color) Color = {};
if (!window.Color.Space) Color.Space = {};

(function () {

var DEG_RAD = Math.PI / 180;
var RAD_DEG = 1 / DEG_RAD;

var shortcuts = { };

var root = Color.Space = function(color, route) {
	if (shortcuts[route]) {
		route = shortcuts[route];
	}
	var arr = route.split(">");
	var key = "";
	for (var n = 0; n < arr.length; n ++) {
		if (n > 1) {
			key = key.split("_");
			key.shift();
			key = key.join("_");
		}
		key += (n == 0 ? "" : "_") + arr[n];
		if (n > 0) color = root[key](color);
	}
	return color;
};

// STRING = 'FFFFFF' | 'FFFFFFFF'

root.STRING_HEX = function (o) {
	return parseInt('0x' + o);
};

// HEX = 0x000000 -> 0xFFFFFF

root.HEX_STRING = function (o, maxLength) {
	if (!maxLength) maxLength = 6;
	if (!o) o = 0;
	var z = o.toString(16);
	// when string is lesser than maxLength
	var n = z.length;
	while (n < maxLength) {
		z = '0' + z;
		n++;
	}
	// when string is greater than maxLength
	var n = z.length;
	while (n > maxLength) {
		z = z.substr(1);
		n--;
	}
	return z;
};

root.HEX_RGB = function (o) {
	return {
		R: (o >> 16),
		G: (o >> 8) & 0xFF,
		B: o & 0xFF
	};
};

// RGB = R: Red / G: Green / B: Blue

root.RGB_HEX = function (o) {
	if (o.R < 0) o.R = 0;
	if (o.G < 0) o.G = 0;
	if (o.B < 0) o.B = 0;
	if (o.R > 255) o.R = 255;
	if (o.G > 255) o.G = 255;
	if (o.B > 255) o.B = 255;
	return o.R << 16 | o.G << 8 | o.B;
};

root.RGB_HSL = function (o) { // RGB from 0 to 1
	var _R = o.R / 255,
		_G = o.G / 255,
		_B = o.B / 255,
		min = Math.min(_R, _G, _B),
		max = Math.max(_R, _G, _B),
		D = max - min,
		H,
		S,
		L = (max + min) / 2;
	if (D == 0) { // No chroma
			H = 0;
			S = 0;
	} else { // Chromatic data
		if (L < 0.5) S = D / (max + min);
		else S = D / (2 - max - min);
		var DR = (((max - _R) / 6) + (D / 2)) / D;
		var DG = (((max - _G) / 6) + (D / 2)) / D;
		var DB = (((max - _B) / 6) + (D / 2)) / D;
		if (_R == max) H = DB - DG;
		else if (_G == max) H = (1 / 3) + DR - DB;
		else if (_B == max) H = (2 / 3) + DG - DR;
		if (H < 0) H += 1;
		if (H > 1) H -= 1;
	}
	return {
		H: H * 360,
		S: S * 100,
		L: L * 100
	};
};

root.RGB_XYZ = function (o) {
	if (!root.RGB_XYZ_Matrix) root.getProfile('sRGB');
	var M = root.RGB_XYZ_Matrix,
		z = {};
	var R = o.R / 255,
		G = o.G / 255,
		B = o.B / 255;
	if (root.Profile == 'sRGB') {
		R = (R > 0.04045) ? Math.pow(((R + 0.055) / 1.055), 2.4) : R / 12.92;
		G = (G > 0.04045) ? Math.pow(((G + 0.055) / 1.055), 2.4) : G / 12.92;
		B = (B > 0.04045) ? Math.pow(((B + 0.055) / 1.055), 2.4) : B / 12.92;
	} else {
		R = Math.pow(R, root.Gamma);
		G = Math.pow(G, root.Gamma);
		B = Math.pow(B, root.Gamma);
	}
	z.X = R * M[0] + G * M[3] + B * M[6];
	z.Y = R * M[1] + G * M[4] + B * M[7];
	z.Z = R * M[2] + G * M[5] + B * M[8];
	return z;
};

// HSL (1978) = H: Hue / S: Saturation / L: Lightess

root.HSL_RGB = function (o) {
	var H = o.H / 360,
		S = o.S / 100,
		L = o.L / 100,
		R, G, B, _1, _2;
	function Hue_2_RGB(v1, v2, vH) {
		if (vH < 0) vH += 1;
		if (vH > 1) vH -= 1;
		if ((6 * vH) < 1) return v1 + (v2 - v1) * 6 * vH;
		if ((2 * vH) < 1) return v2;
		if ((3 * vH) < 2) return v1 + (v2 - v1) * ((2 / 3) - vH) * 6;
		return v1;
	}
	if (S == 0) { // HSL from 0 to 1
		R = L * 255;
		G = L * 255;
		B = L * 255;
	} else {
		if (L < 0.5) _2 = L * (1 + S);
		else _2 = (L + S) - (S * L);
		_1 = 2 * L - _2;
		R = 255 * Hue_2_RGB(_1, _2, H + (1 / 3));
		G = 255 * Hue_2_RGB(_1, _2, H);
		B = 255 * Hue_2_RGB(_1, _2, H - (1 / 3));
	}
	return {
		R: R,
		G: G,
		B: B
	};
};

// CIE (Commission International de L’Eclairage)

// CIE-XYZ (1931) = Y: Luminescence / XZ: Spectral Weighting Curves (Spectral Locus)

root.XYZ_RGB = function (o) {
	if (!root.XYZ_RGB_Matrix) root.getProfile('sRGB');
	var M = root.XYZ_RGB_Matrix;
	var z = {};
	z.R = o.X * M[0] + o.Y * M[3] + o.Z * M[6];
	z.G = o.X * M[1] + o.Y * M[4] + o.Z * M[7];
	z.B = o.X * M[2] + o.Y * M[5] + o.Z * M[8];
	if (root.Profile == 'sRGB') {
		z.R = (z.R > 0.0031308) ? (1.055 * Math.pow(z.R, 1 / 2.4)) - 0.055 : 12.92 * z.R;
		z.G = (z.G > 0.0031308) ? (1.055 * Math.pow(z.G, 1 / 2.4)) - 0.055 : 12.92 * z.G;
		z.B = (z.B > 0.0031308) ? (1.055 * Math.pow(z.B, 1 / 2.4)) - 0.055 : 12.92 * z.B;
	} else {
		z.R = Math.pow(z.R, 1 / root.Gamma);
		z.G = Math.pow(z.G, 1 / root.Gamma);
		z.B = Math.pow(z.B, 1 / root.Gamma);
	}
	return {
		R: Math.round(z.R * 255),
		G: Math.round(z.G * 255),
		B: Math.round(z.B * 255)
	};
};

root.XYZ_xyY = function (o) {
	var n = o.X + o.Y + o.Z;
	if (n == 0) return {
		x: 0,
		y: 0,
		Y: o.Y
	};
	return {
		x: o.X / n,
		y: o.Y / n,
		Y: o.Y
	};
};

root.XYZ_Lab = function (o) {
	var X = o.X / root.WPScreen.X,
		Y = o.Y / root.WPScreen.Y,
		Z = o.Z / root.WPScreen.Z;
	if (X > 0.008856) {
		X = Math.pow(X, 1 / 3);
	} else {
		X = (7.787 * X) + (16 / 116);
	}
	if (Y > 0.008856) {
		Y = Math.pow(Y, 1 / 3);
	} else {
		Y = (7.787 * Y) + (16 / 116);
	}
	if (Z > 0.008856) {
		Z = Math.pow(Z, 1 / 3);
	} else {
		Z = (7.787 * Z) + (16 / 116);
	}
	return {
		L: (116 * Y) - 16,
		a: 500 * (X - Y),
		b: 200 * (Y - Z)
	};
};

// CIE-xyY (1931) = Y: Luminescence / xy: Chromaticity Co-ordinates (Spectral Locus)

root.xyY_XYZ = function (o) {
	return {
		X: (o.x * o.Y) / o.y,
		Y: o.Y,
		Z: ((1 - o.x - o.y) * o.Y) / o.y
	};
};

// CIE-L*ab (1976) = L: Luminescence / a: Red / Green / b: Blue / Yellow

root.Lab_XYZ = function (o) {
	var r = root.WPScreen;
	var Y = (o.L + 16) / 116,
		X = o.a / 500 + Y,
		Z = Y - o.b / 200;
	Y = Math.pow(Y, 3) > 0.008856 ? Math.pow(Y, 3) : (Y - 16 / 116) / 7.787;
	X = Math.pow(X, 3) > 0.008856 ? Math.pow(X, 3) : (X - 16 / 116) / 7.787;
	Z = Math.pow(Z, 3) > 0.008856 ? Math.pow(Z, 3) : (Z - 16 / 116) / 7.787;
	return {
		X: r.X * X,
		Y: r.Y * Y,
		Z: r.Z * Z
	};
};

// Chromatic Adaption
//// Bruce Lindbloom (2009)
// - http://www.brucelindbloom.com/index.html?Eqn_ChromAdapt.html

root.getAdaption = function (XYZ, method) { 
	var r = { // Adaption methods
		'Bradford': {
			A: [
				[0.895100, 0.26640000, -0.16139900],
				[-0.75019900, 1.71350, 0.0367000],
				[0.03889900, -0.0685000, 1.02960000]
			],
			Z: [
				[0.986993, -0.14705399, 0.15996299],
				[0.43230499, 0.51836, 0.0492912],
				[-0.00852866, 0.0400428, 0.96848699]
			]
		}
	};
	var WS = root.WPSource; // White Point Source
	var WD = root.WPScreen; // White Point Destination
	var A = r[method].A; // Load Matrices
	var Z = r[method].Z; 
	// Convert to cone responce domain
	var CRD = multiply(A, [
		[WD.X],
		[WD.Y],
		[WD.Z]
	]); 
	var CRS = multiply(A, [
		[WS.X],
		[WS.Y],
		[WS.Z]
	]);
	// Scale Vectors
	var M = [
		[CRD[0] / CRS[0], 0, 0],
		[0, CRD[1] / CRS[1], 0],
		[0, 0, CRD[2] / CRS[2]]
	]; 
	// Back to XYZ
	var z = multiply(Z, multiply(M, multiply(A, [ 
		[XYZ.X],
		[XYZ.Y],
		[XYZ.Z]
	])));
	return {
		X: z[0][0],
		Y: z[1][0],
		Z: z[2][0]
	};
};

// Generate XYZ <-> RGB matrices

root.getProfile = function (i) {
	var profile = ICC_Profiles[i];
	root.Profile = i;
	root.Gamma = profile[0];
	root.WPSource = root.getIlluminant('2', profile[1]);
	function adapt(color) {
		return root.getAdaption(root.xyY_XYZ(color), 'Bradford');
	};
	var R = adapt({
		x: profile[2],
		y: profile[3],
		Y: profile[4]
	});
	var G = adapt({
		x: profile[5],
		y: profile[6],
		Y: profile[7]
	});
	var B = adapt({
		x: profile[8],
		y: profile[9],
		Y: profile[10]
	});
	root.RGB_XYZ_Matrix = [R.X, R.Y, R.Z, G.X, G.Y, G.Z, B.X, B.Y, B.Z];
	root.XYZ_RGB_Matrix = inverse(root.RGB_XYZ_Matrix);
};

// Convert illuminant into spectral weighting Curves

root.getIlluminant = function (observer, type) {
	var color = Std_Illuminants[type];
	if (observer == "2") {
		color = {
			x: color[0],
			y: color[1],
			Y: 1
		};
	} else {
		color = {
			x: color[2],
			y: color[3],
			Y: 1
		};		
	}
	return root.xyY_XYZ(color);
};

// International Color Consortium (ICC) Profiles
//// Bruce Lindbloom (2011)
// - http://brucelindbloom.com/index.html?WorkingSpaceInfo.html

var ICC_Profiles = { 'sRGB': [ 2.2,  'D65', 0.64, 0.33, 0.212656, 0.3, 0.6, 0.715158, 0.15, 0.06, 0.072186 ] };

// White Points of Standard Illuminants (CIE-1931 2° / CIE-1964 10°)
//// Wikipedia (2011)
// - http://en.wikipedia.org/wiki/Standard_illuminant

var Std_Illuminants = { 'D65': [ 0.31271, 0.32902, 0.31382, 0.33100, 6504 ] };

// Output illuminant

root.Profile = "RGB"; // current working color-space
root.RGB_XYZ_Matrix = ""; // RGB->XYZ conversion matrix
root.XYZ_RGB_Matrix = ""; // XYZ->RGB conversion matrix 
root.Gamma = ""; // used in conversion process
root.WPScreen = root.getIlluminant('2', 'D65'); // screen-white point

// Matrix Math

var multiply = function(m1, m2) {
	var ni = m1.length, ki = ni, i, nj, kj = m2[0].length, j;
	var cols = m1[0].length, M = [], sum, nc, c;
	do { i = ki - ni;
	  M[i] = [];
	  nj = kj;
	  do { j = kj - nj;
		sum = 0;
		nc = cols;
		do { c = cols - nc;
		  sum += m1[i][c] * m2[c][j];
		} while(--nc);
		M[i][j] = sum;
	  } while(--nj);
	} while(--ni);
	return M;
};

var determinant = function(m) { // 3x3
	return m[0] * (m[4] * m[8] - m[5] * m[7]) -
		   m[1] * (m[3] * m[8] - m[5] * m[6]) +
		   m[2] * (m[3] * m[7] - m[4] * m[6]);
};

var inverse = function(m) { // 3x3
	var d = 1.0 / determinant(m);
	return [ 
		d * (m[4] * m[8] - m[5] * m[7]), // 1-3
		d * (-1 * (m[1] * m[8] - m[2] * m[7])),
		d * (m[1] * m[5] - m[2] * m[4]),	
		d * (-1 * (m[3] * m[8] - m[5] * m[6])), // 4-6
		d * (m[0] * m[8] - m[2] * m[6]),
		d * (-1 * (m[0] * m[5] - m[2] * m[3])),	
		d * (m[3] * m[7] - m[4] * m[6]), // 7-9
		d * (-1 * (m[0] * m[7] - m[1] * m[6])),
		d * (m[0] * m[4] - m[1] * m[3]) 
	];
};

})();