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
    this.ammunition = PLAYER_INIT_AMMO;
    this.position = PLAYER_INIT_POS;
    this.motion = motionType.NONE;
    this.verticalSpeed = 0;
    this.currentDir = motionType.RIGHT;
}

// The monster class used in this program
function Monster() {
    this.node = null;
    this.position = new Point(0,0);
    this.startPost = new Point(0,0);
    this.currentDir = motionType.NONE;
    this.specialMonster = false;
    this.maxDisplacement = 0;
}

function SpecialBullet() {
    this.node = null;
    this.position = new Point(0,0);
    this.currentDir = motionType.NONE;
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
var PLAYER_SIZE = new Size(30, 43);         // The size of the player
var MONSTER_SIZE = new Size(45, 48);        // The size of a monster
var SPECIAL_MONSTER_SIZE = new Size(70,35); // The size of a special monster
var SCREEN_SIZE = new Size(600, 560);       // The size of the game screen
var PLAYER_INIT_POS  = new Point(0, 0);     // The initial position of the player
var PLAYER_INIT_AMMO = 8;                   // The initial ammunition for the player

var MOVE_DISPLACEMENT = 5;                  // The speed of the player in motion
var MONSTER_MOVE_DISPLACEMENT = 1;          // The speed of the player in motion
var JUMP_SPEED = 15;                        // The speed of the player jumping
var VERTICAL_DISPLACEMENT = 1;              // The displacement of vertical speed

var GAME_INTERVAL = 25;                     // The time interval of running the game
var INITIAL_TIME_REMAINING = 60;            // The initial time remaining setup                   



//
// Variables in the game
//
var motionType = {NONE:0, LEFT:1, RIGHT:2}; // Motion enum
var scoreType = {MONSTER:0, GOODTHING:1, NEXTLEVEL:2, RESTART:3}; // Motion enum

var svgdoc = null;                          // SVG root document node
var player = null;                          // The player object
var name = "Anonymous";                     // The player's name
var nameTag = null;
var ammunition = 0;
var gameInterval = null;                    // The interval
var monsterBulletInterval = null;
var timeRemaining = null;                   // Time remaining
var zoom = 1.0;                             // The zoom level of the screen

var monsterCanShoot = false;

var monsterArray = [];

var currentLevel = 1;

var GAME_MAP1 = new Array(                   // Text version of the platform design
 "                              ",
 "                              ",
 "                              ",
 "###                           ",
 "  #                           ",
 "  #####     ##########        ",
 "            #                 ",
 "            #               ##",
 "         ####      #       ###",
 "#      ##          #       ###",
 "#     #           ####        ",
 "######           ######       ",
 "            #     ##          ",
 "           ###    #           ",
 "          #####             ##",
 "          #   ##           ###",
 "##            ###    #        ",
 "###             #   ##        ",
 "####            #  ######     ",
 "#####      #                 #",
 "                            ##",
 "                           ###",
 "       #   #             ###  ",
 "       #####      #####       ",
 "##                            ",
 "###          #                ",
 "####        ####              ",
 "##############################"
);

var GAME_MAP2 = new Array(                   // Text version of the platform design
 "                              ",
 "                              ",
 "                              ",
 "###                 #      ###",
 "   #                          ",
 "    ##      ####  #  #        ",
 "            #                 ",
 "            #               ##",
 "         ####              ###",
 "#      ##          #       ###",
 "#  #  #           ####        ",
 "#                #####        ",
 "            #     ##          ",
 "           ###                ",
 "          #####             ##",
 "              ##            ##",
 "##             ###    #       ",
 "###    #        ##  ###       ",
 "####   #         ########     ",
 "#####  #  ##                 #",
 "       #   #                ##",
 "       #   #               ###",
 "       #                 ###  ",
 "       ####       #####       ",
 "##                            ",
 "###          #                ",
 "####        ####              ",
 "###############################"
);

var GAME_MAP3 = new Array(                   // Text version of the platform design
 "                              ",
 "                              ",
 "                              ",
 "  ##                          ",
 "                              ",
 "#            #####    #       ",
 "      #     #                 ",
 "            #       #         ",
 "            #                 ",
 "       #                    # ",
 "                     #        ",
 "    #            #  #         ",
 "                  ##          ",
 "             #                ",
 "                            ##",
 "  #                        ###",
 "               #     #        ",
 "                #             ",
 "   #                          ",
 "   ##      #       #    #    #",
 "                             #",
 "                             #",
 "         ##                   ",
 "             #    ############",
 "             #                ",
 "             #                ",
 "   #   #    ###               ",
 "###############   #############"
);

var GAME_MAP = GAME_MAP1;
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

var GOOD_THING_SIZE = new Size(30, 30);

var EXIT_SIZE = new Size(90,123);

var restartGame = false;

var verticalPlatform = null;
var isVerticalPlatformUp = true;

var fadingPlatform1 = null;
var fadingPlatform2 = null;
var fadingPlatform3 = null;

var timeRemaining = 0;

var cheatMode = false;
var playerWins = false;

// Sound Effects
var bgSound = new Audio("bg.wav");
bgSound.volume = 0.5;
bgSound.loop = true;
var shootSound = new Audio("blaster-firing.wav");
shootSound.volume = 0.5;
var monsterSound = new Audio("monsterdies.wav");
var exitPointSound = new Audio("r2d2-exitpt.wav");
var gameOverSound = new Audio("r2d2-die.wav");
var restartSound = new Audio("dvader-restart.wav");
var endGameSound = new Audio("endofgame.wav");

//
// The load function for the SVG document
//
function load(evt) {
    // Set the root node to the global variable
    svgdoc = evt.target.ownerDocument;
    
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

    // Create disappearing platforms
    createFadingPlatforms();

    // Create vertical platform
    createVerticalPlatform();

    // Create exit door
    createExitDoor();

    // Create the monsters
    createMonsters();

    // Create portal
    createPortals();

    // Create good things
    createGoodThings();

    // Start the game interval
    gameInterval = setInterval("gamePlay()", GAME_INTERVAL);
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
            canShoot = true;
             svgdoc.getElementById("ammo").firstChild.data = "INF";
            break;
        // Deactivate cheat mode
        case "V".charCodeAt(0):
            cheatMode = false;
            svgdoc.getElementById("ammo").firstChild.data = ammunition;
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

    moveMonsters();

    setTimeout("monsterCanShoot=true",10000);
    
    if (monsterCanShoot)
        createMonsterBullets();

    setTimeout("monsterCanShoot=false",9000);
   
    moveMonsterBullets();
    
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
// This function displays ammunition remaining
//
function playerAmmo() {
    ammunition--;
    
    if (ammunition < 0) ammunition = 0;

    svgdoc.getElementById("ammo").firstChild.data = ammunition;
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

    // Transform the monster according to direction
    for (var i = 0; i < monsterArray.length; i++) {
        if (monsterArray[i].currentDir == motionType.RIGHT)
            monsterArray[i].node.setAttribute("transform", "translate(" + 
                (MONSTER_SIZE.w + monsterArray[i].position.x) + "," + monsterArray[i].position.y+") scale(-1, 1)");
        else
            monsterArray[i].node.setAttribute("transform", "translate(" + monsterArray[i].position.x + "," + monsterArray[i].position.y + ")");
    }

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
                platform.setAttribute("style", "fill:rgb(0,205,205)");

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
    fadingPlatform1.setAttribute("style", "fill:#33FFFF; opacity:1;");
    svgdoc.getElementById("platforms").appendChild(fadingPlatform1);
    
    fadingPlatform2 = svgdoc.createElementNS("http://www.w3.org/2000/svg", "rect");
    fadingPlatform2.setAttribute("x", 120);
    fadingPlatform2.setAttribute("y", 300);
    fadingPlatform2.setAttribute("width", 80);
    fadingPlatform2.setAttribute("height", 20);
    fadingPlatform2.setAttribute("style", "fill:#33FFFF; opacity:1;");
    svgdoc.getElementById("platforms").appendChild(fadingPlatform2);
    
    fadingPlatform3 = svgdoc.createElementNS("http://www.w3.org/2000/svg", "rect");
    fadingPlatform3.setAttribute("x", 280);
    fadingPlatform3.setAttribute("y", 460);
    fadingPlatform3.setAttribute("width", 80);
    fadingPlatform3.setAttribute("height", 20);
    fadingPlatform3.setAttribute("style", "fill:#33FFFF; opacity:1;");
    svgdoc.getElementById("platforms").appendChild(fadingPlatform3);
}

function createVerticalPlatform() {
    verticalPlatform = svgdoc.createElementNS("http://www.w3.org/2000/svg", "rect");
    verticalPlatform.setAttribute("x", 470);
    verticalPlatform.setAttribute("y", 300);
    verticalPlatform.setAttribute("width", 40);
    verticalPlatform.setAttribute("height", 20);
    verticalPlatform.setAttribute("style", "fill:rgb(0,205,205);");
    svgdoc.getElementById("platforms").appendChild(verticalPlatform);    
    isVerticalPlatformUp = true;
}

function createMonsters() {
    var platforms = svgdoc.getElementById("platforms");
    var verticalPlatformX = parseInt(verticalPlatform.getAttribute("x"));
    var verticalPlatformY = parseInt(verticalPlatform.getAttribute("y"));
    var verticalPlatformW = parseInt(verticalPlatform.getAttribute("width"));
    var verticalPlatformH = parseInt(verticalPlatform.getAttribute("height"));
    var fadingPlatform1X = parseInt(fadingPlatform1.getAttribute("x"));
    var fadingPlatform1Y = parseInt(fadingPlatform1.getAttribute("y"));
    var fadingPlatform1W = parseInt(fadingPlatform1.getAttribute("width"));
    var fadingPlatform1H = parseInt(fadingPlatform1.getAttribute("height"));
    var fadingPlatform2X = parseInt(fadingPlatform2.getAttribute("x"));
    var fadingPlatform2Y = parseInt(fadingPlatform2.getAttribute("y"));
    var fadingPlatform2W = parseInt(fadingPlatform2.getAttribute("width"));
    var fadingPlatform2H = parseInt(fadingPlatform2.getAttribute("height"));
    var fadingPlatform3X = parseInt(fadingPlatform3.getAttribute("x"));
    var fadingPlatform3Y = parseInt(fadingPlatform3.getAttribute("y"));
    var fadingPlatform3W = parseInt(fadingPlatform3.getAttribute("width"));
    var fadingPlatform3H = parseInt(fadingPlatform3.getAttribute("height"));
    var exitDoor = svgdoc.getElementById("exitdoor").childNodes.item(0);
    var exitX = parseInt(exitDoor.getAttribute("x"));
    var exitY = parseInt(exitDoor.getAttribute("y"));
    
    var numOfMonsters = 0;
    var special = false;

    while(true) {
        if (numOfMonsters == (7 + (currentLevel - 1) * 4)) break;
        // Get a random number out of the pixels in the game area
        var randomX = Math.floor(Math.random() * 30) * 20;
        var randomY = Math.floor(Math.random() * 28) * 20;
        var randomDir = Math.floor(Math.random() * 2);
        var eligible = true;
        for (var j = 0; j < platforms.childNodes.length; j++) {
            var node = platforms.childNodes.item(j);
            if (node.nodeName == "rect") {
                var platX = parseInt(node.getAttribute("x"));
                var platY = parseInt(node.getAttribute("y"));
                var platW = parseInt(node.getAttribute("width"));
                var platH = parseInt(node.getAttribute("height"));
                // Not eligible if collide with the platform, the user, the fading platform, and vertical platform, exit door                
                if(intersect(new Point(randomX,randomY), MONSTER_SIZE, new Point(platX, platY), new Size(platW, platH))
                    || intersect(new Point(randomX,randomY), MONSTER_SIZE, new Point(platX + 20, platY+20), new Size(platW, platH))  
                    || intersect(new Point(randomX,randomY), MONSTER_SIZE, player.position, PLAYER_SIZE) 
                    || intersect(new Point(randomX,randomY), MONSTER_SIZE, new Point(player.position.x + 50, player.position.y + 50), PLAYER_SIZE) 
                    || intersect(new Point(randomX,randomY), MONSTER_SIZE, 
                        new Point(verticalPlatformX, verticalPlatformY), new Size(verticalPlatformW, verticalPlatformH))
                    || intersect(new Point(randomX, randomY), MONSTER_SIZE, 
                        new Point(exitX, exitY), EXIT_SIZE)
                    || intersect(new Point(randomX, randomY), GOOD_THING_SIZE, 
                        new Point(fadingPlatform1X, fadingPlatform1Y), new Size(fadingPlatform1W, fadingPlatform1H))
                    || intersect(new Point(randomX, randomY), GOOD_THING_SIZE, 
                        new Point(fadingPlatform2X, fadingPlatform2Y), new Size(fadingPlatform2W, fadingPlatform2H))
                    || intersect(new Point(randomX, randomY), GOOD_THING_SIZE, 
                        new Point(fadingPlatform3X, fadingPlatform3Y), new Size(fadingPlatform3W, fadingPlatform3H)))  {
                        eligible = false;
                        break;
                }
            }
        }

        if (eligible == true) {    
            ++numOfMonsters;
            if(numOfMonsters == (7 + (currentLevel - 1) * 4))
                special = true;
            createMonster("monster" + numOfMonsters, randomX, randomY, randomDir, 50, special);
        }
    }
}

function createMonster(id, x, y, currDir, displacement, special) {
    
    // The below codes are equivalent to <use x="x'" y="y'" xlink:href="#monster"/>
    var monster = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");     
    svgdoc.getElementById("monsters").appendChild(monster);
    monster.setAttribute("transform", "translate(" + x + "," + y +")");
    monster.setAttribute("id", id);
    
    var value = "";
    
    if (special)
        value = "#specialmonster";
    else 
        value = "#monster";

    monster.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", value);
    
    var monsterObj = new Monster();
    monsterObj.node = svgdoc.getElementById(id);
    monsterObj.startPost = new Point(x, y);
    monsterObj.position = new Point(x, y);
    monsterObj.currentDir = currDir;
    monsterObj.maxDisplacement = displacement;
    monsterObj.specialMonster = special;
    
    monsterArray.push(monsterObj);
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

function createGoodThings() {
    var platforms = svgdoc.getElementById("platforms");
    var verticalPlatformX = parseInt(verticalPlatform.getAttribute("x"));
    var verticalPlatformY = parseInt(verticalPlatform.getAttribute("y"));
    var verticalPlatformW = parseInt(verticalPlatform.getAttribute("width"));
    var verticalPlatformH = parseInt(verticalPlatform.getAttribute("height"));
    var exitDoor = svgdoc.getElementById("exitdoor").childNodes.item(0);
    var exitX = parseInt(exitDoor.getAttribute("x"));
    var exitY = parseInt(exitDoor.getAttribute("y"));
    
    var numOfGoodThings = 0;

    while(true) {
        if (numOfGoodThings == 8) break;
        // Get a random number out of the pixels in the game area
        var randomX = Math.floor(Math.random() * 30) * 20;
        var randomY = Math.floor(Math.random() * 28) * 20;
        var eligible = true;
        for (var j = 0; j < platforms.childNodes.length; j++) {
            var node = platforms.childNodes.item(j);
            if (node.nodeName == "rect") {
                var platX = parseInt(node.getAttribute("x"));
                var platY = parseInt(node.getAttribute("y"));
                var platW = parseInt(node.getAttribute("width"));
                var platH = parseInt(node.getAttribute("height"));
                // Not eligible if collide with the platform, the user, the fading platform, and vertical platform, exit door                
                if(intersect(new Point(randomX,randomY), GOOD_THING_SIZE, new Point(platX, platY), new Size(platW, platH))  
                    || intersect(new Point(randomX,randomY), GOOD_THING_SIZE, player.position, PLAYER_SIZE) 
                    || intersect(new Point(randomX,randomY), GOOD_THING_SIZE, 
                        new Point(verticalPlatformX, verticalPlatformY), new Size(verticalPlatformW, verticalPlatformH))
                    || intersect(new Point(randomX, randomY), GOOD_THING_SIZE, 
                        new Point(exitX, exitY), EXIT_SIZE))  {
                        eligible = false;
                        break;
                }
            }
        }

        if (eligible == true) {
            var goodThing = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
            goodThing.setAttribute("x", randomX);
            goodThing.setAttribute("y", randomY);
            goodThing.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#goodthing");
            svgdoc.getElementById("goodthings").appendChild(goodThing);
            ++numOfGoodThings;
        }
    }
}


function createExitDoor() {
    var exit = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
    exit.setAttribute("x", 550);
    exit.setAttribute("y", 480);
    exit.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#exit");
    svgdoc.getElementById("exitdoor").appendChild(exit);
}


function shootBullet() {

    if (ammunition == 0 && !cheatMode) {
        canShoot = false;
        return;
    } 

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

    if (!cheatMode)
        playerAmmo();
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

function createMonsterBullets() {

    // Create the bullet by creating a use node
    var bullet = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
    
    for (var i = 0; i < monsterArray.length; i++) {
        if (monsterArray[i].specialMonster) {
             // Calculate and set the position of the bullet
            var bulletX = monsterArray[i].position.x + SPECIAL_MONSTER_SIZE.w / 2 - BULLET_SIZE.w / 2 ;
            var bulletY = monsterArray[i].position.y + SPECIAL_MONSTER_SIZE.h / 2 - BULLET_SIZE.h / 2 ;
            bullet.setAttribute("x", bulletX);
            bullet.setAttribute("y", bulletY);
            bullet.setAttribute("direction", monsterArray[i].currentDir);

            bullet.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#monsterbullet");

            // Append the bullet to the bullet group
            svgdoc.getElementById("specialbullet").appendChild(bullet);
        }
    } 
}

function moveMonsterBullets() {

    // Go through all bullets
    var bullets = svgdoc.getElementById("specialbullet");
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

    // // Update the position of the bullet
    // var x = parseInt(monsterBullet.node.getAttribute("x"));

    // if (monsterBullet.currentDir == motionType.RIGHT) {
    //     console.log('to right');
    //     monsterBullet.node.setAttribute("x", x + BULLET_SPEED);
    // }
    // else {
    //     monsterBullet.node.setAttribute("x", x - BULLET_SPEED);
    // }

    // // If the bullet is not inside the screen delete it from the group
    // if (x > SCREEN_SIZE.w || x < 0) {
    //     monsterBullet.node.parentNode.removeChild(monsterBullet.node);
    // }
}

//
// This function moves the vertical platform
//
function moveVerticalPlatform() {
    var y = parseInt(verticalPlatform.getAttribute("y"));
    if(isVerticalPlatformUp) {
        if(y > 50)
            verticalPlatform.setAttribute("y", y - 1);
        else
            isVerticalPlatformUp = false;
    }
    else {
        if(y < 250)
            verticalPlatform.setAttribute("y", y + 1);
        else
            isVerticalPlatformUp = true;
    }
}

function moveMonsters() {
    // Move monster left or right
    for (var i = 0; i < monsterArray.length; i++) {
         // Update monster position
        var displacement = new Point();

        if (monsterArray[i].currentDir == motionType.LEFT)
            displacement.x = -MONSTER_MOVE_DISPLACEMENT;

        if (monsterArray[i].currentDir == motionType.RIGHT)
            displacement.x = MONSTER_MOVE_DISPLACEMENT;

        // Get the new position of the monster
        var position = new Point();
        position.x = monsterArray[i].position.x + displacement.x;
        position.y = monsterArray[i].position.y + displacement.y;

        monsterArray[i].position = position;

        if(monsterArray[i].position.x == monsterArray[i].startPost.x)
            if (monsterArray[i].currentDir == motionType.RIGHT)
                monsterArray[i].currentDir = motionType.LEFT;
            else
                monsterArray[i].currentDir = motionType.RIGHT;

        if((monsterArray[i].position.x >= (monsterArray[i].startPost.x + monsterArray[i].maxDisplacement))
            && monsterArray[i].currentDir == motionType.RIGHT) {
            monsterArray[i].currentDir = motionType.LEFT;
        }
        if((monsterArray[i].position.x <= (monsterArray[i].startPost.x - monsterArray[i].maxDisplacement))
            && monsterArray[i].currentDir == motionType.LEFT) {
            monsterArray[i].currentDir = motionType.RIGHT;
        }   
    }
}

function collisionDetection() {
    
    if (!cheatMode) {
        // Check whether the player collides with a monster
        for (var i = 0; i < monsterArray.length; i++) {
            // For each monster check if it overlaps with the player
            // if yes, stop the game
            if (intersect(player.position, PLAYER_SIZE, 
                monsterArray[i].position, MONSTER_SIZE))
                gameOver();
        }


        // Check whether monster bullet hit the player
        var bullets = svgdoc.getElementById("specialbullet");
        for (var i = 0; i < bullets.childNodes.length; i++) {
            var bullet = bullets.childNodes.item(i);

            // For each bullet check if it overlaps with any monster
            // if yes, remove both the monster and the bullet
            var bulletX = parseInt(bullet.getAttribute("x"));
            var bulletY = parseInt(bullet.getAttribute("y"));

            if (intersect(new Point(bulletX, bulletY), BULLET_SIZE, 
                player.position, PLAYER_SIZE)) {
                gameOver();
            }
        }
    }

    // Check whether the player is on the disappearing platforms
    if(fadingPlatform1 != null && (player.position.x + PLAYER_SIZE.w > 180 
        && player.position.x + PLAYER_SIZE.w < 260) 
        && (player.position.y + PLAYER_SIZE.h == 100)) {
        removePlatform(fadingPlatform1);
        fadingPlatform1 = null;
    }
    if(fadingPlatform2 != null && (player.position.x + PLAYER_SIZE.w > 120 
        && player.position.x + PLAYER_SIZE.w < 200) 
        && (player.position.y + PLAYER_SIZE.h == 300)) {
        removePlatform(fadingPlatform2);
        fadingPlatform2 = null;
    }
    if(fadingPlatform3 != null && (player.position.x + PLAYER_SIZE.w > 280 
        && player.position.x + PLAYER_SIZE.w < 360) 
        && (player.position.y + PLAYER_SIZE.h == 460)) {
        removePlatform(fadingPlatform3);
        fadingPlatform3 = null;
    }

    // Check whether the player collects a good thing
    var goodThings = svgdoc.getElementById("goodthings");
    for (var i = 0; i < goodThings.childNodes.length; i++) {
        var goodThing = goodThings.childNodes.item(i);
        var x = parseInt(goodThing.getAttribute("x"));
        var y = parseInt(goodThing.getAttribute("y"));

        if (intersect(new Point(x, y), GOOD_THING_SIZE, player.position, PLAYER_SIZE)) {
            goodThings.removeChild(goodThing);
            i--;
            updateScore(scoreType.GOODTHING)
        }
    }

    // Check whether a bullet hits a monster
    var bullets = svgdoc.getElementById("bullets");
    for (var i = 0; i < bullets.childNodes.length; i++) {
        var bullet = bullets.childNodes.item(i);

        // For each bullet check if it overlaps with any monster
        // if yes, remove both the monster and the bullet
        var bulletX = parseInt(bullet.getAttribute("x"));
        var bulletY = parseInt(bullet.getAttribute("y"));

        var monsters = svgdoc.getElementById("monsters");
        for (var j = 0; j < monsterArray.length; j++) {
            if (intersect(new Point(bulletX, bulletY), BULLET_SIZE, 
                monsterArray[j].position, MONSTER_SIZE)) {
                monsters.removeChild(monsterArray[j].node);
                monsterArray.splice(j,1);
                bullets.removeChild(bullet);
                updateScore(scoreType.MONSTER);
                monsterSound.play();
            }
        }
    }

    // Check whether the player enters the portal
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
        setTimeout(
            function() { 
                enterPortal = false;
            }, 3000);
    }
    if (intersect(new Point(portal2x, portal2y), PORTAL_SIZE, player.position, PLAYER_SIZE) && !enterPortal) {
        player.position.x = portal1x;
        player.position.y = portal1y;
        enterPortal = true;
        setTimeout(
            function() { 
                enterPortal = false;
            }, 3000);
    }

    // Check whether the player tries to enter exit door
    // TODO
    var exit = svgdoc.getElementById("exitdoor").childNodes.item(0);
    var exitX = parseInt(exit.getAttribute("x"));
    var exitY = parseInt(exit.getAttribute("y"));
    if(intersect(new Point(exitX, exitY), EXIT_SIZE, player.position, PLAYER_SIZE) 
        && goodThings.childNodes.length == 0) {
        bgSound.pause();
        bgSound.currentTime = 0;

        exitPointSound.play();
        updateScore(scoreType.NEXTLEVEL);
        nextLevel();
    }
}

function nextLevel() {
    player.position = new Point(0,0);
    currentLevel++;
    if (currentLevel == 2)
        GAME_MAP = GAME_MAP2;
    if (currentLevel == 3)
        GAME_MAP = GAME_MAP3;
    if (currentLevel == 4) {
        win();
        return;
    }

    cleanUpGroup("monsters", false);
    cleanUpGroup("bullets", false);
    cleanUpGroup("platforms", false);
    monsterArray = [];

    createFadingPlatforms();
    createPlatforms();
    createMonsters();
    createGoodThings();
    createVerticalPlatform();

    timeRemaining = INITIAL_TIME_REMAINING;
    ammunition = PLAYER_INIT_AMMO;

    svgdoc.getElementById("ammo").firstChild.data = ammunition;
    svgdoc.getElementById("level").firstChild.data = currentLevel;
    // Start the timer
    clearInterval(timeRemainingTimer);
    timeRemainingTimer = setInterval("gameTime()", 1000);
    
    if (!cheatMode)
    svgdoc.getElementById("ammo").firstChild.data = ammunition;
    else
    svgdoc.getElementById("ammo").firstChild.data = "INF";
    
    bgSound.play();
}

function removePlatform(fadingPlatform) {
    var animate = svgdoc.createElementNS("http://www.w3.org/2000/svg", "animate");
    animate.setAttribute("attributeName", "opacity");
    animate.setAttribute("attributeType", "CSS");
    animate.setAttribute("from", "1");
    animate.setAttribute("to", "0");
    animate.setAttribute("begin", "0s");
    animate.setAttribute("dur", "0.5s");
    fadingPlatform.appendChild(animate);
    
    setTimeout(function(){
        fadingPlatform.parentNode.removeChild(fadingPlatform);
    }, 500);
}

function win() {
    playerWins = true;
    bgSound.pause();
    bgSound.currentTime = 0;
    // Load and play sound effect for winning the game
    endGameSound.play();

    clearInterval(gameInterval);
    clearInterval(timeRemainingTimer);
    cleanUpGroup("highscoretext", false);
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
    if (order < 5) {
        var content =  svgdoc.getElementById("highscoretext");
        content.childNodes[order*2].setAttribute("style", "fill:rgb(0,205,205)");
        content.childNodes[(order*2)+1].setAttribute("style", "fill:rgb(0,205,205)");
    }
    currentLevel = 1;
}

function updateScore(object) {
    switch(object) {
    case scoreType.MONSTER:
        score += 20;
        break;
    case scoreType.GOODTHING:
        score += 10;
        break;
    case scoreType.NEXTLEVEL:
        score += timeRemaining;
        score += currentLevel * 100;
        break;
    case scoreType.RESTART:
        score = 0;
        break;
    }
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

    if (order < 5) {
        var content =  svgdoc.getElementById("highscoretext");
        content.childNodes[order*2].setAttribute("style", "fill:rgb(0,205,205)");
        content.childNodes[(order*2)+1].setAttribute("style", "fill:rgb(0,205,205)");
    }
}

function startGameAgain() {
    if (!playerWins) 
        restartSound.play();
    else {
        endGameSound.pause();
        endGameSound.currentTime = 0;
    }
    restartGame = true;
    cleanUpGroup("monsters", false);
    monsterArray = [];
    cleanUpGroup("bullets", false);
    cleanUpGroup("goodthings", false);
    cleanUpGroup("highscoretext", false);
    cleanUpGroup("platforms", false);
    player = new Player();

    updateScore(scoreType.RESTART);
    ammunition = PLAYER_INIT_AMMO;
    svgdoc.getElementById("ammo").firstChild.data = ammunition;
   // Hide highscore table
    var highscoretable = svgdoc.getElementById("highscoretable");
    highscoretable.style.setProperty("visibility", "hidden", null);

    GAME_MAP = GAME_MAP1;
    
    createPlatforms();
    createFadingPlatforms();
    createVerticalPlatform();
    createMonsters();
    createGoodThings(); 
    playerWins = false;
    startGame();
}

function startGame() {
    bgSound.play();

    timeRemaining = INITIAL_TIME_REMAINING;
    if (!cheatMode)
        ammunition = PLAYER_INIT_AMMO;
    canShoot = true;

    if (restartGame) {
        // Start the game intervald
        clearInterval(gameInterval);
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
    player.name = name;
    // Display the player name
    nameTag = svgdoc.getElementById("player_name");
    nameTag.firstElementChild.textContent = name;

    var nameTagX = player.position.x;
    var nameTagY = player.position.y - 5;
    nameTag.setAttribute("transform", "translate(" + 
            nameTagX + "," + nameTagY +")");

    enterPortal = false;

    if (!cheatMode)
        svgdoc.getElementById("ammo").firstChild.data = ammunition;
    else
        svgdoc.getElementById("ammo").firstChild.data = "INF";

    // Start the timer
    timeRemainingTimer = setInterval("gameTime()", 1000);
    currentLevel = 1;
    svgdoc.getElementById("level").firstChild.data = currentLevel;
}