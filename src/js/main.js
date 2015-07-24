/* This file should direct the entire game, making sure the board and pieces are
 * being rendered properly 
 */

/// library requires
window.$ = window.jQuery = require("jquery");
require("bootstrap-sass");

/// module requires
var Board = require("./board"),
	display = require("./display"),
	settings = require("./settings");

/// variables
var board;

/// functions
function init() {
	// create and initialize the game board in memory
	board = new Board({
		goals: settings.goals,
		layout: settings.boardLayout.map(function (row) {
			return row.split("");
		})
	});
	
	// initialize the display of the game and pass in the board so it can render
	// the board
	display.init(board);
	
}

/// initialization
init();