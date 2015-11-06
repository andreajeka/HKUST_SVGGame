## COMP 4021 SVG Game Project
##### SUBMISSION: 23:59 Nov 8th 2015

[ ] Time countdown - 4% (reduced by 1/second)

[ ] Exit point

[ ] Create good things (i.e. coins). Collecting them increases score and if all are
collected player can finish the game or get to the next level.

[ ] Monster appears randomly. Player dies if it touches a monster.

[x] Player can shoot monsters to get additional score


1. [x] Starting screen - 4%
	1. [x] Include the title of the game and your name
    2. [x] Give a general introduction to the game and tell the player what he/she needs to do
    3. [x] Say what keys the user needs to press to play the game (left/right/jump/shoot)
2. [ ] Handling of player - 10%
    1. [x] Flip player when move left or right - 2 marks
    2. [x] The player can jump / move left / move right / shoot at any platform - 2marks
    3. [ ] Appropriate visual impact for the player - 2 marks
    4. [x] The player name is appropriately shown at the top of the player, with `Anonymous` used as the name if the user enters an empty string - 2marks
    5. [x] The player dies if it touches any monster - 2 marks
3. [ ] Handling of monsters - 12%
    1. [ ] There must be at least 6 monsters
    2. [ ] Appropriate visual impact - 2 marks
    3. [ ] Some appropriate animation of monsters (using any SVG animation command except animateColor) - 2 marks
    4. [x] The monster move smoothly from one random location to another random location - 2marks
    5. [x] Flip monster when move left/right - 2 marks
    6. [ ] There has to be exactly one special monster which can shoot bullet. There has at most one bullet in game window from the monster at a time- 2 marks
4. [ ] Handling of good things - 6%
    1. [x] There must be at least 8 good things
    2. [x] Appropriate visual impact - 1 mark
    3. [x] Generated at random places at the start of game  - 1 mark
    4. [x] Don't overlap with platforms - 1 mark
    5. [x] Player collect good things by touching them, good things deleted from DOM - 1 mark
    6. [ ] All good things should be collected before can go to next level - 2 marks
5. [x] One vertical platform move up and down - 4%
6. [x] Disappearing platforms - 5%
 	1. [x] There are three disappearing platforms (stand for a certain period of time like 0.5 second, the platform will disappear and player fall down) - 3 marks
    2. [ ] Appropriate visual change in opacity - 2 marks
    3  [x] Gone platform will not come back
7. [x] Transmission portal - 4%
	1. [x] Two portals appeared on the screen - 2 marks
    2. [x] When player enters into one portal, it will appear at the position of another portal - 2 marks
8. [x] Shooting - 6%
	1. [x] A player gets 8 bullets at the start of the game for each level. Number of remaining bullets are shown in GUI - 2 marks
    2. [x] When face right or left bullet moves according to the player orientation and removed if out of screen - 2 marks for each orientation
9. [x] Sound - 5%, one mark each for shooting, reach exit point, player dies, monster dies, continuous music
10. [x] Time remaining - 4%
	1. [x] Player needs to reach exit point within certain period of time
    2. [x] Player will die if cannot reach exit within that time
    3. [x] Time count down is updated and displayed appropriately every second - 4 marks
11. [ ] Level handling - 6%
	1. [ ] Start with level 1
    2. [ ] If exit is reached before time is out, remaining time is added to score and moves to next level
    3. [ ] Appropriate visual impact - 1 mark
    4. [ ] Current level is shown in GUI and updated appropriately - 2 marks
    5. [ ] Game correctly restarted when the next level is started (score not zero of course)
12. [ ] Game Quality - 8%
	1. [ ] First level is not hard but easy - 2 marks
    2. [ ] The game gets harder next level, Add 4 monsters per subsequent level, player always has 8 bullets for any level - 2 marks
    3. [ ] Different theme/images than lab's - 0/2/4 mark
13. [ ] Score update and display - 4%
	1. [ ] Score updated every level. Add L * 100 points for passing level L. Add X points for each second of remaining time. - 1 mark
    2. [ ] Score is updated when a monster is host. Add Y points when this happens. - 1 mark
    3. [ ] Score is updated when a good thing is collected. Add Z points when this happens. - 1 mark
    4. [ ] If game is in zoom mode, more marks are given than above. Double X and Z and triple Y, while L * 100 stays the same - 1 mark
14. [ ] Cheat mode - 6%
	1. [ ] Player will not die when collide with monster, and also infinite bullets - 2 marks
    2. [x] Press 'c' to enter cheat mode - 2 marks
    3. [x] Press 'v' to leave cheat mode - 2 marks
    4. [ ] If game is in zoom mode, more marks are given than above. Double X and Z and triple Y, while L * 100 stays the same - 1 mark
15. [x] End of game - 8%
	1. [x] Score + name are inserted into a top 5 high score table at correct place - 2 marks
    2. [x] High scores saved/updated appropriately in cookie - 2 marks
    3. [x] Show players score and high score - 2 marks
    4. [x] Show 'Start Again?' button. If player clicks on it, the game begins again, enter name, but previously entered name is now the default text. - 2 marks
16. [ ] High score display - 8%
	1. [x] Appropriate title shown 'High Score Table' - 1 mark
    2. [ ] Top 5 scores are shown in descending order. Different color for top 5 - 4 marks
    3. [ ] Cookies are used appropriately - 3 marks

 