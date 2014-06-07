function SyntaxError() {
	return Error.call(this, 'syntax error');
}


function Lexer(input) {
	var token, label;

	function match(pattern) {
		var result = pattern.exec(input);
		if (result) {
			label = result[0];
			input = input.substr(label.length);
			return true;
		} else {
			return false;
		}
	}

	function next() {
		if (match(/^\s+/)) {
			return next();
		} else if (match(/^\(/)) {
			return token = '(';
		} else if (match(/^\)/)) {
			return token = ')';
		} else if (match(/^[0-9]+(\.[0.9]+)?\b/)) {
			label = parseFloat(label);
			return token = 'number';
		} else if (match(/^pi\b/)) {
			label = Math.PI;
			return token = 'number';
		} else if (match(/^e\b/)) {
			label = Math.E;
			return token = 'number';
		} else if (match(/^\*\*/)) {
			return token = '**';
		} else if (match(/^\+/)) {
			return token = '+';
		} else if (match(/^\-/)) {
			return token = '-';
		} else if (match(/^\*/)) {
			return token = '*';
		} else if (match(/^\//)) {
			return token = '/';
		} else if (match(/^\%/)) {
			return token = '%';
		} else if (match(/^$/)) {
			return token = 'end';
		} else {
			throw new SyntaxError();
		}
	}

	next();

	this.next = next;

	this.end = function () {
		return token === 'end';
	};

	this.getCurrent = function () {
		return token;
	};

	this.getLabel = function () {
		return label;
	};
}


function calculate(input) {
	var lexer = new Lexer(input);

	function sum(terminator) {
		var value = product();
		while (true) {
			switch (lexer.getCurrent()) {
			case '+':
				lexer.next();
				value += product();
				break;
			case '-':
				lexer.next();
				value -= product();
				break;
			case terminator:
				return value;
			default:
				throw new SyntaxError();
			}
		}
	}

	function product() {
		var value = power();
		while (true) {
			switch (lexer.getCurrent()) {
			case '*':
				lexer.next();
				value *= power();
				break;
			case '/':
				lexer.next();
				value /= power();
				break;
			case '%':
				lexer.next();
				value %= power();
				break;
			default:
				return value;
			}
		}
	}

	function power() {
		var value = sign();
		if (lexer.getCurrent() !== '**') {
			return value;
		} else {
			lexer.next();
			return Math.pow(value, power());
		}
	}

	function sign() {
		switch (lexer.getCurrent()) {
		case '+':
			lexer.next();
			return sign();
		case '-':
			lexer.next();
			return -sign();
		default:
			return value();
		}
	}

	function value() {
		switch (lexer.getCurrent()) {
		case '(':
			return sub();
		case 'number':
			var value = lexer.getLabel();
			lexer.next();
			return value;
		default:
			throw new SyntaxError();
		}
	}

	function sub() {
		if (lexer.getCurrent() !== '(') {
			throw new SyntaxError();
		} else {
			lexer.next();
			var value = sum(')');
			if (lexer.getCurrent() !== ')') {
				throw new SyntaxError();
			} else {
				lexer.next();
				return value;
			}
		}
	}

	return sum('end');
}


require('repl').start({
	eval: function (input, context, filename, callback) {
		try {
			callback(calculate(input));
		} catch (e) {
			callback(e);
		}
	}
});
