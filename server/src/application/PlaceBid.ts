import GameState from "../domain/entities/GameState";
import { PlayerId } from "../types/id-declarations";
import { HandCycleStatus } from "../domain/enums/HandCycleStatus";

/* ASSUMPTIONS:
* - The playerBids list is initialized with all playerIds in order of bidding - with Dealer last (not necessary but nice for understanding)
* - The currentBidderId is initialized to the playerId of the first bidder (player to the left of the dealer)
* - The bidWinner and highestBid are initialized to null and 0 respectively, and will be updated as players place bids
* - The handCycleStatus is initialized to BIDDING at the start of the bidding cycle, and will be updated to PLAYING once bidding is complete
* ^ This is currently coded for it to automatically transition to playing *I want to make a funciton in HandCycle to handle transitions*
* - If shooting the moon, automatically fills in the rest of the bids to pass and transitions to next phase
* - The PlaceBid function will return null if the bid is invalid, and the updated game state if the bid is valid (including if shooting the moon)
* - The front end takes care of if there isn't a bid when the player is the dealer and forces them to bid 4
*/
export class PlaceBid {

    static placeBid(gameState: GameState, playerId: PlayerId, bidAmount: number): GameState | null {
        //Make sure that the player exists and it's their turn to bid
        console.log('Player ${playerId} is attempting to place a bid of ${bidAmount} in game ${gameState.id}');

        //Validates that it's the BIDDING phase
        if (gameState.handCycle.handCycleStatus !== HandCycleStatus.BIDDING) {
            console.log(`Illegal bid attempt by player ${playerId}. (Not BIDDING phase)`);
            return null;
        }

        const player = gameState.players.find(p => p.id === playerId);
        if (!player || !PlaceBid.validateBidTurn(gameState, playerId)) {
            console.log(`Invalid bid attempt by player ${playerId}. Either player not found or not player's turn.`);
            console.log("Player turn: ", gameState.handCycle.biddingCycle!.currentBidderId); //the ! after biddingCycle is safe because if BIDDING then biddingCycle is guaranteed
            console.log(player);
            return null;
        }

        //Jordan said she takes care of it in the frontend
        // //Special case: If no bids have been made, the dealer must bid at least 4 (or higher)
        // if ((gameState.handCycle.biddingCycle!.highestBid === 0) && (playerId === gameState.handCycle.dealerId)) {
        //     //Dealer can't pass if no bids have been made, must take it with 4
        // }

        //Checks if the bid is valid
        if (!PlaceBid.isBidValid(gameState, bidAmount)) {
            console.log(`Invalid bid amount by player ${playerId}. Bid must be higher than current bid, or pass`);
            return null;
        }

        //Updates the game state with the new bid, and next bidder
        //If shot the moon, automatically fills in rest of bids to 0
        if (bidAmount === 11) {
            console.log(`Player ${playerId} has shot the moon! Automatically ending bidding phase.`);
            PlaceBid.updateGameStateForShootingMoon(gameState, playerId);
        } else {
            console.log(`Player ${playerId} has placed a bid of ${bidAmount}. Updating game state and moving to next bidder.`);
            PlaceBid.updateGameStateForBid(gameState, playerId, bidAmount);
        }
        
        //If every player has placed a bid, transition to next phase
        if (PlaceBid.isBiddingComplete(gameState)) {
            console.log(`Bidding complete for game ${gameState.id}. Transitioning to playing phase.`);
            PlaceBid.endBiddingPhase(gameState);
        }

        console.log("New game state after placing bid:", JSON.stringify(gameState));
        return gameState;
    }

    //Updates the game state for a normal bid (not shooting moon)
    static updateGameStateForBid(gameState: GameState, playerId: PlayerId, bidAmount: number) {
        const biddingCycle = gameState.handCycle.biddingCycle!;
        biddingCycle.playerBids[playerId] = bidAmount;

        if (bidAmount > biddingCycle.highestBid) {
            biddingCycle.highestBid = bidAmount;
            biddingCycle.highestBidderId = playerId;
        }
    
        //Move to next bidder
        biddingCycle.currentBidderId = PlaceBid.getNextBidderId(gameState, playerId);
        console.log(`Player ${playerId} placed a bid of ${bidAmount}. Moving to next bidder.`);
    }

    //Updates the game state for shooting the moon, sets all other bids to 0
    static updateGameStateForShootingMoon(gameState: GameState, playerId: PlayerId) {
        const biddingCycle = gameState.handCycle.biddingCycle!;
        //Set the stats for the shooting moon player
        biddingCycle.highestBid = 11;
        biddingCycle.playerBids[playerId] = 11;
        biddingCycle.highestBidderId = playerId;

        //Set the bids for the other players to 0 or what they already bidded 
        PlaceBid.setOtherBidsForShootingMoon(gameState, playerId);
        console.log(`Player ${playerId} has shot the moon! Setting all other bids to 0.`);
    }

    //Validates that it's the player's turn to bid
    static validateBidTurn(gameState: GameState, playerId: PlayerId): boolean {
        return gameState.handCycle.biddingCycle!.currentBidderId === playerId;
    }

    //Validates that the bid is higher than current, pass, or if there is already shooting the moon
    static isBidValid(gameState: GameState, bidAmount: number): boolean {
        const currentHighestBid = gameState.handCycle.biddingCycle!.highestBid;
        if (bidAmount === 0) { 
            return true;
        } else if (currentHighestBid === 11 && !(bidAmount === 0)) {
            return false; //if there is already a bid of 11, no more bids allowed except pass
        }
        else if (bidAmount > currentHighestBid && bidAmount >= 4 && bidAmount <= 11) {
            return true;
        }
        return false;
    }

    //Helper Function to get next bidder's id
    static getNextBidderId(gameState: GameState, currentBidderId: PlayerId): PlayerId {
        const bidders = gameState.handCycle.biddingCycle!.playerBids;

        //Get playerIds in the order of bidding then find index and return next index
        const orderedPlayerIds = Object.keys(bidders) as PlayerId[];
        const currentIndex = orderedPlayerIds.indexOf(currentBidderId);
        const nextIndex = (currentIndex + 1) % orderedPlayerIds.length;
        return orderedPlayerIds[nextIndex];
    }

    //Helper funciton to set all other bids to 0 if shooting the moon
    static setOtherBidsForShootingMoon(gameState: GameState, shootingPlayerId: PlayerId) {
        const biddingCycle = gameState.handCycle.biddingCycle!;
        console.log("Player has shot the moon, everyone must pass. Setting all other bids to 0.")

        //Loop through other players and set their bids to 0 until we loop back to the shooting player
        //If the player has bid already, we don't overwrite their bid (it won't matter since shooting the moon will override it anyway, good for stats)
        let currentBidderId = PlaceBid.getNextBidderId(gameState, shootingPlayerId); //local variable without modifying actual currBidder
        while (currentBidderId !== shootingPlayerId) {
            if (biddingCycle.playerBids[currentBidderId] === undefined) {
                biddingCycle.playerBids[currentBidderId] = 0;
            }
            currentBidderId = PlaceBid.getNextBidderId(gameState, currentBidderId);
        }
        biddingCycle.currentBidderId =shootingPlayerId; //same player is technically the current bidder since everyone else has to pass/ double checking though even though using local var
    }

    //Checks if bidding is complete by checking if every player in the game has bid
    static isBiddingComplete(gameState: GameState): boolean {
        const bids = gameState.handCycle.biddingCycle!.playerBids;

        return gameState.players.every(player => bids[player.id as PlayerId] !== undefined);
    }

    //Ends the bidding phase and transitions to playing phase
    static endBiddingPhase(gameState: GameState) {
        gameState.handCycle.bidWinner = gameState.handCycle.biddingCycle!.highestBidderId!;
        gameState.handCycle.bidAmount = gameState.handCycle.biddingCycle!.highestBid;
        gameState.handCycle.handCycleStatus = HandCycleStatus.PLAYING; //Want to make it call a funciton in HandCycle to transition the phase, but for now this is fine
        gameState.handCycle.biddingCycle = null; //Free up memory by dereferencing the bidding cycle
    }


}