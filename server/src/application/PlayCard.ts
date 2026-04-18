import assert from "assert";
import { Card } from "../domain/entities/Card";
import GameState from "../domain/entities/GameState";
import { Player } from "../domain/entities/Player";
import { Suit } from "../domain/enums/Suit";
import { Value } from "../domain/enums/Value";
import { PlayerId } from "../types/id-declarations";
import { Trick } from "../domain/entities/Trick";
import { HandCycle } from "../domain/entities/HandCycle";
import { HandCycleStatus } from "../domain/enums/HandCycleStatus";

export class PlayCard {
    static cardPointMap: Record<Value, number> = {
        [Value.ACE]: 1,
        [Value.TWO]: 1,
        [Value.THREE]: 3,
        [Value.FOUR]: 0,
        [Value.FIVE]: 0,
        [Value.SIX]: 0,
        [Value.SEVEN]: 0,
        [Value.EIGHT]: 0,
        [Value.NINE]: 0,
        [Value.TEN]: 1,
        [Value.JOKER]: 1,
        [Value.JACK]: 1,
        [Value.QUEEN]: 0,
        [Value.KING]: 0
    };

    static playCard(gameState: GameState, playerId: PlayerId, card: Card): GameState | null {
        // Make sure the player exists in this game and it's their turn
        console.log(`Player ${playerId} is attempting to play card ${card.value} of ${card.suit} in game ${gameState.id}`);


        //Validates if the card can be played in the current HandCycle (is it the PLAYING phase)
        if (gameState.handCycle.handCycleStatus !== HandCycleStatus.PLAYING) {
            console.log(`Illegal play attempt by player ${playerId}. (Not PLAYING phase)`);
            return null;
        }

        const player = gameState.players.find(p => p.id === playerId);
        if (!player || !PlayCard.validateTurn(gameState, playerId)) {
            console.log(`Invalid play attempt by player ${playerId}. Either player not found or not player's turn.`);
            console.log("Player turn: ", gameState.handCycle.trick!.playerTurn); //the ! after trick is safe because if PLAYING then trick is guaranteed
            console.log(player);
            return null;
        }

        // If the player has no cards to play, update the game state and take next turn
        if (PlayCard.isOutOfCards(gameState, player)){
            console.log(`Player ${player.id} has no cards to play, moving to next turn.`);
            PlayCard.updateGameStateForNoCardPlayed(gameState, player);
        } else {
            // Validate the player has the card in their hand and that it's a valid play
            if (!PlayCard.validateCardInHand(player, card) /*|| !gameState.handCycle.canPlayCard(card)*/) {
                console.log(`Invalid play attempt by player ${playerId}. Card not in hand or not a valid play.`);
                return null;
            }

            // If all checks pass, update the game state for the played card and move to the next turn
            console.log("Updating game state for played card...");
            PlayCard.updateGameStateForPlayedCard(gameState, player, card);
        }

        // If the trick is over, tally points and start the next trick
        if (PlayCard.isTrickOver(gameState.handCycle.trick!)) {
            PlayCard.tallyTrickPoints(gameState, gameState.handCycle.trick!);
            PlayCard.nextTrick(gameState);
        }

        //TODO: Maybe move this to HandCycle
        // If the hand cycle is over, tally points and start a new hand cycle
        if (PlayCard.isHandCycleOver(gameState)) {
            PlayCard.tallyPointsHandCycle(gameState);
            PlayCard.nextHandCycle(gameState);
        }

        //TODO: Maybe move this to GameState or HandCycle
        if (PlayCard.isGameOver(gameState)) {
            gameState.handCycle.handCycleStatus = HandCycleStatus.COMPLETE;
        }
        console.log("Returning game state after play card: ", JSON.stringify(gameState));
        return gameState;
    }


// PlayCard function is called when a player plays a card, it updates the game state accordingly and moves the turn forward
static updateGameStateForPlayedCard(gameState: GameState, player: Player, card: Card) {
    const cardSuit = card.suit;
    const cardValue = card.value;
    player.hand.removeCard({suit: cardSuit, value: cardValue} as Card);
    gameState.handCycle.trick!.cardsPlayed[player.id as PlayerId] = {suit: cardSuit, value: cardValue} as Card;
    gameState.handCycle.trick!.playerTurn = PlayCard.getNextPlayerId(player.id, gameState.players, gameState.handCycle.trick!.startingPlayerId) as PlayerId;
    console.log("New game state after playing card:", JSON.stringify(gameState));
}

// PlayCard function is called when a player has no cards to play, it updates the game state accordingly and moves the turn forward
static updateGameStateForNoCardPlayed(gameState: GameState, player: Player) {
    console.log(`Player ${player.id} has no cards to play, moving to next turn.`);
    gameState.handCycle.trick!.cardsPlayed[player.id as PlayerId] = null;
    gameState.handCycle.trick!.playerTurn = PlayCard.getNextPlayerId(player.id, gameState.players, gameState.handCycle.trick!.startingPlayerId) as PlayerId;
}

// Returns the next player id or null if there are no more players in the trick
static getNextPlayerId(currentPlayerId: string, players: Player[], startingPlayerId: string): string | null {
    const currentIndex = players.findIndex(p => p.id === currentPlayerId);
    const nextIndex = (currentIndex + 1) % players.length;
    return /*players[nextIndex].id===startingPlayerId ? null : */players[nextIndex].id;
}

// Validates that it's the player's turn
static validateTurn (gameState: GameState, playerId: PlayerId): boolean {
    return gameState.handCycle.trick!.playerTurn === playerId;
}

// Validates that a player has the card
static validateCardInHand(player: Player, card: Card): boolean {
    const hand = player.hand;
    return hand.hasCard(card);
}

// Determines if a player has a playable card in PlayCard cycle
static isOutOfCards(gameState: GameState, player: Player): boolean {
    return !player.hand.hasSuit(gameState.handCycle.trumpSuit!);
}



static calcTrickWinner(gameState: GameState): PlayerId {
    const cardsPlayed = gameState.handCycle.trick!.cardsPlayed;
    let winningPlayerId: PlayerId = gameState.handCycle.trick!.startingPlayerId;
    for (const [playerId, card] of Object.entries(cardsPlayed)) {
        if (PlayCard.compareCards(card as Card, cardsPlayed[winningPlayerId] as Card, gameState.handCycle.trumpSuit!)) {
            winningPlayerId = playerId as PlayerId;
        }
    }
    return winningPlayerId;
}

static compareCards(cardA: Card, cardB: Card, trumpSuit: Suit): boolean {
    // There is definitely a better way to do PlayCard but I want to move on for now and come back to it later
    if (cardB === null){
        return true;
    } else if (cardA === null){
        return false;
    } else if (cardA.value === Value.ACE) {
        return true;
    } else if (cardB.value === Value.ACE) {
        return false;
    } else if (cardA.value === Value.JOKER){
        return cardB.value <= Value.JOKER;
    } else if (cardA.suit === trumpSuit && cardB.suit === trumpSuit) {
        return cardA.value >= cardB.value;
    } else if (cardA.equals(Card.jick(trumpSuit))) {
        return cardB.value < Value.JACK;
    } else if (cardB.equals(Card.jick(trumpSuit))) {
        return cardA.value >= Value.JACK;
    }
    console.log(`WARNING: compareCards called when cards are equal. PlayCard should not happen. Cards: ${JSON.stringify(cardA)}, ${JSON.stringify(cardB)}`);
    assert(cardA.equals(cardB));
    return true;
}

static isTrickOver(trick: Trick) {
    return Object.keys(trick.cardsPlayed).length === 4;
}

// PlayCard function starts the next trick, call after tallying points
static nextTrick(gameState: GameState) {
    const winningPlayerId = PlayCard.calcTrickWinner(gameState);
    gameState.handCycle.trick = new Trick(gameState.handCycle.trick!.roundNumber+1, winningPlayerId, {} as Record<PlayerId, Card | null>, winningPlayerId);
}

// PlayCard function is called at the end of a trick to tally points
// Updates team scores on 
static tallyTrickPoints(gameState: GameState, trick: Trick) {
    const winningPlayerId = PlayCard.calcTrickWinner(gameState);
    if (gameState.players.findIndex(p => p.id === winningPlayerId) % 2 === 0) {
        gameState.handCycle.teamOnePoints += Array.from(Object.values(trick.cardsPlayed)).reduce((acc, card) => acc + (PlayCard.cardPointMap[card?.value as Value] || 0), 0);
    } else {
        gameState.handCycle.teamTwoPoints += Array.from(Object.values(trick.cardsPlayed)).reduce((acc, card) => acc + (PlayCard.cardPointMap[card?.value as Value] || 0), 0);
    }
    assert(gameState.handCycle.teamOnePoints <= 10 && gameState.handCycle.teamTwoPoints <= 10, "Scores should never exceed 10");
}

//This function might be better placed in a different file once bidding is implemented etc. but for now it will stay here since it's closely related to play card and the hand cycle logic
static isHandCycleOver(gameState: GameState): boolean {
    return gameState.players.every(p => PlayCard.isOutOfCards(gameState, p));
}

static tallyPointsHandCycle(gameState: GameState) {
    if (gameState.players.findIndex(p => p.id === gameState.handCycle.bidWinner)%2 === 0) {
        if (gameState.handCycle.teamOnePoints >= gameState.handCycle.bidAmount) {
            gameState.teamOneScore += gameState.handCycle.teamOnePoints;
        } else {
            gameState.teamOneScore -= gameState.handCycle.bidAmount;
        }
        gameState.teamTwoScore += gameState.handCycle.teamTwoPoints;
    } else {
        if (gameState.handCycle.teamTwoPoints >= gameState.handCycle.bidAmount) {
            gameState.teamTwoScore += gameState.handCycle.teamTwoPoints;
        } else {
            gameState.teamTwoScore -= gameState.handCycle.bidAmount;
        }
        gameState.teamOneScore += gameState.handCycle.teamOnePoints;
    }
}

//NOTE: the nextHandCycle is being handled somewhere else, leaving this in case it is still being called
static nextHandCycle(gameState: GameState) {
    const nextDealerIndex = (gameState.players.findIndex(p => p.id === gameState.handCycle.dealerId) + 1) % gameState.players.length;
    const nextDealerId = gameState.players[nextDealerIndex].id;
    gameState.initializeHandCycle(nextDealerId);
}

//NOTE: isGameOver should also be in a different file
static isGameOver(gameState: GameState): boolean {
    return gameState.teamOneScore >= 52 || gameState.teamTwoScore >= 52;
}

}