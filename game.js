// The point and size class used in this program
function Point(x, y) {
    this.x = (x)? parseFloat(x) : 0.0;
    this.y = (y)? parseFloat(y) : 0.0;
}

function Size(w, h) {
    this.w = (w)? parseFloat(w) : 0.0;
    this.h = (h)? parseFloat(h) : 0.0;
}

// Helper function for checking intersection between two rectangles
function intersect(pos1, size1, pos2, size2) {
    return (pos1.x < pos2.x + size2.w && pos1.x + size1.w > pos2.x &&
            pos1.y < pos2.y + size2.h && pos1.y + size1.h > pos2.y);
}

// The player class used in this program
function Player() {
    this.name = name;
    this.node = svgdoc.getElementById("player");
    this.position = PLAYER_INIT_POS;
    this.motion = motionType.NONE;
    this.verticalSpeed = 0;
    this.currentDir = motionType.RIGHT;
}

Player.prototype.isOnPlatform = function() {
    var platforms = svgdoc.getElementById("platforms");
    for (var i = 0; i < platforms.childNodes.length; i++) {
        var node = platforms.childNodes.item(i);
        if (node.nodeName != "rect") continue;

        var x = parseFloat(node.getAttribute("x"));
        var y = parseFloat(node.getAttribute("y"));
        var w = parseFloat(node.getAttribute("width"));
        var h = parseFloat(node.getAttribute("height"));

        if (((this.position.x + PLAYER_SIZE.w > x && this.position.x < x + w) ||
             ((this.position.x + PLAYER_SIZE.w) == x && this.motion == motionType.RIGHT) ||
             (this.position.x == (x + w) && this.motion == motionType.LEFT)) &&
            this.position.y + PLAYER_SIZE.h == y) return true;
    }
    if (this.position.y + PLAYER_SIZE.h == SCREEN_SIZE.h) return true;

    return false;
}

Player.prototype.collidePlatform = function(position) {
    var platforms = svgdoc.getElementById("platforms");
    for (var i = 0; i < platforms.childNodes.length; i++) {
        var node = platforms.childNodes.item(i);
        if (node.nodeName != "rect") continue;

        var x = parseFloat(node.getAttribute("x"));
        var y = parseFloat(node.getAttribute("y"));
        var w = parseFloat(node.getAttribute("width"));
        var h = parseFloat(node.getAttribute("height"));
        var pos = new Point(x, y);
        var size = new Size(w, h);

        if (intersect(position, PLAYER_SIZE, pos, size)) {
            position.x = this.position.x;
            if (intersect(position, PLAYER_SIZE, pos, size)) {
                if (this.position.y >= y + h)
                    position.y = y + h;
                else
                    position.y = y - PLAYER_SIZE.h;
                this.verticalSpeed = 0;
            }
        }
    }
}

Player.prototype.collideScreen = function(position) {
    if (position.x < 0) position.x = 0;
    if (position.x + PLAYER_SIZE.w > SCREEN_SIZE.w) position.x = SCREEN_SIZE.w - PLAYER_SIZE.w;
    if (position.y < 0) {
        position.y = 0;
        this.verticalSpeed = 0;
    }
    if (position.y + PLAYER_SIZE.h > SCREEN_SIZE.h) {
        position.y = SCREEN_SIZE.h - PLAYER_SIZE.h;
        this.verticalSpeed = 0;
    }
}


//
// Below are constants used in the game
//
var PLAYER_SIZE = new Size(33, 43);         // The size of the player
var MONSTER_SIZE = new Size(40, 55);        // The size of a monster
var SCREEN_SIZE = new Size(600, 560);       // The size of the game screen
var PLAYER_INIT_POS  = new Point(0, 0);     // The initial position of the player

var MOVE_DISPLACEMENT = 5;                  // The speed of the player in motion
var JUMP_SPEED = 15;                        // The speed of the player jumping
var VERTICAL_DISPLACEMENT = 1;              // The displacement of vertical speed

var GAME_INTERVAL = 25;                     // The time interval of running the game
var INITIAL_TIME_REMAINING = 60;            // The initial time remaining setup                   

//
// Variables in the game
//
var motionType = {NONE:0, LEFT:1, RIGHT:2}; // Motion enum

var svgdoc = null;                          // SVG root document node
var player = null;                          // The player object
var name = "Anonymous";                     // The player's name
var nameTag = null;
var gameInterval = null;                    // The interval
var timeRemaining = null;                   // Time remaining
var zoom = 1.0;                             // The zoom level of the screen
var GAME_MAP = new Array(                   // Text version of the platform design
 "                              ",
 "                              ",
 "                              ",
 "###                           ",
 "  #                           ",
 "  #######    ############     ",
 "   #       ##                 ",
 "                            ##",
 "                           ###",
 "#                  #      ####",
 "#                 ####        ",
 "####             #######      ",
 "            #     ########    ",
 "           ###                ",
 "          #####             ##",
 "      #####   ##         #####",
 "##            ###  #          ",
 "###             #  ###        ",
 "######          #  ######     ",
 "#####      #                 #",
 "         ####               ##",
 "        ##########         ###",
 "       #####          #  ###  ",
 "      ###           ###       ",
 "##                 ###        ",
 "###          #                ",
 "####   #    ####         #    ",
 "##############################"
);
// TODO: Make a bullet object later
var BULLET_SIZE = new Size(10, 10);         // The size of a bullet    
var BULLET_SPEED = 10.0;                    // The speed of a bullet
                                            // = # of pixels it moves for each game loop
var SHOOT_INTERVAL = 200.0;                 // The period when shooting is disabled (cooldown time)
var canShoot = true;                        // A flag indicating whether the player can shoot a bullet
var score = 0;                              // The score of the game

var PORTAL_SIZE = new Size(60, 60);
var PORTAL_ACTIVATION_RANGE = new Size(90, 90);
var enterPortal = false;
var isInPortalRange = false;

var restartGame = false;

var verticalPlatform = null;
var isVerticalPlatformUp = true;

var fadingPlatform1 = null;
var fadingPlatform2 = null;
var fadingPlatform3 = null;

var timeRemaining = 0;

var cheatMode = false;

// Sound Effects
var startSound = new Audio("theme.wav")
var bgSound = new Audio("bg.wav");
bgSound.loop = true;
var shootSound = new Audio("blaster-firing.wav");
var monsterSound = new Audio("monsterdies.wav");
var exitPointSound = new Audio("r2d2-exitpt");
var gameOverSound = new Audio("r2d2-die.wav");

//
// The load function for the SVG document
//
function load(evt) {
    // Set the root node to the global variable
    svgdoc = evt.target.ownerDocument;
    verticalPlatform = svgdoc.getElementById("verticalplatform");
    // Hide highscore table
    var highscoretable = svgdoc.getElementById("highscoretable");
    highscoretable.style.setProperty("visibility", "hidden", null);

    // Attach keyboard events
    svgdoc.documentElement.addEventListener("keydown", keydown, false);
    svgdoc.documentElement.addEventListener("keyup", keyup, false);

    // Remove text nodes in the 'platforms' group
    cleanUpGroup("platforms", true);

    // Set up the platforms
    createPlatforms();

    // Create the player
    player = new Player();

    // Create the monsters
    createMonsters();

    // Create portal
    createPortals();

    // Create disappearing platforms
    createFadingPlatforms();

    // Setup moving vertical platform
    verticalPlatform.setAttribute("y", 300);
    isVerticalPlatformUp = true;

    // Start the game interval
    gameInterval = setInterval("gamePlay()", GAME_INTERVAL);

    bgSound.play();
}


//
// This function removes all/certain nodes under a group
//
function cleanUpGroup(id, textOnly) {
    var node, next;
    var group = svgdoc.getElementById(id);
    node = group.firstChild;
    while (node != null) {
        next = node.nextSibling;
        if (!textOnly || node.nodeType == 3) // A text node
            group.removeChild(node);
        node = next;
    }
}


//
// This is the keydown handling function for the SVG document
//
function keydown(evt) {
    var keyCode = (evt.keyCode)? evt.keyCode : evt.getKeyCode();

    switch (keyCode) {
        // Move left
        case "N".charCodeAt(0):
            player.motion = motionType.LEFT;
            player.currentDir = motionType.LEFT;
            break;
        // Move right
        case "M".charCodeAt(0):
            player.motion = motionType.RIGHT;
            player.currentDir = motionType.RIGHT;
            break;
		// Jump
        case "Z".charCodeAt(0):
            // only jumps if player is on the platform
            if (player.isOnPlatform())
                player.verticalSpeed = JUMP_SPEED;
            break;
        case 32: // spacebar = shoot
              if (canShoot) shootBullet();
              break;
        // Activate cheat mode
        case "C".charCodeAt(0):
            cheatMode = true;
            break;
        // Deactivate cheat mode
        case "V".charCodeAt(0):
            cheatMode = false;
            break;
    }
}

//
// This is the keyup handling function for the SVG document
//
function keyup(evt) {
    // Get the key code
    var keyCode = (evt.keyCode)? evt.keyCode : evt.getKeyCode();

    switch (keyCode) {
        case "N".charCodeAt(0):
            if (player.motion == motionType.LEFT) player.motion = motionType.NONE;
            break;

        case "M".charCodeAt(0):
            if (player.motion == motionType.RIGHT) player.motion = motionType.NONE;
            break;
    }
}

//
// This function updates the position and motion of the player in the system
//
function gamePlay() {

    collisionDetection();
    
    // Check whether the player is on a platform
    var isOnPlatform = player.isOnPlatform();
    
    // Update player position
    var displacement = new Point();

    // Move left or right
    if (player.motion == motionType.LEFT)
        displacement.x = -MOVE_DISPLACEMENT;
    if (player.motion == motionType.RIGHT)
        displacement.x = MOVE_DISPLACEMENT;

    // Fall
    if (!isOnPlatform && player.verticalSpeed <= 0) {
        displacement.y = -player.verticalSpeed;
        player.verticalSpeed -= VERTICAL_DISPLACEMENT;
    }

    // Jump
    if (player.verticalSpeed > 0) {
        displacement.y = -player.verticalSpeed;
        player.verticalSpeed -= VERTICAL_DISPLACEMENT;
        if (player.verticalSpeed <= 0)
            player.verticalSpeed = 0;
    }

    // Get the new position of the player
    var position = new Point();
    position.x = player.position.x + displacement.x;
    position.y = player.position.y + displacement.y;

    // Check collision with platforms and screen
    player.collidePlatform(position);
    player.collideScreen(position);

    // Set the location back to the player object (before update the screen)
    player.position = position;

    moveBullets();
    moveVerticalPlatform();

    updateScreen();
}

//
// This function displays time remaining
//
function gameTime() {
    timeRemaining--;
    
    if (timeRemaining < 0) timeRemaining = 0;
    
    if(timeRemaining == 0)
        gameOver();

    svgdoc.getElementById("time").firstChild.data = timeRemaining;
}

//
// This function updates the position of the player's SVG object and
// set the appropriate translation of the game screen relative to the
// the position of the player
//
function updateScreen() {
    // Transform the player according to direction
    if (player.currentDir== motionType.LEFT)
        player.node.setAttribute("transform", "translate(" + 
            (PLAYER_SIZE.w + player.position.x) + "," + player.position.y+") scale(-1, 1)");
    else 
        player.node.setAttribute("transform", "translate(" + player.position.x + "," + player.position.y + ")");

    // Player's name moves along with the player
    if (nameTag != null) {
      var nameTagX = player.position.x + 15;
      var nameTagY = player.position.y - 5;
      nameTag.setAttribute("transform", "translate(" + 
            nameTagX + "," + nameTagY +")");
  }

    // Calculate the scaling and translation factors
    var scale = new Point(zoom, zoom);
    var translate = new Point();

    translate.x = SCREEN_SIZE.w / 2.0 - (player.position.x + PLAYER_SIZE.w / 2) * scale.x;
    if (translate.x > 0)
        translate.x = 0;
    else if (translate.x < SCREEN_SIZE.w - SCREEN_SIZE.w * scale.x)
        translate.x = SCREEN_SIZE.w - SCREEN_SIZE.w * scale.x;

    translate.y = SCREEN_SIZE.h / 2.0 - (player.position.y + PLAYER_SIZE.h / 2) * scale.y;
    if (translate.y > 0)
        translate.y = 0;
    else if (translate.y < SCREEN_SIZE.h - SCREEN_SIZE.h * scale.y)
        translate.y = SCREEN_SIZE.h - SCREEN_SIZE.h * scale.y;

    // Transform the game area
    svgdoc.getElementById("gamearea").setAttribute("transform", "translate(" + translate.x + "," + translate.y + ") scale(" + scale.x + "," + scale.y + ")");
}

function zoomScreen() {
    ++zoom;
    updateScreen();
}

function createPlatforms() {
    var platforms = svgdoc.getElementById("platforms");
    for (var y = 0; y < GAME_MAP.length; y++) {
        var start = null, end = null;
        for (var x = 0; x < GAME_MAP[y].length; x++) {
            // CASE 1 : If this is the first time defining start when '#'' is found
            // set the start point
            if (start == null && GAME_MAP[y].charAt(x) == "#")
                start = x;
            // CASE 2 : If the consecutive "#" is done, set the end point
            if (start != null && GAME_MAP[y].charAt(x) == " ")
                end = x - 1;
            // CASE 3 : If we are already at the end of the game map and # is still found
            if (start != null && x == GAME_MAP[y].length - 1)
                end = x;
            // If start and end points have been determined, we are ready to draw
            if (start != null && end!= null) {
                var platform = svgdoc.createElementNS("http://www.w3.org/2000/svg", "rect");
                platform.setAttribute("x", start * 20);
                platform.setAttribute("y", y * 20);
                platform.setAttribute("width", (end - start + 1) * 20);
                platform.setAttribute("height", 20);
                platform.setAttribute("style", "fill:orange");

                platforms.appendChild(platform);

                start = end = null;
            }
        }
    }
}

function createFadingPlatforms() {
    fadingPlatform1 = svgdoc.createElementNS("http://www.w3.org/2000/svg", "rect");
    fadingPlatform1.setAttribute("x", 180);
    fadingPlatform1.setAttribute("y", 100);
    fadingPlatform1.setAttribute("width", 80);
    fadingPlatform1.setAttribute("height", 20);
    fadingPlatform1.setAttribute("style", "fill:grey; fill-opacity:1");
    svgdoc.getElementById("platforms").appendChild(fadingPlatform1);
    
    fadingPlatform2 = svgdoc.createElementNS("http://www.w3.org/2000/svg", "rect");
    fadingPlatform2.setAttribute("x", 80);
    fadingPlatform2.setAttribute("y", 220);
    fadingPlatform2.setAttribute("width", 80);
    fadingPlatform2.setAttribute("height", 20);
    fadingPlatform2.setAttribute("style", "fill:grey; fill-opacity:1");
    svgdoc.getElementById("platforms").appendChild(fadingPlatform2);
    
    fadingPlatform3 = svgdoc.createElementNS("http://www.w3.org/2000/svg", "rect");
    fadingPlatform3.setAttribute("x", 280);
    fadingPlatform3.setAttribute("y", 420);
    fadingPlatform3.setAttribute("width", 80);
    fadingPlatform3.setAttribute("height", 20);
    fadingPlatform3.setAttribute("style", "fill:grey; fill-opacity:1");
    svgdoc.getElementById("platforms").appendChild(fadingPlatform3);
}

function createMonsters() {
    createMonster(200,40);
    createMonster(300,40);
}

function createMonster(x,y) {
    // The below codes are equivalent to <use x="x'" y="y'" xlink:href="#monster"/>
    var monster = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
    svgdoc.getElementById("monsters").appendChild(monster);
    monster.setAttribute("x", x);
    monster.setAttribute("y", y);
    monster.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#monster");
}

function createPortals() {
    createPortal (530, 10, "portal1");
    createPortal (0, 400, "portal2");
}

function createPortal(x,y,id) {
    var portal = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
    svgdoc.getElementById("portals").appendChild(portal);
    portal.setAttribute("x", x);
    portal.setAttribute("y", y);
    portal.setAttribute("id", id);
    portal.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#portal");
}

function shootBullet() {

    // Load and play sound effect for shooting
    shootSound.load();
    shootSound.play();

    // Disable shooting for a short period of time
    canShoot = false;
    setTimeout("canShoot = true", SHOOT_INTERVAL);

    // Create the bullet by creating a use node
    var bullet = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
   
    // Calculate and set the position of the bullet
    var bulletX = player.position.x + PLAYER_SIZE.w / 2 - BULLET_SIZE.w / 2 ;
    var bulletY = player.position.y + PLAYER_SIZE.h / 2 - BULLET_SIZE.h / 2 ;
    bullet.setAttribute("x", bulletX);
    bullet.setAttribute("y", bulletY);
    bullet.setAttribute("direction", player.currentDir);
    
    // Set the href of the use node to the bullet defined in the defs node
    bullet.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#bullet");

    // Append the bullet to the bullet group
    svgdoc.getElementById("bullets").appendChild(bullet);
}

//
// This function moves the bullet
function moveBullets() {
    // Go through all bullets
    var bullets = svgdoc.getElementById("bullets");
    for (var i = 0; i < bullets.childNodes.length; i++) {
        var node = bullets.childNodes.item(i);

        // Update the position of the bullet
        var x = parseInt(node.getAttribute("x"));
        if (node.getAttribute("direction") == motionType.RIGHT)
            node.setAttribute("x", x + BULLET_SPEED);
        else node.setAttribute("x", x - BULLET_SPEED);

        // If the bullet is not inside the screen delete it from the group
        if (x > SCREEN_SIZE.w || x < 0) {
            bullets.removeChild(node);
            i--;
        }    
    }
}

//
// This function moves the vertical platform
//
function moveVerticalPlatform() {
    var y = parseInt(verticalPlatform.getAttribute("y"));
    if(isVerticalPlatformUp) {
        if(y > 100)
            verticalPlatform.setAttribute("y", y - 1);
        else
            isVerticalPlatformUp = false;
    }
    else {
        if(y < 300)
            verticalPlatform.setAttribute("y", y + 1);
        else
            isVerticalPlatformUp = true;
    }
}

function collisionDetection() {
    // Check whether the player collides with a monster
    var monsters = svgdoc.getElementById("monsters");
    for (var i = 0; i < monsters.childNodes.length; i++) {
        var monster = monsters.childNodes.item(i);

        // For each monster check if it overlaps with the player
        // if yes, stop the game
        var monsterX = parseInt(monster.getAttribute("x"));
        var monsterY = parseInt(monster.getAttribute("y"));
        if (intersect(player.position, PLAYER_SIZE, 
            new Point(monsterX, monsterY), MONSTER_SIZE))
            gameOver();
    }

    // Check whether the player is on the disappearing platforms
    if(fadingPlatform1 != null && (player.position.x + PLAYER_SIZE.w > 180 && player.position.x + PLAYER_SIZE.w < 260) && (player.position.y + PLAYER_SIZE.h == 100)) {
        removePlatform(fadingPlatform1);
        fadingPlatform1 = null;
    }
    if(fadingPlatform2 != null && (player.position.x + PLAYER_SIZE.w > 80 && player.position.x + PLAYER_SIZE.w < 160) && (player.position.y + PLAYER_SIZE.h == 220)) {
        removePlatform(fadingPlatform2);
        fadingPlatform2 = null;
    }
    if(fadingPlatform3 != null && (player.position.x + PLAYER_SIZE.w > 280 && player.position.x + PLAYER_SIZE.w < 360) && (player.position.y + PLAYER_SIZE.h == 420)) {
        removePlatform(fadingPlatform3);
        fadingPlatform3 = null;
    }

    // Check whether a bullet hits a monster
    var bullets = svgdoc.getElementById("bullets");
    for (var i = 0; i < bullets.childNodes.length; i++) {
        var bullet = bullets.childNodes.item(i);

        // For each bullet check if it overlaps with any monster
        // if yes, remove both the monster and the bullet
        var bulletX = parseInt(bullet.getAttribute("x"));
        var bulletY = parseInt(bullet.getAttribute("y"));

        for (var j = 0; j < monsters.childNodes.length; j++) {
            var monster = monsters.childNodes.item(i);
            if (monster != null) {
                var monsterX = parseInt(monster.getAttribute("x"));
                var monsterY = parseInt(monster.getAttribute("y"));
                if (intersect(new Point(bulletX, bulletY), BULLET_SIZE, 
                    new Point(monsterX, monsterY), MONSTER_SIZE)) {
                    monsters.removeChild(monster);
                    bullets.removeChild(bullet);
                    j--;
                    i--;
                    updateScore();
                    monsterSound.play();
                }
            }
        }
    }

    // Check whether the player enters the portal
    // TODO: Enhance portal mechanism using range instead of cooldown
    var portal1 = svgdoc.getElementById("portal1");
    var portal2 = svgdoc.getElementById("portal2");
    var portal1x = parseInt(portal1.getAttribute("x"));
    var portal1y = parseInt(portal1.getAttribute("y"));
    var portal2x = parseInt(portal2.getAttribute("x"));
    var portal2y = parseInt(portal2.getAttribute("y"));
    var dispFactor = (PORTAL_ACTIVATION_RANGE.x - PORTAL_SIZE.x)/2; // x and y will be the same

        if (intersect(new Point(portal1x, portal1y), PORTAL_SIZE, player.position, PLAYER_SIZE) && !enterPortal) {
            player.position.x = portal2x;
            player.position.y = portal2y;
            enterPortal = true;
            // isInPortalRange = true;

            // if (!intersect(new Point(portal2x - dispFactor, portal2y - dispFactor), PORTAL_ACTIVATION_RANGE, player.position, PLAYER_SIZE))
            //     isInPortalRange = false;
            setTimeout(function(){enterPortal = false;}, 2000);
        }
        if (intersect(new Point(portal2x, portal2y), PORTAL_SIZE, player.position, PLAYER_SIZE) && !enterPortal) {
            player.position.x = portal1x;
            player.position.y = portal1y;
            enterPortal = true;
            // isInPortalRange = true;
            
            // if (!intersect(new Point(portal1x - dispFactor, portal1y - dispFactor), PORTAL_ACTIVATION_RANGE, player.position, PLAYER_SIZE))
            //     isInPortalRange = false;
            setTimeout(function(){enterPortal = false;}, 2000);
        }

      //  if (!isInPortalRange) enterPortal = false;
}

function removePlatform(fadingPlatform) {
    var animate = svgdoc.createElementNS("http://www.w3.org/2000/svg", "animateColor");
    animate.setAttribute("attributeName", "fill");
    animate.setAttribute("attributeType", "CSS");
    animate.setAttribute("from", "grey");
    animate.setAttribute("to", "white");
    animate.setAttribute("begin", "0s");
    animate.setAttribute("dur", "0.5s");
    animate.setAttribute("fill", "freeze");
    fadingPlatform.appendChild(animate);
    //setTimeout(function(){disappearingPlatform.style.setAttribute("fill-opacity", disappearingPlatform.style.getAttribute("fill-opacity") - 0.1);}, 50);
    setTimeout(function(){fadingPlatform.parentNode.removeChild(fadingPlatform);}, 500);
}

function updateScore() {
    score += 10;
    svgdoc.getElementById("score").firstChild.data = score;
}

function gameOver() {

    bgSound.pause();
    bgSound.currentTime = 0;
    // Load and play sound effect for gameover
    gameOverSound.play();

    clearInterval(gameInterval);
    clearInterval(timeRemainingTimer);

    var table = getHighScoreTable();

    name = player.name;
    var newRecord = new ScoreRecord(player.name, score);

    // By default the new record should be pushed back to the back of the table
    var order = table.length;
    for (var i = 0; i < table.length; i++) {
        if (newRecord.score > table[i].score) {
            order = i;
            break;
        }
    }

    table.splice(order, 0, newRecord);

    setHighScoreTable(table);
    showHighScoreTable(table);
}

function startGameAgain() {
    restartGame = true;
    cleanUpGroup("monsters", false);
    cleanUpGroup("bullets", false);
    cleanUpGroup("highscoretext", false);
    startGame();
}

function startGame() {

    timeRemaining = INITIAL_TIME_REMAINING;

    if (restartGame) {
        // Hide highscore table
        var highscoretable = svgdoc.getElementById("highscoretable");
        highscoretable.style.setProperty("visibility", "hidden", null);

        // Start the game interval
        gameInterval = setInterval("gamePlay()", GAME_INTERVAL);

        svgdoc.getElementById("time").firstChild.data = timeRemaining;
    } else { //start for the first time
        //Hide the startscreen 
        var startscreen = svgdoc.getElementById("startscreen");
        startscreen.style.setProperty("visibility", "hidden", null);
    }

    // Setup the player name
    name = prompt("Please enter your name", name);
    if (name == "" || name == null || !name)
        name = "Anonymous";

    // Display the player name
    nameTag = svgdoc.getElementById("player_name");
    nameTag.firstElementChild.textContent = name;

    var nameTagX = player.position.x;
    var nameTagY = player.position.y - 5;
    nameTag.setAttribute("transform", "translate(" + 
            nameTagX + "," + nameTagY +")");

    enterPortal = false;
    
    // Start the timer
    timeRemainingTimer = setInterval("gameTime()", 1000);
}