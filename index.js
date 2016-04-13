var acorn = require('babylon');
var traverse = require('babel-traverse').default;

var regexBoth = /\b(import|require)\b/;

module.exports = detectImportRequire;
function detectImportRequire(src, opts) {
	return findImportRequire(src, opts).strings;
}

function findImportRequire(src, opts) {
	opts = opts || {};
	src = (src || '').toString();

	var results = {
		strings: [],
		nodes: []
	};

	// quick regex test before we parse entire AST
	var regex = regexBoth;
	if (!regex.test(src)) {
		return results;
	}

	var ast = acorn.parse(src, {
		ecmaVersion: 6,
		sourceType: 'module',
		allowReserved: true,
		allowReturnOutsideFunction: true,
		allowHashBang: true,
		plugins: opts.plugins || []
	});

	function importDeclaration(node) {
		if (node.source.type === 'StringLiteral') {
			results.strings.push(node.source.value);
		}
		results.nodes.push(node);
	}

	function callExpression(node) {
		if (!isRequire(node)) {
			return;
		}
		if (node.arguments.length) {
			if (node.arguments[0].type === 'StringLiteral') {
				results.strings.push(node.arguments[0].value);
			}
		}
		results.nodes.push(node);
	}

	walk(ast, {
		ImportDeclaration: importDeclaration,
		CallExpression: callExpression
	});

	return results;
}

function walk(ast, visitors) {
	traverse(ast, {
		enter(path) {
			if (visitors[path.node.type]) {
				visitors[path.node.type](path.node);
			}
		}
	});
}

function isRequire(node) {
	return node.callee.type === 'Identifier' &&
		node.callee.name === 'require';
}
