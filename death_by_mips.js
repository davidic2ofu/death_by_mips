// Green sheet info: registers, instructions
var reg = {
	'0': 'zero',	'1': 'at',		'2': 'v0',		'3': 'v1',
	'4': 'a0',		'5': 'a1',		'6': 'a2',		'7': 'a3',
	'8': 't0',		'9': 't1',		'10': 't2',		'11': 't3',
	'12': 't4',		'13': 't5',		'14': 't6',		'15': 't7',
	'16': 's0',		'17': 's1',		'18': 's2',		'19': 's3',
	'20': 's4',		'21': 's5',		'22': 's6',		'23': 's7',
	'24': 't8',		'25': 't9',		'26': 'k0',		'27': 'k1',
	'28': 'gp',		'29': 'sp',		'30': 'fp',		'31': 'ra',
};

var reg_instr = {
	"add": "20",	"addu": "21",	"and": "24",	"jr": "08",
	"nor": "27",	"or": "25",		"slt": "2a",	"sltu": "0b",
	"sll": "00",	"srl": "02",	"sub": "22",	"subu": "23"
};

var immed_instr = {
	"addi": "08",	"addiu": "09",	"andi": "0c",	"lui": "0f",
	"ori": "0d",	"slti": "0a",	"sltui": "0b"
};

var base_instr = {
	"lw": "23",		"sw": "2b",		"lbu": "24",	"lhu": "25",
	"ll": "30",		"sb": "28",		"sc": "38",		"sh": "29"
};

var pcrel_instr = {
	"beq": "04",	"bne": "05"
};

var pseudodir_instr = {
	"j": "02",		"jal": "03"
};

// finds instruction name given funct hex code (R type)
function getReg(hex) {
	for (key in reg_instr) 
		if (hex == reg_instr[key]) 
			return key;
	return null;
}

// finds instruction name given op code (I/J type)
function getCode(hex) {
	for (key in immed_instr) 
		if (hex == immed_instr[key]) 
			return key;
	for (key in base_instr) 
		if (hex == base_instr[key]) 
			return key;
	for (key in pcrel_instr) 
		if (hex == pcrel_instr[key]) 
			return key;
	for (key in pseudodir_instr) 
		if (hex == pseudodir_instr[key]) 
			return key;
	return null;
}

// Classes represent instructions (R/I/J type)
// getters return formatted answer to calling function
class Reg {
	constructor(val) {
		this.codeType = "register only (R-type)";
		this.binVer = val;
		this.hexVer = binToHex(val);
		this.opcode = val.slice(0,6);
		this.rs = val.slice(6,11);
		this.rt = val.slice(11,16);
		this.rd = val.slice(16,21);
		this.shamt = val.slice(21,26);
		this.funct = val.slice(26,32);

		var functHex = parseInt(this.funct.slice(0,2),2).toString(16)
			+ parseInt(this.funct.slice(2,6),2).toString(16);
		this.name = getReg(functHex);	
	
		this.rs_reg = decodeRegister(parseInt(this.rs, 2));
		this.rt_reg = decodeRegister(parseInt(this.rt, 2));
		this.rd_reg = decodeRegister(parseInt(this.rd, 2));
	}
	get mips() {
		var mips_code;
		if (this.name == null) 
			mips_code = "not a valid instruction";
		else if (this.name == "sll" || this.name == "srl") 
			mips_code = this.name + " $" + this.rd_reg + ", $" + this.rt_reg + ", " + parseInt(this.shamt, 2);
		else if (this.name == "jr") 
			mips_code = this.name + " $" + this.rs_reg;
		else
			mips_code = this.name + " $" + this.rd_reg + ", $" + this.rs_reg + ", $" + this.rt_reg;
		var answer = "MIPS code: " + mips_code + "<br />type: " + this.codeType + "<br />binary: " + addSpacesToBin(this.binVer) + "<br />hex: 0x" + this.hexVer;
		return answer;
	}
}

class Imm {
	constructor(val, label) {
		this.binVer = val;
		this.hexVer = binToHex(val);
		this.opcode = val.slice(0,6);
		this.rs = val.slice(6,11);
		this.rt = val.slice(11,16);
		this.immed = val.slice(16,32);
		
		this.opHex = parseInt(this.opcode.slice(0,2),2).toString(16)
			+ parseInt(this.opcode.slice(2,6),2).toString(16);
		this.name = getCode(this.opHex);

		if (getCode(this.opHex) in base_instr)		
			this.codeType = "base (I-type)";
		else if (getCode(this.opHex) in pcrel_instr)		
			this.codeType = "PC-relative (I-type)";
		else
			this.codeType = "immediate (I-type)";

		if (label != "0")
			this.label_name = label;
		else
			this.label_name = "label_name";
		
		this.rs_reg = decodeRegister(parseInt(this.rs, 2));
		this.rt_reg = decodeRegister(parseInt(this.rt, 2));
	}
	get mips() {
		var mips_code;
		if (this.name == null) 
			mips_code = "not a valid instruction";
		else if (getCode(this.opHex) in base_instr)
			mips_code = this.name + " $" + this.rt_reg + ", " + parseInt(this.immed, 2).toString() + "($" + this.rs_reg + ")";
		else if (getCode(this.opHex) in pcrel_instr)
			mips_code = this.name + " $" + this.rs_reg + ", $" + this.rt_reg + ", " + this.label_name;
		else if (this.name == "lui") 
			mips_code = this.name + " $" + this.rt_reg + ", 0x" + binToHex(this.immed);
		else
			mips_code = this.name + " $" + this.rt_reg + ", $" + this.rs_reg + ", " + parseInt(this.immed, 2).toString();
		var answer = "MIPS code: " + mips_code + "<br />type: " + this.codeType + "<br />binary: " + addSpacesToBin(this.binVer) + "<br />hex: 0x" + this.hexVer;
		return answer;
	}
}

class PseudoDir {
	constructor(val, label) {
		this.codeType = "pseudo-direct (J-type)";
		this.binVer = val;
		this.hexVer = binToHex(val);
		this.opcode = val.slice(0,6);
		this.rs = val.slice(6,11);
		this.opHex = parseInt(this.opcode.slice(0,2),2).toString(16)
			+ parseInt(this.opcode.slice(2,6),2).toString(16);
		this.name = getCode(this.opHex);
		
		if (label != "0")
			this.label_name = label;
		else
			this.label_name = "label_name";
	}
	get mips() {
		var mips_code = this.name + " " + this.label_name;
		var answer = "MIPS code: " + mips_code + "<br />type: " + this.codeType + "<br />binary: " + addSpacesToBin(this.binVer) + "<br />hex: 0x" + this.hexVer;
		return answer;		
	}
}

// STARTING POINT; CALLED BY WEB PAGE:
// takes input from user, qualifies and decodes input, then returns formatted data
// to the web page
function collectVal() {
	var val = prompt("Enter instruction, hex, or binary: ").toLowerCase();
	answer = qualify(val);
	if (answer == null)
		answer = "Invalid; please try again.";
	document.getElementById("showVal").innerHTML = answer;
}

// returns register name based on register number
function decodeRegister(val) {
	if (val >= 0 || val < 32)
		return reg[val];
	else
		return 'invalid';
}

// 4-bit binary value returned for each hex value
function hexToBin(a) {
	var newVal = "";
	for (i = 0; i < a.length; i++) 
		newVal += ("0000" + parseInt(a.charAt(i),16).toString(2)).slice(-4);
	return newVal;
}

// returns hex value for 8n-bit binary value
function binToHex(a) {
	var newVal = "";
	for (i = 0; i < a.length/8; i++) 
		newVal += ("00" + parseInt(a.slice(8*i, 8*i+8),2).toString(16)).slice(-2);
	return newVal;
}

// simply adds white space between every 4 bits of 32-bit value (formatting tool)
function addSpacesToBin(val) {
	var newVal = val.charAt(0);
	for (i = 1; i < 32; i++) {
		if (i % 4 == 0)
			newVal += " ";
		newVal += val.charAt(i);
	}
	return newVal;
}

// called by qualify function if user's input is either hex or binary value;
// takes binary value and qualifies it by either opcode or funct value then
// returns the formatted answer to the caller
function decodeBinary(val){
	var opHex = parseInt(val.slice(0,2),2).toString(16)
		+ parseInt(val.slice(2,6),2).toString(16);
	var code = getCode(opHex);
	if (val.slice(0,6) == "000000") 
		return (new Reg(val)).mips; 
	else if (code in immed_instr || code in base_instr || code in pcrel_instr)
		return (new Imm(val, "0")).mips;
	else if (getCode(opHex) in base_instr)
		return (new Base(val, "0")).mips;
	else if (getCode(opHex) in pcrel_instr)
		return (new PcRel(val, "0")).mips;
	else if (getCode(opHex) in pseudodir_instr)
		return (new PseudoDir(val, "0")).mips;
	else
		return;
}

// gives binary value for either a register name or register number
function registerToBin(val) {
	if (val.charAt(0) != '$')
		return;
	else 
		val = val.replace(/\$/g, '');
	if (val in reg)
		return ('00000' + parseInt(val).toString(2)).slice(-5);
	for (key in reg) 
		if (val == reg[key]) 
			return ('00000' + parseInt(key).toString(2)).slice(-5);
	return;
}

// takes user input, qualifies input as hex, binary, or mips instruction
function qualify(val) {
	// Strip the 0x
	if (val.charAt(0)== "0" && val.charAt(1) == "x")
		val = val.slice(2, val.length);
	
	// Possible hex input
	if (val.length == 8) {
		isHex = true;
		for (i = 0; i < 8; i++) 
			if (val.charCodeAt(i) < 48 || (val.charCodeAt(i) > 57 && val.charCodeAt(i) < 97) || val.charCodeAt(i) > 102)
				isHex = false;
		if (isHex == true)
			return decodeBinary(hexToBin(val));
	}
	
	// Possible binary input
	if (val.length >= 32) {
		checkBin = val.replace(/\s+/g, '');
		if (checkBin.length == 32) {
			isBinary = true;
			for (i = 0; i < 32; i++) 
				if (checkBin.charAt(i) != "0" && checkBin.charAt(i) != "1")
					isBinary = false;
			if (isBinary == true)
				return decodeBinary(checkBin);
		}
	}	

	// Otherwise check if valid instruction:
	// replace characters ,() with space, then condense multiple spaces to one space, then
	// trim leading and trailing spaces
	var mips = val.replace(/[,()]+/g, ' ').replace(/\s\s+/g, ' ').replace(/^\s+|\s+$/g, '');
	mips = mips.split(' ');

	// if register-only instruction
	if (mips[0] in reg_instr) {
		var op = '000000';
		var funct = hexToBin(reg_instr[mips[0]]).slice(-6);
		var rs, rt, rd, shamt;
		if (mips[0] == 'jr') {
			rs = registerToBin(mips[1]);
			if (rs != null && mips.length == 2) {
				val = op + rs + '000000000000000' + funct;
				return (new Reg(val)).mips;
			} else
				return;
		} else if (mips[0] == 'sll' || mips[0] == 'srl') {
			rs = '00000';
			rd = registerToBin(mips[1]);
			rt = registerToBin(mips[2]);
			if (!isNaN(parseInt(mips[3])))
				shamt = ('00000' + parseInt(mips[3]).toString(2)).slice(-5);
			else
				shamt = null;
			if (rd != null && rt != null && shamt != null && mips.length == 4) {
				val = op + rs + rt + rd + shamt + funct;
				return (new Reg(val)).mips;
			} else
				return;
		} else {
			rd = registerToBin(mips[1]);
			rs = registerToBin(mips[2]);
			rt = registerToBin(mips[3]);
			shamt = '00000';
			if (rs != null && rt != null && rd != null && mips.length == 4) {
				val = op + rs + rt + rd + shamt + funct;
				return (new Reg(val)).mips;
			} else
				return;
		}

	// if immediate instruction
	} else if (mips[0] in immed_instr) {
		var rs, rt, immed;
		var	op = ('0000' + parseInt(immed_instr[mips[0]], 16).toString(2)).slice(-6);
		var imm = 3;	// mips array index where the immediate field occurs
		if (mips[0] == 'lui') {
			rs = '00000';
			imm = 2;
			if (mips.length != 3)
				return;
		}
		if (imm == 3 && mips.length != 4)
			return;

		if (imm == 3) 
			rs = registerToBin(mips[2]);
		
		rt = registerToBin(mips[1]);
		
		// determine immediate field
		if (mips[imm].charAt(0) == '0' && mips[imm].charAt(1) == 'x' && !isNaN(parseInt(mips[imm].slice(2,mips[imm].length))))
			immed = ('0000000000000000' + parseInt(mips[imm], 16).toString(2)).slice(-16);
		else if (!isNaN(parseInt(mips[imm])))
			immed = ('0000000000000000' + parseInt(mips[imm]).toString(2)).slice(-16);
		else
			immed = null;
		
		if (rs != null && rt != null && immed != null) {
			val = op + rs + rt + immed;
			return (new Imm(val, '0')).mips;
		} else
			return;

	// if base instruction
	} else if (mips[0] in base_instr) {
		var rs, rt, immed;
		var	op = ('0000' + parseInt(base_instr[mips[0]], 16).toString(2)).slice(-6);
		rt = registerToBin(mips[1]);
		rs = registerToBin(mips[3]);
		// determine immediate field
		var imm = 2;
		if (mips[imm].charAt(0) == '0' && mips[imm].charAt(1) == 'x' && !isNaN(parseInt(mips[imm].slice(2,mips[imm].length))))
			immed = ('0000000000000000' + parseInt(mips[imm], 16).toString(2)).slice(-16);
		else if (!isNaN(parseInt(mips[imm])))
			immed = ('0000000000000000' + parseInt(mips[imm]).toString(2)).slice(-16);
		else
			immed = null;
		if (rs != null && rt != null && immed != null) {
			val = op + rs + rt + immed;
			return (new Imm(val, '0')).mips;
		} else
			return;

	// if pc-relative instruction
	} else if (mips[0] in pcrel_instr) {
		var rs, rt, immed;
		var	op = ('0000' + parseInt(pcrel_instr[mips[0]], 16).toString(2)).slice(-6);
		if (mips.length != 4)
			return;
		rs = registerToBin(mips[1]);
		rt = registerToBin(mips[2]);
		immed = '0000000000000111';
		var label = mips[3];
		if (rs != null && rt != null && label != null) {
			val = op + rs + rt + immed;
			return (new Imm(val, label)).mips;
		} else
			return;	
	
	// if pseudo-direct instruction	
	} else if (mips[0] in pseudodir_instr) {
		var	op = ('0000' + parseInt(pseudodir_instr[mips[0]], 16).toString(2)).slice(-6);
		var dest = '01010101010101010101010101';
		if (mips.length != 2)
			return;
		var label = mips[1];
		if (label != null) {
			val = op + dest;
			return (new PseudoDir(val, label)).mips;
		} else
			return;			
	
	// if invalid instruction
	} else
		return;
}
