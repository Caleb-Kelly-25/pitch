
/** 
 * GameService
 *--------------------------------------------
 * This is the Logic engine for the game.
 * Its job is to:
 * 1. Initialize Game, HandCycle, and RoundPhase states
 *
*/

import { ICard, IGame, ITeam, IParticipant, IHand, IHandCycle, IRoundPhase } from '../types/game';
import { v4 as uuidv4 } from 'uuid';


