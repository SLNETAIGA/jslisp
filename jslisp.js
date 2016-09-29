function factorial(n) {
  return n ? n * factorial(n - 1) : 1;
}                       
var globalEnvironment = { 
    't': true, 
    'nil': false, 
	'pi': Math.PI,
	'e': Math.E,
	'ln2': Math.LN2,
	'log2e': Math.LOG2E,
	'log10e': Math.LOG10E,
	'sqrt12': Math.SQRT12,
	'sqrt2': Math.SQRT2,
	'ln10': Math.LN10,
	'inf': 179769999999999999999900000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    'maxint': Number.MAX_VALUE,
	'minint': Number.MIN_VALUE,
	
	'defvar': function(vargs) {       
        return operator( function(left, right) {  
            eval(" globalEnvironment."+left+"="+right+";");
			return "";
        }, vargs ); 
    }, 
	
    '+': function(vargs) {       
        return operator( function(left, right) {  
            return left + right;  
        }, vargs ); 
    }, 
     
    '-': function(vargs) {       
        return operator( function(left, right) {  
            return left - right;  
        }, vargs ); 
    }, 
     
    '*': function(vargs) {       
        return operator( function(left, right) {  
            return left * right;  
        }, vargs ); 
    }, 
     
    '/': function(vargs) {       
        return operator( function(left, right) {  
            return left / right;  
        }, vargs ); 
    },
	
	'@': function(vargs) {       
        return operator( function(left, right) { 
			return left.toString()+right.toString();
        }, vargs ); 
    },
	
	'fact': function(vargs) {       
        return operator( function(left, right) { 
			return factorial(left);
        }, vargs ); 
    },
	
	'sin': function(vargs) {       
        return operator( function(left, right) { 
			return Math.sin(left);
        }, vargs ); 
    },
	
	'cos': function(vargs) {       
        return operator( function(left, right) { 
			return Math.cos(left);
        }, vargs ); 
    },
	
	'tan': function(vargs) {       
        return operator( function(left, right) { 
			return Math.tan(left);
        }, vargs ); 
    },
	
	'pow': function(vargs) {       
        return operator( function(left, right) { 
			return Math.pow(left,right);
        }, vargs ); 
    },
	
	'round': function(vargs) {       
        return operator( function(left, right) { 
			return Math.round(left);
        }, vargs ); 
    },
	
	'abs': function(vargs) {       
        return operator( function(left, right) { 
			return Math.abs(left);
        }, vargs ); 
    },
} 

function operator(cb, vargs) { 
    if (vargs.length < 2) { 
        throw 'Required at least 2 arguments'; 
    } 

    var i = 0, result = vargs[0]; 
     
    while (1) { 
        if ( ++i == vargs.length ) { 
            break; 
        } 
         
        result = cb( result, vargs[i] ); 
    } 

    return result; 
} 

var parse = function(input) { 
    var tokens = /;.*|"((?:[^"\\]|\\[\s\S])*)"|([^\s`();'",]{2,}|[^\s`();'",.])|(\S)/g, 
        tok, 
        expArr = []; 
     
    function readToken() {  
        var tok, i; 
         
        while ( tok = tokens.exec(input) ) { 
            for (i = 1; i < tok.length; ++i) { 
                if ( tok[i] ) { 
                    return tok; 
                } 
            } 
        }    
    }    
     
    function parseToken(tok) {   
        if ( tok[1] ) { 
            return [ 'string', tok[1].replace( /\\"/g, '"') ]; 
        } 

        if ( tok[2] ) { 
            if (tok[2] < 0 || tok[2] == 0 || tok[2] > 0) {  
                return [ 'number', tok[2] * 1 ]; 
            }    

            return [ 'word', tok[2].toLowerCase() ]; 
        } 

        if (tok[3] == '(') { 
            var arr = [ 'list', [] ]; 

            while ( tok = readToken() ) { 
                if (tok[3] == ')') { 
                    return arr; 
                } 

                arr[1].push( parseToken(tok) ); 
            } 

            throw 'Perhaps skipped )'; 
        } 

        throw 'Unexpected token ' + tok[3] + ' at position ' + tok.index; 
    } 
     
    while ( tok = readToken() ) { 
        expArr.push( parseToken(tok) ); 
    }  
       
    return expArr; 
} 

function Environment(data, parent) { 
    this.data = data; 
    this.parent = parent;      
} 

Environment.prototype.lookup = function(id) { 
    var scope = this, data; 
     
    while (scope) { 
        if (scope.data[id] !== undefined) { 
            return scope.data[id]; 
        } 
         
        scope = scope.parent; 
    } 
     
    throw 'Object ' + id + ' not found'; 
} 

// выполнялка
function evaluate(exp, env) {   
    switch ( exp[0] ) { 
        case 'word': 
            return env.lookup( exp[1] ); 
             
        case 'list':  
            var name; 
             
            exp = exp[1]; 
            name = exp[0][1]; 
            exp[0] = evaluate( exp[0], env ); 
             
            if ( typeof exp[0] == 'function' ) { 
                 
                for (var i = 1; i < exp.length; ++i) { 
                    exp[i] = evaluate( exp[i], env ) 
                } 
                 
                try { 
                    return exp[0].call(null, exp.slice(1), env); 
                } 
                catch (err) { 
                    throw 'Error in function ' + name + ': ' + err; 
                } 
            } 
             
            throw '"' + name + '" not a function'; 
             
        default: 
            return exp[1]; 
    } 
} 

function execute(input) {  
    var expArr =  parse(input), 
        env = new Environment( {}, new Environment( globalEnvironment ) ); 
      
    console.log( JSON.stringify(expArr) );   
     
    for (var i = 0; i < expArr.length; ++i) { 
        ge('out').innerHTML += "<br>"+evaluate(expArr[i], env); 
    }
} 

var ge = function(id) { 
    return document.getElementById(id); 
} 

window.addEventListener( 'load', function() {   
    ge('execute').onclick = function() { 
	ge('out').innerHTML = "";
        try { 
            execute( ge('input').value ); 
        } 
        catch (err) { 
            ge('out').innerHTML += err; 
        } 
    } 
} ); 
